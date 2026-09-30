---
title: "Editing — group index"
status: in-progress
---

This group builds Phase 2 editing in the local client: the dev toolbar with its Edit option, in-place editing of the page being read in two modes only (raw and live preview), the save path through the Rust engine, diagram editors, and the few authoring helpers that survive. The main editor of agentks content is an AI; a human edits **existing files only** — small fixes and quick ideas — with no new-file command, no file tree, no tabs and no second navigation. Several people editing at once is [060_collaboration](../060_collaboration/00_overview.md), the stage right after this one; this group builds on the same server-held `yrs` document per open file so that stage adds only presence and access keys.

# 01 To Do

| Leaf | Status | Delivers | Absorbs |
|---|---|---|---|
| [110/10 Dev toolbar](./10_dev-toolbar.md) | in-progress | The bar, Edit, and the tools: Problems, Cache, System, Theme preview | [2025-06-25-dev-toolbar-enhancements](../../../2025-06-25-dev-toolbar-enhancements/issue.md) |
| [110/20 Edit in place](./20_edit-in-place.md) | in-progress | Turning a page into an editor where it stands; the raw / live preview switch; editability from Rust | — |
| [110/30 Live preview](./30_live-preview.md) | in-progress | Today's CodeMirror 6 live preview carried over and improved; block widgets rendered by Rust | [2026-04-10-view-modes](../../../2026-04-10-view-modes/issue.md) 01, editor-advanced 07 |
| [110/40 Save path](./40_save-path-and-sync.md) | open | `open`, sync into the server document, autosave, checks, atomic write, echo suppression, merging outside edits | [2026-04-10-editor-core](../../../2026-04-10-editor-core/issue.md) 02, 04, 12 |
| [110/50 Diagram editing](./50_diagram-editing.md) | open | Single-user in-place editors for Mermaid, Graphviz, Excalidraw, tldraw, draw.io | [2026-04-10-editor-diagrams](../../../2026-04-10-editor-diagrams/issue.md) `30_editor/*` |
| [110/60 Authoring helpers](./60_authoring-helpers.md) | open | Slash commands and image paste or drop, if kept; the rest of editor-advanced sorted | [2026-04-10-editor-advanced](../../../2026-04-10-editor-advanced/issue.md) |

**Order inside the group.** 10 (the bar and Edit switch) and 40's server side first; then 20 and 30 together; then 50; 60 last and only for the items it keeps. The whole group waits for Phase 1 rendering to pass parity.

## Rules for every leaf
- **Two modes only**: raw and live preview. Read-only is editing switched off. No preview page, no WYSIWYG, no view-only mode, no split view.
- **In place**: the layout around the body stays; nothing opens a separate editor page.
- **Existing files only**: no create, rename, move or delete from the editor. Those are the AI's and the CLI's jobs (`agentks move` keeps links correct).
- **One renderer**: anything whose output could differ from the real page is rendered by Rust over `/api`. No `marked` or Shiki in the browser.
- **Rust decides what is editable** and marks it in the manifest; the client never infers it from the URL.
- **Client only**: the toolbar and the editor live in `apps/agentks-client/src/devtoolbar/` and `src/editor/`, never in `agentks-ui`, so a published page cannot contain them.
- **Loaded on demand**: reading never downloads CodeMirror or a diagram editor ([090/40](../090_frontend-performance/40_code-splitting-and-lazy-islands.md)).

## Done when
- Every leaf is `review` or closed.
- A person can open any markdown page of this repository's docs or tracker, choose Edit, change text in live preview, and see it saved to disk and re-rendered, while an AI edit to the same file on disk appears in the open editor without loss.

# 02 Status and Result
In progress. 10, 20 and 30 are in progress; 40, 50 and 60 are open.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, local folder `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`; work in `apps/agentks-client/src/{devtoolbar,editor}` and the engine's `/api` handlers.
- **Design, read first:** [editor engines](../../notes/03_frontend/03_editor-engines.md), [the dev toolbar](../../notes/03_frontend/05_dev-toolbar.md), [the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) (sections 05, 06).
- **Discussion:** [editing mode](../../brainstorm/02_future-stages/02_editing-mode.md), [the dev toolkit](../../brainstorm/02_future-stages/03_dev-toolkit.md), [multi-user editing and auth](../../brainstorm/02_future-stages/04_multi-user-editing-and-auth.md).
- **Today's editor:** [the editor folder](../../../../../../agent-ks-engine/src/dev-tools/editor), [the editor store](../../../../../../agent-ks-engine/src/dev-tools/server/editor-store.ts), [the Yjs sync](../../../../../../agent-ks-engine/src/dev-tools/server/yjs-sync.ts).
- **Closed by the editing decisions:** [2026-04-10-view-modes](../../../2026-04-10-view-modes/issue.md) (done), [2026-04-10-editor-navigation-and-layout](../../../2026-04-10-editor-navigation-and-layout/issue.md) (dropped), [2025-06-25-editor-server-management](../../../2025-06-25-editor-server-management/issue.md) (superseded).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the separate `/editor` page is discarded; editing happens in the reading UI and mixes markdown and rendered content, like Obsidian.
- Decided (sidhantha, 2026-09-29): editing is Phase 2, switched from the dev toolkit, and talks to the server over the same WebSocket; no WASM build.
- Decided (sidhantha, 2026-09-30): the toolbar is a bar like Astro's with an Edit option; two modes only; no separate navigation; the AI is the main editor and humans edit existing files only; the existing live preview is improved, not rebuilt.
- Decided (sidhantha, 2026-09-30): multi-user access uses access keys with no sign-in; Decided (claude, 2026-09-30): multi-user sync is the stage right after single-user editing, inside 1.0.0 ([the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md)).
- Decided (claude, 2026-09-30): Phase 2 editing uses a server-held `yrs` document per open file from the start, settling the open point in [editor engines](../../notes/03_frontend/03_editor-engines.md) section 11, because the multi-user stage then adds no second protocol.

# 05 Notes & Analysis
## Watch out
- The prior audit named save echo as a known trap: the editor reloads a file it just saved and loses the cursor. [40](./40_save-path-and-sync.md) owns the fix.
