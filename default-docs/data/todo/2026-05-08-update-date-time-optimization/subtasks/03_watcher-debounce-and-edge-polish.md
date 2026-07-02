---
title: "Watcher debounce + edge polish (optional)"
status: open
---

Optional polish layered on top of subtasks 01 and 02. Three small refinements that handle scripted-git operations, concurrent events, and cache-file hygiene. Land if the underlying pain shows up; skip otherwise — the unified design works correctly without these.

- [ ] **Watcher debounce** — `setTimeout(handler, 100)` wrapper around the git-ref change listener. Bursts of events from `git rebase -i`, `git commit --fixup`, scripted batch operations etc. coalesce into a single refresh. Reset the timer on each event; only fire when the burst settles.

   ```ts
   let burstTimer: NodeJS.Timeout | null = null;
   server.watcher.on('change', (file) => {
     if (!watchedGitPaths.has(file)) return;
     if (burstTimer) clearTimeout(burstTimer);
     burstTimer = setTimeout(() => {
       refreshIssueDateCache(...);
       burstTimer = null;
     }, 100);
   });
   ```

   Why 100 ms: long enough to coalesce a typical `rebase -i` (which fires many events sub-second), short enough that humans don't notice the delay between commit and cache update.

- [ ] **Single-flight lock** for concurrent refresh calls. If a watcher event lands while a previous refresh is still walking git, the second one waits or coalesces — never starts in parallel. A simple `isRefreshing: boolean` + a `pendingAfter: boolean` is enough; with debounce in place, this is mostly belt-and-suspenders.

- [ ] **Detached-HEAD entry/exit handling.** When the active state transitions from a branch to detached HEAD (or back), the branch-ref watch needs to update. Subtask 02 handles the file-load side; this subtask makes the watch-set reconciliation explicit:
   - Entering detached HEAD: stop watching `.git/refs/heads/<old-branch>`; in-memory only from here.
   - Returning to a branch: re-add the watch on the branch's ref file; load that branch's cache.

- [ ] **Orphan-branch GC at server start** — already in subtask 02's checklist as a "logged, not silent" pass. This subtask owns the polish: log line per orphan, count summary at startup, optional `--keep-orphans` flag for users who switch branches frequently and don't want files churned.

- [ ] **Test — `git rebase -i HEAD~5` with 3 squashes**: confirm only one cache-refresh event fires (not 5+ as it would without debounce). Logs should show one refresh after the rebase settles.

- [ ] **Test — concurrent commits via two processes**: simulate two simultaneous commits (rare but possible in scripted setups). Confirm the cache eventually settles to the correct state without corruption (file is atomic-renamed on each write; last-writer-wins is acceptable).

- [ ] **Test — detached HEAD round trip**: `git checkout <sha>` (enters detached); commit a few times; `git checkout main` (returns to branch). Confirm the cache transitions cleanly: detached state was in-memory only, returning to `main` reloads `main.json` and reconciles.

## Why this is optional

The core pain (request-path lag, server-restart cost, branch-switch cost) is fully addressed by subtasks 01 + 02. The items here matter only when:

- You frequently script git (rebase, fixup, scripted batch commits) and notice many redundant refreshes.
- You routinely operate in detached HEAD (uncommon outside specific workflows).
- You generate many short-lived branches and want orphan files cleaned automatically.

If none of those apply, subtask 03 stays open and that's fine.

## Files likely touched

- `astro-doc-code/src/dev-tools/integration.ts` — debounce wrapper, single-flight, detached-HEAD transitions, orphan logging.
- `astro-doc-code/src/loaders/issue-dates.ts` — minor: helper to detect detached state cleanly.
