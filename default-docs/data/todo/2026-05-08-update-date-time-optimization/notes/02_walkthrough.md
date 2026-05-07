---
title: "Walkthrough — what happens, when, and how long it takes"
sidebar_label: "Walkthrough"
---

# Walkthrough — what happens, when, and how long it takes

Plain-language walk-through of the proposed cache flow. Six scenarios you'll actually hit during dev, each shown as a timeline with concrete timings. All numbers are typical for a 500-issue tracker; small-tracker numbers are even faster.

## The cache, in one sentence

A JSON file per branch that stores `<issue-folder> → most-recent-commit-date`, kept fresh by the watcher itself, so reads never wait on git.

```
.cache/<repo>/<branch>.json    →   { lastUpdateHash, issues: { slug: ISO-date, ... } }
```

The running server holds **only the active branch's cache** in memory. Disk is the persistence layer.

---

## Scenario 1 — Server start, first time ever (cold)

You just cloned the repo. No cache files exist. You run `bun run dev`.

```
T=0ms      `bun run dev` starts the server
           │
T=10ms     Astro hits its `astro:server:setup` hook
           │
T=11ms     Our integration looks for .cache/<repo>/<currentBranch>.json
           │            → not found
           │
T=12ms     Full walk:
           │   git log --no-merges --name-only --pretty=format:'§%aI'
           │           -- default-docs/data/todo
           │
T=300ms    Walk finishes (500 issues, ~3000 commits touching tracker = ~280ms)
           │   In-memory map populated with every issue's date
           │
T=305ms    Atomic write to .cache/<repo>/<branch>.json (~5ms)
           │
T=310ms    Server is fully ready. First request can land at any moment.
           │
... (server idle, waiting for requests) ...
           │
T=2.5s     User opens /todo in browser
           │
T=2.501s   SSR calls getIssueDate(...)  →  pure Map.get(), ~50µs
T=2.502s   Render finishes
T=2.510s   HTML reaches browser
```

**Felt latency**: 0 ms on the request. The cold cost was paid before any request arrived.

---

## Scenario 2 — Server start, cache file already exists, HEAD matches

You restart the dev server. Nothing has changed in git since last shutdown.

```
T=0ms      `bun run dev` starts
           │
T=10ms     Astro hits `astro:server:setup`
           │
T=11ms     Read .cache/<repo>/<branch>.json from disk
           │
T=14ms     Parse JSON (3ms for ~500 issues)
           │
T=15ms     git rev-parse HEAD → currentSha
           │
T=18ms     loaded.lastUpdateHash === currentSha   →  cache is already fresh, no work
           │
T=19ms     Server fully ready
```

**Felt latency**: 0 ms. Server-restart cost dropped from ~300 ms (full walk) to ~10 ms (read + parse).

---

## Scenario 3 — Server start, cache exists but HEAD has moved

You restarted, but in between you (or a teammate via pull) committed.

```
T=0ms      `bun run dev` starts
           │
T=10ms     Astro hits `astro:server:setup`
           │
T=11ms     Read .cache/<repo>/<branch>.json
T=14ms     Parse JSON
T=15ms     git rev-parse HEAD → currentSha
           │
T=18ms     loaded.lastUpdateHash !== currentSha
           │
T=19ms     git merge-base --is-ancestor loaded.lastUpdateHash currentSha
           │            → exit 0 (linear advance, e.g. ff-pull or local commit)
           │
T=24ms     Diff walk: git log <loaded.hash>..HEAD --name-only -- <tracker>
           │
T=33ms     Walk finishes (5 commits in range = ~9ms)
           │   Patch the entries for touched issues
           │
T=34ms     Atomic write to update the JSON
           │
T=38ms     Server fully ready
```

**Felt latency**: 0 ms. Catching up on missed commits is ~10× faster than a full walk.

---

## Scenario 4 — You commit a file inside an issue folder (the common case)

Server is running. You save your work and `git commit`.

```
T=0ms      `git commit` lands. .git/refs/heads/<branch> rewrites to point at new SHA.
           │
T=2ms      chokidar fires 'change' on .git/refs/heads/<branch>
           │
T=3ms      Our listener runs.
           │   entry.stale = true      (mark the in-memory cache stale)
           │
T=4ms      git rev-parse HEAD → newSha
           │
T=7ms      git merge-base --is-ancestor entry.lastUpdateHash newSha
           │            → exit 0 (linear advance — normal commit on active branch)
           │
T=8ms      git log <oldSha>..HEAD --name-only -- <tracker>
           │            (range = 1 commit; only that commit's tree is read)
           │
T=15ms     Walk finishes (~7ms for 1 commit touching 2 files in 1 issue)
           │   For each touched issue slug → entry.issues.set(slug, newDate)
           │   entry.lastUpdateHash = newSha
           │   entry.stale = false
           │
T=17ms     Atomic write to .cache/<repo>/<branch>.json
           │
T=20ms     Done. Cache is fresh in memory AND on disk. No reader was blocked.
           │
... (no work happening) ...
           │
T=8s       You navigate to /todo in browser
T=8.001s   SSR pulls the now-fresh cache value with a Map.get()
T=8.005s   HTML rendered
```

**Felt latency at user**: 0 ms. The watcher did the work in the background while you were still in your editor.

For comparison, today's lazy model: T=8s the user hits /todo, T=8.5s render finishes (full walk on the request path). That ~500 ms is what we eliminate.

---

## Scenario 5 — You commit something OUTSIDE the tracker (no-op for us)

You changed `astro-doc-code/src/loaders/issues.ts` and committed. Nothing about the tracker changed.

```
T=0ms      `git commit` lands. .git/refs/heads/<branch> rewrites.
           │
T=2ms      chokidar fires 'change'
           │
T=3ms      Listener runs.
T=4ms      git rev-parse HEAD → newSha
T=7ms      git merge-base --is-ancestor → linear ✓
           │
T=8ms      git log <oldSha>..HEAD --name-only -- default-docs/data/todo
           │           ← pathspec filters out non-tracker commits
           │
T=10ms     Walk returns empty stdout (no commit in range touched the tracker)
           │   No entries change. But we DO update lastUpdateHash anyway.
           │
T=11ms     entry.lastUpdateHash = newSha
           │   (Why? skipping the bump means the next commit's walk
           │    re-scans the same range. Always-bump is the correct invariant.)
           │
T=14ms     Atomic write (file content barely changed; just hash bump)
           │
T=15ms     Done.
```

**Cost of no-op commits**: ~15 ms per commit. Cheap, and the bump is essential for correctness.

---

## Scenario 6 — You switch to a branch you've been on before

```
T=0ms      `git checkout feature-foo`. .git/HEAD rewrites to "ref: refs/heads/feature-foo".
           │
T=2ms      chokidar fires 'change' on .git/HEAD
           │
T=3ms      Listener runs.
           │   First: persist the OUTGOING branch's current cache to its file
           │           (atomic write, ~3ms — usually a no-op if it was already saved)
           │
T=6ms      Parse new .git/HEAD → newBranch = "feature-foo"
           │
T=7ms      Read .cache/<repo>/feature-foo.json
T=10ms     Parse JSON
           │
T=11ms     git rev-parse HEAD → currentSha (which is feature-foo's tip)
           │
T=14ms     loaded.lastUpdateHash vs currentSha
           │
           │       Case A: equal              → no work; cache is up-to-date
           │       Case B: ancestor of HEAD   → diff walk to catch up (~10ms)
           │       Case C: non-linear         → full rebuild (~300ms; rare on
           │                                    a branch you've been on)
           │
T=15ms     (Case A — most common) In-memory cache now reflects feature-foo's state
           │
T=16ms     Reconcile watch set: stop watching .git/refs/heads/main,
           │                    start watching .git/refs/heads/feature-foo
           │
T=18ms     Done.
```

**Felt latency**: 0 ms at the user. Compare to today: full rebuild every time you switch branches, ~300–500 ms paid by the next reader.

---

## Scenario 7 — You switch to a brand-new branch (never seen before)

```
T=0ms      `git checkout -b experiment`. .git/HEAD rewrites.
           │
T=2ms      chokidar fires
T=6ms      newBranch = "experiment"
T=7ms      .cache/<repo>/experiment.json   →   not found
           │
T=8ms      Full walk required:
           │   git log --no-merges --name-only --pretty=format:'§%aI'
           │           -- default-docs/data/todo
           │
T=308ms    Walk finishes (~300ms for 500 issues)
           │   In-memory cache now reflects experiment's state
           │   (which equals the parent branch's state at branch-creation)
           │
T=311ms    Atomic write to .cache/<repo>/experiment.json
T=314ms    Reconcile watch set
T=315ms    Done.
```

**Felt latency**: 0 ms at the user (work happens on the watcher, not the request path). One-time cost; subsequent switches to `experiment` go through Scenario 6.

---

## Scenario 8 — A page render happens (any time)

This is the hot path. Measured at every request that asks for issue dates.

```
T=0ms      Request lands at /todo
           │
T=1ms      SSR starts rendering IssuesTable.astro
           │
T=2ms      For each issue (say 500 of them):
           │     getIssueDate(tracker, slug)
           │       └─ ensureFresh(tracker)    →  cache.has(tracker) ? return.
           │       └─ entry.issues.get(slug)  →  string | undefined
           │     ~50µs per issue × 500 = ~25ms total
           │
T=27ms     SSR finishes the table
T=30ms     HTML reaches the browser
```

**No git invocation. No file IO. Pure in-memory Map lookups.** This is the entire point — make the read path trivially cheap so it scales with issue count, not commit count.

---

## How the timings stack up across a day

A developer commits ~6 times an hour for 8 hours = 48 commits. About a third touch the tracker.

| Event | Count/day | Cost each | Total/day |
|---|---|---|---|
| No-op commits (don't touch tracker) | ~32 | ~15 ms | ~480 ms |
| Tracker-touching commits | ~16 | ~20 ms | ~320 ms |
| Branch switches (mix of known + new) | ~5 | ~15 ms (mostly known) | ~75 ms |
| Server restarts | ~3 | ~30 ms | ~90 ms |
| **Total background work per day** | | | **~1 s** |
| **Total request-path blocking per day** | | | **~0 s** |

For comparison, today's lazy model gives ~24 s/day of cumulative request-path blocking at the same scale.

---

## Why this design works

Three properties make it fast:

1. **Watcher pays the cost, not readers.** The user-visible latency is just the time SSR takes to do Map lookups (~25 ms for 500 issues). Git work happens off the request path.
2. **Diff walks scale with new-commits, not all-commits.** A single `git commit` walks 1 commit. A 5-commit pull walks 5. Past commits are paid for only once and stay paid via the persistent cache.
3. **Per-branch storage keeps switches cheap.** Branch switches go from "redo all the work" to "load 30 KB of JSON".

## Summary of cost-on-each-event

| Event | Cost (typical 500-issue tracker) |
|---|---|
| Server start, cache fresh | ~10 ms (read JSON, verify HEAD) |
| Server start, cache stale | ~20 ms (read + diff walk) |
| Server start, no cache | ~300 ms (full walk + write) — once per branch |
| `git commit` (touches tracker) | ~20 ms (watcher) |
| `git commit` (no tracker change) | ~15 ms (watcher; just hash bump) |
| `git checkout` to known branch | ~15 ms (watcher) |
| `git checkout` to new branch | ~300 ms (watcher) — once |
| Rebase / non-linear | ~300 ms (watcher; falls back to full rebuild) |
| **Page render** | **~25 ms** for 500 issues — never blocks on git |
