---
title: "Cleanup and metrics"
description: "How cache status, cache clean and cache reset work inside, why cleanup keeps everything when unsure, and the counters behind the dev toolbar."
---

Nothing in the machine home is cleaned on a schedule. Cleanup is a command the user starts, from the terminal or by asking an agent, and it always reports before it removes anything. This page explains how the three cache commands work inside `apps/agentks-engine/crates/cache/src/clean.rs`, and then the metrics every cache layer records.

## The three commands

| Command | Does | Changes anything? |
|---|---|---|
| `agentks cache status` | Sizes of the build caches, the library store, downloaded models and downloaded migration scripts | No |
| `agentks cache clean <root>…` | Scans the roots for projects, keeps what they need, reports the rest, removes it after a yes | After `--yes` or a confirmation |
| `agentks cache reset` | Removes the current project's build cache, for every engine build | After `--yes` or a confirmation |

An agent runs `clean` or `reset` only when the user asks, and shows the report first, because both delete files outside the project.

## cache status

`status(home)` reads `build-cache.json` when it is current, and walks the folders otherwise. It returns the build caches per project and engine build, every library commit, the models and the migration script folders, each with its size, plus notes such as "`build-cache.json` belongs to a newer agentks; sizes come from a walk".

## cache clean

Cleanup has two halves. `plan_clean` decides and changes nothing. `apply_clean` removes exactly what a plan lists.

### 1. Find the projects

Every agentks project has `config/dep.yaml`, so the scan walks each root looking for it. It skips `node_modules`, `target`, `data/builds`, every hidden folder (which covers `.git` and `.venv`) and the machine home itself. It never follows a symlink. Two overlapping roots, such as `~/projects` and `~/projects/acme`, count a project once. A large disk can take a few minutes; thoroughness matters more than speed here. The scan calls a progress callback for each folder it enters, so the CLI can show that it is moving.

### 2. Collect what is needed

- **Every commit in each found project's `dep.lock`.** The cache crate cannot read a lock file, so it asks through the `ProjectNeeds` trait, which `agentks-library` implements.
- **Everything a running server uses**, even when its project lies outside the scanned roots. The CLI passes the project keys of the running servers, read from their run records.

### 3. Keep everything when unsure

- If any found project's pins cannot be read, or a running server's project is unknown, **the plan removes no library commit at all**, and says why under `skipped`.
- A build cache is removable only when its recorded config folder is **confirmed gone**. A cache with no record, or one whose folder cannot be checked, is kept and listed under `skipped`.

An unsure answer keeps things, rather than guessing what is safe to delete.

### 4. Report

The plan lists the projects found, the library commits to remove with their sizes, the build caches to remove with their folders and sizes, everything skipped with the reason, and the total space freed. Under `--json` the CLI prints it as one document:

```json
{
  "plan": {
    "projects": ["/home/sid/projects/acme/docs"],
    "commits": [{ "host": "github.com", "repo": "acme/design-kit", "commit": "51aa0c3f…", "bytes": 1204331 }],
    "buildCaches": [{ "key": "8c1f0a9b3d2e4f56", "folder": "…", "bytes": 48213004 }],
    "skipped": [],
    "bytes": 49417335
  },
  "removed": false,
  "freedBytes": 0
}
```

### 5. Remove

`apply_clean` removes what the plan lists, and nothing else:

- It refuses a plan whose build cache path is not `build-cache/<key>` inside this machine home, before it removes anything, so a hand-edited plan cannot delete elsewhere.
- It takes each commit's install lock first, so a commit being installed at that moment is never removed.
- It restores write permission on a read-only commit folder before removing it.

**Cleanup is safe by construction.** A library commit removed by mistake, for example one a project outside the roots needs, is fetched again from that project's lock on its next start. A removed build cache is rebuilt. The cost is time and network, never content.

## cache reset

`reset_project(home, project)` removes one project's build cache folder, for every engine build, and drops its entry from `build-cache.json`. A running server keeps its memory cache until it restarts.

## Metrics

Every cache layer counts what it does, for the dev toolbar and `agentks cache status`. **Metrics never change behaviour**: nothing reads them to decide anything. They hold no user-identifying data.

| Type | Layer | Holds |
|---|---|---|
| `LayerMetrics` | Memory cache | Hits, misses, evictions, entries held, bytes held (resident values included) |
| `DiskMetrics` | Build cache | Hits, misses, rejected entries, writes, bytes written, in this process |
| `TimingWindow` | Any timed operation: a render, a git walk, a CSS compile | The newest 256 timings; a summary gives the count, the last, p50 and p95, in microseconds |

The build cache has its own type because "entries held" and "evictions" have no cheap meaning on disk, while a count of rejected entries does. Counters are atomics outside the cache locks, so counting costs nothing measurable on the request path. A timing window keeps the newest values and sorts them only when read, so recording one is a single push.

The dev toolbar's cache view reads a snapshot of these metrics over `/api`. It is available to localhost connections and to edit access keys only, never to read-only keys, because it reveals file paths.

## Related

- [The build cache on disk](./15_build-cache.md): `build-cache.json` and `project.json`, which cleanup reads.
- [The library store](./25_library-store.md): the locks and read-only folders cleanup respects.
- [The memory cache](./10_memory-cache.md): where `LayerMetrics` come from.
