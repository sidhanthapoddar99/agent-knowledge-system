---
title: "Edit in place: turning the page into its editor"
status: in-progress
---

Choosing Edit turns the content area of the page being read into an editor where it stands; the navbar, sidebar and outline stay. This leaf builds that switch: asking Rust for the source, mounting CodeMirror 6 over the body with the cursor where the reader was, switching between raw and live preview, and going back to the rendered page when Edit is turned off. What can be edited is decided by Rust.

# 01 To Do
- [ ] **Editability from Rust.** The manifest route entry carries `editable` and `source` ([080/30](../080_ui-and-client/30_client-shell-and-routing.md)). Rust marks as editable: markdown pages in docs and blog sections; markdown files in the tracker (`issue.md`, notes, subtasks, comments, logs); first-class diagram pages (opened in their diagram editor, [50](./50_diagram-editing.md)). Not editable: artifact pages, generated pages (blog index, tracker index), config, `settings.json`, sidecars, library elements.
- [ ] **Open.** `open { path }` over `/api` returns the file text, its hash and the document id of the server-held `yrs` document ([40](./40_save-path-and-sync.md)).
- [x] **Mount.** Replace the rendered body with a CodeMirror 6 view of the whole file, frontmatter included (shown as a properties block in live preview, as today). The editor code is a lazy chunk.
- [x] **Keep the reader's place.** Rust writes `data-src-lines="12-18"` on each top-level block of `body_html` ([030/50](../030_rust-engine/50_markdown-pipeline.md)). On Edit, put the cursor at the block nearest the top of the screen and keep the scroll so the text does not jump.
- [x] **Two modes.** A switch beside Edit: live preview (default) and raw. Raw is the whole file as markdown with syntax colouring. The choice is UI state ([090/10](../090_frontend-performance/10_ui-state-persistence.md)).
- [x] **Outline follows** the heading being edited while in edit mode.
- [x] **Leave.** Turning Edit off flushes pending changes (autosave), closes the document, and redraws the page from Rust's render of the saved file.
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
In progress. The client side is built and tested against the client's mock engine; Rust's `editable` marks, its `open` handler, its `data-src-lines` marks, embedded diagrams and the Playwright tests against the engine are left.

## Result
Built in the wave-3 editor worktree (`/home/sid/projects/06_02_NeuraLabs/.agentks-worktrees/editor`, branch `wave3/editor`, not committed), under `apps/agentks-client/src/editor/`:

- `controller.ts`: `EditController`, the switch (`off`, `opening`, `on`, `closing`). On Edit it reads the reader's place, asks `open { path }` and loads the editor chunk in parallel, and refuses when the reply says `editable: false` or a kind other than `markdown`. Off flushes the pending save first; on a failed save editing stays on with the reason. Leaving the page for another does the same.
- `editability.ts`: reads only the manifest route's `editable` mark; a missing mark, a closed socket and the `read` role are refusals with a reason. In the mock, artifact pages carry `editable: false`, and Edit says "Artifact pages are HTML the AI writes; they are not edited here." A diagram page is refused until its editor exists.
- `EditorHost.tsx` and a new optional `bodySlot` prop on `PageLayoutProps` in `apps/packages/agentks-ui/src/layouts/types.ts`, drawn by `@docs/default` and `@docs/compact` in place of the page body. The navbar, sidebar and outline stay.
- `place.ts`: the first block whose top is below the navbar (`--navbar-height`) is the reader's place. The cursor goes to that block's first line, and the view scrolls so the line keeps its offset on screen. Measured on the mock at 1440 × 900: the text moved 2 px (top of the page), 1 px (scrolled 300 px) and 7 px (scrolled 600 px). Edit off scrolls the rendered page back to the block the editor showed at the top.
- `engine/view.ts`: the CodeMirror 6 view of the whole file, frontmatter included (a properties block in live preview). Live preview and raw sit in one compartment, so a switch keeps the cursor and the undo history; the mode is kept per project. Raw adds line numbers and the active-line highlight.
- `engine/heading-ids.ts`: heading lines carry the ids of the outline's items, matched by heading text, so the outline's links and its highlighting keep working while editing.
- `sync/save-document.ts`: today's save path, behind the `DocumentSync` interface in `sync/document.ts`. It sends `save { path, content, base_hash }` one second after the last keystroke, one request at a time. A stale base is a conflict, and a person picks "Use the disk version" or "Keep mine". A change on disk that is not our own save (told apart by hash) comes in as the smallest edit, so the cursor stays.
- The editor chunk is 558.9 kB (192.4 kB gzip) and loads only on Edit; the main bundle is 56.0 kB (20.2 kB gzip). Measured with `vite build`.
- Tests: `tests/editor/editing.test.tsx` (5, whole app over the in-memory mock: Edit on, type, save, Edit off shows the saved text rendered; the mode kept per project; an artifact refused with the reason; editability cases; strict `data-src-lines` parsing) and `tests/editor/save-document.test.ts` (6). The client's 46 tests run in about 0.9 s.
- Gate: `./ctl gate` in the worktree, exit 0 (31 s).
- Screenshots, light and dark: `/tmp/aks-shots/out/{light,dark}-01-reading.png`, `-02-editing.png`, `-03-typed.png`, `-06-raw.png` and `-08-after.png`.
- Left: Rust's side of the first two items (the `editable` and `source` marks on routes, the `open` handler; the document id waits for [40](./40_save-path-and-sync.md)); `data-src-lines` from the render crate; embedded diagrams (a click on a fence or an embed shows its markdown source, and a fence shows a preview under it; the diagram editor is [50](./50_diagram-editing.md)); the Playwright tests against the engine. The Done-when checks need the engine serving this repository's docs and tracker.

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
- Decided (claude, 2026-10-01): a route with no `editable` mark is not editable, and Edit says "agentks has not said whether this page can be edited", because a guess from the page kind would be a wrong answer that looks right.
- Decided (claude, 2026-10-01): the editor goes in through an optional `bodySlot` prop on the UI package's `PageLayoutProps`, because the layout owns where the body sits, and the navbar, sidebar and outline must stay; a published page never passes it. Every page layout draws it: both docs layouts, the tracker's file page and the blog post. `tests/body-slot.test.tsx` checks each one, because a layout that ignored the slot would hide the editor with no error.
- Decided (claude, 2026-10-01): `open` returns `{ text, hash, editable, kind }`, the contract track's shape, with no document id, because the server-held `yrs` document ([40](./40_save-path-and-sync.md)) is not built; the document model sits behind a `DocumentSync` interface so a `yrs` binding replaces it without touching the controller or the view.
- Decided (claude, 2026-10-01): turning Edit off, or leaving the page, saves first, and a failed save keeps editing on with the reason, because leaving would drop the change.
- Decided (claude, 2026-10-01): the reader's place is the first marked block whose top is below the navbar, else the last one above it when one block fills the screen, because that is the text the reader is looking at.
- Decided (claude, 2026-10-01): the outline keeps working while editing by giving heading lines the outline items' ids, matched by heading text, because the outline items carry no source line.
- Decided (claude, 2026-10-01): the live-or-raw choice is kept per project in [090/10](../090_frontend-performance/10_ui-state-persistence.md)'s store, under the kind `edit`, through the toolbar's `prefs.ts` ([10](./10_dev-toolbar.md)).

# 05 Notes & Analysis
## Watch out
- Frontmatter at the top shifts every line number; `data-src-lines` must count from the start of the file, frontmatter included.
