---
title: "Re-add incremental refresh for linear advances"
state: open
done: false
---

When subtask 03 of the mental-model issue first landed, the cache had an incremental-refresh path: on linear advance from `syncedAt` to `HEAD`, walk only `<syncedAt>..HEAD` and patch entries in place. We deleted that path during the simplification because lazy invalidation always cleared the entry first. Bring it back as a stale-flag variant: instead of `cache.delete()` on watcher fire, mark the entry stale; the next reader walks only the new commits if HEAD is a descendant of `syncedAt`.

Full rationale in [`../notes/02_optimization-options.md`](../notes/02_optimization-options.md) § 3.

- [ ] **Replace `cache.delete()` with a `stale: true` flag** in `invalidateIssueDateCache()`. Keep the entry around.
- [ ] **In `ensureFresh()`** — if entry is stale: capture `currentHeadSha`. If `merge-base --is-ancestor entry.syncedAt newHead`, walk `<syncedAt>..HEAD` and patch entries in place; clear stale, update `syncedAt`. Otherwise full rebuild.
- [ ] **Re-introduce `isAncestor()` helper** (was deleted during simplification).
- [ ] **Re-introduce the `sinceSha` parameter on `walkLog()`** — for the incremental path it's `<sinceSha>..HEAD`; for full rebuild it's null/all-history.
- [ ] **Branch switch must full-rebuild** — `merge-base --is-ancestor` returns non-zero on non-linear moves; the `else` branch handles this correctly by falling through to `fullBuild()`.
- [ ] **Test**: start with warm cache; commit; confirm next read does an incremental walk (`<syncedAt>..HEAD`, ~5 ms regardless of total history); branch-switch and confirm next read does a full rebuild.

## Compatibility with subtask 01 (async rebuild)

The async-rebuild promise should also use the incremental path when applicable — same `isAncestor` discriminator, same `<syncedAt>..HEAD` walk, just running in the background instead of in the request path. So if 01 has landed when this subtask is picked up, the async rebuild gets faster too.

## Trade-off

The incremental path needs a small invariant that nobody mutates `entry.issues` between syncs. We don't, so this is safe.

## Files likely touched

- `astro-doc-code/src/loaders/issue-dates.ts` — re-introduce stale flag, `isAncestor`, incremental walk path.
