---
title: "Git dates cache — branch-keyed, eager, incremental issue `updated` dates"
status: open
---

An issue's `updated` date comes from git: the newest commit that touched anything under its folder. Walking git history is the slow part of loading a tracker: about 500 ms at 3,000 tracker-touching commits, and 2.5 s at 15,000. Today's engine pays it on the request path after every commit. This leaf builds the design that [2026-05-08-update-date-time-optimization](../../../2026-05-08-update-date-time-optimization/issue.md) wrote and deferred to the Rust engine: **eager** (the watcher updates the cache before any reader arrives), **incremental** (walk only `lastHash..HEAD`), **persistent** (on disk, in the build cache) and **branch-keyed** (one file per branch, so switching back is cheap). Reads never touch git.

# 01 To Do
- [ ] **The walk, from Rust.** Use gitoxide (the same Rust git library the library fetcher uses), so no `git` program is needed. The walk is the equivalent of
      `git log --no-merges --name-only --pretty=format:'§%aI' [<since>..HEAD] -- <tracker>`:
      for each non-merge commit touching the tracker, take its **author date** and the changed paths; map each path to its issue folder (the first path segment under the tracker that matches `YYYY-MM-DD-<slug>`); keep the newest date per folder.
- [ ] **In memory: the active branch only.** A map `issue folder → ISO date` plus `last_update_hash`. Reads are a map lookup.
- [ ] **On disk:** `~/.agentks/build-cache/<project key>/<engine version>/git-dates/<branch>.json`, written atomically ([040/40](./40_build-cache-on-disk.md)). Shape in section 01. Branch names with `/` are encoded (`feature/foo` → `feature%2Ffoo`), reversibly.
- [ ] **Start-up (pre-warm, before the server accepts connections):**
    - [ ] Load the active branch's file. Missing, corrupt or wrong format version → full walk, save.
    - [ ] `last_update_hash == HEAD` → done.
    - [ ] `last_update_hash` is an ancestor of `HEAD` (the `merge-base --is-ancestor` test) → diff walk `last..HEAD`, save.
    - [ ] Otherwise (rebase, force update, unrelated history) → full walk, save.
- [ ] **On a moved branch ref** (the watcher sees `.git/HEAD` or the active ref change; [050/30](../050_server/30_watcher-and-push.md)): run the same reconcile. Push the issues whose date changed.
- [ ] **Diff-walk rules** (carried from subtask 01 of the absorbed issue):
    - [ ] Every commit walked is newer than the cache, so **always overwrite** an issue's date; never skip because one is present.
    - [ ] **Bump `last_update_hash` even when the walk found nothing** (a commit that touched no tracker file). Otherwise the next walk re-scans the same range.
- [ ] **Branch switch** (subtask 02): save the outgoing branch's file, load the incoming one (or walk fresh), reconcile against `HEAD`, and make the watcher follow the new branch's ref file.
- [ ] **Detached HEAD:** no branch name → keep the cache in memory only; returning to a branch reloads its file.
- [ ] **Debounce and single flight** (subtask 03): coalesce ref events for ~100 ms, so `git rebase -i` gives one refresh; never run two walks at once — a second request while one runs sets a "run again after" flag.
- [ ] **Orphan branches:** at start, list local branches and delete cached files of branches that no longer exist. Log one line per file removed. This is cleanup of stale state inside our own cache, not user-data cleanup.
- [ ] **No git repository, or an issue never committed:** the date is absent, and the tracker loader shows the issue's `created` date instead, which is today's rule ([030/60](../030_rust-engine/60_tracker-loader.md)). Never invent a date.
- [ ] **Feed the keys.** Each reconcile bumps a `git_dates_generation` counter that is part of the issues-index key ([040/10](./10_cache-keys-and-dependencies.md)).

## Guardrails
- Reads never run a git walk. Only start-up and the watcher do.
- Keep the algorithm of the absorbed issue unless a test proves a rule wrong; its notes are the spec.
- A history rewrite always falls through to a full walk. Being fast is never worth a wrong date.

## Done when
Tests on a scripted fixture repository (create commits with fixed author dates):
- A commit touching one issue updates only that issue's date, and the walk covered one commit (count it).
- A commit touching no tracker file bumps `last_update_hash` with no date change.
- Restart with the cache warm and `HEAD` unchanged: no walk runs. Restart with `HEAD` two commits ahead: a diff walk of two commits runs.
- Switch `main → feature → main`: the second arrival at `main` loads its file and walks only what is new.
- `git rebase -i` squashing three commits triggers one refresh and a full walk, and the dates end correct.
- Detached HEAD round trip leaves no file for the detached state.
- A deleted branch's file is removed on the next start.
- Benchmark on a generated 15,000-commit tracker: warm start under 20 ms, one-commit update under 20 ms ([170/40](../170_testing/40_performance-budget.md)).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/`, the git module or crate that [030/10](../030_rust-engine/10_workspace-and-crate-boundaries.md) names, storing through the cache crate.

**Read first — the absorbed issue, which is the spec:**
- [Design and rationale](../../../2026-05-08-update-date-time-optimization/notes/01_design-and-rationale.md) — the flows, the cache-file shape, the edge-case table.
- [Walkthrough](../../../2026-05-08-update-date-time-optimization/notes/02_walkthrough.md) — timelines with timings for every scenario.
- [Deferred until the engine migration](../../../2026-05-08-update-date-time-optimization/notes/04_deferred-until-runtime-migration.md) — what changes in Rust.
- Its subtasks, all absorbed here: [01 eager incremental refresh](../../../2026-05-08-update-date-time-optimization/subtasks/01_eager-incremental-refresh.md), [02 branch-keyed persistent cache](../../../2026-05-08-update-date-time-optimization/subtasks/02_branch-keyed-persistent-cache.md), [03 watcher debounce and edge polish](../../../2026-05-08-update-date-time-optimization/subtasks/03_watcher-debounce-and-edge-polish.md).
- Today's code: [issue-dates.ts](../../../../../../agent-ks-engine/src/loaders/issue-dates.ts), [git-ref-watcher.ts](../../../../../../agent-ks-engine/src/dev-tools/server/git-ref-watcher.ts).
- [Machine home, section 01](../../notes/02_engine/06_machine-home-and-build-cache.md) — where `git-dates/<branch>.json` lives.

**Depends on:** [040/40](./40_build-cache-on-disk.md), [040/50](./50_document-cache-by-location.md), [030/60 tracker loader](../030_rust-engine/60_tracker-loader.md).
**Unblocks:** the issues index and issue pages; [050/30](../050_server/30_watcher-and-push.md) pushes its changes.

# 04 Decisions
- Decided (sidhantha, 2026-05-08, carried by the migration on 2026-09-29): the eager, incremental, branch-keyed, persistent design of the absorbed issue.
- Decided (claude, 2026-09-30): the walk uses gitoxide, so the tracker needs no `git` program; the cache lives in the build cache, not in the project's `.cache/`.
- Decided (claude, 2026-09-30): a missing date falls back to the issue's `created` date, as today.

# 05 Notes & Analysis

## 01 The cache file
```json
{ "format": 1, "branch": "main", "last_update_hash": "b9d2c20...",
  "issues": { "2026-04-10-issues-layout": "2026-05-08T03:20:41+05:30" } }
```

## 02 Why eager, not async
At ~15 ms per incremental walk, doing it in the watcher handler keeps readers free without pending-promise state or atomic swaps. The absorbed issue's note explains this in full.

## Watch out
- Merge commits are skipped (`--no-merges`), so a merge that only brings in another branch's changes dates each issue by its original commit. That is the intended meaning of `updated`.
- `git fetch` changes no local ref, so nothing fires. Correct: fetch alone does not change the checked-out history.
- A worktree has its own `HEAD` in `.git/worktrees/<name>/`; resolve the real git dir before watching.
