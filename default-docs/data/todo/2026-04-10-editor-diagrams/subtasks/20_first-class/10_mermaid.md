---
title: "First-class mermaid pages (+ shared loader foundation)"
status: done
---

`.mmd` / `.mermaid` files with the `XX_` prefix render as first-class docs
pages — same sidebar, same routing as markdown. Mermaid is the pathfinder
format: the shared loader/routing/sidebar work lands here, and the graphviz
and excalidraw subtasks extend it. Core trick: the page body is the same
`<div class="diagram diagram-mermaid">` container embeds emit, so the existing
BaseLayout client script renders it — no new render machinery.

**Decided (sidhantha, 2026-07-03):** slug collisions (`01_foo.md` +
`01_foo.mmd`) are an explicit collision error for that slug — no silent
winner. See `brainstorm/01_discuss_display-first-architecture.md`.

**Shipped 2026-07-03** — implemented in `src/loaders/diagram-pages.ts`,
wired into `loadContent()` (docs content type); verified with temporary
first-class demo pages (all three types render live on
`user-guide/15_writing-content/07_diagram-showcase.md`). Details in
`agent-log/010_lp_display-first-implementation/103_first-class-foundation.md`.

## Shared foundation (this subtask)

- [x] **Extend the docs scan** — separate diagram-page scan
      (`**/*.{mmd,mermaid,dot,gv,excalidraw}`) merged into `loadContent()`;
      per-section opt-out `"allow_diagram_pages": false` in the section-root
      `settings.json`, enabled by default (flag tested both directions).
- [x] **Explicit `assets/` exclusion** — the diagram scan runs with
      `ignore: '**/assets/**'`; embed-only diagrams in assets never become
      pages.
- [x] **Diagram content handler** — no frontmatter parsing; page body is the
      same `.diagram` container embeds emit (excalidraw pages carry
      `data-src` and fetch client-side); title falls back to the filename
      (strip prefix, title-case). Non-prefixed diagram files skip with a
      warning rather than markdown's hard error.
- [x] **Metadata sidecar** — optional sibling `XX_name.meta.json`
      (`.jsonc` honoured), only when the name isn't enough — per the
      decision (sidhantha, 2026-07-03).
- [x] **Slug rules + collision error** — same slug grammar as markdown;
      collisions render an explicit error box at that slug + a build error
      (verified live with a temp `16_lightbox.mmd` vs `15_lightbox.md`).
- [x] **Sidebar tree** — diagram entries are ordinary `LoadedContent`, so
      the sidebar/ordering/routing consume them unchanged (verified: both
      demo titles in the built sidebar).

## Mermaid-specific

- [x] **Page rendering** — browser-verified: `.mmd` page renders SVG via the
      existing lazy loader; the outline column auto-hides on heading-less
      pages (existing `headings.length > 0` condition — the brainstorm's
      open question resolved itself).
