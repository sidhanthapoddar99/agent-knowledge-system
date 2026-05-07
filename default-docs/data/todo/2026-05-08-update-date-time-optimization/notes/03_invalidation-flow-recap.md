---
title: "Invalidation flow recap — for the optimization subtasks"
sidebar_label: "Invalidation flow recap"
---

# Invalidation flow recap

Quick reference for the optimization subtasks under this issue. The fuller treatment lives in [`agent-log/001_cache-and-update-mechanism.md`](../../2026-05-07-tracker-mental-model-alignment/agent-log/001_cache-and-update-mechanism.md) of the mental-model issue. This page is just the diagram + the moving parts each subtask touches.

## The flow today

```
git commit / checkout / pull
        │
        ▼
chokidar fires `change` on  .git/HEAD  (or active branch ref)
        │
        ▼
listener in dev-tools/integration.ts → invalidateIssueDateCache()
        │
        ▼
cache.delete(trackerRoot)                ← cheap, no git spawn
        │
        ▼  (some time later)
        │
next reader → ensureFresh() sees cache empty → fullBuild() runs
        │                                      `git log` walk, blocking
        ▼
return entry.issues.get(slug)             ← O(1) Map lookup
```

## What each optimization changes

| Subtask | Changes which arrow |
|---|---|
| **01 — async background rebuild** | Decouples the rebuild from the next-reader call. Watcher event itself triggers the walk in the background; readers serve stale-or-empty without blocking. |
| **02 — pre-warm on server start** | Adds a one-shot `getAllIssueDates()` call inside the integration's setup hook, before any reader exists. |
| **03 — incremental refresh** | Replaces `cache.delete()` with a "stale flag", and replaces full `fullBuild()` with `<syncedAt>..HEAD` walk when the move is linear. Branch switch / rebase fall back to full rebuild. |
| **04 — disk persistence** | Wraps the in-memory cache with on-disk read at server-start and on-disk write on watcher events / shutdown. |
| **05 — watcher debounce** | Adds a 100 ms `setTimeout` between watcher event and `invalidateIssueDateCache()` to coalesce bursts. |

## Constraints that hold across all optimizations

- **The watcher is the only invalidation source.** Reads must never touch `git rev-parse HEAD` to verify freshness — that perf footgun is gone, don't bring it back. The watcher gives correctness; reads stay O(1).
- **`updated` always reflects committed history visible from the current checkout.** Branch switches must rebuild (or rebuild-async); never blend cross-branch data.
- **Fallbacks stay honest.** No `.git/` → `getIssueDate` returns null → caller substitutes `created`. This must hold under every optimization variant.
- **Public API is fixed.** `getIssueDate`, `getAllIssueDates`, `invalidateIssueDateCache`, `getIssueDateWatchPaths`. Optimizations are internal.

## Files each subtask is likely to touch

- `astro-doc-code/src/loaders/issue-dates.ts` — the cache loader itself (subtasks 02, 03, 04, 05).
- `astro-doc-code/src/dev-tools/integration.ts` — watcher wiring + pre-warm hook (subtasks 02, 03, 06).
- `astro-doc-code/src/loaders/issues.ts` — caller; should not need changes if API is preserved (sanity-check after each subtask).
