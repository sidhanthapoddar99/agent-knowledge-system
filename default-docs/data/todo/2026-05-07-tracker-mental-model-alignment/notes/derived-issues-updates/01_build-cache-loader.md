---
title: "Build the issue-date cache loader (git walk + invalidation logic)"
---

- [ ] Create `astro-doc-code/src/loaders/issue-dates.ts` exporting `getIssueDate(trackerRoot, issueSlug)` and `getAllIssueDates(trackerRoot)`. Internally owns the per-tracker in-memory cache.
- [ ] **Cold-start build**: run `git log --no-merges --name-only --pretty=format:'§%aI' -- <trackerRoot>` once per tracker. Stream stdout, parse line-by-line, take the first date seen per path (git log is reverse-chronological → first hit = most recent commit). Aggregate per-issue as `max()` over the issue folder's files.
- [ ] **Incremental refresh**: store `syncedAt = <HEAD SHA>` alongside the per-tracker map. On invalidation:
  - `git merge-base --is-ancestor <syncedAt> HEAD` → exit 0 → incremental walk: `git log <syncedAt>..HEAD --name-only --pretty=format:'§%aI' -- <trackerRoot>`, patch affected entries (recompute `max()` for each touched issue).
  - Anything else → full rebuild.
- [ ] **Watcher integration**: register `.git/HEAD` (and the active branch ref under `.git/refs/heads/<branch>`) with the existing `cacheManager.setWatchPaths()` so the dev server invalidates on commit / checkout / pull.
- [ ] **Fallbacks**:
  - Repo isn't a git checkout (`.git/` missing) → cache stays empty, `getIssueDate()` returns null, callers fall back to `created` (folder slug date).
  - Issue folder has no committed files yet → `getIssueDate()` returns null → callers fall back to `created`.
- [ ] **No disk persistence.** In-memory only. Cold-start cost is sub-2-second at the hypothetical 200k-file scale and well under a second at realistic scale. Don't introduce a `.cache/` file.
- [ ] **Test**: cold start populates correctly; incremental refresh after a `git commit` on a watched file updates only that issue's date; full rebuild on `git checkout <other-branch>` produces same map as a fresh cold start.

## Implementation notes

- Use `child_process.spawn` (not `exec`) and stream stdout — output for 200k files can be ~6 MB.
- Author date (`%aI`) over committer date (`%cI`) — survives rebase, reflects original edit intent.
- Pathspec `-- <trackerRoot>` is critical for performance: scopes the diff machinery to commits that touched the path. Without it, you'd walk the whole repo.
- The `§` separator (or any byte that won't appear in git output) lets you distinguish date markers from filename lines in the stream parser.

## Files likely touched (created)

- `astro-doc-code/src/loaders/issue-dates.ts` (new)
- `astro-doc-code/src/loaders/cache-manager.ts` — register the new watch paths.
- `astro-doc-code/src/loaders/index.ts` — re-export.
