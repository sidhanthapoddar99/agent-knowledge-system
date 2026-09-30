---
title: "Diagram pages and diagram embeds"
status: open
---

Diagrams are native content: Mermaid (`.mmd`), Graphviz (`.dot`), Excalidraw (`.excalidraw`) and draw.io (`.drawio`) render as embeds inside markdown — inline fences or `[[./assets/x.mmd]]` references — and as first-class pages when an `NN_`-prefixed diagram file sits in a section, with an optional sidecar. All of that display work is done today ([2026-04-10-editor-diagrams](../../../2026-04-10-editor-diagrams/issue.md), groups `10_embeds` and `20_first-class`). This leaf carries it into the new layouts and islands. Editing diagrams is [110/50](../110_editing/50_diagram-editing.md).

# 01 To Do
- [ ] **Diagram page layout** (`agentks-ui/src/layouts/pages/diagram/`) for `kind: diagram` pages: the section frame, a title and description from the sidecar, and the diagram island full width with pan, zoom and lightbox.
- [ ] **Embeds in bodies.** Rust renders fences and `[[...]]` diagram embeds to island markers with the source inline (`<div data-island="mermaid">…`); the client mounts the viewer ([080/50](../080_ui-and-client/50_islands.md)). An embedded file's hash is part of the page's hash ([020/40](../020_content-contract/40_embeds-and-dependencies.md)).
- [ ] **Per format:**
    - [ ] Mermaid and Graphviz: render in the browser, themed from CSS variables for light and dark.
    - [ ] Excalidraw: reference-based only (never inline JSON), rendered to SVG by the Excalidraw export in a React island, expandable.
    - [ ] draw.io: the vendored GraphViewer, dark mode native as today.
- [ ] **Sidecars** (same-name `.json` as today) carry title, description and options; Rust reads them and sends the values.
- [ ] **Sidebar glyph** marks diagram pages (mark the exception, not the default), from the shared glyph list.
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
Open. Not started.

## Result
None yet.

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

# 05 Notes & Analysis
## Watch out
- The draw.io viewer is about 3 MiB raw; it must never land in the shell bundle.
