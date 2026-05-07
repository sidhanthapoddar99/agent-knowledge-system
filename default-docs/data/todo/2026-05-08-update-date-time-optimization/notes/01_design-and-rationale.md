---
title: "Design + rationale — branch-keyed persistent cache with eager incremental update"
sidebar_label: "Design + rationale"
---

# Cache scaling — design + rationale

The current derived-`updated` cache uses **lazy invalidation** (watcher deletes the entry; next reader does a full `git log` walk). At present scale (~12 tracker-touching commits) that walk is ~11 ms — invisible. As the tracker grows, the cost grows linearly in commits-touching-tracker, eventually crossing the perceptible-lag threshold.

This document captures the proposed end-state: an **eager incremental cache**, persisted **per branch** to disk, kept fresh by the watcher itself so reads never block on git.

For a step-by-step timeline of the proposed flow with concrete timings, see [`02_walkthrough.md`](./02_walkthrough.md).

## When does the cost start to bite?

The cost dominator is **tracker-touching commits**, not total issue count. Git's pathspec filter (`-- <tracker>`) skips commits that didn't touch anything under it; among the rest, every commit contributes a header line + N filename lines that we parse.

| Scenario | Tracker-touching commits | Walk cost (today) | Verdict |
|---|---|---|---|
| Now (this repo) | ~12 | ~11 ms | invisible |
| 1 yr moderate use | ~500 | ~80 ms | invisible |
| 3 K issues / 2 yr active | ~3 000 | ~500 ms | starts to feel laggy |
| 10 K issues / 5 yr | ~15 000 | ~2.5 s | clearly laggy on the request path |

The cost is paid **on the request path** — whichever HTTP request is the first reader after a watcher event eats the full walk synchronously. For a project committing every ~10 minutes during an 8-hour day, that's ~48 invalidations × ~500 ms = **~24 s of cumulative request-path blocking** in the 3 K-issue case. Not catastrophic, but the kind of paper-cut lag that makes the dev experience feel sluggish without anyone being able to point at it.

## Today's flow (lazy invalidation)

```
1. git commit
2. .git/refs/heads/<branch> changes
3. chokidar fires → listener → cache.delete(tracker)        (~1 ms)
4. some time later, a render asks for getIssueDate(...)
5. ensureFresh sees empty cache → runs FULL walk
   git log --no-merges --name-only --pretty=format:'§%aI' -- <tracker>
   (cost grows linearly in tracker-touching commits)
6. cache populated; answer returned
```

Properties:
- Reads pay the cost.
- Branch switches always re-walk full history.
- Server restart loses the cache; first request after restart pays full walk.
- No persistence. In-memory only.

## Proposed flow (eager incremental, branch-keyed, persistent)

```
On server start:
  1. load .cache/<repo>/<currentBranch>.json (or empty)
  2. if missing | schema mismatch | corrupt → full walk + save
     else if loaded.lastUpdateHash != currentHEAD
            → walk loaded.lastUpdateHash..HEAD (diff only) + save
     else  → no work
  3. server ready, cache fully populated

On git commit (active branch):
  1. chokidar fires
  2. listener does diff walk:
       git log <lastUpdateHash>..HEAD --name-only -- <tracker>
       update touched issue entries with the new commit's date
       lastUpdateHash = newHEAD
       atomic write of <branch>.json
     (~5 ms for no-op commits, ~15 ms for typical commits)
  3. cache fresh BEFORE any reader arrives → reads never block

On git checkout other-branch:
  1. chokidar fires on .git/HEAD
  2. listener:
       newBranch = parse .git/HEAD
       if .cache/<repo>/<newBranch>.json exists
            → load it; if behind currentHEAD, diff walk from there
       else → full walk + save
     reconcile watch set (point at new branch's ref)
```

Cache file shape:

```
.cache/<repo-fingerprint>/
├── main.json
├── feature-foo.json
└── feature-bar.json

each <branch>.json:
{
  "schemaVersion": 1,
  "lastUpdateHash": "b9d2c20...",
  "issues": {
    "2026-04-10-issues-layout":             "2026-05-08T03:20:41+05:30",
    "2026-05-07-tracker-mental-model-...":  "2026-05-08T03:20:41+05:30",
    ...
  }
}
```

The running server holds **only the active branch's cache** in RAM; switching branches reloads the relevant file.

## Current vs. proposed — comparison table

| Dimension | Today (lazy in-memory) | Proposed (eager, branch-keyed, persistent) |
|---|---|---|
| **Cache shape** | One Map per tracker, in memory only | One JSON file per branch on disk + active branch in memory |
| **Invalidation strategy** | Push-delete on watcher, pull-rebuild on read | Push-update on watcher (eager incremental walk) |
| **Walk type per event** | Full history every time | Diff `<lastHash>..HEAD` (1 commit ≈ 1 commit walk) |
| **Cost on `git commit` (touches tracker)** | next reader pays ~500 ms (at 3 K scale) | watcher pays ~15 ms; readers free |
| **Cost on `git commit` (no tracker change)** | next reader pays ~500 ms | watcher pays ~5 ms (just hash bump); readers free |
| **Cost on `git checkout <known-branch>`** | full rebuild ~500 ms | load file + diff walk ~15 ms |
| **Cost on `git checkout <new-branch>`** | full rebuild ~500 ms | full rebuild + save ~500 ms (one-time) |
| **Cost on rebase / force-update** | full rebuild ~500 ms | discriminator falls through to full rebuild ~500 ms (correct) |
| **Cost after server restart** | full rebuild on first request ~500 ms | load JSON ~3 ms + diff walk if behind ~15 ms |
| **Cost of reads (always)** | varies (cache state-dependent) | always O(1) Map.get() |
| **Time-to-fresh after commit** | until first reader hits SSR | immediate (cache pre-updated by watcher) |
| **Branch isolation** | none (global cache thrashed on every switch) | per-branch files; switches don't trash other branches' work |
| **Failure modes** | corrupt git state → ensureFresh returns null silently | same + on-disk JSON corruption → discard & rebuild + schema-version mismatch → discard & rebuild |
| **Lines of code (loader)** | ~150 (current `issue-dates.ts`) | ~250 (estimate after changes) |
| **Net request-path blocking time per 8-hr day @ 6 commits/hr** | ~24 s | ~0 s |

## Edge cases and how each is handled

| Concern | Handling |
|---|---|
| Linear advance (commit, ff-pull) | `merge-base --is-ancestor` returns 0 → diff walk |
| Branch switch to known branch | Load that branch's cache file → diff walk if behind |
| Branch switch to new branch | No cache file → full walk → save under new branch's name |
| Rebase / force-push to local | Discriminator returns non-zero → full rebuild |
| Branch deleted | Cache file orphans → GC pass on server start drops files for branches not in `git branch --list` |
| Detached HEAD | No branch name → skip persistence; in-memory only (transient state, getting back to a branch reloads from disk) |
| Concurrent watcher events (rebase / fixup bursts) | Watcher debounce (~100 ms coalesce) OR single-flight lock |
| Two processes on same repo | Atomic rename (`<branch>.json.tmp` → rename); last-writer-wins; self-healing |
| Schema change across framework versions | `schemaVersion` field; mismatch → discard + rebuild |
| Issue folder deleted in recent commit | Walk picks up deletion path → assigns slug → loader skips on disk-walk → orphan entry; bounded leak; optional GC |
| `git fetch` (no local ref change) | Listener doesn't fire (we watch local refs only) — correct, fetch alone doesn't change YOUR branch's history |
| `git pull` with merge | Active branch ref moves → diff walk handles the merge commit normally |
| No-op commits (don't touch tracker) | Walk returns empty → bump `lastUpdateHash` → small disk write. ~5 ms. Essential — skipping the bump means re-walking the same range on next commit |

## Why eager (not async) at this work size

An earlier draft of this issue had a separate "async background rebuild" subtask: kick off a `Promise<CacheEntry>` on each watcher event so readers serve stale-or-empty without blocking. With incremental walks at ~15 ms, **async machinery is overkill** — running the diff walk synchronously inside the watcher handler keeps the reader path equally non-blocking (the cache was already fresh by the time the reader arrived) without the complexity of pending-promise state, generation counters, or atomic-swap logic.

So the unified design **collapses async-background into the watcher path itself**. Watcher does the work synchronously; it's just ~15 ms of work, and it happens off any user request.

## What this is *not*

- **Not a substitute for the watcher.** chokidar is what triggers the listener. Without it (production builds, CI), the cache populates once at first read and stays — correct, since builds are one-shot.
- **Not push notifications to the browser.** SSR still needs the user to navigate or refresh. The cache is fresh in memory; the next render reflects it; the browser doesn't auto-update.
- **Not relevant to read-side perf.** Reads were already O(1) once populated. This design optimises *invalidation cost*, not *read cost*.

## Subtask mapping

The three subtasks in this issue carve the design into shippable, independently-verifiable slices:

| Subtask | Delivers |
|---|---|
| **01 — Eager incremental refresh (in-memory)** | Diff-walk mechanism + stale-flag invalidation + watcher does sync update. Validates the engine without disk-state complexity. **Land first.** |
| **02 — Branch-keyed persistent cache + pre-warm** | `.cache/<repo>/<branch>.json` files, atomic writes, server-start load + reconcile, branch-switch fast path. **Land second; depends on 01.** |
| **03 — Watcher debounce + edge polish** | 100 ms debounce for scripted-git bursts, detached-HEAD handling, orphan-branch GC. **Optional; land if the pain is felt.** |

Together, **01 + 02** delivers the full unified design.
