---
title: "Edit in place: turning the page into its editor"
status: open
---

Choosing Edit turns the content area of the page being read into an editor where it stands; the navbar, sidebar and outline stay. This leaf builds that switch: asking Rust for the source, mounting CodeMirror 6 over the body with the cursor where the reader was, switching between raw and live preview, and going back to the rendered page when Edit is turned off. What can be edited is decided by Rust.

# 01 To Do
- [ ] **Editability from Rust.** The manifest route entry carries `editable` and `source` ([080/30](../080_ui-and-client/30_client-shell-and-routing.md)). Rust marks as editable: markdown pages in docs and blog sections; markdown files in the tracker (`issue.md`, notes, subtasks, comments, logs); first-class diagram pages (opened in their diagram editor, [50](./50_diagram-editing.md)). Not editable: artifact pages, generated pages (blog index, tracker index), config, `settings.json`, sidecars, library elements.
- [ ] **Open.** `open { path }` over `/api` returns the file text, its hash and the document id of the server-held `yrs` document ([40](./40_save-path-and-sync.md)).
- [ ] **Mount.** Replace the rendered body with a CodeMirror 6 view of the whole file, frontmatter included (shown as a properties block in live preview, as today). The editor code is a lazy chunk.
- [ ] **Keep the reader's place.** Rust writes `data-src-lines="12-18"` on each top-level block of `body_html` ([030/50](../030_rust-engine/50_markdown-pipeline.md)). On Edit, put the cursor at the block nearest the top of the screen and keep the scroll so the text does not jump.
- [ ] **Two modes.** A switch beside Edit: live preview (default) and raw. Raw is the whole file as markdown with syntax colouring. The choice is UI state ([090/10](../090_frontend-performance/10_ui-state-persistence.md)).
- [ ] **Outline follows** the heading being edited while in edit mode.
- [ ] **Leave.** Turning Edit off flushes pending changes (autosave), closes the document, and redraws the page from Rust's render of the saved file.
- [ ] **Embedded diagrams.** In edit mode, clicking a diagram embed or fence opens its source or its diagram editor in place ([50](./50_diagram-editing.md)).
- [ ] **Tests** (Playwright against the engine): Edit on and off on each editable kind; the button disabled on each non-editable kind; cursor lands at the block in view; switching modes keeps the cursor and scroll.

## Guardrails
- No new file, rename, move or delete; no file tree, tabs or second sidebar.
- The client never decides editability; a page not marked editable never shows an enabled Edit.
- The formatting help inserts markdown only; the file only ever holds markdown.

## Done when
- On this repository's docs and tracker, Edit works on every editable page kind and is disabled with a reason on every other kind.
- Turning Edit on does not move the text on screen by more than one line.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `apps/agentks-client/src/editor/`, the engine's `open` handler and manifest.
- **Read first:** [editor engines](../../notes/03_frontend/03_editor-engines.md) (sections 01 to 04, 07), [editing mode](../../brainstorm/02_future-stages/02_editing-mode.md).
- **Today's code:** [CodeMirror setup](../../../../../../agent-ks-engine/src/dev-tools/editor/core/codemirror-setup.ts), [editor theme](../../../../../../agent-ks-engine/src/dev-tools/editor/core/editor-theme.ts), [formatting commands](../../../../../../agent-ks-engine/src/dev-tools/editor/core/formatting-commands.ts) (kept), [the views](../../../../../../agent-ks-engine/src/dev-tools/editor/views) (replaced by the two-mode switch).
- **Depends on:** [10](./10_dev-toolbar.md), [40](./40_save-path-and-sync.md), [080/30](../080_ui-and-client/30_client-shell-and-routing.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): Edit makes an editable page's content editable in place; two modes, raw and live preview; existing files only.
- Proposed (claude, 2026-09-30): artifacts are not editable in place; `data-src-lines` maps blocks to source lines ([editor engines](../../notes/03_frontend/03_editor-engines.md) sections 02, 04).

# 05 Notes & Analysis
## Watch out
- Frontmatter at the top shifts every line number; `data-src-lines` must count from the start of the file, frontmatter included.
