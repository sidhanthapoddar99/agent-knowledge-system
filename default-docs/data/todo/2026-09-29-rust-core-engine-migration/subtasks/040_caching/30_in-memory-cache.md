---
title: "In-memory cache — least-recently-used, with a byte budget"
status: open
---

The engine keeps hot derived values in memory so a page view costs a map lookup, not a render. A large tracker has thousands of pages, and a long-running server must not grow without bound. This leaf builds one in-memory cache, shared by every connection and every user of a project's server, that evicts the least recently used entries once a byte budget is reached.

# 01 To Do
- [ ] **One cache per server process**, keyed by the keys from [040/10](./10_cache-keys-and-dependencies.md), holding serialised responses (the exact JSON bytes sent over `/api`), not Rust structs. Serving then costs no serialisation, and the size of an entry is known exactly.
- [ ] **Least-recently-used eviction with a byte budget.** Count the bytes of each value. Evict the least recently used entries once the total passes the budget.
    - [ ] Default budget: 256 MB (claude, proposed). A machine setting in `~/.agentks/settings.json`, key `cache.memory_mb`; see [040/50](./50_document-cache-by-location.md) for where machine settings live.
    - [ ] Never evict an entry that is being sent at that moment: hand out reference-counted handles (`Arc<[u8]>`), so eviction only drops the cache's own reference.
- [ ] **Two tiers of residency.**
    - [ ] Always resident, never evicted: the site index, the manifest, the compiled CSS, the git dates of the active branch. They are small and every request needs them.
    - [ ] Evictable: rendered pages, sidebars, issue details, highlighted code blocks.
- [ ] **Fill from disk before rendering.** On a miss, look in the build cache ([040/40](./40_build-cache-on-disk.md)) before rendering. After a render, write to both.
- [ ] **Single flight.** Two requests for the same missing key while it renders wait for the one render, not two. Use a per-key in-flight map of shared futures.
- [ ] **Invalidation.** Entries are keyed by content, so a change never needs to find and delete them: the new key simply misses. Old entries age out through the budget. Expose `drop_prefix(project)` only for `cache reset`.
- [ ] **Metrics hooks** for [040/95](./95_cache-metrics.md): hits, misses, evictions, bytes, entries.

## Guardrails
- Bounded memory is a requirement, not an optimisation: no unbounded map anywhere in the server.
- Rendering stays off the async threads (run it on the blocking pool), per [030/90](../030_rust-engine/90_memory-and-concurrency.md).

## Done when
- A unit test fills the cache past its budget and asserts total bytes stay under it and the oldest-used entries went first.
- A test fires 50 concurrent requests for one missing page and asserts exactly one render ran.
- A soak test on a generated 5,000-page project, browsing every page twice, keeps the process's resident memory under budget plus a fixed overhead ([170/40](../170_testing/40_performance-budget.md) sets the number).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/`, the cache crate.

**Read first:**
- [The Rust engine, section 06](../../notes/02_engine/03_rust-engine.md) — "In memory: the index; rendered pages; derived trees; keyed by render hash".
- The prior audit's [JIT rendering study](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/021_question_jit-rendering.md) — 1.83 ms p50 per uncached render, which is why memory caching pays for large sites only.
- Today's in-memory cache, for what not to repeat: [cache-manager.ts](../../../../../../agent-ks-engine/src/loaders/cache-manager.ts).

**Depends on:** [040/10](./10_cache-keys-and-dependencies.md), [030/90 memory and concurrency](../030_rust-engine/90_memory-and-concurrency.md).
**Unblocks:** [050/20 websocket API](../050_server/20_websocket-api.md), [040/95](./95_cache-metrics.md).

# 04 Decisions
- Decided (claude, 2026-09-30): cached values are the serialised response bytes, held behind reference-counted handles.
- Decided (claude, 2026-09-30): the index, manifest, CSS and active-branch git dates are always resident; everything else is evictable.
- Proposed (claude, 2026-09-30): a 256 MB default budget, set per machine.

# 05 Notes & Analysis

## 01 Crate choice
A maintained LRU crate with weighted entries (for example `moka` with a size weigher, which also gives single-flight through `get_with`) is fine. Check its latest release builds on Rust 1.98.1 before adding it ([toolchain versions](../../agent-memory/toolchain-versions.md)).

## Watch out
- Multi-user: several users on one server share this cache. That is the point — a page rendered for one is free for the next. Nothing user-specific may ever be stored here (presence, access, UI state).
