---
title: "Caching — every cache layer, who owns it, what invalidates it"
status: open
---

The index leaf of the caching group. agentks caches in three places: the engine's memory, the per-project build cache on disk under `~/.agentks/build-cache/`, and the browser. Plus one global store, the library cache. This group builds the server-side layers and the rules that keep every layer correct. The browser layer is built by the client groups ([080/00](../080_ui-and-client/00_overview.md), [090/00](../090_frontend-performance/00_overview.md)); this group defines the hashes they rely on.

# 01 To Do

| Leaf | Delivers | Status |
|---|---|---|
| [040/10 Cache keys and dependencies](./10_cache-keys-and-dependencies.md) | The one key function: engine version + content hash + embed hashes + settings fingerprint | open |
| [040/20 Settings invalidation](./20_settings-invalidation.md) | A map from each config key to the cache layers it invalidates | open |
| [040/30 In-memory cache](./30_in-memory-cache.md) | A least-recently-used cache with a byte budget | open |
| [040/40 Build cache on disk](./40_build-cache-on-disk.md) | `~/.agentks/build-cache/<project key>/<engine version>/…`, atomic, self-healing | open |
| [040/50 Document cache by location](./50_document-cache-by-location.md) | The project key, relative-path addressing, moved projects and moved files | open |
| [040/60 Library cache](./60_library-cache.md) | The global store `libraries/<host>/<repo>/<commit>/`: atomic, locked, read-only | open |
| [040/70 Git dates cache](./70_git-dates-cache.md) | Branch-keyed, eager incremental issue `updated` dates | open |
| [040/80 Cache format versions](./80_cache-format-versions.md) | A format version in every store; a mismatch rebuilds, never reads | open |
| [040/90 Clean and reset](./90_clean-and-reset.md) | `agentks cache status · clean <root>… · reset`, and `build-cache.json` | open |
| [040/95 Cache metrics](./95_cache-metrics.md) | Hit rate, size and eviction counts, for the dev toolbar and `cache status` | open |

**Order of work inside the group.** 10 → 50 → 80 first: they fix the key, the address and the format rules every other layer uses. Then 30 and 40 (the two page-data layers), 20 (needs the settings schema from [030/30](../030_rust-engine/30_config-loader-and-settings-schema.md)), 70 (needs the tracker loader), 60 (needed by the library group), 90 and 95 last.

## Guardrails
- **The server owns derived data.** Rendering, git dates, CSS, highlighting and search are computed once on the server and shared by every user and tab. The browser copy only saves a round trip; it is never the source ([server note, decisions](../../notes/02_engine/04_sync-engine-and-server.md)).
- **Keys are content hashes, never modification times.** WSL reports unreliable times ([machine home, section 02](../../notes/02_engine/06_machine-home-and-build-cache.md)).
- **When unsure, rebuild.** A cache entry that is missing, corrupt, from another format version or from another engine version is ignored and rebuilt. It is never read "best effort".
- **Cache what is expensive; re-derive the rest.** The site index is not persisted: the prior audit measured a full warm re-derivation at 7.8 ms.
- **No automatic cleanup** of anything on disk. Cleanup is a command the user starts (sidhantha, 2026-09-30).
- **One implementation.** The CLI and the server call the same cache code in the shared core.

## Done when
- Every leaf in the table is closed.
- `cargo test -p agentks-cache` (or the crate [030/10](../030_rust-engine/10_workspace-and-crate-boundaries.md) names) passes, including the invalidation tests from leaves 10 and 20.
- The end-to-end test in [170/30](../170_testing/30_end-to-end.md) shows: editing a page, an embedded file, a theme setting and a navbar item each refreshes exactly the affected views, with no restart.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where the work happens:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, in the Rust workspace `apps/agentks-engine/`.

**Read first (every leaf in this group):**
- [Machine home and build cache](../../notes/02_engine/06_machine-home-and-build-cache.md) — the `~/.agentks/` layout, the build cache, the library cache, cleanup, concurrency.
- [The Rust engine, section 06 Caching](../../notes/02_engine/03_rust-engine.md) — the three layers and the render hash.
- [Sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) — push of changed hashes; the caching decisions of 2026-09-30.
- [Client application, section 05](../../notes/03_frontend/02_client-application.md) — the browser layer that consumes these hashes.
- [Permissions and repositories](../../agent-memory/permissions-and-repositories.md) and [toolchain versions](../../agent-memory/toolchain-versions.md).

**Absorbed issues:**
- [2026-08-07-content-embed-cache-dependencies](../../../2026-08-07-content-embed-cache-dependencies/issue.md) → [040/10](./10_cache-keys-and-dependencies.md).
- [2026-05-08-update-date-time-optimization](../../../2026-05-08-update-date-time-optimization/issue.md) → [040/70](./70_git-dates-cache.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the hybrid — index at start-up, pages rendered on request and cached where it pays ([machine home](../../notes/02_engine/06_machine-home-and-build-cache.md)).
- Decided (sidhantha, 2026-09-30): the library cache is global, keyed by repository and commit; its size is not a concern.
- Decided (sidhantha, 2026-09-30): no automatic cleanup; cleanup is given a root folder and scans it.
- Decided (claude, 2026-09-30): derived data is cached once, on the server; the browser keeps a hash-checked copy plus UI state ([server note](../../notes/02_engine/04_sync-engine-and-server.md)).

# 05 Notes & Analysis

## 01 The layers at a glance

| Layer | Holds | Keyed by | Owner leaf | Invalidated by |
|---|---|---|---|---|
| Engine memory | Rendered pages, sidebars, indexes, compiled CSS | Render hash | [040/30](./30_in-memory-cache.md) | A new render hash; the byte budget |
| Build cache (disk) | Git dates per branch, rendered pages, CSS, highlighted code, narration audio | Project key → engine version → content hash | [040/40](./40_build-cache-on-disk.md) | A new hash (old entries become unused); `cache reset`; `cache clean` |
| Library cache (disk, global) | Library repositories at one commit | Host / repository path / commit | [040/60](./60_library-cache.md) | Never; a commit's content never changes. `cache clean` only |
| Git dates (disk + memory) | Issue `updated` dates for one branch | Project key → branch | [040/70](./70_git-dates-cache.md) | A moved branch ref (incremental walk); a rewrite (full walk) |
| Browser | Manifest, pages, sidebars, indexes; UI state | The hashes the engine sends; project key | [080/40](../080_ui-and-client/40_websocket-client.md), [090/20](../090_frontend-performance/20_data-cache-indexeddb.md) | A pushed hash change |

## Watch out
- A cache that answers "probably fine" is the defect class this project already hit twice (the SSR module isolation incident and the stale-embed bug). Every leaf's done-when includes an invalidation test, not only a hit test.
