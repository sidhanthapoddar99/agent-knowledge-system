---
title: "Scaling analysis — derived `updated` cache cost vs. tracker size"
sidebar_label: "Scaling analysis"
---

# Scaling analysis — when does the cold rebuild become laggy?

## Current implementation in two lines

`ensureFresh()` checks `cache.has(trackerRoot)`. If false, it spawns one `git log --no-merges --name-only --pretty=format:'§%aI' -- <tracker>` walk synchronously, populates the per-issue map, returns. Subsequent reads are O(1) `Map.get()`. The watcher in `dev-tools/integration.ts` clears the entry on `.git/HEAD` or active-branch-ref change → next read rebuilds.

So cost = one full git-log walk per invalidation event. The question is: how does that walk scale?

## What dominates the walk cost

- **Not** total issue count. The cache size scales with issues, but populating it doesn't — the walk visits commits, not issues.
- **Not** total repo commits. Git's pathspec filter (`-- <tracker>`) makes git skip commits that didn't touch any path under the tracker.
- **Yes** the count of **tracker-touching commits**. Each one contributes a header line + N filename lines to stdout, all of which we parse.
- **Yes** git's per-commit tree-diff cost. Internal to git, scales with commit-count linearly.

## Measured numbers

This repo on 2026-05-08:

```
Total repo commits:           ~331
Tracker-touching commits:      12
Cold walkLog wall-clock time:  ~11 ms
Output size:                   363 lines, 27 KB
```

## Linear projection

Roughly proportional to tracker-touching commits (git tree-diff is the bottleneck, our parsing is below the noise floor):

| Scenario | Tracker-touching commits | Estimated walk time | Verdict |
|---|---|---|---|
| Now (this repo) | 12 | ~11 ms | invisible |
| 1 year of moderate use | ~500 | ~80 ms | invisible |
| 3 K issues, 2 yr active project | ~3000 | ~500 ms | starts to feel laggy |
| 10 K issues, 5 yr long-running project | ~15000 | ~2.5 s | clearly laggy on the request path |

The ~500 ms threshold is where users start noticing a pause. Below that: imperceptible. Above: blocks the render visibly.

## When does the lag bite?

Cold rebuild only runs when the cache is empty. The cache is empty in three situations:

1. **Just after server start** — first `getIssueDate()` call populates the cache.
2. **Just after a git event** — watcher fires, `cache.delete()` runs, next reader rebuilds.
3. **Process restart** — fresh memory, no disk persistence today.

In each, the cost is paid by the **next reader on the request path**. That's the source of perceived lag.

## What scales gracefully

- **Reads after warm-up** — pure `Map.get()`, O(1). Even at 100 K issues, this is sub-millisecond.
- **Memory** — ~30 bytes per issue entry. 10 K issues = ~300 KB. Trivial.
- **Watcher cost** — single chokidar listener, dynamic watch set. Constant overhead.
- **stdout buffer** — capped at 64 MB; even 100 K commits with ~5 paths each ≈ 25 MB. Headroom remains.

## What doesn't scale gracefully (today)

- **Cold rebuild on the request path** — synchronous spawn-and-walk. Linear in tracker-touching-commits.
- **Watcher event = full rebuild** — incremental refresh was deleted as dead code under lazy invalidation; bringing it back is one of the optimizations.
- **No pre-warm** — first request after server start always pays full cold cost.
- **No persistence** — every restart rebuilds.

## Short version

We're imperceptibly fast today. Up to a few hundred tracker-touching commits, no one will notice anything. Past ~3 K commits, the request-path stutter becomes felt; past ~10 K, it's a clear bug. The optimization subtasks under this issue cover the path from "currently fast" to "fast at 10 × the scale", in incremental, low-risk steps.
