---
title: "Collaboration — shared live documents, presence and access keys"
status: in-progress
---

The index leaf of the collaboration group. Several people edit one project together: text and diagrams sync live, everyone sees who is on a page and where their cursor is, and tracker changes (status, labels, comments) appear for everyone at once. There is **no sign-in**: the owner grants access with an **access key**. The sync runs on `yrs` (the Rust port of Yjs) inside the server, over the same `/api` socket, and the file on disk stays the source of truth. This group takes over [2026-04-10-sync-and-presence](../../../2026-04-10-sync-and-presence/issue.md) and the multi-user half of [diagram editing](../../../2026-04-10-editor-diagrams/subtasks/30_editor/40_in-place-and-multi-user-editing.md).

# 01 To Do

| Leaf | Delivers | Phase | Status |
|---|---|---|---|
| [060/10 yrs document per file](./10_yrs-document-per-file.md) | The server-held live document for each open file: load, epochs, unload, memory | 2 (single user) | review |
| [060/20 Sync protocol](./20_sync-protocol.md) | Binary frames on `/api`: join, sync steps, updates, awareness | 2 | open |
| [060/60 Disk and live document merge](./60_disk-and-live-doc-merge.md) | An AI edit on disk merges into the open document; autosave writes back | 2 | open |
| [060/30 Presence](./30_presence.md) | Who is on a page; cursors, selections, names, colours | multi-user | open |
| [060/40 Access keys](./40_access-keys.md) | `agentks share`: keys, roles, hashed storage, cookie sessions, revoke | multi-user | in-progress |
| [060/50 Network exposure and TLS](./50_network-exposure-and-tls.md) | `--share`: bind, allowed hosts, TLS through a tunnel or proxy, limits | multi-user | open |
| [060/70 Tracker live edits](./70_tracker-live-edits.md) | Status, labels and comments changed from the page, live for everyone | multi-user | open |
| [060/80 Diagram collaboration](./80_diagram-collaboration.md) | Excalidraw, tldraw, Mermaid, Graphviz, draw.io edited together | multi-user | open |
| [060/90 Git attribution](./90_git-attribution.md) | Who edited what, carried into commits as trailers | multi-user | open |
| [060/95 Collaboration tests](./95_collaboration-tests.md) | Convergence, reconnect, conflict, revoke and load tests | both | open |

**Order of work.** 10, 20 and 60 land with Phase 2 editing, because single-user editing already runs on one live document per file. The rest is the multi-user stage, which sits inside 1.0.0 right after editing: 40 and 50 first (nobody joins without a key), then 30, 70, 80, 90. 95 grows with every leaf.

## Guardrails
- **The file on disk is the source of truth.** A live document is a working copy; it is never persisted as CRDT state and never outlives its file.
- **No sign-in.** Access keys only (sidhantha, 2026-09-30). The server stores only key hashes, in the machine home, never in the project.
- **One protocol.** Multi-user adds presence and keys to the Phase 2 sync; it does not add a second sync path.
- **Localhost stays the default.** Network access needs `--share` and a key.
- Humans edit existing files; the tracker writers in [060/70](./70_tracker-live-edits.md) are the one structured exception, and they call the CLI's own writers.

## Done when
- Every leaf is closed and [060/95](./95_collaboration-tests.md) passes in CI.
- Two people on two machines, one with an `edit` key over `--share`, edit one page and one Excalidraw diagram at once, see each other's cursors, and the files on disk end identical to both editors' views.

# 02 Status and Result
In progress. 10 is in review; 40 is in progress; 20, 30, 50, 60, 70, 80, 90 and 95 are open.

## Result
None yet.

## Agent log
none

# 03 References

**Where the work happens:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system` — server side in `apps/agentks-engine/` (a sync crate or module named by [030/10](../030_rust-engine/10_workspace-and-crate-boundaries.md)), client side in `apps/agentks-client/src/editor/` with the editing group ([110/00](../110_editing/00_overview.md)).

**Read first (every leaf):**
- [Sync engine and server, sections 05–08](../../notes/02_engine/04_sync-engine-and-server.md) — editing, multi-user, access keys, security.
- [Editor engines, sections 06, 08 and 10](../../notes/03_frontend/03_editor-engines.md) — the server-held document, diagram editors.
- [Multi-user editing and auth (brainstorm)](../../brainstorm/02_future-stages/04_multi-user-editing-and-auth.md) — the history; its "auth first" is replaced by access keys.

**Absorbed:**
- [2026-04-10-sync-and-presence](../../../2026-04-10-sync-and-presence/issue.md): subtask `02_presence-and-live-users` → [060/30](./30_presence.md); `03_sync-testing` → [060/95](./95_collaboration-tests.md); `01_yjs-crdt` is done for the Astro editor, and its lessons are carried into [060/10](./10_yrs-document-per-file.md).
- [Diagram editing with presence](../../../2026-04-10-editor-diagrams/subtasks/30_editor/40_in-place-and-multi-user-editing.md), multi-user half → [060/80](./80_diagram-collaboration.md). The single-user half is [110/50](../110_editing/50_diagram-editing.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): multi-user access has no sign-in; the owner grants access with an access key, shared or generated.
- Decided (claude, 2026-09-30): multi-user sync ships in 1.0.0, as the stage right after single-user editing; single-user editing already runs on one `yrs` document per open file ([server note](../../notes/02_engine/04_sync-engine-and-server.md)).
- Decided (sidhantha, 2026-09-29): the audience is one or two developers at a time. Size the limits for small teams, not crowds.

# 05 Notes & Analysis

## Watch out
- [Editor engines, section 10](../../notes/03_frontend/03_editor-engines.md) still says "Auth first" in one bullet; the decisions above replace it.
