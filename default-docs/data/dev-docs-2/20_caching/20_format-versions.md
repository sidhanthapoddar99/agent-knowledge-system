---
title: "Format versions"
description: "The format number every persisted store carries, the one read rule for all of them, and when to bump a format."
---

Every file agentks keeps in the machine home carries a format number. When the stored shape of a file changes, its number goes up, and every binary that finds a number it does not expect ignores the file and rebuilds it. This page lists the numbers, the read rule, and when to bump one.

**A cache is never migrated.** Caches are rebuilt. Only content is migrated.

## The format numbers

Each store has its own constant. Most live in `agentks_core::formats`, in `apps/agentks-engine/crates/core/src/home.rs`:

| Constant | Store |
|---|---|
| `PAGES_FORMAT` | Rendered page entries in the build cache |
| `CSS_FORMAT` | Compiled theme CSS in the build cache |
| `HIGHLIGHT_FORMAT` | Highlighted code blocks in the build cache |
| `GIT_DATES_FORMAT` | `git-dates/<branch>.json` |
| `BUILD_CACHE_INDEX_FORMAT` | `build-cache.json` |
| `RUN_RECORD_FORMAT` | `run/<project key>.json`, the record of a running server |
| `PORTS_FORMAT` | `ports.json`, each project's stable port |
| `SHARE_KEYS_FORMAT` | `share/<project key>.json`, the access-key store |
| `LIBRARY_STORE_FORMAT` | The completion marker of a library commit folder |

`agentks_cache::PROJECT_FILE_FORMAT`, in `apps/agentks-engine/crates/cache/src/index.rs`, versions `build-cache/<project key>/project.json`.

**No two files share a number.** A shared number would mean that bumping one file silently makes the other unreadable too. `project.json` has its own number for exactly this reason: if it shared the index's, an index bump would hide which caches belong to dead projects.

## Where the number is written

| Store | Where |
|---|---|
| Build cache entries | The third field of the entry's header line |
| JSON stores: `build-cache.json`, `project.json`, git dates, run records, `ports.json`, the access-key store | A top-level `"format": N` |
| A library commit folder | The completion marker `.agentks-complete`, which holds `{"format": N}`. The folder's files are the commit and never change, but the folder's layout could |

## The read rule

`check_json_format(bytes, expected)` is the one read rule for every JSON store:

| Result | Meaning | What the reader does |
|---|---|---|
| `Current` | This binary's format | Read it |
| `Older(n)` | An older format | Ignore it and rebuild |
| `Newer(n)` | A newer format | Ignore it. If the file is shared, leave it untouched |
| `Unreadable` | Not JSON, not an object, or no numeric `format` | Ignore it and rebuild |

A build cache entry of another format fails its header check, is deleted and reads as a miss. A library commit whose marker holds another format reads as not installed and is installed again.

## Shared machine files are never downgraded

Several agentks versions can live on one machine. A project pinned with mise may run an older binary beside a newer one. Some files are shared by every version: `build-cache.json` and the run records. For those:

- a file in a **newer** format is left untouched. The older binary works without it and says so once, for example "`build-cache.json` belongs to a newer agentks";
- a file in an **older** format is rebuilt in the current one.

So running an older and a newer agentks in turn never makes either one crash or read the other's data.

## Formats reach the browser too

The render, theme and highlight keys include their store's format number. The browser caches by the same hashes the engine sends, so a format bump gives new keys and the browser misses as well. Without this, a data format that changed without a version change, as happens between two development builds, would leave the browser showing stale data.

Development builds also add their commit to the engine folder of the build cache, so a changing working tree never reads its own old output.

## When to bump

Bump a store's format whenever its stored shape changes: a field added, removed, renamed or changing meaning. A bump is always safe, because the cost is one rebuild. **When unsure whether a change needs one, bump.**

A snapshot test in `apps/agentks-engine/crates/cache/src/index.rs` fails when the stored shape of `build-cache.json` or `project.json` changes, and says to bump the format. A store added later adds its own constant, uses `check_json_format`, and gets a wrong-format test.

## Related

- [The build cache on disk](./15_build-cache.md): the entry header.
- [The library store](./25_library-store.md): the completion marker.
- [Versioning](../50_versioning/01_overview.md): engine and content versions, which are a different thing.
