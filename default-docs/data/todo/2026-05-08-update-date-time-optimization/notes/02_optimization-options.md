---
title: "Optimization options — five ranked approaches"
sidebar_label: "Optimization options"
---

# Optimization options — five ranked approaches

Each option is independent unless noted. Land them in ROI order; stop at the point where the perceived-lag concern is gone for your scale.

## 1. Move rebuild OFF the request path (highest ROI)

**Today:** watcher fires → `cache.delete()` → next request reader does the rebuild synchronously → render blocks for ~500 ms (at 3K-issue scale).

**Better:** watcher fires → kick off rebuild as a background promise → reader either gets fresh cache (rebuild done) or empty cache (rebuild in flight) — never blocks waiting for git.

Pseudo-code:

```ts
let pendingRebuild: Promise<CacheEntry> | null = null;

// Watcher handler:
invalidateIssueDateCache();
pendingRebuild = fullBuildAsync(trackerRoot);
pendingRebuild.then((entry) => {
  cache.set(trackerRoot, entry);
  pendingRebuild = null;
});

// Reader path:
function ensureFresh(trackerRoot: string): void {
  if (cache.has(trackerRoot)) return;       // hot path, no change
  if (pendingRebuild) return;                // serve stale-or-empty; don't block
  // No cache, no pending — cold start, do sync rebuild.
  fullBuildSync(trackerRoot);
}
```

**Cost:** swap `spawnSync` for `spawn` in the watcher-triggered path. Keep the sync version for the genuinely-cold first-ever read. ~30 lines.

**Trade-off:** brief window after a commit where the index shows stale data (the rebuild hasn't completed yet). Users typically don't notice — the previous values are still close to correct, and the cache fills in by the next render-tick anyway.

**ROI:** removes 100 % of the request-path lag from invalidations.

## 2. Pre-warm cache at server start

**Today:** the first `getIssueDate()` after `bun run dev` triggers the full cold walk synchronously inside the request that asked for it.

**Better:** kick off `walkLog` from the integration's `astro:server:setup` hook. By the time the first request lands, the cache is warm.

```ts
// integration.ts, after watcher setup:
queueMicrotask(() => {
  // Warms the cache for the default tracker.
  getAllIssueDates(defaultTrackerPath);
});
```

**Cost:** ~5 lines.

**Trade-off:** none. The walk runs once per server lifetime; it's already going to happen at some point — moving it forward just removes the user-perceived stutter on first navigation.

**ROI:** removes the "first issues page is slow" feel after server start. Doesn't help during ongoing churn (option 1 covers that).

## 3. Re-add incremental refresh

**Today:** every watcher event = full rebuild.

**Better:** keep the cache entry on watcher fire, mark it `stale: true`. Next read does:

```ts
function ensureFresh(trackerRoot: string): void {
  const entry = cache.get(trackerRoot);
  if (entry && !entry.stale) return;
  if (entry?.stale && isAncestor(entry.syncedAt, currentHeadSha())) {
    // Walk only the new commits.
    incrementalRefresh(entry, entry.syncedAt);
    entry.stale = false;
    return;
  }
  // Branch switch, rebase, or no entry → full rebuild.
  fullBuild(trackerRoot);
}
```

**Cost:** ~30 lines. Re-introduces the `isAncestor()` helper we deleted earlier.

**Trade-off:** the incremental path needs a small invariant that the existing entry is consistent with `syncedAt` — i.e. nobody mutated `entry.issues` between syncs. We don't, so this is safe.

**ROI:** in rapid-commit dev sessions ("I'm committing every 30 seconds during a refactor"), incremental refresh drops cost from full-walk to ~5 ms. Branch switches remain full rebuilds (correct — the commit set differs).

## 4. Disk-persisted cache

**Today:** every `bun run dev` does the full walk on the first issues-page load.

**Better:** persist `cache` to `.astro/issue-dates.json` on watcher events / process exit. On server start, load the file. Verify `syncedAt` against current HEAD; linear advance → incremental from there; otherwise full rebuild.

**Cost:** file I/O, schema versioning, gitignore entry, cleanup on schema change. ~60 lines.

**Trade-off:** another piece of cache state to manage. Schema-version skew across framework upgrades will mean stale on-disk caches get rebuilt — which is fine, but adds a code path.

**ROI:** only matters if your dev-server cycles often. For long-running dev sessions, option 2 already pre-warms.

**Verdict:** skip until there's a felt need. Option 2 covers most of the same UX win.

## 5. Watcher debounce

**Today:** rapid git events (interactive rebase, scripted commits) each fire a separate watcher event → invalidate → rebuild.

**Better:** debounce by ~100 ms. Rapid bursts coalesce into a single rebuild.

```ts
let debounceTimer: NodeJS.Timeout | null = null;
server.watcher.on('change', (file) => {
  if (!watchedGitPaths.has(file)) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    invalidateIssueDateCache();
    invalidateIssuesCache();
    /* + reconciliation block */
    debounceTimer = null;
  }, 100);
});
```

**Cost:** ~5 lines.

**Trade-off:** events are merged for ~100 ms, so a fast `git commit && git checkout` could be served as a single invalidation. Cache still rebuilds correctly because the second event includes the latest state.

**ROI:** marginal in normal use. Useful during scripted operations (rebase, squash, fixup) that fire many events in <1 s.

## Recommendation for the asked scale

For **3 K issues / busy churn**:

- **Land 1 + 2 together.** ~30 lines combined, no architectural risk. Removes both the on-request-path lag and the cold-start lag. That alone covers the perceived-lag concern up to ~3 K issues.
- **Add 3** if commit-during-dev churn becomes the bottleneck. Useful for long refactor sessions. ~30 more lines.
- **Skip 4 and 5** until there's a measured need. They're nice-to-have, not load-bearing.

For **10 K issues / 5 yr project**:

- All of 1, 2, 3 are needed.
- 4 (disk persistence) starts paying for itself when server restarts are frequent.
- 5 (debounce) becomes useful if commit churn is genuinely high.

## What's deliberately NOT on this list

- **SQLite-backed cache.** Overkill at the asked scales. Worth revisiting at 100 K+ issue trackers.
- **Switching to libgit2 / nodegit.** External dep; current `spawnSync` is fast enough at the asked scales. Not worth the dependency surface.
- **Per-file dates.** Not a perf optimization; a feature. Cache shape supports it (just store per-file in `walkLog`); bumps memory ~10 ×. Not in scope of this issue.
- **Caching across branches in the same process.** Different branches see different histories; conflating their caches would be wrong, not just complex. Each branch gets its own rebuild on switch — correct behaviour.
