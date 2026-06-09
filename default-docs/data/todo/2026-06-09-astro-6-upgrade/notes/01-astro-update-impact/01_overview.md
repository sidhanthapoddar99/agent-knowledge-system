---
title: "Upgrade impact — overview"
---

# Astro 5.16.12 → 6.4.5 — upgrade impact overview

One-page blast-radius map for moving this framework off Astro 5.16.12 onto 6.4.5. Per-subsystem detail lives in the sibling notes 02–05 in this folder. This page ranks the subsystems and names the single highest-risk area.

## Version deltas driving the work

| Dependency | Current pin (`astro-doc-code/package.json`) | Target (Astro 6.4.5) | Breaking? |
|---|---|---|---|
| `astro` | `^5.16.12` | `^6.4.5` | YES (major) |
| Vite (transitive) | `^6.4.x` | `^7.3.2` | YES (major) |
| `@astrojs/mdx` | `^4.3.13` | `6.0.3` (needs `astro ^6.4.0`) | YES (major) |
| `shiki` | `^3.22.0` (direct dep) | Astro bundles `^4.0.2` | YES (major) — our direct pin is independent |
| Node.js | 18+ tolerated | **22.12.0+** (Astro floor `^20.19.1 \|\| >=22.12.0`) | YES — drops 18 & 20.x below 20.19 |
| Zod | via `astro:schema` | v4, `astro:schema` removed → `astro/zod` | YES if imported |
| `marked` `^17.0.1`, `gray-matter` `^4.0.3` | direct deps | unchanged | No — not constrained by Astro |

Sources: RESEARCH DIGEST (astro6-breaking-changes, astro6-vite-ssr, astro6-integrations-mdx) and `astro-doc-code/package.json`. Node floor and Vite jump are the two hard constraints that gate everything else.

## Risk-ranked subsystem table

| Rank | Subsystem | Key files | Why it's exposed | Detail note |
|---|---|---|---|---|
| 🔴 **1 — highest** | **Loaders + SSR cache invalidation** | `src/dev-tools/integration.ts` (the `server.moduleGraph.invalidateModule` dual-invalidation block), `src/loaders/issue-dates.ts`, `src/loaders/issues.ts` | Hand-rolled workaround for Vite 6 SSR/plugin module isolation. Vite 7 + Astro's own fix (#16757) change the exact behavior this code compensates for — the workaround may become redundant, may conflict, or may silently stop firing. | `03_*` |
| 🟠 2 | **Config + integration wiring** | `astro.config.mjs`, `src/dev-tools/integration.ts` (hooks), `src/middleware.ts` | `astro.config.mjs` already ESM (safe — `.cjs/.cts` dropped, but we don't use them). Integration uses `astro:config:setup`, `addDevToolbarApp()`, `addMiddleware()`, `updateConfig()` — all reported safe. We do NOT use `astro:build:ssr` / `astro:build:done` / `RouteData.generate()` (all removed in v6). Main exposure: Vite 7 config surface (`fs.allow` ok, `fs.cachedChecks` removed) and Node-floor enforcement in `./start`. | `02_*` |
| 🟡 3 | **Parsers + custom-tags** | `src/parsers/` (renderers, transformers, preprocessors), `src/custom-tags/` (`callout.ts`, `collapsible.ts`, `tabs.ts`), `@astrojs/mdx` | MDX v4→v6 major jump (test MDX rendering). Markdown heading-ID generation changed (trailing hyphens no longer stripped → anchor links may break). Shiki 3→4 if Astro's bundled highlighter is in the path. Our pipeline uses `marked` directly, so much is insulated, but heading-ID + MDX behavior must be re-tested. | `04_*` |
| 🟢 4 | **Layouts** | `src/layouts/**` (`.astro` files, `parts/client.ts`) | `<style>`/`<script>` now render in source order (was reversed in v5) — check any CSS-cascade or script-init order assumptions. `<ViewTransitions />` → `<ClientRouter />` and `Astro.glob()` → `import.meta.glob()` (grep needed). Layout routing in `[...slug].astro` already uses `import.meta.glob()`. Mostly mechanical. | `05_*` |

## Highest-risk area: SSR module-invalidation / Vite-isolation code

The single most fragile spot is the **dual-invalidation block in `src/dev-tools/integration.ts`** (the git-ref `server.watcher.on('change', …)` handler that clears local caches *and* calls `server.moduleGraph.invalidateModule()` on `issue-dates.ts` / `issues.ts`).

Why it tops the list:

- **It exists specifically to fight Vite 6 behavior.** The in-code comment states it plainly: *"under Vite 6 SSR, the modules loaded by this plugin context and the modules loaded by the SSR context can be separate instances sharing source but not module-level state."* Clearing only the plugin-context import leaves the SSR copy stale, so it force-invalidates via `moduleGraph`. That is a workaround pinned to a specific Vite version's isolation semantics.
- **Astro 6 ships a core fix to the exact failure mode.** Astro 6.3.4+ (#16757) changes the `astro:hmr-reload` plugin so SSR-only module changes now propagate through Vite's `updateModules` and properly invalidate the SSR module runner's cache. Our manual belt-and-suspenders may now be redundant — or may interact badly with the new path.
- **Vite 7 rewrites the surrounding machinery.** Vite 7 manages `ssrCompatModuleRunner` lifecycle explicitly, removed `experimental.skipSsrTransform`, changed SSR transform of `Object` (#19996), and upgraded the file watcher to chokidar v4 (changes invalidation timing). `moduleGraph.invalidateModule` is the API this block depends on; its semantics under Vite 7's Environment-API dev server are exactly what must be re-verified.
- **Failure is silent and data-correctness-shaped.** If invalidation stops firing, layouts render a stale `updated` date after a git commit/checkout with no error — it just looks wrong. There's no build-time signal; only a live HMR test catches it.

**Verification gate for this area:** start dev, make a commit (or `git checkout`) touching an issue folder, confirm the `[issue-dates] SSR module invalidated:` logs fire and the rendered `updated` date refreshes on next request. If Vite 7 + #16757 already handle it, the `moduleGraph` block is a simplification candidate — but remove it only after the live test passes without it. Full background: `2026-05-08-update-date-time-optimization/notes/03_ssr-module-isolation.md` (referenced directly in the source comment).

## How to use these notes

1. Read this overview for the map.
2. Then the per-subsystem note matching the area you're touching (`02_*` config/integration, `03_*` loaders+SSR, `04_*` parsers+custom-tags, `05_*` layouts).
3. Cross-check every version-specific claim against the official v6 upgrade guide before acting — items marked ⚠️ Unverified in sibling notes are not yet confirmed.

> ⚠️ Unverified — exact `@astrojs/mdx` v4→v6 breaking changes and Shiki 3→4 output diffs were not fully retrieved during research. Confirm against the official v6 upgrade guide and the mdx package CHANGELOG before relying on them.
