---
title: "The save path: server-held document, autosave, safe writes, echo suppression"
status: open
---

When a person edits a file, the change must reach disk safely, never overwrite a change they have not seen, and never bounce back as a fake "outside change" that jumps their cursor. And because the AI is the main editor, a file often changes on disk while a person has it open; that change must merge into the open editor, not clash. This leaf builds the path from keystroke to disk: a server-held `yrs` document per open file, autosave, checks, atomic writes, echo suppression, and the merge of outside edits. The multi-user stage reuses all of it ([060_collaboration](../060_collaboration/00_overview.md)).

# 01 To Do
- [ ] **Server documents** (with [060/10](../060_collaboration/10_yrs-document-per-file.md), which owns the document lifecycle): `open` creates or joins a `yrs` document for the file; the client's CodeMirror syncs with it over `/api` (binary frames). The document unloads after the last client leaves and its content is on disk.
- [ ] **Autosave.** Rust writes the file about one second after typing stops, when Edit is turned off, and when the tab closes. No save button. Absorbs editor-core subtask 04 (autosave interval from config; default one second).
- [ ] **Checks before writing** in Rust: the path is an existing file inside the project's content sections; not in the library cache, not config, not `.git`, not outside the project. The client's word is never enough.
- [ ] **Safe write.** Write a temp file in the same folder, then rename it over the target, so a crash never leaves half a file.
- [ ] **No lost writes.** A write carries the base hash of the content the document started from; if the file on disk changed and was not yet merged, merge first ([060/60](../060_collaboration/60_disk-and-live-doc-merge.md)), never overwrite blindly.
- [ ] **Echo suppression.** Rust records the hash it just wrote; when the watcher reports that file with that hash, it is the save's own echo: send a `saved` push, not a change. Any other hash is an outside change.
- [ ] **Outside edits merge.** On an outside change to an open file, Rust diffs the new disk text against the document and applies the difference as an ordinary edit, so the person sees the AI's change appear and nobody loses work.
- [ ] **After a write** Rust re-indexes the file and pushes `changed`, so other tabs and the reading view refresh.
- [ ] **Status** (absorbs editor-core subtask 12): the toolbar shows connection (connected, reconnecting, offline), sync (synced, pending) and save (saved, saving, failed) states from pushes.
- [ ] **Server-side performance** (absorbed from editor-advanced 07): debounce document-to-text materialisation to about 50–100 ms; never rebuild a file tree (there is none).
- [ ] **Tests** (Rust integration + Playwright): type, stop, see the file on disk within 1.5 s; kill the server mid-write and find the old or new file whole; an AI write while editing merges without cursor jump; a save does not produce a `changed` echo to the saving client; a write to a non-content path is refused.

## Guardrails
- The file on disk is the source of truth; the document is working state.
- Writes go only through this path and only to existing files in content sections.
- WSL reports unreliable modification times: compare content hashes, never times.

## Done when
- The Rust integration tests and Playwright tests above pass.
- Editing a tracker note while an agent rewrites a different paragraph of it on disk keeps both changes.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: the engine's `open` and save handlers and the watcher; `apps/agentks-client/src/editor/sync/`.
- **Read first:** [editor engines](../../notes/03_frontend/03_editor-engines.md) (section 06), [the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) (sections 04 to 06), [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md) (risk "Save echo").
- **Today's code:** [the editor store](../../../../../../agent-ks-engine/src/dev-tools/server/editor-store.ts) (per-file echo counter), [the Yjs sync](../../../../../../agent-ks-engine/src/dev-tools/server/yjs-sync.ts) (resets the whole document on an outside change — the behaviour replaced here), [the Yjs client](../../../../../../agent-ks-engine/src/dev-tools/editor/sync/yjs-client-v2.ts), [CodeMirror–Yjs binding](../../../../../../agent-ks-engine/src/dev-tools/editor/core/codemirror-yjs.ts).
- **Absorbed:** [editor-core 04 auto-save](../../../2026-04-10-editor-core/subtasks/04_auto-save.md), [editor-core 12 live status](../../../2026-04-10-editor-core/subtasks/12_live-status.md), server-side items of [editor-advanced 07](../../../2026-04-10-editor-advanced/subtasks/07_performance-improvements.md).
- **Depends on:** [060/10 yrs document per file](../060_collaboration/10_yrs-document-per-file.md), [050/30 watcher and push](../050_server/30_watcher-and-push.md).
- **Unblocks:** [20](./20_edit-in-place.md), [50](./50_diagram-editing.md), [060_collaboration](../060_collaboration/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): editing talks to the server over the same WebSocket.
- Decided (claude, 2026-09-30): a server-held `yrs` document per open file from Phase 2 ([the group index](./00_overview.md)).
- Proposed (claude, 2026-09-30): autosave about a second after typing stops; no save button ([editor engines](../../notes/03_frontend/03_editor-engines.md) section 06).

# 05 Notes & Analysis
## Watch out
- Editors and git write by renaming a temp file over the target; the watcher watches folders, not inodes.
- A `git checkout` while a file is open is an outside change like any other; it merges, and the status shows it.
