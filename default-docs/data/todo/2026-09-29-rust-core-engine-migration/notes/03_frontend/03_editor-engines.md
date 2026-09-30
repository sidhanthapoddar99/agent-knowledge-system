---
title: "Editor engines: in-place editing and diagram editors"
---

Editing is a Phase 2 feature of the local client, and it happens **in place, on the page people read**. Choosing **Edit** in the dev toolbar turns the content area of an editable page into an editor. The layout around it stays as it is. There are **two modes only**. **Raw** shows the whole file as markdown. **Live preview** shows the markdown only where the cursor is and keeps everything else rendered, Obsidian-style. With editing off the page is read-only. The text engine is **the CodeMirror 6 live preview built today**, carried over and improved rather than rebuilt; the separate `/editor` page and its IDE chrome are discarded. The main editor of agentks content is an AI, so a human edits **existing files only**: small fixes and quick ideas, with no new-file command, no file tree and no second navigation. Saving goes over the `/api` WebSocket to Rust, which writes the file and does not mistake its own write for an outside change. Rich blocks in the live preview are rendered by Rust, the same renderer as every page, so the preview equals the real page. Diagrams (Excalidraw, tldraw, Mermaid, draw.io) get their own editors in the same place. Several people editing at once is a later stage, after auth.

# 03 References

- [Editing mode](../../brainstorm/02_future-stages/02_editing-mode.md) — the discussion and the 2026-09-30 decisions.
- [The dev toolbar](./05_dev-toolbar.md) — where Edit and the mode switch live.
- [The client application](./02_client-application.md) — the app the editor runs in, and its WebSocket client.
- [The sync engine and server](../02_engine/04_sync-engine-and-server.md) — the server side of `render`, `save` and document sync.
- [Multi-user editing and auth](../../brainstorm/02_future-stages/04_multi-user-editing-and-auth.md) — the discussion. The design is in [the server](../02_engine/04_sync-engine-and-server.md).
- [Diagram editing in place, with multi-user presence](../../../2026-04-10-editor-diagrams/subtasks/30_editor/40_in-place-and-multi-user-editing.md) — the subtask that owns diagram editing.
- [2026-04-10-view-modes](../../../2026-04-10-view-modes/issue.md) (done) and [2026-04-10-editor-navigation-and-layout](../../../2026-04-10-editor-navigation-and-layout/issue.md) (dropped) — closed on 2026-09-30 by these decisions.
- [2026-04-10-editor-core](../../../2026-04-10-editor-core/issue.md), [2026-04-10-editor-advanced](../../../2026-04-10-editor-advanced/issue.md) and [2026-04-10-sync-and-presence](../../../2026-04-10-sync-and-presence/issue.md) — paused issues whose surviving items re-plan onto this design.
- Today's editor, in [the editor folder](../../../../../../agent-ks-engine/src/dev-tools/editor): [the live preview](../../../../../../agent-ks-engine/src/dev-tools/editor/live-preview/index.ts), [its decoration builder](../../../../../../agent-ks-engine/src/dev-tools/editor/live-preview/build-decorations.ts), [the formatting commands](../../../../../../agent-ks-engine/src/dev-tools/editor/core/formatting-commands.ts), [the Yjs client](../../../../../../agent-ks-engine/src/dev-tools/editor/sync/yjs-client-v2.ts); and the server side, [the editor store](../../../../../../agent-ks-engine/src/dev-tools/server/editor-store.ts) and [the Yjs sync](../../../../../../agent-ks-engine/src/dev-tools/server/yjs-sync.ts).

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the current editor, the separate `/editor` page, is discarded.
- Decided (sidhantha, 2026-09-29): editing happens in the reading and review UI, which changes only slightly when editing is on.
- Decided (sidhantha, 2026-09-29): the editing view mixes markdown and rendered content in one panel, like Obsidian.
- Decided (sidhantha, 2026-09-29): editing mode belongs to Phase 2, and is switched on and off from the dev toolkit.
- Decided (sidhantha, 2026-09-29): no WASM build. The live preview asks Rust to render over the WebSocket.
- Decided (sidhantha, 2026-09-29): editing talks to the server directly, over the same WebSocket.
- Decided (sidhantha, 2026-09-30): multi-user access uses access keys, with no sign-in. Decided (claude, 2026-09-30): multi-user sync is the stage right after single-user editing, inside 1.0.0.
- Decided (sidhantha, 2026-09-30): the dev toolbar has an Edit option. On a page that can be edited, it makes the content area editable in place.
- Decided (sidhantha, 2026-09-30): two modes only: raw and live preview. Read-only is editing switched off. No preview page, no WYSIWYG mode, no view-only mode.
- Decided (sidhantha, 2026-09-30): no separate navigation for editing: no tabs, file explorer, extra sidebars or split views.
- Decided (sidhantha, 2026-09-30): the main editor is an AI. Human editing edits existing files only: no new file, no advanced editing options.
- Decided (sidhantha, 2026-09-30): the live preview already built is the base, improved rather than rebuilt.
- Decided (sidhantha, 2026-09-30): editing diagrams in place (Excalidraw, tldraw, Mermaid, draw.io-style), with multi-user presence, is wanted.

# 05 Notes & Analysis

## 01 How it feels

- **Reading is the default.** Nothing on the page suggests editing until Edit is chosen.
- **Edit on:** the page body becomes editable where it stands. The navbar, sidebar and outline stay; the outline follows the text being edited.
- **Live preview:** clicking into a block shows its markdown; leaving the block renders it again. Tables, diagrams, embeds and code blocks stay visual until clicked.
- **Raw:** the whole file as markdown, with syntax colouring. Frontmatter shows as text.
- **Edit off:** the page goes back to the rendered reading view, drawn from Rust's latest render of the saved file.
- **Formatting help** (bold, headings, lists, links) inserts markdown. The file only ever holds markdown.

## 02 What can be edited

| Page | Editable in place | Why |
|---|---|---|
| A markdown page in a docs section or the blog | Yes | The main case |
| A markdown file in the tracker: `issue.md`, a note, a subtask, a comment | Yes | Same text engine |
| A first-class diagram page (`.mmd`, `.dot`, `.excalidraw`, `.drawio`) | Yes, with its diagram editor (section 08) | The diagram is the document |
| A diagram embedded in a page (`[[../assets/flow.mmd]]`) or a diagram fence | Yes, by clicking it, which opens its source or its diagram editor | Saved to its own file, or to the fence it came from |
| An artifact page (`.html`) | No (claude, proposed) | Self-contained HTML the AI writes; its scripts run in an iframe |
| A generated page: the blog index, the issues index | No | Rust derives it; there is no file behind it |
| Config files, `settings.json`, sidecars | No | Structured metadata; the AI and the CLI change them |
| A library element | No | It sits read-only in the machine cache ([libraries](../04_ecosystem/01_library-system.md)) |

Rust marks each page in the manifest as editable or not, with the file path behind it. The client shows Edit only when it is allowed. The client never decides this from the URL.

## 03 The text engine: CodeMirror 6, carried over

Today's live preview is built on CodeMirror 6 decorations. A decoration builder walks the markdown syntax tree and hides the syntax markers (`#`, `**`, `` ` ``, `[](url)`) everywhere except on the lines under the cursor. Obsidian uses the same technique. That code is the base.

| Today's part | Fate |
|---|---|
| `live-preview/` (decorations, widgets, theme) | **Kept and improved.** The core of live preview mode |
| `core/formatting-commands.ts` | Kept: the formatting help |
| `core/codemirror-setup.ts`, `core/editor-theme.ts` | Kept, reworked to mount inside the page body and to use the theme variables |
| `sync/yjs-client-v2.ts`, `core/codemirror-yjs.ts` | Reworked onto the new `/api` WebSocket (section 06) |
| `renderer/` (a browser copy of `marked` and Shiki) | **Dropped.** Rich blocks are rendered by Rust (section 05) |
| `views/` (source, live preview, WYSIWYG, preview panel, split view manager) | Replaced by a two-mode switch: raw and live preview |
| `editor-page.ts`, `layout/` (menubar, resize handles), `file-tree/` (tree, file create, rename and delete) | **Dropped.** No editor page, no navigation, no new files |

The rebuilt code lives in the client's `editor/` folder ([the client](./02_client-application.md)). It is loaded only when Edit is first chosen, so reading never pays for CodeMirror.

## 04 Mounting in place

1. Edit asks Rust for the page's source file (`open`), which returns the text and its hash.
2. The client replaces the rendered body with a CodeMirror view holding the full file, frontmatter included. In live preview, frontmatter shows as a properties block, as today.
3. **Placing the cursor where the user was reading** (claude, proposed): Rust writes the source line range on each top-level block of a rendered body (`data-src-lines="12-18"`). When Edit is chosen, the client puts the cursor at the block nearest the top of the screen and keeps the scroll position, so the text does not jump. The layouts are built block by block, which makes this mapping simpler than in a general editor.
4. Leaving Edit saves any pending change, closes the document and redraws the page from Rust's render.

## 05 Live preview rendering: two layers

| Layer | Handles | Done by |
|---|---|---|
| Inline decorations | Headings, emphasis, inline code, links, task boxes, rules, frontmatter properties | CodeMirror, in the browser. This is styling of the source, not a second renderer |
| Block widgets | Tables, callouts, diagram fences, `[[...]]` embeds, highlighted code, images | Rust. The client sends the block's markdown in a `render` request and shows the HTML it gets back, with the same islands as the reading view |

The rule: **anything whose output could differ from the real page comes from Rust.** That is how the preview stays equal to the published page with one renderer, which the prior audit named as a known risk. On localhost a `render` round trip takes milliseconds. The client asks again only when a block's text changes, and caches block HTML by the block's hash.

## 06 Saving, and the document on the server

**The server holds the document** (claude, proposed). When a file is opened for editing, Rust creates a shared document for it with `yrs`, the Rust port of Yjs, and the client's CodeMirror syncs with it over `/api`. This is the model today's editor already uses in TypeScript. Using it from Phase 2 onwards, even for one user, has two gains:

- **Outside edits merge instead of clashing.** The AI is the main editor, so a file often changes on disk while a person has it open. When the watcher sees such a change, Rust works out the difference against the document and applies it as an ordinary edit. The person sees the AI's change appear, and neither side loses work. Today's server instead resets the whole document on an outside change.
- **The multi-user stage adds only access keys and presence.** Sync already works; a second person joins the same document.

The save path:

1. Edits flow into the server's document as they are typed.
2. **Autosave** (claude, proposed): Rust writes the file about a second after typing stops, and when Edit is turned off or the tab closes. There is no save button; a small status in the toolbar shows saved, saving or failed.
3. **Checks before writing:** the path must be an existing file inside the project's content folders, and must not be in the library cache or outside the project. Rust refuses anything else. The client's word is never enough.
4. **Safe write:** Rust writes to a temporary file and renames it over the original, so a crash never leaves half a file.
5. **Echo suppression:** Rust records the hash of what it wrote. When the watcher then reports that file, a matching hash means "our own write" and is ignored. A different hash is a real outside change and is merged as above. The prior audit named this as a known trap; today's store tracks it with a counter per file.
6. Rust re-indexes the file and pushes `changed`, so other tabs and the reading view refresh.

## 07 UI state kept between visits

Whether editing was on, raw or live preview, scroll and cursor positions per page, collapsed sections. These sit in local storage with the rest of the UI state ([the client](./02_client-application.md)). There are no editor tabs to remember.

## 08 Diagram editors

A diagram is edited where it appears: on its own first-class page, or by clicking it inside a page with editing on. Each format gets the editor that fits it. Every editor loads only when that diagram is opened for editing.

| Format | File | Editor | Saved to |
|---|---|---|---|
| Excalidraw | `.excalidraw` (JSON) | The Excalidraw canvas component (React) | The `.excalidraw` file |
| tldraw | a tldraw file | The tldraw canvas component (React) | Its file. Whether tldraw also becomes a displayed format is open in the subtask |
| Mermaid | `.mmd`, or a `mermaid` fence | The source in CodeMirror beside a live render | The `.mmd` file, or the fence in the page it came from |
| Graphviz | `.dot`, or a `dot` fence | The same as Mermaid | The `.dot` file or the fence |
| draw.io | `.drawio` (XML) | The diagrams.net editor in its embed mode, inside an iframe | The `.drawio` file |

- **The file on disk stays the diagram's own format**, readable and editable outside agentks.
- **Saving uses the same path** as text: checks, a safe write, echo suppression. Canvas formats save a whole new file on change rather than syncing keystrokes (claude, proposed); multi-user canvas sync comes with the later stage.
- **Multi-user presence** on diagrams (who is here, their cursor or selection) belongs to the multi-user stage, like text.
- The full scope and its done-when live in [the diagram editing subtask](../../../2026-04-10-editor-diagrams/subtasks/30_editor/40_in-place-and-multi-user-editing.md). Its open question is whether the single-user half ships in Phase 2; claude suggests yes, since it needs only editing mode.

## 09 What editing does not have

- No new file, rename, move or delete. Those are the AI's and the CLI's jobs (`agentks move` keeps links correct).
- No file tree, tabs, split views or a second sidebar.
- No preview page, WYSIWYG mode or view-only mode.
- No advanced tools. Slash commands, spell check and drag-and-drop upload from [2026-04-10-editor-advanced](../../../2026-04-10-editor-advanced/issue.md) are not part of Phase 2 unless the user re-plans them.

## 10 The multi-user stage

- **Sync:** the same server-held `yrs` documents; a second client joins the same document.
- **Presence:** who is on the page, with their cursor and selection, from [2026-04-10-sync-and-presence](../../../2026-04-10-sync-and-presence/issue.md).
- **Auth first.** Until it exists the server listens on localhost only, so nobody on the network can reach the editor ([the sync engine and server](../02_engine/04_sync-engine-and-server.md)).

## 11 Open

- Whether single-user diagram editing ships in Phase 2 (section 08).
- Whether Phase 2 uses server-held `yrs` documents from the start, as proposed in section 06, or a plain save with a conflict notice.

Both are tracked in [open questions and risks](../01_overview/05_open-questions-and-risks.md).
