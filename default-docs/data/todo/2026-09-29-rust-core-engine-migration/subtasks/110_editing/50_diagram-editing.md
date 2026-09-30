---
title: "Diagram editing in place (single-user)"
status: open
---

Diagrams are edited where they appear: on their own first-class page, or by clicking one inside a page with editing on. Each format gets the editor that fits it — a canvas for Excalidraw, tldraw and draw.io, source with a live render for Mermaid and Graphviz — and every save keeps the diagram in its own file format, readable outside agentks. This leaf builds the single-user half in Phase 2 and takes over the open editor subtasks of [2026-04-10-editor-diagrams](../../../2026-04-10-editor-diagrams/issue.md). Presence and several people on one diagram are [060/80](../060_collaboration/80_diagram-collaboration.md).

# 01 To Do
- [ ] **Mermaid and Graphviz** (absorbed `30_editor/10`, `20`): the source in CodeMirror beside a live render; the render is the diagram island fed by the current text (browser-side rendering is display of the source, same library as the reading view). Saved to the `.mmd` or `.dot` file, or back into the fence it came from.
- [ ] **Excalidraw** (absorbed `30_editor/30`): the Excalidraw canvas (React island) on `.excalidraw` files; save the whole scene on change, debounced; the file stays Excalidraw JSON.
- [ ] **draw.io**: the diagrams.net editor in embed mode inside an iframe, loaded from a vendored or self-hosted build so editing works offline; save the XML to the `.drawio` file.
- [ ] **tldraw**: the tldraw canvas (React island) on tldraw files. Decide whether tldraw also becomes a displayed format ([35](../100_layouts/35_diagram-pages.md)); if yes, add its viewer there in the same change.
- [ ] **Save path.** Every diagram save goes through [40](./40_save-path-and-sync.md): checks, atomic write, echo suppression. Canvas formats save a whole new file per change rather than syncing keystrokes.
- [ ] **Where editing starts.** On a first-class diagram page, Edit opens the page's editor. On an embed or fence inside a markdown page in edit mode, clicking it opens its editor in place; closing returns to the text editor.
- [ ] **Lazy.** Each editor is its own chunk, loaded only when that diagram is opened for editing.
- [ ] **Tests**: open, change and save one fixture of each format; the saved file opens in the format's own tool (Excalidraw JSON validates, draw.io XML parses); a fence edit writes back into the right fence.

## Guardrails
- The file on disk stays the diagram's own format.
- No new diagram files from the editor; creating diagrams is the AI's job.
- Heavy editors never load for reading.

## Done when
- A diagram of each supported format can be edited in place and saved to its own file, and the reading view shows the change after save (the single-user half of the diagram subtask's "Done when").

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/agentks-client/src/editor/diagrams/`.
- **Absorbed:** [2026-04-10-editor-diagrams](../../../2026-04-10-editor-diagrams/issue.md) — [30_editor/10 mermaid](../../../2026-04-10-editor-diagrams/subtasks/30_editor/10_mermaid.md), [30/20 graphviz](../../../2026-04-10-editor-diagrams/subtasks/30_editor/20_graphviz.md), [30/30 excalidraw](../../../2026-04-10-editor-diagrams/subtasks/30_editor/30_excalidraw.md), and the single-user half of [30/40 in-place and multi-user editing](../../../2026-04-10-editor-diagrams/subtasks/30_editor/40_in-place-and-multi-user-editing.md).
- **Read first:** [editor engines](../../notes/03_frontend/03_editor-engines.md) (section 08), [the Excalidraw plan](../../../2026-04-10-editor-diagrams/notes/01_excalidraw.md), [the draw.io renderer note](../../../2026-04-10-editor-diagrams/notes/05_drawio-renderer.md), [diagram tooling research](../../../2026-04-10-editor-diagrams/notes/03_diagram-tooling-research.md).
- **Depends on:** [20](./20_edit-in-place.md), [40](./40_save-path-and-sync.md), [100/35 diagram pages](../100_layouts/35_diagram-pages.md).
- **Unblocks:** [060/80 diagram collaboration](../060_collaboration/80_diagram-collaboration.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): diagrams (Excalidraw, tldraw, Mermaid, draw.io-style) are editable in place, with multi-user presence later.
- Decided (claude, 2026-09-30, under sidhantha's delegation): single-user in-place diagram editing is part of Phase 2, because it needs only editing mode; this settles the open question in [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md) — record it there when this leaf starts (edit, never commit, in this repository).
- Proposed (claude, 2026-09-30): canvas formats save a whole file per change ([editor engines](../../notes/03_frontend/03_editor-engines.md) section 08).

# 05 Notes & Analysis
## Watch out
- diagrams.net's embed mode talks to its host by `postMessage`; accept messages only from the iframe's own origin.
- Excalidraw is about 500 KB or more gzipped; it must be its own chunk.
