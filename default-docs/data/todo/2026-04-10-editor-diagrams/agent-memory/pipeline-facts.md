---
title: "Verified pipeline facts (code audit 2026-07-03)"
---

# Diagram pipeline — verified facts

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
