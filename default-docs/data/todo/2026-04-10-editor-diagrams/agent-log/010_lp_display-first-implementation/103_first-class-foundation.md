---
title: "M3 — first-class loader foundation shipped (mermaid pathfinder)"
iteration: 3
agent: claude
status: done
date: 2026-07-03
---

## Goal

I4: diagram files as first-class docs pages — the shared loader foundation,
verified on mermaid and (as a bonus) excalidraw.

## Approach

New `src/loaders/diagram-pages.ts`, wired into `loadContent()` for the docs
content type (`data.ts`). Everything downstream (routing, sidebar, layouts)
consumes `LoadedContent` unchanged — diagram files simply become entries:

- Scans `**/*.{mmd,mermaid,dot,gv,excalidraw}` with **`ignore:
  '**/assets/**'`** (the landmine defused — embed-only diagrams in assets
  never become pages).
- `XX_` prefix required; non-prefixed diagram files are skipped with a
  warning (softer than markdown's hard error — they may be stray working
  files).
- Optional `XX_name.meta.json` sidecar (`.jsonc` honoured via
  `readSettings`) for title/description/sidebar_label/sidebar_position/draft;
  fallback title derives from the filename.
- Page body = the same `.diagram` container embeds emit (mermaid/graphviz:
  inline source; excalidraw: `data-src` → client fetch) — zero new render
  machinery.
- **Slug collisions** (`15_lightbox.md` + `16_lightbox.mmd`) render an
  explicit collision error at that slug + an `addError`; no silent winner.
- **Opt-out**: `"allow_diagram_pages": false` in the section-root
  `settings.json`.
- Cache: diagram sources + sidecars added to the mtime dependency list;
  `FileType` union extended with `'diagram'` (no other consumers).

## Result

Live demos (permanent dogfood) in `dev-docs/15_scripts/`:
`11_diagram-page-demo.mmd` + sidecar, `12_excalidraw-page-demo.excalidraw`
(no sidecar — filename-derived title). Verified on the built site +
headless browser: both pages render SVG, sidebar shows both titles
correctly, collision error rendered during the temp test (file removed
after), opt-out flag tested in both directions, **outline column auto-hides**
on diagram pages (existing `headings.length > 0` condition — the open
brainstorm question resolved itself; no code needed).
`20_first-class/10_mermaid.md` → **review**.

## Next

I5 — graphviz page verification (extensions already registered; needs a
live `.dot`/`.gv` check), excalidraw page viewer polish check, then
first-class skills + docs (I6).
