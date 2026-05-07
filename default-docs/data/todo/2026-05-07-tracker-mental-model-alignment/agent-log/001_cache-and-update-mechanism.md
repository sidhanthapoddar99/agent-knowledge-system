---
iteration: 1
agent: claude
status: success
date: 2026-05-07
---

## Goal

Document the issue-dates cache mechanism end-to-end: how the cache populates, when it invalidates, what triggers refresh, and why each design choice was made. This is the canonical reference for [subtask 09 (`document-cleanup-in-dev-docs`)](../subtasks/09_document-cleanup-in-dev-docs.md) — when that subtask lands the dev-docs writeup, link to or quote this entry.

## What the cache stores

In-memory only. Per-tracker `Map<issueSlug, ISO-8601-author-date>`, keyed by the absolute tracker path. Plus a `syncedAt` SHA captured at populate-time (diagnostic only — reads do not compare against it).

```ts
interface CacheEntry {
  issues: Map<string, string>;  // "2026-04-10-issues-layout" → "2026-05-07T22:00:57+05:30"
  syncedAt: string;             // HEAD SHA when this entry was built
}
const cache = new Map<string, CacheEntry>();
```

No disk persistence. Process restart = full rebuild on first read. Acceptable because cold-start cost is one `git log` walk (~1–2 s for 1 000 issues; sub-100 ms for typical trackers).

File: `astro-doc-code/src/loaders/issue-dates.ts`.

## How a value is computed

Single git invocation, scoped to the tracker:

```bash
git log --no-merges --name-only --pretty=format:'§%aI' -- <tracker-relative-path>
```

- `--no-merges` — merge commits don't represent real edits.
- `%aI` — author date in ISO 8601 with timezone.
- `§` separator distinguishes commit headers from filename lines.
- Pathspec `-- <tracker>` makes git skip commits that didn't touch the tracker.
- Output is reverse-chronological. We walk it once and remember the first hit per issue slug — that's the most recent commit date touching anything under that issue's folder.

Path-to-slug extraction uses `FOLDER_PATTERN = /^\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*$/`. Anything outside an issue folder (e.g. tracker-root files) is filtered out.

## Update mechanism — the actual flow

This is the critical part. The cache uses **lazy invalidation**: watcher pushes a "throw it away" signal, the next reader does the rebuild work.

```
git commit / checkout / pull
        │
        ▼
chokidar fires `change` event on  .git/HEAD  (or the active branch ref)
        │
        ▼
listener in dev-tools/integration.ts → invalidateIssueDateCache()
        │
        ▼
cache.delete(trackerRoot)                ← cheap; just a Map mutation. NO git spawn here.
        │
        ▼
   (some time later — could be ms, could be minutes)
        │
        ▼
render / loader / docs-show calls getIssueDate(trackerRoot, slug)
        │
        ▼
ensureFresh() sees cache.has(trackerRoot) === false
        │
        ▼
fullBuild() runs                          ← single `git log` walk, populates the entry
        │
        ▼
return entry.issues.get(slug)             ← O(1) Map lookup
```

Subsequent reads (within the same session, between two watcher events) hit `if (cache.has(trackerRoot)) return;` and short-circuit. **No git invocation at all.** That's the entire reason this loader is fast: the hot path is a single `Map.has()` followed by a single `Map.get()`.

## Confirming "the cache only refreshes when an edit happens"

Yes. Concretely:

1. **`git commit` on the active branch** → `.git/refs/heads/<branch>` is overwritten by git → chokidar fires → cache cleared → next read rebuilds.
2. **`git checkout`** (any kind) → `.git/HEAD` rewrites → chokidar fires → cleared → next read rebuilds.
3. **`git pull --ff-only`** → branch ref advances → chokidar fires → cleared → next read rebuilds.
4. **Editing a tracked file in the editor** → does NOT change HEAD or any ref → no chokidar fire → cache stays. The commit-time changes the cache state, not the edit-time. (This is by design — `updated` reflects committed history, not unstaged edits.)
5. **No git activity between two reads** → cache untouched, hot path returns instantly.

## What was rejected and why

### Rejected: per-read HEAD comparison

Original implementation called `git rev-parse HEAD` on every `ensureFresh()` to compare against `entry.syncedAt`. With 37 issues per render, that meant 37 sync git spawns per page (~150 ms blocking). The watcher already provides authoritative invalidation; re-checking HEAD on every read was redundant and slow.

### Rejected: TTL-based revalidation

A 1-second TTL was briefly tried as middle ground — "trust the cache for N ms, then re-verify". Rejected because:
- The TTL value is arbitrary (why 1 s and not 10 s? not 100 ms?).
- It adds belt-and-suspenders logic for a problem the watcher already solves.
- If the watcher is broken, the right fix is to fix the watcher, not paper over with a TTL that re-spawns git "occasionally."

### Rejected: incremental refresh via `git merge-base --is-ancestor`

The earlier version had a code path that, on linear advance from `syncedAt` to `HEAD`, walked only `<syncedAt>..HEAD` and patched touched entries in place. With the watcher invalidating the entry entirely on any change, that path was dead code (the cache is always empty when the next read comes in). Removed.

### Rejected: disk-persisted cache

A `.cache/issue-dates.json` was considered for cold-start avoidance. Rejected — cold start is one `git log` walk, sub-100 ms for typical trackers. Not worth the complexity of cache-file invalidation, schema versioning, or cleanup on schema change.

## Watcher specifics

`getIssueDateWatchPaths()` returns up to two file paths (when the project is a git checkout):

1. `.git/HEAD` — the symbolic-ref or detached-HEAD pointer. Changes on `git checkout`, `git checkout -b`, detached-HEAD moves.
2. `.git/refs/heads/<active-branch>` — the commit SHA the active branch points at. Changes on `git commit` (HEAD itself doesn't move on a normal commit; the branch ref does).

Both are needed: watching only `HEAD` would miss in-place commits; watching only the branch ref would miss `git checkout`.

The integration registers a **single** change-listener, gated by a mutable `watchedGitPaths: Set<string>`. After every change event the handler:

1. `invalidateIssueDateCache()` + `invalidateIssuesCache()`.
2. Re-derives the desired watch set via `getIssueDateWatchPaths()`. After `git checkout other-branch`, this points at a different branch ref file.
3. `unwatch()` paths no longer desired; `add()` newly-desired paths. Updates `watchedGitPaths`.

This means: if you `git checkout -b new-branch` then `git commit` on the new branch, the second event still invalidates correctly — the watch set re-points to the new branch's ref after the first event.

## Fallbacks

- **No `.git/`** (e.g. `git archive` extract, fresh `mkdir`): `findRepoRoot()` returns null → cache never populates for that tracker → every `getIssueDate()` call returns null → caller (`loaders/issues.ts`) substitutes the issue's `created` date (parsed from the folder slug). Layouts render normally; the Updated column matches Created.
- **Never-committed issue** (folder exists, no commit touches it yet): `walkLog()` produces no entry for that slug → caller falls back to `created`. Honest signal — there's no recorded edit.
- **`git rev-parse HEAD` fails** (corrupt repo, transient git state): `currentHeadSha()` returns null → `ensureFresh()` returns without populating → next read tries again. Self-healing.

## Memory profile

- Cache size: bounded by tracker count × issues per tracker. ~30 bytes per issue entry. 1 000 issues = ~30 KB.
- `repoRootByPath`: bounded by distinct call sites of `findRepoRoot()` (effectively 1).
- One `git log` output buffer at populate-time, freed after `walkLog()` returns. Cap is `maxBuffer: 64 MB` — far more than any realistic tracker needs.
- No long-lived listener or subscription state.
- Audit on 2026-05-08: no leaks found, no infinite-cache risks. The watcher push and reader pull are decoupled with no recursive paths.

## Public API

```ts
import { getIssueDate, getAllIssueDates,
         invalidateIssueDateCache, getIssueDateWatchPaths }
  from '@loaders/issue-dates';

getIssueDate(trackerRoot, issueSlug): string | null     // hot path
getAllIssueDates(trackerRoot): Map<string, string>      // bulk read
invalidateIssueDateCache(trackerRoot?): void            // called by watcher
getIssueDateWatchPaths(): string[]                      // wired by integration
```

`loaders/issues.ts` reads via `getIssueDate(dataPath, id) ?? created` (issues.ts:379) — exactly one call per issue per render.

## Relationship to subtask 09

Subtask 09 in this issue is the deferred dev-docs writeup of the cleanup + new mechanisms. When that subtask lands a dev-docs page (target: `default-docs/data/dev-docs/05_architecture/`), it should reference this entry as the canonical source for the cache mechanism. Either link to the agent-log path or quote the relevant sections directly.
