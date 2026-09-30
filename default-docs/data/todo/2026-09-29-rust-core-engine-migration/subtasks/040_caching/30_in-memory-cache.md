---
title: "In-memory cache — least-recently-used, with a byte budget"
status: review
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
Review. The in-memory cache is built and tested.

## Result
Where: the main repository, `apps/agentks-engine/crates/cache/` (branch `wave2/cache`). Tests: `cargo test -p agentks-cache`, 36 tests in 0.06 s; `./ctl gate` green.

- `MemoryCache` in `memory.rs`: `with_budget`, `get`, `insert`, `set_resident` / `resident`, `get_or_insert_with` (single flight), `clear`, `metrics`. `DEFAULT_MEMORY_BUDGET` is 256 MB; `MachineSettings` reads `cache.memory_mb`.
- Tests: the cache stays under budget and evicts the least recently used first; a handed-out value survives eviction; resident slots are never evicted; 50 concurrent requests for one missing key run exactly one render; a failed render is not shared; one miss then one hit.
- Left: filling from the build cache before rendering is the site crate's orchestration (it holds both caches); the 5,000-page soak test belongs to 170/40.

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
- Decided (claude, 2026-10-01): no LRU crate: a `HashMap` plus a `BTreeMap` of use ticks under one mutex, with hit, miss and eviction counters as atomics, because the render runs on the blocking pool (so moka's async machinery buys nothing) and it avoids a dependency.
- Decided (claude, 2026-10-01): single flight blocks on a mutex and condition variable instead of shared futures, because 030/90 puts rendering on blocking threads; a failed or panicking render is never shared, and one waiter takes over and renders again.
- Decided (claude, 2026-10-01): always-resident values sit in named slots (`set_resident("manifest", key, bytes)`), one value per slot, outside the budget, because each is replaced as a whole when it changes and a slot drops the old value without a scan.
- Decided (claude, 2026-10-01): a value larger than the whole budget is not stored (keeping it would evict everything); single-flight waiters still receive it.
- Decided (claude, 2026-10-01): `clear()` drops evictable entries and keeps resident slots; there is no `drop_prefix(project)`, because one server process serves one project, so the whole cache is that project's.

# 05 Notes & Analysis

## 01 Crate choice
A maintained LRU crate with weighted entries (for example `moka` with a size weigher, which also gives single-flight through `get_with`) is fine. Check its latest release builds on Rust 1.98.1 before adding it ([toolchain versions](../../agent-memory/toolchain-versions.md)).

## Watch out
- Multi-user: several users on one server share this cache. That is the point — a page rendered for one is free for the next. Nothing user-specific may ever be stored here (presence, access, UI state).
