---
title: "Live preview: carry over and improve today's CodeMirror 6 engine"
status: open
---

Live preview shows markdown only where the cursor is and keeps everything else rendered, Obsidian-style. Today's CodeMirror 6 live preview already does this with decorations that hide syntax markers away from the cursor; it was finished in [2026-04-10-view-modes](../../../2026-04-10-view-modes/issue.md) subtask 01. This leaf carries it into the client's editor, improves it — viewport-limited decorations, the performance fixes already identified, the unfinished table polish — and switches rich blocks to Rust rendering so the preview equals the real page.

# 01 To Do
- [ ] **Carry over** [the live-preview folder](../../../../../../agent-ks-engine/src/dev-tools/editor/live-preview) (decorations, widgets, theme) and [formatting commands](../../../../../../agent-ks-engine/src/dev-tools/editor/core/formatting-commands.ts) into `apps/agentks-client/src/editor/live-preview/`. Rework its theme to read the site's theme variables so edited text looks like the page.
- [ ] **Two layers** ([editor engines](../../notes/03_frontend/03_editor-engines.md) section 05):
    - [ ] Inline decorations in the browser: headings, emphasis, inline code, links, task boxes, rules, frontmatter properties. Styling of the source, not a second renderer.
    - [ ] Block widgets from Rust: tables, callouts, diagram fences, `[[...]]` embeds, highlighted code, images. The client sends the block's markdown in a `render { path, markdown }` request and shows the returned HTML with the same islands as the reading view; it caches block HTML by the block's hash and re-asks only when the block's text changes.
- [ ] **Drop the browser renderer** ([the renderer folder](../../../../../../agent-ks-engine/src/dev-tools/editor/renderer), a copy of `marked` and Shiki).
- [ ] **Performance fixes** (absorbed from editor-advanced subtask 07 and its [performance note](../../../2026-04-10-editor-advanced/notes/02_editor-performance.md)):
    - [ ] Build decorations only for `view.visibleRanges` (a `ViewPlugin`), and rebuild only ranges whose cursor status changed.
    - [ ] Push decorations in document order and skip the sort.
    - [ ] Compute the selection's line numbers once per rebuild.
    - [ ] Replace the tree-ready polling with `ensureSyntaxTree` and tree-update events.
    - [ ] Parse frontmatter from `state.sliceDoc(0, 2048)`, not the whole document.
- [ ] **Polish** (the open item of view-modes 01): table rendering and editing edge cases — cursor entering and leaving a table, wide tables, pipes inside code.
- [ ] **Formatting help** (absorbed editor-core subtask 02's open item): bold, italic, strike, link, code, list, quote, table, rule and the heading picker work in live preview as well as raw; keyboard shortcuts Ctrl+B, Ctrl+I, Ctrl+K, Ctrl+E.
- [ ] **Tests**: decoration snapshots on fixture markdown (every construct, cursor inside and outside); a 5,000-line file keeps keystroke-to-paint under 16 ms; `render` requests are sent only on block text change.

## Guardrails
- Improve, do not rebuild: keep the decoration builder's approach.
- Anything whose output could differ from the real page comes from Rust.
- No WYSIWYG mode and no preview panel.

## Done when
- Every markdown construct in the fixture set displays in live preview the way the reading view shows it, with syntax revealed only on the cursor's lines.
- Arrow-key movement on a 5,000-line file stays smooth (no long task over 50 ms in a trace).
- A diagram fence edited in live preview shows Rust's render of it within 100 ms of typing stopping.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/agentks-client/src/editor/live-preview/`; the engine's `render` handler.
- **Read first:** [editor engines](../../notes/03_frontend/03_editor-engines.md) (sections 03, 05), [the live preview subtask](../../../2026-04-10-view-modes/subtasks/01_live-preview.md) (what exists), [the editor performance note](../../../2026-04-10-editor-advanced/notes/02_editor-performance.md), [editor typography](../../../2026-04-10-editor-advanced/notes/03_editor-typography.md).
- **Today's code:** [live preview entry](../../../../../../agent-ks-engine/src/dev-tools/editor/live-preview/index.ts), [the decoration builder](../../../../../../agent-ks-engine/src/dev-tools/editor/live-preview/build-decorations.ts), [widgets](../../../../../../agent-ks-engine/src/dev-tools/editor/live-preview/widgets.ts).
- **Absorbed:** view-modes subtask 01's open polish item; [editor-advanced 07 performance improvements](../../../2026-04-10-editor-advanced/subtasks/07_performance-improvements.md) (the client-side items; the server-side ones move to [40](./40_save-path-and-sync.md)); [editor-core 02 formatting toolbar](../../../2026-04-10-editor-core/subtasks/02_formatting-toolbar.md).
- **Depends on:** [20](./20_edit-in-place.md), [050/20 WebSocket API](../050_server/20_websocket-api.md) (`render`).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the live preview already built is the base, improved rather than rebuilt.
- Decided (sidhantha, 2026-09-29): no WASM build; the live preview asks Rust to render over the WebSocket.
- Proposed (claude, 2026-09-30): block widgets come from Rust, inline decorations stay in the browser ([editor engines](../../notes/03_frontend/03_editor-engines.md) section 05).

# 05 Notes & Analysis
## Watch out
- The `render` request needs the file path so relative links and embeds resolve as they would on the page.
- Code-file editing (editor-core 14) is out of scope: humans edit markdown pages and diagrams only.
