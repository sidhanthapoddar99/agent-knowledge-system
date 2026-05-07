---
author: claude
date: 2026-05-07
---

## What happens when you `git commit` (post-incremental, after subtask 03 lands)

```
1. you type git commit
   ↓
2. git writes the commit object + bumps .git/refs/heads/main
   to point at the new SHA
   ↓
3. chokidar sees .git/refs/heads/main change
   ↓
4. our listener runs:
       entry.stale = true           ← KEEP the entry, just mark stale
       (NOT cache.delete anymore)
   ~1 ms work, no git, no allocation.
   ↓
5. some time later, getIssueDate("2026-04-10-issues-layout") is called
   ↓
6. ensureFresh() sees a stale entry. It runs the discriminator:

       git merge-base --is-ancestor entry.syncedAt newHead
                                  └── ~5 ms ──────┘

   exit 0 → linear advance (e.g. straightforward `git commit`)
   exit non-0 → non-linear move (rebase, branch switch, force-update)
   ↓
7a. LINEAR PATH (the common case — 99 % of dev commits)

       git log --no-merges --name-only \
               --pretty=format:'§%aI' \
               <syncedAt>..HEAD \
               -- default-docs/data/todo

       └── walks ONLY commits between old-sync and new-HEAD ──┘
       └── for "1 commit since last sync" that's 1 commit total ─┘
       └── ~5–10 ms regardless of total tracker history ────────┘

   for each touched issue slug:
       entry.issues.set(slug, newCommitDate)   ← OVERWRITE, since
                                                  newer-than-syncedAt
                                                  is by definition newer
                                                  than any cached value

   entry.syncedAt = newHead
   entry.stale = false
   answer returned.
   ↓
7b. NON-LINEAR PATH (branch switch, rebase, force-update)

   fall back to fullBuild() — same as today's behaviour.
   correct because the commit set is genuinely different from
   what the cache holds. unavoidable for non-linear moves.
```

## Scope — unchanged

Same as before: a commit "touches" an issue when any path under
`<tracker>/<YYYY-MM-DD-slug>/**` is in the commit's changed-file list.
Pathspec filtering (`-- default-docs/data/todo`) still scopes the walk
to the tracker.

## Per-commit cost change

| Scenario | Today (full rebuild) | After subtask 03 (incremental) |
|---|---|---|
| `git commit` (linear, 1 commit) | walk all ~230 commits → ~500 ms | merge-base + walk 1 commit → ~15 ms |
| `git pull --ff-only` (linear, 5 commits) | ~500 ms | walk 5 commits → ~25 ms |
| `git checkout other-branch` | ~500 ms | discriminator says non-linear → fall back, ~500 ms |
| `git rebase -i HEAD~5` | ~500 ms × N events | fall back per event (debounce in subtask 05 helps coalesce) |

For your "commit every 10 minutes for an 8-hour day" scenario:
- 48 invalidations × ~500 ms = **~24 s of cumulative request-path blocking** today
- 48 invalidations × ~15 ms = **~0.7 s** with incremental
- **~30× faster.** Branch switches still pay the full cost (rare).

## What's tricky and how each is handled

| Concern | Handling |
|---|---|
| Branch switch / rebase produces non-linear history | `merge-base --is-ancestor` returns non-zero → full rebuild. Correct. |
| Issue folder deleted in a recent commit | Incremental walk sees deletion, slug gets the deletion-commit's timestamp. Loader skips the slug on disk-walk → orphan cache entry, never read. Bounded leak (~30 B/entry). Optional GC pass after incremental. |
| Concurrent watcher events | Use the watcher debounce from subtask 05 (~100 ms coalesce window) OR a single-flight lock on the refresh. |
| First-hit-per-slug semantics | In incremental mode, every entry walked is by definition newer than `syncedAt`, so always overwrite. Don't skip-if-present. |
| Detached HEAD / tags / weird states | merge-base operates on SHAs, doesn't care about ref shape. Works the same way. |

## Why this isn't already in

The original implementation (subtask 03 of the mental-model-alignment issue, before simplification) had this exact incremental path. It was deleted during the lazy-invalidation simplification because `cache.delete()` made the entry empty before the next read, leaving the incremental code unreachable. Honest mistake — invalidation should mark stale, not delete. Subtask 03 of THIS issue brings it back with the right invalidation contract.
