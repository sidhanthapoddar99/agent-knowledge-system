---
title: "Build cache on disk — per project, per engine version, self-healing"
status: review
---

Restarting a server, or running a CLI command, should not pay again for work already done: highlighted code, compiled CSS, rendered pages and git dates. The build cache keeps that work on disk under `~/.agentks/build-cache/`, per project and per engine version. Every entry is named by its content hash, written atomically, and ignored and rebuilt if anything about it is wrong.

# 01 To Do
- [ ] **The layout**, exactly as in the machine home note:
      ```
      ~/.agentks/build-cache/<project key>/<engine version>/
        git-dates/<branch>.json   pages/<render hash>.json   css/<hash>.css
        highlight/<hash>.json
      ```
      The project key comes from [040/50](./50_document-cache-by-location.md). `AGENTKS_HOME` overrides `~/.agentks` (for CI, containers and tests).
- [ ] **A small store API** in the cache crate: `get(kind, hash) -> Option<Bytes>`, `put(kind, hash, bytes)`, `path(kind, hash)` for large files served by streaming.
- [ ] **Atomic writes.** Write `<name>.tmp-<pid>-<random>` in the same folder, `fsync`, then rename over the target. Two writers of the same entry write the same bytes, so the last rename wins harmlessly.
- [ ] **Verify on read, cheaply.** Each entry starts with a small header: format version ([040/80](./80_cache-format-versions.md)), the key, and the length. A header that does not match, a short file or a parse failure means: delete the entry, log one line, rebuild. Never return partial data.
- [ ] **What is cached and what is not**, as the note says. Cached: git dates, rendered pages, CSS, highlighted code. Narration audio is not here: it lives in the machine-wide store `~/.agentks/audio/`, shared by every project and every engine version ([machine home](../../notes/02_engine/06_machine-home-and-build-cache.md) section 01). Not cached: the site index (rebuilt each start), anything keyed by time.
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
Review. The build cache and `build-cache.json` are built and tested.

## Result
Where: the main repository, `apps/agentks-engine/crates/cache/` (branch `wave2/cache`). Tests: `cargo test -p agentks-cache`, 36 tests in 0.06 s; `./ctl gate` green.

- `BuildCache` in `disk.rs`: `open`, `get`, `put`, `path`, `open_stream` (for audio: the file positioned after the header), `read_named` / `write_named` / `list_named` / `remove_named`, `record_usage`, `metrics`, `disabled_reason`.
- Entry layout: `build-cache/<key>/<engine>/<kind>/<hex>.<json|css|bin>`, each starting with the text line `agentks-cache <kind> <format> <key> <length>`. Writes go through `fs::atomic_write` (temporary file, fsync, rename, folder fsync).
- `index.rs`: `build-cache.json` (`{"format":1,"entries":[…]}`), updated under `build-cache.json.lock`; missing, broken or older → rebuilt by walking `build-cache/`; newer → left untouched. `build-cache/<key>/project.json` names the config folder and has its own format, `PROJECT_FILE_FORMAT`. `last_used` is `null` when the system clock is before 1970, never a made-up date.
- Tests: round trip; engine folders never share; five kinds of corrupt entry (short, flipped magic, wrong format, empty, another key's bytes) are deleted and read as a miss; two concurrent writers of 40 entries leave every entry valid and no temporary file; a read-only home opens the cache disabled; the index records, rebuilds and never downgrades.
- Left: the restart-without-render check needs the server; `AGENTKS_HOME` is honoured by `MachineHome::locate` in core.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/`, the cache crate.

**Read first:**
- [Machine home and build cache](../../notes/02_engine/06_machine-home-and-build-cache.md) — sections 01 (layout), 02 (what is cached), 03 (`build-cache.json`), 06 (concurrency).
- [Video artifacts](../../notes/04_ecosystem/05_video-pages.md) — narration audio lives in `~/.agentks/audio/`, not in the build cache, and is never committed.

**Depends on:** [040/10](./10_cache-keys-and-dependencies.md), [040/50](./50_document-cache-by-location.md), [040/80](./80_cache-format-versions.md).
**Unblocks:** [040/30](./30_in-memory-cache.md), [040/70](./70_git-dates-cache.md), [040/90](./90_clean-and-reset.md), [150/10 agentks build](../150_publishing/10_agentks-build.md) (build reuses the cache).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): machine-wide state lives in `~/.agentks/`, with a build cache per project.
- Decided (sidhantha, 2026-09-29): generated narration audio may live in the build cache and be embedded in a build, but is never committed.
- Proposed (claude, 2026-09-29), adopted here: the engine version is a level of the build cache path; `AGENTKS_HOME` overrides the home.
- Decided (claude, 2026-10-01): entry headers are one text line (`agentks-cache pages 1 b3:<hex> <len>`), so an entry can be inspected with `head` and the header check is a string compare.
- Decided (claude, 2026-10-01): generated audio lives in the machine-wide store `~/.agentks/audio/`, not in the build cache, because a clip is keyed by everything that decides its sound and is right for every project and engine version ([the voiceover's store](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/07_voiceover.md#08-the-store)). The audio kind this leaf built (`audio/<hex>.bin`, `open_stream`, `AUDIO_FORMAT`) is left over; the video issue's voice track ([070](../../../2026-09-29-narrated-video-pages/subtasks/070_voice-in-the-engine.md)) removes it when it builds the store.
- Decided (claude, 2026-10-01): each project cache gets `build-cache/<key>/project.json` (`{"format":1,"project":"<config dir>"}`), because without it a walk that rebuilds `build-cache.json` cannot name any project, and cleanup could not tell a dead cache from a live one.
- Decided (claude, 2026-10-01): a read-only home is detected at `open` by creating and removing a probe file; the cache then opens disabled (reads miss, writes are skipped) and `disabled_reason()` gives the one line to log, because the cache crate may not print.
- Decided (claude, 2026-10-01): `bytes` in `build-cache.json` is measured once when a project's entry is first created, then grows by the bytes this process wrote.
- Decided (claude, 2026-10-01): `project.json` has its own format, `agentks_cache::PROJECT_FILE_FORMAT`, not `BUILD_CACHE_INDEX_FORMAT`, because an index bump would otherwise make the `project.json` of every dead project unreadable, and clean would then keep those dead caches forever. It lives in the cache crate until `agentks_core::formats` adds it.

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
