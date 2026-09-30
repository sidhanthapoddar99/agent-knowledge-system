---
title: "Diagram collaboration — several people editing one diagram"
status: open
---

Diagrams are documents too. When two people open the same Excalidraw scene, tldraw drawing, Mermaid or Graphviz source, or draw.io file, they should edit it together and see each other's pointers and selections. Each format needs its own sync shape, because a canvas is not text. This leaf builds the multi-user half of [diagram editing with presence](../../../2026-04-10-editor-diagrams/subtasks/30_editor/40_in-place-and-multi-user-editing.md); the single-user editors are [110/50](../110_editing/50_diagram-editing.md).

# 01 To Do
- [ ] **Text formats — Mermaid (`.mmd`, `mermaid` fences) and Graphviz (`.dot`, `dot` fences).** They are text: sync them as `Y.Text` exactly like markdown ([060/10](./10_yrs-document-per-file.md)). A fence inside a page is part of the page's document, so no extra work beyond showing the live render beside the source.
- [ ] **Excalidraw (`.excalidraw`, JSON).** Document shape: a `Y.Map` of elements keyed by element id, each value the element JSON with its `version`; plus `Y.Map` `appState` for the shared parts (background colour, grid) and `files` for embedded images. Apply remote changes through `updateScene`; merge concurrent changes to one element by the higher `version` then `versionNonce`, as Excalidraw's own reconciliation does. Serialise back to the `.excalidraw` JSON on write-back.
- [ ] **tldraw.** tldraw's store is a set of records keyed by id: put them in a `Y.Map`, following tldraw's documented Yjs sync pattern. Serialise to its file format on write-back. Whether tldraw also becomes a displayed format stays with the diagram subtask.
- [ ] **draw.io (`.drawio`, XML).** The diagrams.net editor runs in an iframe and exposes only whole-file load and save. So: presence only (who has it open), whole-file autosave with `base_hash`, and on a concurrent save the second one gets `conflict` and reloads with a notice. No fine-grained merge (claude decision; see section 01).
- [ ] **Presence on canvases.** Pointer position and selected element ids through awareness ([060/30](./30_presence.md)); Excalidraw's `collaborators` API and tldraw's presence records draw them.
- [ ] **Disk merges** for canvas formats ([060/60](./60_disk-and-live-doc-merge.md)): diff old and new file element by element and apply only changed elements.
- [ ] **Write-back** through the one save path; the file on disk stays the diagram's own format, readable outside agentks.

## Guardrails
- The file keeps its own format. No agentks-specific wrapper inside `.excalidraw`, `.drawio` or tldraw files.
- Heavy editor bundles load only when a diagram is opened for editing ([090/40](../090_frontend-performance/40_code-splitting-and-lazy-islands.md)).

## Done when
- Two browsers edit one `.excalidraw` scene: moving different shapes at the same time keeps both moves; each sees the other's pointer; the saved file opens in excalidraw.com unchanged in meaning.
- Two browsers edit one `.mmd` file and see the render update live.
- Two browsers save one `.drawio` at once: one succeeds, the other gets the conflict notice and reloads.
- A script changes one element of an open `.excalidraw` file on disk; only that element changes in both browsers.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository — server shapes in `agentks-sync` in `apps/agentks-engine/`, client bindings in `apps/agentks-client/src/editor/`.

**Read first:**
- [Editor engines, section 08 Diagram editors](../../notes/03_frontend/03_editor-engines.md).
- The absorbed subtask: [30/40 in-place and multi-user editing](../../../2026-04-10-editor-diagrams/subtasks/30_editor/40_in-place-and-multi-user-editing.md), and its issue's [Excalidraw plan](../../../2026-04-10-editor-diagrams/notes/01_excalidraw.md) (Yjs sync already sketched there).
- Excalidraw's collaboration docs (`reconcileElements`, `collaborators`) and tldraw's Yjs sync example, at their latest versions.

**Depends on:** [060/10](./10_yrs-document-per-file.md), [060/20](./20_sync-protocol.md), [060/30](./30_presence.md), [110/50](../110_editing/50_diagram-editing.md).
**Unblocks:** [060/95](./95_collaboration-tests.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): diagrams (Excalidraw, tldraw, Mermaid, draw.io-style) should be editable in place, with multi-user presence.
- Decided (claude, 2026-09-30): text diagram formats sync as text; Excalidraw and tldraw sync element-wise in `Y.Map`s; draw.io gets presence and whole-file saves with conflicts, not live merging.

# 05 Notes & Analysis

## 01 Why draw.io is whole-file
The embedded diagrams.net editor has no API for applying remote element changes while a user edits; reloading the whole XML under someone's cursor would lose their in-progress action. Presence plus conflict-checked saves is the honest level of support. Revisit only if diagrams.net ships a collaboration API.

## Watch out
- Excalidraw image files (`files`) can be large base64 blobs. Sync them once by id; never resend them on every change.
