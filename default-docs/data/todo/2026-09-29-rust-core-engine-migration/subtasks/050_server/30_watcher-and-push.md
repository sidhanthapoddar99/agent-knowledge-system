---
title: "Watcher and push — from a change on disk to a pushed hash"
status: review
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
    2. Content paths → update index entries, rolled-up folder hashes and dependency records. A change under a video folder (one whose settings file says `"kind": "video"`) re-hashes that folder and updates its one `Video` entry, because the files inside a video folder have no entries of their own ([030/40](../030_rust-engine/40_site-index.md)).
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
Review: the watcher is built and tested on a real temp project; some Done-when scenarios depend on the engine (fatal config, embeds, git dates) and are covered only by the code path.

## Result
- `src/watcher.rs`: one `notify` 8 watcher, recursive, over `Backend::watch_roots()` (today the project root, plus the config folder when outside it). Folders, not inodes.
- Noise filter (`is_ignored`): swap and backup files, `.#*`, `4913`, `*.tmp-*`, `node_modules`, `data/builds`, and all of `.git/` except `HEAD`, `packed-refs` and `refs/**` (not `*.lock`). Access events are dropped: the watcher's own hashing opens files.
- Debounce 50 ms (`Limits::debounce`), then one batch on the blocking pool. Change by content hash against the watcher's own table of last hashes (seeded by one walk at start); a removed folder removes every known file under it. The first batch after seeding counts every path as written, so nothing changed during the seed walk is lost.
- The batch goes to `Backend::apply_changes`; `ChangeSet::pushes()` go out in order. An engine error of kind `fatal` becomes a `fatal` push; the server keeps serving.
- Overflow (`need_rescan`, or a watcher error) compares every file again and pushes `resync`. Polling (1 s, content compare) on WSL `/mnt/*` or when native events fail.
- Echo step: a written file whose hash is in the echo table is marked as the server's own write (050/35).
- Tests: unit `changes_are_decided_by_content`, `noise_is_ignored_and_git_refs_are_not`; integration `a_change_on_disk_becomes_one_push_and_a_touch_none` (touch → nothing; save by rename → one `changed` with the new hash).
- Not built: the separate ~100 ms git-ref debounce; a git directory outside the project root or in a worktree; per-section watch roots (needs a site API).

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/server/` (the watcher module), calling `agentks-site` (`apply_changes`) and the cache crate.

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
- Decided (claude, 2026-10-01): the watcher keeps its own table of last content hashes, seeded by one walk, because `FileChange` must arrive already confirmed by hash and the site exposes no per-file hash.
- Decided (claude, 2026-10-01): until the site names its watch roots, the watcher watches the whole project root and drops noise by path, because a missed change is worse than an extra event; the site should expose the real roots (sections, config, themes, local libraries, git refs).
- Decided (claude, 2026-10-01): an echoed save still goes through `apply_changes` and is pushed as `changed`; the `saved` push replaces it once `agentks-api` has `saved`, because the index must learn the new hash either way.

# 05 Notes & Analysis

## Watch out
- Hashing every file on a large checkout costs time; hash only paths in the batch, in parallel on the blocking pool.
- The git-ref debounce (~100 ms, [040/70](../040_caching/70_git-dates-cache.md)) is separate from the content debounce (~50 ms). A rebase fires both; process content first so pushed dates match pushed pages.
