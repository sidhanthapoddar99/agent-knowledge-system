---
title: "Externalise paths.ts / alias.ts / config.ts so the engine takes project root as input"
state: open
---

The biggest engineering risk in this issue. Today these modules assume "the project root is the cwd / the location of `dynamic_data/`." Once the engine lives in `node_modules/documentation-template/`, that assumption breaks.

## What needs to change

### `src/loaders/paths.ts`

Currently does **two-phase init**:
1. Structural paths (resolved at module load)
2. User paths from `site.yaml` (resolved during `loadSiteConfig()`)

Both phases assume project root via `process.cwd()` or hardcoded relative paths. Refactor to:

```ts
export interface FrameworkPaths {
  projectRoot: string;
  dataPath: string;          // <projectRoot>/dynamic_data/data
  configPath: string;        // <projectRoot>/dynamic_data/config
  assetsPath: string;        // <projectRoot>/dynamic_data/assets
  themesPath: string;        // <projectRoot>/dynamic_data/themes
  // ... user-defined aliases resolved later
}

export function initPaths(opts: { projectRoot: string }): FrameworkPaths { ... }
```

The `projectRoot` comes from the integration options (subtask 03), defaulting to cwd if omitted.

### `src/loaders/alias.ts`

Two alias families:
- **System aliases** (`@docs`, `@blog`, `@issues`, `@custom`, `@navbar`, `@footer`) — resolve to layout components inside the *package*, not the consumer. After this refactor, these point at `node_modules/documentation-template/dist/layouts/...`.
- **User aliases** (`@data`, `@assets`, `@themes`, custom ones from `paths:` in `site.yaml`) — still resolve relative to the consumer's project root.

The split has to be honoured carefully — a user alias colliding with a system alias name should error clearly.

### `src/loaders/config.ts`

`loadSiteConfig()` reads from a hardcoded `dynamic_data/config/site.yaml`. After: takes `configPath` from the path init result. Must accept it being absent (consumer hasn't set up yet) and surface a helpful error.

### `src/loaders/data.ts` and `src/loaders/issues.ts`

Both already require absolute paths — that's good, no change to the API. Just have to make sure callers (the integration, the layouts) hand them paths derived from `FrameworkPaths`, not from hardcoded relatives.

### Layout discovery — `[...slug].astro`

```ts
const layouts = import.meta.glob('@/layouts/**/Layout.astro');
```

After: the glob has to point inside the *package*'s built `dist/`. Investigate whether Vite's `import.meta.glob` traverses `node_modules` cleanly when the path matches an alias — it does, but the alias has to be set up in the consumer's `astro.config.mjs` (the integration handles this).

## Acceptance

- All path/alias/config init takes a `projectRoot` (or derived) as input — no `process.cwd()` calls in loader code
- A test that init works with `projectRoot = '/tmp/some-other-dir'` produces the right resolved paths
- System vs user alias split is explicit; collision = clear error
- Loader unit tests still pass against a fixture project root

## Risks

- **Test fixture sprawl** — every loader test now needs a project-root fixture. Set up one shared fixture in a `__test_fixtures__/` directory.
- **Vite alias plumbing** — Astro's Vite config has to learn the new alias map at integration-load time. Subtask 03 owns this wiring; this subtask just produces a function the integration calls.

## Out of scope

- The Astro integration that *uses* this refactored paths module — subtask 03
- The actual published-package build — subtask 05
