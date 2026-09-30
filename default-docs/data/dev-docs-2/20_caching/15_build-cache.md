---
title: "The build cache on disk"
description: "BuildCache: the per-project cache under ~/.agentks/build-cache/, the project key, the entry header, atomic writes, the read-only case and build-cache.json."
---

The build cache keeps expensive results on disk between runs, so a restarted server serves a page it rendered yesterday without rendering it again. It is `BuildCache`, in `apps/agentks-engine/crates/cache/src/disk.rs`. There is one cache folder per project and engine build, inside the machine home.

## What it holds, and what it does not

| Cached | Why |
|---|---|
| Rendered page data, by render key | Rendering is cheap but not free across thousands of pages |
| Compiled theme CSS | Merged once per set of theme inputs |
| Highlighted code blocks | The costliest step of rendering |
| The tracker's git dates, per branch | Walking git history is the slow part of loading a tracker |

| Not cached | Why |
|---|---|
| The site index | Rebuilding it takes milliseconds, and a stale index is the worst kind of wrong |
| Anything keyed by a modification time | Some file systems report unreliable times |

Nothing in the build cache is the only copy of anything. Losing the folder costs time, never content.

## The layout

```
~/.agentks/
  build-cache.json                     the index of every project's build cache
  build-cache/
    <project key>/
      project.json                     which config folder this cache belongs to
      <engine folder>/
        pages/<key hex>.json           rendered page data
        css/<key hex>.css              compiled theme CSS
        highlight/<key hex>.json       highlighted code
        git-dates/<branch>.json        the tracker's dates for one branch
```

- **The machine home** is `~/.agentks/`, or `%USERPROFILE%\.agentks\` on Windows. The `AGENTKS_HOME` environment variable moves it, for CI, containers and tests. It must be an absolute path.
- **The project key** is the first 16 hex digits of the BLAKE3 hash of the project's canonical config folder path. `project_identity` resolves symlinks first, so a project reached through a symlink and through its real path gets one key. When the path cannot be made canonical, it falls back to the absolute path and tells the caller to log it.
- **A moved project** gets a new key and starts with a cold cache. The old folder is removed by the next `agentks cache clean`, because its recorded config folder no longer exists.
- **The engine folder** is the engine version, such as `1.0.0`. A development build adds its commit, as `1.0.0+<12 hex digits>`, so a changing working tree never reads its own stale output. Two engine builds never read each other's entries.

## The entry format

Every entry starts with a one-line text header, then the body:

```
agentks-cache pages 1 b3:5f1c…e0 48213
{"url":"/dev-docs/architecture/overview", …}
```

The header holds five fields: the magic word `agentks-cache`, the kind, the kind's format version, the key, and the body's length in bytes. Because the header is text, `head -1` shows what an entry is, and checking it is a string compare.

**On read**, the cache checks that the header names this kind, this format and this key, and that the body has exactly the announced length. An entry that fails any check, is short or is empty is deleted, counted as rejected, and read as a miss. It is rebuilt on the next render. Partial data is never returned. A read that fails for another reason, such as a permission error, is an error, not a miss.

**On write**, the cache uses `fs::atomic_write`: it writes a temporary file in the same folder, flushes it to disk, renames it over the target, then flushes the folder. A crash never leaves half a file. Two processes writing the same entry write the same bytes, because the name is the content's key, so the last rename wins harmlessly. On Windows, a rename over a file another process has open fails for a moment, so the write retries briefly.

Folders are created when first needed, and "already exists" is not an error.

## Named files

The git dates are not keyed by hash, but by branch: `git-dates/<branch>.json`. `read_named`, `write_named`, `list_named` and `remove_named` handle such files. A branch name is encoded into one safe file name, reversibly: `feature/foo` becomes `feature%2Ffoo`. Named files carry no header. They are JSON stores with their own `"format"` field, which the caller checks.

## A read-only home

`BuildCache::open` creates the folder and writes and removes a probe file. When that fails, as in a read-only container, the cache opens **disabled**: every read misses and every write is skipped, so agentks runs with memory caching only. `disabled_reason()` returns one line for the caller to log, since the cache crate never prints. The start does not fail.

## build-cache.json

`build-cache.json` indexes every project's build cache, so `cache status` and `cache clean` can answer without walking every folder:

```json
{
  "format": 1,
  "entries": [
    {
      "key": "8c1f0a9b3d2e4f56",
      "project": "/home/sid/projects/acme/docs/config",
      "engine": "1.0.0",
      "last_used": "2026-10-04T09:12:00Z",
      "bytes": 48213004
    }
  ]
}
```

- `BuildCache::record_usage` updates this project's entry at start and at shutdown, under a short lock on `build-cache.json.lock`.
- `bytes` is approximate and cheap: measured once when the entry is created, then increased by the bytes this process writes.
- `last_used` is `null` when the system clock reads a time before 1970, never a made-up date.
- A missing, broken or older file is rebuilt by walking `build-cache/`. A file written by a newer agentks is left untouched, and the older binary works without it.

Each project folder also holds `project.json`, which names its config folder: `{"format": 1, "project": "<config folder>"}`. It lets a rebuild of the index name each cache, and lets cleanup tell a dead project from a live one. It has its own format number, `PROJECT_FILE_FORMAT`, separate from the index's. Otherwise bumping the index format would make every dead project's `project.json` unreadable, and cleanup would keep those dead caches forever.

## Several processes at once

A server and several CLI commands may use the home at the same time:

- every write is atomic;
- an entry never changes once written, because its name is its content's key;
- `build-cache.json` is updated under a short file lock.

## Related

- [Format versions](./20_format-versions.md): the format number in each header and store.
- [The git dates cache](./30_git-dates.md): what lives in `git-dates/`.
- [Cleanup and metrics](./35_cleanup-and-metrics.md): how old caches are removed.
