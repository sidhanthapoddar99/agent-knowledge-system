---
title: "Astro 5 → 6 breaking changes"
---

Canonical breaking-change list for the **5.16.12 → 6.4.5** upgrade. Completeness over prose. Every row is grounded in the research digest unless tagged ⚠️ Unverified. Cross-references: see `01_overview.md` for the high-level plan and `03_repo-impact.md`-style notes for which of these actually touch this codebase.

**Sources:** [v6 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v6/) · [Astro 6.0 blog](https://astro.build/blog/astro-6/) · [astro@6.0.0 release](https://github.com/withastro/astro/releases/tag/astro@6.0.0) · [Vite 7.0.0](https://github.com/vitejs/vite/releases/tag/v7.0.0).

**Repo baseline** (from `astro-doc-code/package.json`): `astro ^5.16.12`, `@astrojs/mdx ^4.3.13`, `shiki ^3.22.0`, `@types/node ^22.0.0`, `typescript ^5.7.0`. Direct deps `marked ^17.0.1` and `gray-matter ^4.0.3` are not constrained by Astro.

---

## Node / runtime

| Change | What it affects | Action required |
|---|---|---|
| **Min Node bumped to 22.12.0** (Astro 6.0.0 floor `^20.19.1 \|\| >=22.12.0`); Node 18 & most of 20 dropped | Local dev, CI, deploy targets | Verify Node `>=22.12.0` (or `>=20.19.1`) in dev + CI. `./start` should assert the minimum. |
| **Vite → 7.x** (`^6.4.1` → `^7.3.2`) | Whole build/dev pipeline | Bundled by Astro; review SSR/plugin behavior (see SSR table). |
| **Vite 7 is ESM-only** (CJS build removed, `#20032`) | Anything importing Vite as `.cjs` | None expected — repo is `"type": "module"`. Audit any tooling that `require()`s Vite. |
| **Zod → v4** | Schemas using string-format validators (`.email()`, `.uuid()`, …) | Migrate to v4 API / top-level `z` namespace. If importing Zod directly, use `import { z } from 'astro/zod'`. Repo uses custom loaders, not Astro schemas — likely no impact; grep to confirm. |
| **Shiki → 4.0** (`^3.22.0` → `^4.x`) | Code-block syntax highlighting output | Bump and visually regression-test rendered code blocks. |
| **TypeScript** — no major bump (~5.x) | — | No action. |

---

## Config

| Change | What it affects | Action required |
|---|---|---|
| **`.cjs` / `.cts` config files removed** | Astro config format | Use `astro.config.mjs` only. Repo already uses `.mjs` — no action. |
| **`import.meta.env` always inlined, never type-coerced** | Code relying on auto-coerced env values (e.g. booleans/numbers) | Treat `import.meta.env.*` as strings; coerce manually. Audit env reads. |
| **`import.meta.env.ASSETS_PREFIX` removed** | Asset-prefix lookups | Replace with `build.assetsPrefix` from `astro:config/server`. Not used in repo (no match in `src/`). |
| **`experimental.csp` → `security.csp`** (now stable) | Projects using experimental CSP | Move config key if used. Not used in repo. |
| **`experimental.fonts` → `fonts`** (now stable) | Projects using experimental Fonts API | Move config key if used. Not used in repo. |
| **i18n: `routing.redirectToDefaultLocale` defaults to `false`** (was `true`); only valid with `prefixDefaultLocale: true` | i18n redirect behavior | If you relied on the old `true` default, set it explicitly. Repo has no i18n config — no action. |

---

## SSR / dev-server

| Change | What it affects | Action required |
|---|---|---|
| **Dev server redesigned on Vite Environment API** | `astro dev` runtime; non-Node platforms run real prod runtime in dev | Mostly transparent. Re-test dev workflows end-to-end. |
| **Astro 6.3.4+ core fix for stale SSR-only modules** (`#16757`) — `astro:hmr-reload` now returns SSR-only modules so Vite's `updateModules` invalidates the runner cache | The dual-invalidation workaround at `astro-doc-code/src/dev-tools/integration.ts:226` (`server.moduleGraph.invalidateModule(mod)`) | **Test whether the manual invalidation is still needed.** Vite 7 + this fix may make it redundant or conflicting — verify against live HMR before removing. |
| **Vite 7: SSR transform no longer accesses `Object` in transformed code** (`#19996`) | SSR-transformed module behavior | Behavioral; surfaces only in edge cases. Test SSR rendering. |
| **Vite 7: `experimental.skipSsrTransform` removed** (`#20038`) | Any SSR transform escape-hatch | Remove if used. Not used in repo. |
| **Vite 7: `ssrCompatModuleRunner` lifecycle** — recreated on restart, closed on server close (`#18973`, `#18784`) | Stale SSR module cache across dev-server restarts | Test: restart dev server, confirm no stale SSR cache. |
| **Vite 7: `build.cssMinify` defaults to `'esbuild'` for SSR** (`#15637`) | SSR build CSS output (now minified by default) | Verify SSR bundle CSS matches expectations. |
| **Vite 7: chokidar → v4** (`#18453`) | File-watcher invalidation timing | Test rapid edits — no duplicate rebuilds / missed invalidations. |
| **Vite 7: `fs.cachedChecks` removed** (`#18493`) | fs optimization option | Remove if set. `fs.allow` still valid. |
| **Vite 7: `file://` resolution change** (`#18422`) | Plugins resolving `file:` URLs | Audit custom resolution logic. |
| **Removed `astro:ssr-manifest` virtual module** (`#14306`) | Code importing the SSR manifest virtual module | Not used in repo — no action. |
| **`ssrMoveAssets` reads Vite manifest** (`#15345`) | SSR asset separation accuracy | Transparent; verify built assets. |

---

## Integrations / adapters / dev-toolbar

| Change | What it affects | Action required |
|---|---|---|
| **`<ViewTransitions />` removed → `<ClientRouter />`** (`handleForms` prop also removed) | View-transition usage | Swap component. Not used in repo (no match in `src/`). |
| **`astro:build:ssr` hook: `entryPoints` removed** | Adapters reading `entryPoints` | Update adapter code. Repo integration does not use this hook. |
| **`astro:build:done` hook: `routes` removed** | Adapters reading `routes` | Update adapter code. Repo integration does not use this hook. |
| **`RouteData.generate()` removed** | Adapters calling it | Update adapter code. Not used in repo. |
| **`NodeApp`, `loadManifest()`, `loadApp()` removed from `astro/app/node`; old `app.render()` signature removed** | Custom Node adapters | Use new adapter APIs. Not used in repo. |
| **`SSRManifest` restructured** (new required props) | Custom adapters | Rebuild against new shape. Not used in repo. |
| **All official adapters need updates for Vite 7** | Any installed adapter | Run `npx @astrojs/upgrade` to bump adapters together. Repo ships no adapter currently. |
| **`@astrojs/mdx` requires `astro ^6.4.0`** — bump `^4.3.13` → `6.0.3` (v4→v6 major jump) | MDX rendering | Bump alongside Astro; thoroughly test MDX output. ⚠️ Unverified — specific v4→v5→v6 MDX breaking changes (changelog fetch failed). |
| **Session `test` driver removed; session driver config object-based** | Astro sessions | Repo does not use Astro sessions — no action. |
| **Adapter `edgeMiddleware` → `middlewareMode`** | Adapters using edge middleware | Adapter-only. Repo `src/middleware.ts` uses `defineMiddleware()` — unaffected. |
| **`addDevToolbarApp()` / `defineToolbarApp()` / `server.send`/`on`** — registration unchanged, app structure refined | Dev-toolbar apps in `src/dev-tools/` | ⚠️ Unverified — exact app-structure refinement. Test toolbar apps (layout-selector, error-logger, editor, system-metrics, cache-inspector) visually post-upgrade. |

---

## Content / markdown / images / routing

| Change | What it affects | Action required |
|---|---|---|
| **Legacy content collections API removed** — `src/content/config.ts` → `src/content.config.ts`; `entry.slug` → `entry.id`; `entry.render()` → `render(entry)`. Temporary `legacy.collectionsBackwardsCompat` flag available | Projects using Astro content collections | **Repo does NOT use Astro content collections** — no `src/content/config.ts` exists; content loads via custom loaders in `src/loaders/`. No migration needed. Confirm before assuming. |
| **`Astro.glob()` removed → `import.meta.glob()`** | Glob-based imports in `.astro` | Repo already uses `import.meta.glob()` in routing — no `Astro.glob` matches in `src/`. No action. |
| **`astro:schema` removed → `astro/zod`** | Schema imports | Not used in repo — no action. |
| **`getImage()` throws if called client-side** (build-time only) | Client-side image generation | Audit usage. Not found in repo `src/`. ⚠️ Unverified scope. |
| **Images crop by default** (no `fit` needed); **no upscaling** in default service | Image transforms / dimensions | Re-check any image-processing output sizes. |
| **SVG rasterization now supported** | SVG → raster conversion (font-embedding quality caveats) | Spot-check any rasterized SVGs. |
| **Markdown heading IDs: trailing hyphens no longer stripped** (`#picture-` stays `#picture-`) | Anchor links to headings ending in hyphen | Audit in-doc anchor links / TOC generation. Verify the repo's heading-extraction transformer (`src/parsers/transformers/`) against new IDs. |
| **Script/style render order = source order** (was reversed in v5) | CSS cascade / script init order across multiple `<style>`/`<script>` tags | Test layouts with multiple style/script tags for cascade or init-order regressions. |
| **Endpoints with file extensions reject trailing slashes** (`/sitemap.xml`, not `/sitemap.xml/`); `build.trailingSlash` does not override | Extension-bearing endpoint routes | Audit `src/pages/` endpoints. ⚠️ Unverified whether repo has affected endpoints. |
| **`getStaticPaths()`: numeric params no longer accepted** | Routes passing numeric `params` | Convert numeric params to strings. Audit `getStaticPaths` in `src/pages/[...slug].astro` and others. |

---

## Migration order (condensed)

1. Bump Node to `>=22.12.0`; verify in dev + CI.
2. `npx @astrojs/upgrade` (Astro + any adapters together).
3. Bump `@astrojs/mdx` → `6.0.3`, `shiki` → `^4`.
4. Grep-audit removed APIs: `Astro.glob`, `astro:schema`, `ViewTransitions`, `ASSETS_PREFIX`, `getImage`, `skipSsrTransform`, `fs.cachedChecks` (most already absent — re-confirm).
5. Re-test SSR HMR and decide fate of the `integration.ts:226` invalidation workaround.
6. Verify markdown heading anchors, multi-`<style>`/`<script>` order, image output sizes.
7. Full `./start build` + dev smoke test.
