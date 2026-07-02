---
title: "Externalizing paths/config, and the Astro-integration boundary"
---

# Externalizing paths/config + the Astro-integration boundary

Two coupled subtasks carried the real engineering risk of the npm-package branch: teaching the
engine to stop assuming "we *are* the project," and exposing it as an Astro integration the
consumer adds to their config. The first is fully transferable to any distribution shape; the
second is where the npm-specific bet lived — and where the Go runtime chose a different seam.

## The core problem — the engine assumes it *is* the project

Today `paths.ts`, `alias.ts`, `config.ts` resolve everything relative to a hard-coded "project
root = cwd" and discover layouts via `import.meta.glob('src/layouts/**')` — which only works
when `src/` is co-located with the consumer. Once the engine lives in
`node_modules/documentation-template/`, all three assumptions break. The fix: the engine must
**take the project root as an input**, threaded from the integration's options down through
every loader.

### paths.ts — from implicit cwd to explicit input

The two-phase init (structural paths at module load, user paths during `loadSiteConfig()`) both
lean on `process.cwd()`. The proposed shape made the root a parameter:

```ts
export function initPaths(opts: { projectRoot: string }): FrameworkPaths { ... }
```

`projectRoot` comes from the integration, defaulting to cwd if omitted. The acceptance bar was
concrete: *no `process.cwd()` anywhere in loader code*, plus a test proving init against
`projectRoot = '/tmp/some-other-dir'` resolves correctly.

### alias.ts — the system/user split becomes load-bearing

Two alias families that previously both resolved against one root now diverge:

| Family | Examples | Resolves to (post-extraction) |
|---|---|---|
| **System** | `@docs`, `@blog`, `@issues`, `@custom`, `@navbar`, `@footer` | package files — `node_modules/documentation-template/dist/layouts/...` |
| **User** | `@data`, `@assets`, `@themes`, custom `paths:` entries | the consumer's project root, as before |

The collision case (a user alias shadowing a system name) has to error clearly rather than
silently win. Note: this split is *conceptually the same* one already documented in the
framework's `@root` semantics — `@root` resolves to the framework folder, not the consumer's
outer project. The npm branch would have generalized that to the whole system-alias family.

### config.ts / data.ts / issues.ts — mostly plumbing

`loadSiteConfig()` stops reading a hard-coded `dynamic_data/config/site.yaml` and takes
`configPath` from the init result (with a helpful error when the consumer hasn't set up yet).
`data.ts` and `issues.ts` already require absolute paths — no API change, just make sure callers
hand them paths derived from `FrameworkPaths`, not hard-coded relatives.

## The Astro-integration boundary — the npm-specific bet

The consumer-facing API was to be an integration:

```js
import { documentationTemplate } from 'documentation-template/integration';
export default defineConfig({
  integrations: [documentationTemplate({ dataPath: './dynamic_data' })],
});
```

The integration would own: calling `initPaths()`, wiring Vite aliases (both families), loading
site config, registering routes at the package's `[...slug].astro`, mounting dev-tools (unless
disabled), setting up mtime file watchers, and surfacing config/theme errors. The options
surface was deliberately tiny for v1 — `dataPath`, `disableDevTools`, `themeOverride` — on the
principle that *every option is a future support burden*.

### The risk that never fully resolved

The whole integration hinged on one unproven assumption: **does Vite's `import.meta.glob`
traverse `node_modules` cleanly when the path matches an alias set up by the integration?** The
subtasks flagged it repeatedly — layout discovery, HMR across the package boundary, and Vite
alias plumbing under `node_modules` were all listed as risks with "fall back to absolute path
resolution" as the escape hatch. That uncertainty is exactly the kind of Vite/Astro
dev-vs-prod fragility the Go migration set out to eliminate.

## Where this landed

The **path/config externalization is fully transferable and still needed** — the Go runtime
also takes the project root as input and ports these loaders (`notes/architecture/01_overview.md`
lists `loaders/` → Go port as required work). What *dropped* is the Astro-integration wrapper:
in the Go model there is no consumer `astro.config.mjs`, no Vite alias map to plumb, no
`import.meta.glob` to worry about — the binary owns routing via a compile-time layout map, and
the "integration boundary" collapses into "the binary reads `default-docs/` in the cwd." The
integration-boundary *thinking* transferred; the specific mechanism did not.
