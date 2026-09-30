---
title: "Build cache on disk — per project, per engine version, self-healing"
status: open
---

Restarting a server, or running a CLI command, should not pay again for work already done: highlighted code, compiled CSS, rendered pages, git dates and narration audio. The build cache keeps that work on disk under `~/.agentks/build-cache/`, per project and per engine version. Every entry is named by its content hash, written atomically, and ignored and rebuilt if anything about it is wrong.

# 01 To Do
- [ ] **The layout**, exactly as in the machine home note:
      ```
      ~/.agentks/build-cache/<project key>/<engine version>/
        git-dates/<branch>.json   pages/<render hash>.json   css/<hash>.css
        highlight/<hash>.json     audio/<hash>.<ext>
      ```
      The project key comes from [040/50](./50_document-cache-by-location.md). `AGENTKS_HOME` overrides `~/.agentks` (for CI, containers and tests).
- [ ] **A small store API** in the cache crate: `get(kind, hash) -> Option<Bytes>`, `put(kind, hash, bytes)`, `path(kind, hash)` for large files served by streaming (audio).
- [ ] **Atomic writes.** Write `<name>.tmp-<pid>-<random>` in the same folder, `fsync`, then rename over the target. Two writers of the same entry write the same bytes, so the last rename wins harmlessly.
- [ ] **Verify on read, cheaply.** Each entry starts with a small header: format version ([040/80](./80_cache-format-versions.md)), the key, and the length. A header that does not match, a short file or a parse failure means: delete the entry, log one line, rebuild. Never return partial data.
- [ ] **What is cached and what is not**, as the note says. Cached: git dates, rendered pages, CSS, highlighted code, narration audio. Not cached: the site index (rebuilt each start), anything keyed by time.
- [ ] **Record usage** in `~/.agentks/build-cache.json`: for this project's entry, update `last_used` and `bytes` at start and on shutdown, under a short file lock. Shape in section 01 below.
- [ ] **Directory creation** is lazy and race-safe (`create_dir_all`, ignoring "already exists").
- [ ] **Read-only home.** If `~/.agentks` cannot be written (a read-only container), run with memory caching only and say so once. Do not fail the start.

## Guardrails
- Nothing in the build cache is ever the only copy of anything. Losing the folder costs time, never content.
- No cleanup here. Cleanup is [040/90](./90_clean-and-reset.md), started by the user.
- Two engine versions of one project never read each other's entries: the version is a folder level.

## Done when
- Restarting a server on a warm cache serves a previously viewed page without re-rendering it (a debug counter or log line proves no render ran).
- A test corrupts an entry (truncate it, flip its header) and the next read rebuilds it without an error reaching the user.
- A test runs two processes writing the same entries at once; every entry ends complete and valid.
- `AGENTKS_HOME=/tmp/x agentks start` writes only under `/tmp/x`.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/`, the cache crate.

**Read first:**
- [Machine home and build cache](../../notes/02_engine/06_machine-home-and-build-cache.md) — sections 01 (layout), 02 (what is cached), 03 (`build-cache.json`), 06 (concurrency).
- [Video pages](../../notes/04_ecosystem/05_video-pages.md) — narration audio in the build cache, never committed.

**Depends on:** [040/10](./10_cache-keys-and-dependencies.md), [040/50](./50_document-cache-by-location.md), [040/80](./80_cache-format-versions.md).
**Unblocks:** [040/30](./30_in-memory-cache.md), [040/70](./70_git-dates-cache.md), [040/90](./90_clean-and-reset.md), [150/10 agentks build](../150_publishing/10_agentks-build.md) (build reuses the cache).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): machine-wide state lives in `~/.agentks/`, with a build cache per project.
- Decided (sidhantha, 2026-09-29): generated narration audio may live in the build cache and be embedded in a build, but is never committed.
- Proposed (claude, 2026-09-29), adopted here: the engine version is a level of the build cache path; `AGENTKS_HOME` overrides the home.

# 05 Notes & Analysis

## 01 build-cache.json
```json
{ "entries": [ { "key": "8c1f...", "project": "/home/sid/projects/acme/docs/config",
                 "engine": "1.2.0", "last_used": "2026-10-04T09:12:00Z", "bytes": 48213004 } ] }
```
It lets `cache status` and `cache clean` answer without walking every folder. It is an index, so if it is missing or unreadable, rebuild it by walking `build-cache/`.

## Watch out
- Windows: rename over an open file fails. Retry briefly, and never hold entry files open longer than one read.
- Keep `bytes` approximate and cheap: add on write, do not walk the tree on every start.
