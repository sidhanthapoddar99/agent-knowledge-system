---
title: "Benefit: new features & developer experience"
---

What Astro 6.0 actually shipped as *new* (not removals — those live in `../00-astro-update/02_breaking-changes.md`), filtered to whether **this** project can use it. This framework rolls its own content pipeline (`marked` + `shiki` + `gray-matter`, **not** Astro content collections), its own dev-toolbar integration (`src/dev-tools/integration.ts`), and resolves layouts via `import.meta.glob` — so several headline Astro 6 features (content layer, live collections, image/font services) simply don't touch us. Said plainly per row.

Cross-links: `01_overview.md` (why upgrade at all) · `02_performance.md` (speed/runtime wins) · `04_strategic.md` (longer-term positioning).

**Sources:** [Astro 6.0 blog](https://astro.build/blog/astro-6/) · [v6 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v6/) · [Dev Toolbar App reference](https://docs.astro.build/en/reference/dev-toolbar-app-reference/) · Astro 6.0.4 changelog (dev-toolbar prebundle fix). All claims sourced; anything inferred is tagged ⚠️ Unverified.

---

## High-relevance (this project benefits)

| Feature | What it is (sourced) | Benefit here? |
|---|---|---|
| **Redesigned `astro dev` on Vite Environment API** | Dev server now runs the *actual* production runtime via Vite's Environment API; dev + build share code paths, shrinking "works in dev, breaks in prod" drift. | **Yes.** Our whole dev-tools layer (`src/dev-tools/`) lives in the dev server. Unified runtime means the SSR module-runner behaviour we test in dev matches prod. Pairs with the 6.3.4+ SSR-invalidation fix (#16757) that may retire the `moduleGraph.invalidateModule` workaround — see `../00-astro-update/02_breaking-changes.md` SSR table and `../01-astro-update-impact/02_config-and-integration.md`. |
| **Dev-toolbar prebundle fix (6.0.4)** | Astro now prebundles `astro/toolbar` in dev when custom toolbar apps are registered, preventing re-optimization reloads that hide/break the toolbar. (6.0.3 had a regression where custom dev-tool integrations made the toolbar vanish.) | **Yes — directly.** We register **five** custom toolbar apps via `addDevToolbarApp` (layout-selector, error-logger, editor, system-metrics, cache-inspector). This fix targets exactly our shape of integration. **Pin ≥ 6.0.4**, not 6.0.0–6.0.3. |
| **`astro:config/server` virtual module** | Type-safe access to build config (e.g. `build.assetsPrefix`) at runtime, replacing the removed `import.meta.env.ASSETS_PREFIX`. | **Maybe.** We don't use `ASSETS_PREFIX` today, but our asset-serving routes (`src/pages/assets/`) and middleware could read build config type-safely from here instead of ad-hoc env reads. Optional ergonomics, not required. |
| **`astro:env` type-safe env variables** | Recommended over `import.meta.env`; schema-declared, validated, typed server/client env vars. Relevant because v6 makes `import.meta.env` *always inlined, never coerced* (strings only). | **Maybe.** Our config reads `.env` via Vite's `loadEnv` in `astro.config.mjs` (e.g. `CONFIG_DIR`) and `import.meta.env.DEV` in middleware. Migrating `CONFIG_DIR`/`ALLOWED_HOSTS`-style vars to `astro:env` would give validation + typed coercion and dodge the new string-only inlining footgun. Worth evaluating; not a blocker. |
| **New community dev-toolbar apps** | Ecosystem apps now exist: Image Inspector, AI-agent visual feedback/annotation, route map, JSON-LD validator, user-agent switcher. | **Maybe.** We ship our *own* toolbar apps, so we don't need these — but the richer ecosystem validates our investment in the toolbar surface and gives reference implementations for app patterns. Informational. |

---

## Stabilised-but-not-currently-used (available if we adopt)

| Feature | What it is (sourced) | Benefit here? |
|---|---|---|
| **`security.csp` (CSP) — now stable** | Was `experimental.csp`; auto-hashes scripts/styles and emits CSP headers for static + dynamic pages to harden against XSS. v6 also generates responsive-image styles via hash classes + `data-*` for CSP compatibility. | **Maybe.** We don't configure CSP today (confirmed not in repo). If we ever want hardened headers for the rendered docs/issues site, this is now a stable opt-in config key — no experimental flag. Net-new capability, currently unused. |
| **Fonts API — now stable (`fonts` config)** | Was `experimental.fonts`; native font downloading, caching, optimized fallbacks, and preload-link injection for local / Google / Fontsource fonts. | **Maybe.** Our theming uses CSS `--font-family-*` tokens (see CLAUDE.md theming contract); fonts are theme-CSS-driven, not Astro-managed. Adopting the Fonts API would mean self-hosting + auto-preload for theme fonts — a real perf win *if* we route font loading through Astro. Currently out of band, so: opt-in only. |
| **Route caching (experimental)** | Platform-agnostic API to cache server-rendered responses with web-standard cache semantics + automatic dependency tracing for invalidation. | **Maybe (long-term).** We build `static` for prod (`output: isDev ? 'server' : 'static'`), so there are no server responses to cache in the shipped site. Only relevant if a deployment ever serves SSR. Experimental — don't depend on it. |
| **Queued rendering (experimental)** | Two-pass render (traverse → ordered queue → render) reporting up to 2× faster rendering and lower memory. | See `02_performance.md` — performance, not DX. Experimental; opt-in flag. |
| **Experimental Rust compiler (`@astrojs/compiler-rs`)** | Faster `.astro` compilation + stronger diagnostics vs the Go compiler. | See `02_performance.md`. Could speed builds of our `.astro` layouts; experimental, opt-in. |

---

## Not relevant to this project (be honest)

| Feature | What it is (sourced) | Benefit here? |
|---|---|---|
| **Live Content Collections (stable in 6)** | Request-time content fetching through the unified Content Layer; content updates the moment it's published without rebuilding. | **No.** We never use Astro content collections — content loads through our own `src/loaders/` (`data.ts`, `issues.ts`) with mtime caching. Confirmed in `../01-astro-update-impact/04_parsers-and-layouts.md`. Zero adoption surface. |
| **Content Layer API as the standard** | The (formerly experimental) content layer is now the only collections API; no legacy backwards-compat by default. | **No.** Same reason — our pipeline is framework-agnostic `marked`/`shiki`/`gray-matter`. The legacy-removal is a *no-op* for us, and the new API offers nothing we'd wire in. |
| **`astro/zod` consolidation + Zod 4** | Schema validation now imports from `astro/zod`; Zod bumped to v4. | **No.** We don't author Astro content schemas. Our loaders validate via custom logic, not Zod. (Bundled-dep bump only — see breaking-changes note.) |
| **Image service: crop-by-default, no upscaling, SVG rasterization, CSP-friendly responsive styles** | v6 image-service behaviour changes + new SVG raster support. | **No.** We don't use `getImage()` / Astro's image service; assets go through our own embed preprocessor + `src/pages/assets/[...path].ts`. (Confirmed no `getImage` in `src/`.) |
| **`<ClientRouter />` (replacing `<ViewTransitions />`)** | The view-transitions client router component. | **No.** No view-transition usage anywhere in `src/`. |
| **Rebuilt `@astrojs/cloudflare` adapter (workerd everywhere, native bindings)** | Cloudflare adapter runs `workerd` at all stages with real KV/D1/R2/Durable Object bindings locally. | **No.** Repo ships no adapter; we build `static`. Irrelevant unless deployment strategy changes. |
| **Adapter API additions** (`createApp()`, `createRequest()`, `writeResponse()`, `entrypointResolution: "auto"`, `astro:routes:resolved` hook) | New server-adapter ergonomics for Node/edge adapter authors. | **No.** We author no adapter. Our integration uses only `astro:config:setup` + `addDevToolbarApp` + `updateConfig` (see `../01-astro-update-impact/02_config-and-integration.md`). The new `astro:routes:resolved` hook is ⚠️ Unverified as useful here — we don't post-process routes. |
| **Object-based session drivers (`sessionDrivers` helpers)** | Sessions now configured via object API; `test` driver removed. | **No.** We don't use Astro sessions. |

---

## Bottom line

The genuinely useful new surface for this project is narrow but real: **(1)** the unified Vite-Environment-API dev server (de-risks our entire dev-tools layer and pairs with the SSR-invalidation fix), and **(2)** the dev-toolbar prebundle fix in **6.0.4** — which is a *must-have* given our five custom toolbar apps, so pin ≥ 6.0.4. Beyond that, `astro:env` and `astro:config/server` are nice-to-have ergonomics worth a follow-up, and `security.csp` / Fonts API are stable opt-ins we *could* adopt later. The big-ticket Astro 6 content/image/collection features are inert for us by design — we own that layer. Speed-oriented items (queued rendering, Rust compiler) are covered in `02_performance.md`.
