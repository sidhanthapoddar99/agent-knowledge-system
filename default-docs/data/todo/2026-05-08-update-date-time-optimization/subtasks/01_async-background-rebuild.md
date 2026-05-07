---
title: "Move cache rebuild off the request path (async background)"
state: open
done: false
---

Today the `git log` walk runs synchronously inside `ensureFresh()`, on whichever request happens to be the first reader after a watcher invalidation. At ~3 K issues this becomes a ~500 ms blocking pause on the request that draws the unlucky-first card. Decouple the rebuild from the request path: watcher fires → kick off an async rebuild → readers serve cached-or-empty without ever blocking on git.

Full rationale and implementation sketch in [`../notes/02_optimization-options.md`](../notes/02_optimization-options.md) § 1.

- [ ] **Add `pendingRebuild: Promise<CacheEntry> | null`** module-level state in `issue-dates.ts`.
- [ ] **`fullBuildAsync()`** — `spawn` (not `spawnSync`) version of `walkLog`. Returns a promise resolving to the `CacheEntry`.
- [ ] **Watcher path** — in `dev-tools/integration.ts`, after `invalidateIssueDateCache()`, call a new `prefetchIssueDates()` exported from `issue-dates.ts` that kicks off the async rebuild and atomically swaps it into the cache when ready. Don't block the watcher handler.
- [ ] **Reader path** — `ensureFresh()`: if cache populated, return; if `pendingRebuild` exists, return (serve empty/stale, don't block); otherwise (genuinely cold, never built) do the sync `fullBuild()` for correctness on first-ever request.
- [ ] **Atomic swap** — when `pendingRebuild` resolves, only swap the result in if no newer rebuild has started since (use a generation counter, or check that `pendingRebuild` reference hasn't changed).
- [ ] **Error handling** — if the async git spawn fails (e.g. transient git lock), log and clear `pendingRebuild` so the next read can retry. Don't poison the cache.
- [ ] **Test**: trigger a watcher event in dev mode; navigate to `/todo` immediately; confirm the page renders without blocking on git, and that the index reflects the post-commit dates within ~1 render cycle.

## Trade-off

There's a brief window after a commit where the index shows stale dates (rebuild hasn't completed yet). At ~500 ms rebuild time this means up to one render with stale data. In practice users don't notice — the previous values are still close to correct. Worth the trade for guaranteed-non-blocking renders.

## Files likely touched

- `astro-doc-code/src/loaders/issue-dates.ts` — add async build path + pending-promise state.
- `astro-doc-code/src/dev-tools/integration.ts` — call `prefetchIssueDates()` after invalidation.

## Coupling with subtask 02

These two pair naturally — 02 (pre-warm) runs the same `prefetchIssueDates()` once at server start. Land them in one PR.
