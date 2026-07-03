---
title: "Verified pipeline facts (code audit 2026-07-03)"
---

# Diagram pipeline — verified facts

- **Excalidraw rendering (shipped 2026-07-03):** `exportToSvg` from
  `@excalidraw/excalidraw@0.18.1` (the `@excalidraw/utils` npm package is a
  stale test release — never use it). Lazy chunk ≈624 KB gz, loads only on
  pages with `.diagram-excalidraw` divs. Peer react/react-dom installed.
  **clsx gotcha:** excalidraw pins `clsx@1.1.1` (CJS); without a direct
  `clsx@^2.1.1` dependency it hoists over Astro's ESM clsx and breaks the
  static build at the generate step ("Named export 'clsx' not found").
  Headless runs log a harmless font-subset worker fallback error.
- **Asset caching (fixed 2026-07-03):** `/content-assets/` and `/assets/`
  routes send `Cache-Control: no-cache` in dev (ETag → 304), 1-year
  immutable in prod; excalidraw `data-src` URLs carry an mtime `?v=` param
  for prod cache-busting; `renderExcalidraw` fetches with
  `cache: 'no-cache'`. Demo scenes: all three diagram types live on
  `user-guide/15_writing-content/07_diagram-showcase.md`.

All paths relative to `astro-doc-code/`.

- **Fence → div:** `src/parsers/renderers/marked.ts:75` converts
  ` ```mermaid|dot|graphviz ` fences to `<div class="diagram diagram-*">`.
  Same transform duplicated in `src/parsers/postprocessors/diagrams.ts`
  (regex over `<pre><code>`) and `src/dev-tools/editor/renderer/index.ts:62`.
- **Client render:** `src/scripts/diagrams.ts`, loaded globally by
  `src/layouts/BaseLayout.astro:139`. Lazy dynamic imports: `mermaid`,
  `@hpcc-js/wasm-graphviz` (both in package.json; no excalidraw dep).
  Re-render trigger: `diagrams:render` event (editor preview dispatches it —
  `src/dev-tools/editor/layout/preview-panel.ts:26`,
  `src/dev-tools/editor/views/preview.ts:45`). Completion event
  `diagrams:rendered` consumed by `src/scripts/lightbox.ts`.
- **Failure classes:** `.diagram-rendered` / `.diagram-error` on the div.
- **Embed-by-reference already works** for mermaid/dot: the asset-embed
  preprocessor (`src/parsers/preprocessors/asset-embed.ts`) inlines `[[file]]`
  content verbatim *including inside code fences*. **In-fence paths must be
  file-relative — `./` or `../`** (bare names skipped in `asset-embed.ts` to
  protect documentation examples; `../` allowed since the 2026-07-03 patch);
  the bare-name → `assets/` shorthand of the issues content type applies only
  outside fences. Verified by build 2026-07-03 — artifact:
  `notes/02_embed-verification.md`.
- **Docs glob:** `**/*.{md,mdx}` at `src/loaders/data.ts:139`; `XX_` prefix is
  enforced with a build error for files (`data.ts:~210`), folders without
  prefix sort at 999 (not excluded). **No explicit `assets/` exclusion
  anywhere** — assets stay out of the sidebar only because they contain no
  matching files. Widening the glob without an explicit skip breaks builds.
- **Issues loader:** `src/loaders/issues.ts` scans only the six known
  collections, `*.md`-filtered (`walkTwoLevels`, 2-level cap, no name-based
  skip). Issue-root `assets/` never read → invisible by construction. Bare
  `[[name]]` in issue markdown resolves to `<dir>/assets/<name>`
  (`src/parsers/content-types/issues.ts:52`).
- **Dark mode:** CSS invert + hue-rotate filter on diagram divs, not
  renderer-level theming.
- **Custom tags are GONE (2026-07):** `src/custom-tags/` removed; rich
  content is native GFM (alerts, `<details>`, fences). Never design against
  `:::tag{…}` syntax. Renderer is marked + GFM alerts.
- **`asset-src` postprocessor is extension-agnostic:** rewrites ANY relative
  `<img src>` (not just images, not keyed to `assets/` folder name) to
  `/content-assets/<path-rel-to-content-root>`;
  `src/pages/content-assets/[...path].ts` serves + statically builds any
  colocated file (except markdown/settings). This is what makes
  `![x](./assets/arch.excalidraw)` embeds nearly free.
