---
title: "Watcher and push — from a change on disk to a pushed hash"
status: open
---

The AI is the main author, so files change on disk all the time while a page is open. The watcher sees those changes, the engine updates its index and caches, and the server pushes the new hashes so every open tab refreshes exactly what changed. This leaf builds that path with `notify`, handling the traps today's engine hit: unreliable modification times on WSL, editors that save by rename, `git checkout` touching hundreds of files at once, and config edits that break loading.

# 01 To Do
- [ ] **One watcher per project** (`notify`, recursive) over: every content section's data folder, `config/`, theme folders, local libraries named in `dep.yaml`, and the git refs (`.git/HEAD` and the folder holding the active branch ref; resolve worktrees to the real git dir).
- [ ] **Watch folders, not file inodes.** Editors write a temp file and rename it over the target, which replaces the inode.
- [ ] **Ignore noise:** editor swap and backup files (`.swp`, `~`, `.#*`, `4913`), agentks's own temporary files (`*.tmp-*`), `.git/` except the refs, `node_modules`, `data/builds`.
- [ ] **Debounce and coalesce** for about 50 ms: collect paths, then process one batch. A `git checkout` becomes one update.
- [ ] **Decide by content, not time.** For each path in a batch, hash the file and compare with the index. Same hash → no change (WSL and `touch` produce such events). Missing → removed.
- [ ] **Process a batch:**
    1. Config paths → reload and diff config ([040/20](../040_caching/20_settings-invalidation.md)); invalid → push `fatal`, keep serving the last good config, stop here.
    2. Content paths → update index entries, rolled-up folder hashes and dependency records.
    3. Ask the key function which keys changed ([040/10](../040_caching/10_cache-keys-and-dependencies.md)).
    4. Git ref paths → run the git-dates reconcile ([040/70](../040_caching/70_git-dates-cache.md)).
    5. Echo check: a path whose new hash equals a hash the server just wrote is the server's own save ([050/35](./35_file-writes-and-echo-suppression.md)) → push `saved`, not `changed`.
    6. Collaboration: a changed file that is open as a live document → hand it to [060/60](../060_collaboration/60_disk-and-live-doc-merge.md).
    7. Push one `changed` with every affected key and new hash, plus `removed`; push `errors` for files whose content errors changed.
- [ ] **Overflow.** When the OS event queue overflows (`notify` reports a rescan), rebuild the index by a full walk and push `resync`. Never assume nothing changed.
- [ ] **A moved or deleted page.** Push `removed` with the old key; if the index can tell the file moved (same hash at a new path in the same batch), include the new URL so the client can offer it.
- [ ] **Polling fallback** for file systems without events (some network mounts, WSL `/mnt/*` paths): detect at start, poll with content hashes every 1 s, and log once that polling is in use.

## Guardrails
- The watcher runs off the request path; readers never wait for it except through the cache's single-flight.
- One path from disk to push. The editing and collaboration paths plug into steps 5 and 6; they do not add their own watchers.
- A config error never kills the server (server note, section 03).

## Done when
Integration tests with a real watcher on a temp project:
- Save by rename (write temp, rename over) → one `changed` push with the page's new hash.
- `touch` a file → no push.
- Change 500 files at once (a scripted checkout) → one batch, one push.
- Break `site.yaml` → `fatal` push, pages still served from the last good config; fix it → `changed` for the manifest.
- Edit a file embedded by two pages → both pages' keys in one push.
- Commit on the active branch → issue dates update and are pushed.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/agentks-server/` (the watcher module), calling the core and the cache crate.

**Read first:**
- [Sync engine and server, section 04 The watcher](../../notes/02_engine/04_sync-engine-and-server.md).
- [Why and the prior audit](../../brainstorm/01_initial-discussion/02_why-and-prior-audit.md) — the WSL mtime and rename hazards.
- [Client application, section 06 Live updates](../../notes/03_frontend/02_client-application.md).
- Today's watcher wiring and git-ref watcher: [integration.ts](../../../../../../agent-ks-engine/src/dev-tools/integration.ts), [git-ref-watcher.ts](../../../../../../agent-ks-engine/src/dev-tools/server/git-ref-watcher.ts).

**Depends on:** [050/20](./20_websocket-api.md), [040/10](../040_caching/10_cache-keys-and-dependencies.md), [040/20](../040_caching/20_settings-invalidation.md), [030/40 site index](../030_rust-engine/40_site-index.md).
**Unblocks:** live updates in the client ([080/40](../080_ui-and-client/40_websocket-client.md)), [050/35](./35_file-writes-and-echo-suppression.md), [060/60](../060_collaboration/60_disk-and-live-doc-merge.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the WebSocket carries pushes; the engine pushes changes.
- Proposed (claude, 2026-09-30), adopted here: ~50 ms debounce, content-hash comparison, folder watching and git-ref watching, `fatal` on a broken config.
- Decided (claude, 2026-09-30): an event-queue overflow triggers a full re-index and a `resync` push; network mounts fall back to hash polling.

# 05 Notes & Analysis

## Watch out
- Hashing every file on a large checkout costs time; hash only paths in the batch, in parallel on the blocking pool.
- The git-ref debounce (~100 ms, [040/70](../040_caching/70_git-dates-cache.md)) is separate from the content debounce (~50 ms). A rebase fires both; process content first so pushed dates match pushed pages.
