---
title: "Diagram pages and diagram embeds"
status: in-progress
---

Diagrams are native content: Mermaid (`.mmd`), Graphviz (`.dot`), Excalidraw (`.excalidraw`) and draw.io (`.drawio`) render as embeds inside markdown — inline fences or `[[./assets/x.mmd]]` references — and as first-class pages when an `NN_`-prefixed diagram file sits in a section, with an optional sidecar. All of that display work is done today ([2026-04-10-editor-diagrams](../../../2026-04-10-editor-diagrams/issue.md), groups `10_embeds` and `20_first-class`). This leaf carries it into the new layouts and islands. Editing diagrams is [110/50](../110_editing/50_diagram-editing.md).

# 01 To Do
- [x] **Diagram page layout** (`agentks-ui/src/layouts/pages/diagram/`) for `kind: diagram` pages: the section frame, a title and description from the sidecar, and the diagram island full width with pan, zoom and lightbox.
- [ ] **Embeds in bodies.** Rust renders fences and `[[...]]` diagram embeds to island markers with the source inline (`<div data-island="mermaid">…`); the client mounts the viewer ([080/50](../080_ui-and-client/50_islands.md)). An embedded file's hash is part of the page's hash ([020/40](../020_content-contract/40_embeds-and-dependencies.md)).
- [x] **Per format:**
    - [x] Mermaid and Graphviz: render in the browser, themed from CSS variables for light and dark. (Dark mode is the theme's invert filter, as today; see Decisions.)
    - [x] Excalidraw: reference-based only (never inline JSON), rendered to SVG by the Excalidraw export in a React island, expandable.
    - [x] draw.io: the vendored GraphViewer, dark mode native as today.
- [ ] **Sidecars** (same-name `.json` as today) carry title, description and options; Rust reads them and sends the values.
- [x] **Sidebar glyph** marks diagram pages (mark the exception, not the default), from the shared glyph list.
- [ ] **Static build.** The static renderer replaces sources with SVG where possible ([150/30](../150_publishing/30_diagrams-to-svg.md)); the island then attaches pan and zoom only.
- [ ] **Parity** on every diagram page and embed in this repository, including [the first-class demo](../../../2026-04-10-editor-diagrams/notes/04_first-class-demo.excalidraw) and the user-guide diagram pages.

## Guardrails
- Slug collisions between a diagram file and a markdown page are an error in Rust, as today.
- `assets/` folders are never scanned for first-class pages.
- Each diagram library loads only on pages with that diagram kind ([090/40](../090_frontend-performance/40_code-splitting-and-lazy-islands.md)).

## Done when
- Every diagram embed and diagram page in this repository renders in the client in light and dark mode, with pan, zoom and lightbox working.
- A page with no diagrams loads no diagram library.

# 02 Status and Result
In progress (claude, 2026-10-01): diagram pages and body embeds of all four languages draw in the client in light and dark; Rust's island markers, the static build's SVG and full-repo parity are left.

## Result
- **Built** on branch `wave3/layout-artifacts` (worktree `.agentks-worktrees/layout-artifacts`):
    - `apps/packages/agentks-ui/src/layouts/pages/diagram/DiagramBody.tsx` draws inside the section's layout: title and description, then the `diagram` island at the column's width. With no JavaScript, a Mermaid or Graphviz page shows its source; the others show one line.
    - `apps/packages/agentks-ui/src/islands/diagram/` is one island for the four languages. Each renderer is its own lazy chunk (`render/mermaid.ts`, `graphviz.ts`, `excalidraw.ts`, `drawio.ts`). Also there: the toolbar (Expand, Copy PNG, the menu with copy and download of PNG, SVG and source), the caption, and the viewer with pan and zoom (`viewer/`).
    - Body embeds: `apps/packages/agentks-ui/src/islands/body.ts` turns each block Rust lists in `page.diagrams` into an island marker, keeping its id.
    - Excalidraw's fonts ship from the client itself (`apps/agentks-client/tools/excalidraw-fonts.ts`), without the 13 MB CJK family. The draw.io viewer is vendored with its hash in `islands/diagram/drawio/README.md`.
- **Checked** in a browser against the mock (`ctl dev client`, `/dev-docs/examples/…`): every language as a page and as an embed, light and dark. Each page loaded only its own renderer, and draw.io redrew on each theme switch. Screenshots, in the worktree: `data/screenshots/layout-artifacts/{diagram-showcase,mermaid-page,graphviz-page,excalidraw-page,drawio-page}-{light,dark}.png`.
- **Tests:** `tests/islands.test.tsx` in the UI package covers the body adapter and the mounter. `./ctl gate` is green (30 s).
- **Left:** Rust writing `data-island` markers (the client adapts today's `div.diagram` blocks until then), the static build's SVG ([150/30](../150_publishing/30_diagrams-to-svg.md)), Rust reading the sidecars, and parity on every diagram in the repository.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `apps/packages/agentks-ui/src/layouts/pages/diagram/` and the diagram islands.
- **Absorbed:** the display half of [2026-04-10-editor-diagrams](../../../2026-04-10-editor-diagrams/issue.md) (groups `10_embeds` and `20_first-class`, all done today — carried over, not rebuilt from scratch). Its [excalidraw scene tools](../../../2026-04-10-editor-diagrams/subtasks/40_tooling/10_excalidraw-scene-tools.md) stay in that issue.
- **Read first:** [the diagram pages user guide](../../../../user-guide/15_writing-content/06_diagram-pages.md), [the draw.io user guide](../../../../user-guide/15_writing-content/07_drawio.md), [the draw.io renderer note](../../../2026-04-10-editor-diagrams/notes/05_drawio-renderer.md), [the embed verification note](../../../2026-04-10-editor-diagrams/notes/02_embed-verification.md).
- **Today's code:** [diagrams](../../../../../../agent-ks-engine/src/scripts/diagrams.ts), [diagram actions](../../../../../../agent-ks-engine/src/scripts/diagram-actions.ts), [draw.io](../../../../../../agent-ks-engine/src/scripts/drawio.ts), [pan and zoom](../../../../../../agent-ks-engine/src/scripts/panzoom.ts), [lightbox](../../../../../../agent-ks-engine/src/scripts/lightbox.ts).
- **Depends on:** [15](./15_docs-layouts.md), [080/50](../080_ui-and-client/50_islands.md), [030/70 diagram and artifact sources](../030_rust-engine/70_diagram-and-artifact-sources.md).

# 04 Decisions
- Decided (sidhantha, 2026-04-10): diagrams are native content, display first ([the diagrams issue](../../../2026-04-10-editor-diagrams/issue.md)).
- Decided (sidhantha, when `.drawio` was added): the draw.io renderer is vendored, and its dark mode is native ([the draw.io renderer note](../../../2026-04-10-editor-diagrams/notes/05_drawio-renderer.md)).
- Decided (sidhantha, 2026-09-29): first-class diagram pages are in Phase 1 scope ([impact on other issues](../../brainstorm/01_initial-discussion/18_impact-on-other-issues.md) section 07).
- Decided (claude, 2026-10-01): Mermaid, Graphviz and Excalidraw keep the theme's dark-mode invert filter instead of CSS-variable theming, because the invert also flips colours the author set in the diagram, and the theme CSS already carries it. draw.io keeps its own dark palette.
- Decided (claude, 2026-10-01): one `diagram` island for all four languages, with a lazy renderer per language, because the toolbar, viewer, caption and error states are shared, and each library still loads only where it is used.
- Decided (claude, 2026-10-01): the client adapts Rust's current `div.diagram` blocks into island markers (`body.ts`), using `page.diagrams` as the list, because Rust does not write `data-island` yet. The adapter goes once Rust writes markers.
- Decided (claude, 2026-10-01): pin `mermaid` 11.17.2, not 12, because `@excalidraw/excalidraw` depends on mermaid 11 and two copies would ship.
- Decided (claude, 2026-10-01): ship Excalidraw's fonts from the client and leave out the CJK family (Xiaolai, 13 MB), because the client is embedded in the binary and a CDN is blocked by the server's content security policy. CJK text falls back to the reader's fonts.
- Decided (claude, 2026-10-01): a diagram page opens pan and zoom in the viewer rather than inline, because inline wheel zoom would take over the page's scrolling.
- Decided (claude, 2026-10-01): an embed that points at a diagram page (`data-page` with no file URL) shows a link to that page, because the island has no file to draw.
- Decided (claude, 2026-10-01): each draw gets its own child element, removed when the draw is superseded, because a slow draw finishing after a newer one otherwise overwrote it (seen as a blank draw.io page in dark mode).

# 05 Notes & Analysis
## Watch out
- The draw.io viewer is about 3 MiB raw; it must never land in the shell bundle.
- The server's content security policy (`script-src 'self'`) blocks Graphviz's WebAssembly until it allows `'wasm-unsafe-eval'`.
- Excalidraw's export inlines font subsets through a worker with a WebAssembly chunk of about 735 KB gzipped, fetched on every page with an Excalidraw drawing. Inlining only for downloads would drop it from page views.
