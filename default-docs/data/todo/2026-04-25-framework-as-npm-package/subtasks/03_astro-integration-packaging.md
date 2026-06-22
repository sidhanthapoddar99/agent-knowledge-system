---
title: "Astro integration entry point — `documentation-template/integration`"
state: open
---

The consumer-facing API. After this lands, a docs project's `astro.config.mjs` looks like:

```js
import { defineConfig } from 'astro/config';
import { documentationTemplate } from 'documentation-template/integration';

export default defineConfig({
  integrations: [
    documentationTemplate({
      dataPath: './dynamic_data',   // optional — defaults to cwd/dynamic_data
      // future options: theme overrides, dev-tools toggle, etc.
    }),
  ],
});
```

## What the integration owns

Standard Astro integration hooks (`astro:config:setup`, `astro:server:setup`, `astro:build:done`, etc.). The integration:

1. **Resolves project paths** by calling the refactored `initPaths()` from subtask 02
2. **Wires Vite aliases** — both system aliases (`@docs`, `@blog`, …) pointing at the package's `dist/`, and user aliases from `site.yaml`
3. **Loads site config** (calls `loadSiteConfig()`) so subsequent layouts can read it
4. **Registers routes** — points Astro at the package's `[...slug].astro` and `assets/`
5. **Mounts dev-tools** (if not disabled) — see subtask 04 for the toggle question
6. **Sets up file watchers** for cache invalidation (mtime-based)
7. **Surfaces errors** — bad config, missing `dynamic_data/`, theme contract violations — with helpful messages pointing at the right docs

## Options surface (initial v1)

```ts
interface DocumentationTemplateOptions {
  /** Absolute or cwd-relative path to the consumer's dynamic_data/ folder.
   *  Defaults to './dynamic_data'. */
  dataPath?: string;

  /** Disable the live editor + dev-toolbar (see subtask 04). Default: false in dev, n/a in prod. */
  disableDevTools?: boolean;

  /** Override the default theme name (otherwise read from site.yaml). */
  themeOverride?: string;
}
```

Keep this surface deliberately small for v1. Every option is a future support burden.

## Package exports map

`package.json` `exports` field:

```json
{
  "exports": {
    "./integration": "./dist/integration.js",
    "./layouts/*": "./dist/layouts/*",
    "./loaders": "./dist/loaders/index.js",
    "./parsers": "./dist/parsers/index.js"
  }
}
```

Layouts have to be reachable via subpath imports because the system aliases (`@docs/default`) need to resolve to package files.

## Acceptance

- `documentationTemplate(opts)` returns a valid Astro integration
- Consumer with a minimal `astro.config.mjs` (5 lines, just the integration) can `bun run dev` and see their `dynamic_data/` content
- Consumer can override `dataPath` and the integration honours it
- Helpful error when `dataPath` doesn't exist, when `site.yaml` is missing, when theme can't be resolved
- The integration plays nicely with other Astro integrations (no global state pollution)

## Risks

- **Vite alias resolution under `node_modules`** — Vite may need help finding the package's layout files. If it can't, fall back to absolute path resolution inside the integration.
- **Astro version compatibility** — pin a peer dep min version that supports the integration hooks we use.
- **HMR for content changes** — currently works because everything is in one project. After: make sure file watchers across the package boundary still trigger HMR.

## Out of scope

- `disableDevTools` semantics beyond "everything off" — subtask 04 owns the granular split
- Telemetry, analytics, opt-in upgrade nudges — out of scope entirely
