---
title: "yrs document per file — the server-held live document"
status: review
---

When a file is opened for editing, the server creates a live document for it with `yrs`, the Rust port of Yjs, and every editor of that file syncs with it. With one person, this lets an AI's change on disk merge into the open editor instead of clashing ([060/60](./60_disk-and-live-doc-merge.md)). With several, it is the shared state they all edit. This leaf builds the document manager: create from the file, hand out, write back through the save path, unload when idle, and never let an old document's state leak into a new one.

# 01 To Do
- [x] **A document manager per server**: a map `relative path → LiveDoc`. `LiveDoc` holds the `yrs::Doc`, an **epoch** (a random id created with the document), the base text and hash last read from or written to disk, the set of joined connections, and a dirty flag.
- [x] **Create on first join.** Read the file through the index, put the text into a `Y.Text` named `content` (diagram formats use other shapes, [060/80](./80_diagram-collaboration.md)), set the base.
- [x] **Epochs stop duplicated content.** A document rebuilt from disk is a new CRDT history. If a client that synced with an older epoch sends its state, merging it would duplicate the text (the "content duplication" bug today's editor fixed with a disposed flag). So: the join reply carries the epoch; a client whose local epoch differs discards its local document and syncs fresh, then re-applies its own unsaved text as a plain diff ([060/20](./20_sync-protocol.md)).
- [x] **Write back (autosave).** After changes, wait until typing pauses about 1 s, then write the document's text through the server's save path ([050/35](../050_server/35_file-writes-and-echo-suppression.md)) with `base_hash` = the base. On success, update the base. Changes that came from disk ([060/60](./60_disk-and-live-doc-merge.md)) do not trigger a write-back.
- [x] **Leave and unload.** When the last connection leaves: write back if dirty, then unload after 5 minutes idle (today's rooms waited 30 minutes; with the file as the source of truth, less is enough). Unload only after a successful write-back; if it fails, keep the document and report the error to the next joiner.
- [x] **Memory limits.** Cap open documents (for example 200) and total document bytes; refuse a new join with a clear error beyond the cap rather than evict a dirty document.
- [x] **Shutdown.** Write back every dirty document before the server exits ([050/40](../050_server/40_lifecycle-ps-stop-logs.md)).
- [x] **Read-only joins.** A `read` role may join to watch live changes and presence; its updates are rejected ([060/40](./40_access-keys.md)).
- [x] **Metrics:** open documents, joined connections, write-backs, failures ([040/95](../040_caching/95_cache-metrics.md)).

## Guardrails
- The file stays the source of truth. No CRDT state is written to disk, ever.
- All writes go through the one save path, with its path rules and echo suppression.
- Heavy work (diffs, serialisation) stays off the async threads.

## Done when
- Unit tests: create from a file, apply updates, write back after the pause, base updated; unload after idle; a failed write-back keeps the document.
- The epoch test: a client holding an old epoch reconnects after the server restarted; the text is not duplicated and the client's unsaved edit survives.
- A single user edits a page with autosave and never sees a `conflict`, even while the AI edits other parts of the same file (with [060/60](./60_disk-and-live-doc-merge.md)).

# 02 Status and Result
Review. The document manager is built and tested in the sync crate; the server still has to wire it to the socket, the watcher and the save path (110/40, the server track).

## Result
- Code: `apps/agentks-engine/crates/sync/src/docs/` in the main repository — `mod.rs` (`DocManager`: join, leave, disconnect, receive), `live.rs` (the only file that uses `yrs`), `disk.rs` (`merge_from_disk`, `file_removed`), `timed.rs` (`tick`, `flush_all`, `metrics`), `merge.rs`, `files.rs` (`DocFiles`, `Clock`, `DocLimits`), `types.rs`.
- The server gives the manager a `DocFiles` value: `read` returns an editable file's text and hash; `write` calls `Site::save` and then `ServerHandle::record_write`, so live documents use the one save path with echo suppression. The manager never sees a socket, and no `yrs` type crosses its API.
- Timings and limits: autosave 1 s after the last client change; write-back at once when the last member leaves; unload 5 minutes after that; at most 200 documents and 256 MiB of text; a failed write-back keeps the document, is retried after 5 s, and is reported to the next joiner (`JoinReply::write_error`).
- New dependencies: `yrs` 0.28.0, `similar` 3.2.0, `getrandom` 0.4.3 (workspace `Cargo.toml`).
- Tests: `cargo test -p agentks-sync` — 19 tests in the crate, 6 of them for documents (load, edit, forward, autosave after the pause, base moved; read-only member refused; write-back on leave, failed write-back kept, unload after idle; the epoch test with a stale client whose unsaved edit survives and whose naive merge is shown to duplicate the text; the disk merge; limits and diagrams). About 0.01 s. `./ctl gate` green.
- Not done here: the end-to-end "single user never sees a conflict" check needs the server wiring.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/`, the sync crate `agentks-sync` (`crates/sync/`).

**Read first:**
- [Editor engines, section 06 Saving, and the document on the server](../../notes/03_frontend/03_editor-engines.md).
- [Sync engine and server, sections 05 and 06](../../notes/02_engine/04_sync-engine-and-server.md).
- The absorbed [01_yjs-crdt](../../../2026-04-10-sync-and-presence/subtasks/01_yjs-crdt.md) (done in TypeScript): its fixes — disposed flag, consume-on-read counter, read-only textarea until synced, idle eviction, connection-aware close — are the traps to design out here.
- Today's server: [yjs-sync.ts](../../../../../../agent-ks-engine/src/dev-tools/server/yjs-sync.ts), [editor-store.ts](../../../../../../agent-ks-engine/src/dev-tools/server/editor-store.ts).
- The `yrs` crate documentation (latest release at start; check it builds on Rust 1.98.1).

**Depends on:** [050/35](../050_server/35_file-writes-and-echo-suppression.md), [060/20](./20_sync-protocol.md).
**Unblocks:** [110/40](../110_editing/40_save-path-and-sync.md), [060/60](./60_disk-and-live-doc-merge.md), [060/30](./30_presence.md), [060/80](./80_diagram-collaboration.md).

# 04 Decisions
- Decided (claude, 2026-09-30): Phase 2 editing uses a server-held `yrs` document per open file, even for one user ([server note](../../notes/02_engine/04_sync-engine-and-server.md); the editor note lists it as open, and the server note's 2026-09-30 decision settles it).
- Decided (claude, 2026-09-30): documents carry an epoch; an old epoch's state is never merged into a new document.
- Decided (claude, 2026-09-30): autosave about 1 s after typing pauses; unload 5 minutes after the last client leaves.
- Decided (claude, 2026-10-01): the manager reads and writes files only through a `DocFiles` trait the server implements (`Site::save` then `record_write`), because `Site` has no read method and echo suppression lives in the server; the trait keeps one save path and lets tests use an in-memory store.
- Decided (claude, 2026-10-01): time comes from a `Clock` trait and the server calls `tick()` every few hundred milliseconds, because the crate is transport-agnostic and has no async runtime; tests move time by hand.
- Decided (claude, 2026-10-01): a join with another epoch returns `discard_local: true` as well as the epoch, and document numbers are per join, so frames sent on a number from before an unload or restart are refused as bad frames.
- Decided (claude, 2026-10-01): a `read` member's sync step 2 is dropped and its update is `Forbidden`, because Yjs clients always answer the server's step 1 and a read member has nothing to add; checking whether a step 2 adds information would need a copy of the document.
- Decided (claude, 2026-10-01): "dirty" is "a client changed the text since the last write-back"; a write-back is skipped when the text equals the base, so a merge from disk never causes a save by itself.
- Decided (claude, 2026-10-01): the text-byte limit is 256 MiB and counts text only, not `yrs` overhead, because text is what can be measured cheaply at join time.
- Decided (claude, 2026-10-01): Excalidraw and draw.io files are `Diagram` documents and their join returns `NotImplemented` until 060/80; Mermaid and Graphviz sources are text. The kind comes from `agentks_content::diagram_type`, the one extension table.
- Decided (claude, 2026-10-01): awareness frames are relayed unchanged to the other members until 060/30 builds presence.

# 05 Notes & Analysis

## Watch out
- Autosave timing lives in code, not in `site.yaml`: today's `editor.autosave_interval` and `editor.presence.*` keys are dropped in 1.0.0 ([project config, section 04](../../notes/02_engine/02_project-config.md)).
