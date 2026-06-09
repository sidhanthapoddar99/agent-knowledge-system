---
title: "Impact: config & integrations"
---

Audited the three surfaces that touch the Astro/Vite integration API: the root config (`astro.config.mjs`), the dev-toolbar integration (`src/dev-tools/integration.ts`), and middleware (`src/middleware.ts` + `src/dev-tools/server/middleware.ts`). Findings cross-checked against the v6 research digest. **Headline: nothing in these files uses an API the v6 digest flags as removed.** The one genuinely live risk is the Vite-6→7 SSR module-isolation behaviour our `moduleGraph.invalidateModule` workaround depends on — and it's a test-and-maybe-simplify, not a break.

All `file:line` references are to files under `astro-doc-code/`.

## What `astro.config.mjs` actually uses

| API / option | Where | Notes |
|---|---|---|
| `defineConfig` from `astro/config` | `astro.config.mjs:2,91` | Core config entry. Unchanged in v6. |
| `mdx()` from `@astrojs/mdx` | `astro.config.mjs:3,99` | Integration. **Version bump required** — see below. |
| `loadEnv` from `vite` | `astro.config.mjs:7,18` | Vite helper; reads `.env` from `repoRoot`. Vite 7 keeps `loadEnv`. ⚠️ Unverified that the signature is unchanged — confirm against Vite 7 migration guide. |
| `output: isDev ? 'server' : 'static'` | `astro.config.mjs:92` | `server`/`static` output modes. ⚠️ Unverified the literal values survive unchanged in v6 — confirm against the official v6 upgrade guide (v5 already renamed `hybrid`→`static`; no further rename is in the digest). |
| `server.{port,host,allowedHosts}` | `astro.config.mjs:93-97` | Standard server block. Not flagged in digest. |
| `markdown.shikiConfig` | `astro.config.mjs:102-107` | Shiki config. **Shiki 3→4** bundled in v6 (digest §6) — verify `github-dark` theme + `wrap` still render correctly. |
| `vite.server.allowedHosts` | `astro.config.mjs:111` | Vite passthrough. Not flagged. |
| `vite.server.fs.allow` | `astro.config.mjs:112-119` | Allows `repoRoot` (+ optional ext-layouts) so Vite serves `default-docs/` from outside `astro-doc-code/`. Digest §"Plugin & File System": Vite 7 removed only `fs.cachedChecks`; **`fs.allow` remains valid** (digest classifies this Low-Risk). No change needed. |
| `vite.resolve.alias` (`@`, `@layouts`, `@loaders`, …) | `astro.config.mjs:121-134` | Plain Vite resolve aliases. Digest classifies the alias set as Low-Risk — "should work unchanged under Vite 7." No change needed. |
| `integrations: [mdx(), devToolbarIntegration()]` | `astro.config.mjs:98-101` | Our own integration is registered here — audited next. |

**Config-file format note:** the digest §4 says v6 removed `.cjs`/`.cts` config files; `astro.config.mjs` is already the supported ESM format, so we are clear. We also load `./src/dev-tools/integration.ts` and `./src/loaders/paths.ts` as `.ts` imports directly from the config (`astro.config.mjs:9-10`) — not flagged anywhere in the digest, but ⚠️ Unverified that direct `.ts` config-side imports behave identically under the Vite 7 dev-server redesign; smoke-test that the config loads.

## What `src/dev-tools/integration.ts` actually uses

This is an `AstroIntegration` (`integration.ts:14,76`) with a single `astro:config:setup` hook (`integration.ts:80`). It destructures **`addDevToolbarApp` and `updateConfig`** only — it does **not** touch `astro:build:ssr`, `astro:build:done`, `injectRoute`, `addMiddleware`, `RouteData.generate()`, or `SSRManifest`, which are the integration-API items the digest flags as breaking.

| API / pattern | Where | Astro 6 status (per digest) |
|---|---|---|
| `astro:config:setup` hook | `integration.ts:80` | **Safe** — still supported (digest §2). |
| `addDevToolbarApp({id,name,icon,entrypoint})` ×5 | `integration.ts:325,333,341,349,357` | **Safe** — registration signature unchanged (digest §3). App *internals* may need visual re-test (see sibling note on dev-tools). |
| `updateConfig({ vite: { plugins: [...] } })` | `integration.ts:130` | **Safe** — `updateConfig` unchanged (digest §2). |
| Vite plugin `configureServer(server)` | `integration.ts:138` | Vite plugin hook. Not flagged. Uses `server.httpServer`, `server.watcher`, `server.ws.send`, `server.middlewares` (via `setupEditorMiddleware`). |
| `server.watcher.add/unwatch/on('change'\|'add'\|'unlink')` | `integration.ts:169,207,237,241,249,270` | Chokidar-backed watcher. Digest: Vite 7 upgrades **chokidar v3→v4** — file-invalidation *timing* may shift. **TEST** rapid edits + git-ref watches (`integration.ts:190-246`) don't miss/duplicate. |
| `server.moduleGraph.getModuleById(id)` + `invalidateModule(mod)` | `integration.ts:224-226` | **HIGHEST-RISK ITEM.** See dedicated section below. |
| `server.ws.send({ type: 'full-reload' })` | `integration.ts:264,279,313` | HMR full-reload signal. Not flagged. |
| `handleHotUpdate({ file, server })` returning `[]` | `integration.ts:284,309,316` | Vite plugin hook used to suppress default HMR. ⚠️ Unverified under Vite 7's redesigned dev server / Environment API — `handleHotUpdate` semantics could shift. **TEST** that returning `[]` still suppresses reload. |

### The `moduleGraph.invalidateModule` SSR workaround — read this carefully

`integration.ts:180-233` is a deliberate **dual-invalidation** workaround. Its own inline comment (`integration.ts:180-189`) explains it: under **Vite 6 SSR**, the modules loaded by the plugin context and by the SSR context can be *separate instances* sharing source but not module-level state, so clearing only the local imports (`invalidateIssueDateCache()` / `invalidateIssuesCache()`, `integration.ts:212-213`) leaves the SSR copy stale. The fix re-instantiates `loaders/issue-dates.ts` and `loaders/issues.ts` in the SSR context via `server.moduleGraph.invalidateModule()` (`integration.ts:198-230`).

The digest's Vite-SSR section makes this the load-bearing concern for the whole upgrade:

- Astro 6 ships **Vite 7.3.2** (was Vite 6.4.x) — SSR module isolation behaviour may change (digest §7, classified MEDIUM-risk, citing `integration.ts` lines ~180-233 specifically).
- **Astro 6.3.4+ includes a core fix (PR #16757)** to the `astro:hmr-reload` plugin: it now returns SSR-only modules to Vite so `updateModules` properly invalidates the SSR module-runner cache. The digest notes this "directly addresses the dual-invalidation workaround mentioned in the issue."
- Vite 7 also adds explicit `ssrCompatModuleRunner` lifecycle management (recreate-on-restart, close-on-server-close) and removed `experimental.skipSsrTransform`.

**Net:** our workaround may become (a) unnecessary, (b) still-correct-but-redundant, or (c) interacting badly with the new core fix. Do **not** delete it blindly. Action: upgrade, then run the verification sequence below; only remove the dual-invalidation if a git-ref change reliably refreshes the rendered `updated` date with the local-only clear. Full original context: `default-docs/data/todo/2026-05-08-update-date-time-optimization/notes/03_ssr-module-isolation.md` (referenced from `integration.ts:188-189,219-221`).

## What the middleware files actually use

### `src/middleware.ts`

| API / pattern | Where | Astro 6 status |
|---|---|---|
| `defineMiddleware` from `astro:middleware` | `middleware.ts:8,10` | **Safe** — import + `(context, next)` signature unchanged (digest §4). |
| `import.meta.env.DEV` | `middleware.ts:12` | Env access. Digest §5: v6 makes `import.meta.env` "always inlined and never type-coerced." `.DEV` is a boolean Astro injects — ⚠️ Unverified it's affected (the coercion change targets user-defined string vars), but **confirm** `import.meta.env.DEV` still reads as a boolean, not the string `"true"`, post-upgrade. |
| `context.url.searchParams` / `context.locals.layoutOverride` | `middleware.ts:14,16` | `locals` pattern unchanged (digest §4). Safe. |

We do **not** use Astro sessions, so the session-driver-removal / object-config-required change (digest §4, §3) is **not relevant**.

### `src/dev-tools/server/middleware.ts`

This is **not** Astro middleware — it's a Vite connect-style middleware registered through `server.middlewares.use(...)` inside the integration's `configureServer`.

| API / pattern | Where | Astro 6 status |
|---|---|---|
| `import type { ViteDevServer } from 'vite'` | `server/middleware.ts:17` | Vite type. ⚠️ Unverified the `ViteDevServer` shape is identical in v7 — type-check after upgrade. |
| `server.middlewares.use((req,res,next)=>…)` | `server/middleware.ts:192,435` | connect middleware stack. Digest classifies the middleware setup pattern Low-Risk ("Vite APIs stable"). |
| `server.httpServer`, `server.watcher`, `server.ws` (via the `setupEditorMiddleware(server, …)` call at `integration.ts:150`) | `server/middleware.ts:156-161` | Passed in from the plugin. Same Vite-7 caveats as the integration's watcher usage. |
| `gray-matter` (`matter`), `fs`, `path` | `server/middleware.ts:24,21,22` | Plain Node + 3rd-party. `gray-matter` is a direct project dep, **not constrained by Astro** (digest §6). Safe. |

No `addMiddleware()` / `injectRoute()` usage anywhere — both files implement HTTP handling via Vite's connect stack, sidestepping the Astro adapter-middleware (`middlewareMode`/`edgeMiddleware`) changes entirely.

## Required version bumps surfaced here

| Package | Current pin | v6 target | Source |
|---|---|---|---|
| `@astrojs/mdx` | `4.3.13` | `6.0.3` (requires `astro ^6.4.0`) | digest §1 |
| Shiki (bundled via Astro) | 3.x | 4.0.x | digest §6 — re-test `markdown.shikiConfig` rendering |
| Vite (bundled via Astro) | 6.4.x | 7.3.2 | digest §"Vite Version Jump" |

⚠️ The `@astrojs/mdx` v4→v6 changelog could not be fetched during research (digest §1) — confirm MDX-specific breaking changes against `https://github.com/withastro/astro/blob/main/packages/integrations/mdx/CHANGELOG.md` and test MDX rendering post-upgrade.

## Verification sequence (for this surface)

1. Upgrade Astro + `@astrojs/mdx`, then `bun run dev` (`./start dev`) — confirm `astro.config.mjs` loads (its `.ts` config-side imports resolve under Vite 7).
2. Confirm dev toolbar shows all five apps (`integration.ts:325-362`); open the editor, save a page — `/__editor/*` routes (`server/middleware.ts:192`) respond.
3. **SSR-isolation test:** commit/checkout something under `default-docs/data/issues/` (or todo tracker), watch for `[issue-dates] SSR module invalidated:` logs (`integration.ts:228`), and confirm a rendered issue's `updated` date refreshes. Then try removing the `moduleGraph` block (`integration.ts:215-233`) and re-test — if it still refreshes, the Astro 6.3.4+ core fix (#16757) has made it redundant.
4. **Watcher test:** rapid edits + branch switch don't drop/duplicate invalidations (chokidar v4 timing).
5. Confirm `import.meta.env.DEV` (`middleware.ts:12`) still reads boolean.
6. Visual-check Shiki output (`markdown.shikiConfig`, `astro.config.mjs:102-107`) after the Shiki 4 bump.
