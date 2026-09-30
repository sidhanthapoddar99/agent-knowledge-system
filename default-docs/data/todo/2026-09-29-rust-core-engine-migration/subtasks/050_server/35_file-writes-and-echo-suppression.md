---
title: "File writes and echo suppression — `open` and `save` on the server"
status: in-progress
---

Phase 2 lets a person edit a page in place. Every write goes through the server, which is the only thing allowed to change files on the user's behalf. This leaf builds the server's write path: `open` returns a file's text and hash; `save` checks the path, refuses a write based on a stale copy, writes atomically, and records what it wrote so the watcher does not report the save back as an outside change. The client's editing and autosave are [110/40](../110_editing/40_save-path-and-sync.md); live shared documents that write through this path are [060/10](../060_collaboration/10_yrs-document-per-file.md).

# 01 To Do
- [ ] **`open`** `{ path }` → `{ text, hash, editable, kind }`. `path` is relative to the project root. Refuse anything the manifest does not mark editable.
- [ ] **Path rules for `save`** (all in one function in the core, also used by [060/00](../060_collaboration/00_overview.md) and the tracker writers in [060/70](../060_collaboration/70_tracker-live-edits.md)):
    - [ ] The path is relative, canonicalises inside a content section's data folder, and is not a symlink out of it.
    - [ ] The file already exists. Creating files is the AI's and the CLI's job (sidhantha, 2026-09-30).
    - [ ] Not under `config/`, `.git/`, the library cache, or an `assets/` folder's binary files; not `settings.json` or a `.meta.json` sidecar (structured metadata, changed by the CLI and the tracker writers).
- [ ] **`save`** `{ path, content, base_hash }`:
    - [ ] If the file's current hash ≠ `base_hash` → reply `conflict` with the disk text and its hash. Never overwrite a change the editor has not seen.
    - [ ] Write `<name>.tmp-<pid>-<rand>` in the same folder, `fsync`, rename over the target. Keep the file's permissions and line endings style; do not add or strip a trailing newline the client did not change.
    - [ ] Record `(path, new_hash)` in the echo table with a short lifetime (for example 5 s).
    - [ ] Reply `{ ok, hash }` and push `saved { path, hash }` to every connection showing that page.
- [ ] **Echo suppression** in the watcher's batch step ([050/30](./30_watcher-and-push.md)): a path whose hash matches an echo-table entry is the server's own write → consume the entry, update the index, push `saved`. Any other hash is an outside change.
- [ ] **Role check:** `open` and `save` need `edit` or `owner` ([060/40](../060_collaboration/40_access-keys.md)).
- [ ] **Attribution hook:** each successful save records `(path, key label or "owner", time)` for [060/90](../060_collaboration/90_git-attribution.md).
- [ ] **Line-ending and encoding rules:** files are UTF-8; refuse invalid UTF-8 from the client; keep CRLF if the file used CRLF.

## Guardrails
- The client's word is never enough; every rule is checked on the server.
- No new files, no rename, no delete over the socket.
- A crash mid-save never leaves half a file.

## Done when
- Tests: save to a path outside the content folders, to `config/site.yaml`, to a missing file, to a symlink pointing outside → each refused with `forbidden`.
- A save with a stale `base_hash` returns `conflict` and leaves the file unchanged.
- A normal save produces `saved` and no `changed` push (echo suppressed); an outside write a moment later produces `changed`.
- Killing the process between writing the temp file and renaming leaves the original intact.

# 02 Status and Result
In progress: the echo table and the watcher's echo step are built; `open`, `save` and `saved` wait for their message types in `agentks-api` and for `Site::save`.

## Result
- `src/echo.rs`: `EchoTable` records `(path, hash)` for 5 s and matches by hash, once; an outside write with another hash is never mistaken for the save.
- The watcher's batch step marks a written file whose hash matches as the server's own write (`Batch::echoed`).
- `ServerHandle::record_write(path, hash)`: the call every write path makes right after its atomic write.
- Tests: `echo::tests` and the echo case in `watcher::tests::changes_are_decided_by_content`.
- Left: the `open` and `save` ops (need `ClientMessage::Open`/`Save`, their reply shapes and `Push::Saved` in `agentks-api`), the save handler (`Site::save`, then `record_write`, then the reply and `saved`), the `conflict` reply with the disk text (needs `SiteError::Conflict` to carry it), and the attribution hook.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/` — path checks and atomic writes through `agentks_cache::fs` (`canonical_inside`, `atomic_write`), handlers in `agentks-server`.

**Read first:**
- [Sync engine and server, sections 05 and 07](../../notes/02_engine/04_sync-engine-and-server.md) — the editing messages and rules, security.
- [Editor engines, sections 02 and 06](../../notes/03_frontend/03_editor-engines.md) — what is editable, the save path, echo suppression.
- [Editing mode (brainstorm)](../../brainstorm/02_future-stages/02_editing-mode.md).
- Today's echo handling, for the trap it solved: [editor-store.ts](../../../../../../agent-ks-engine/src/dev-tools/server/editor-store.ts).

**Depends on:** [050/20](./20_websocket-api.md), [050/30](./30_watcher-and-push.md), [050/50](./50_security.md).
**Unblocks:** [110/40](../110_editing/40_save-path-and-sync.md), [060/10](../060_collaboration/10_yrs-document-per-file.md), [060/60](../060_collaboration/60_disk-and-live-doc-merge.md), [060/70](../060_collaboration/70_tracker-live-edits.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): humans edit existing files only; the AI is the main editor.
- Proposed (claude, 2026-09-30), adopted here: `base_hash` conflicts, atomic writes, echo suppression by hash ([server note](../../notes/02_engine/04_sync-engine-and-server.md)).
- Decided (claude, 2026-09-30): this leaf was added to the tree so the server-side write path has one owner, separate from the client's editing UX (110/40) and from live documents (060).
- Decided (claude, 2026-10-01): the echo table lives in the server and is fed through `ServerHandle::record_write`, because the server is the only writer on the user's behalf and the watcher that consumes the entries is the server's.

# 05 Notes & Analysis

## Watch out
- Echo by hash, not by counter: today's store counts writes per file, which drifts when an outside write lands between the save and its event.
