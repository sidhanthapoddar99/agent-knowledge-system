---
title: "The memory cache"
description: "MemoryCache: serialised responses held under a byte budget, least-recently-used eviction, resident values and single flight."
---

The memory cache keeps recently served answers inside the server process, so a second request for the same page costs a lookup, not a render. It is `MemoryCache`, in `apps/agentks-engine/crates/cache/src/memory.rs`. There is one per server process, shared by every connection. Since one server serves one project, the whole cache belongs to that project.

## What it holds

The cache holds **serialised responses**: the exact JSON bytes sent over `/api`, not Rust structs. So serving a hit costs no serialisation, and the size of every entry is known exactly.

Values are handed out as `Arc<[u8]>`, a reference-counted byte slice. Eviction only drops the cache's own reference, so an entry being sent at that moment is never pulled from under the sender.

**Nothing user-specific may be stored here.** Every connection shares the cache, so it holds only derived data: pages, sidebars, indexes, CSS. Presence, access and UI state never go in.

## Two tiers

| Tier | Holds | Evicted? |
|---|---|---|
| Evictable | Rendered pages, sidebars, issue details, highlighted code | Yes, least recently used first, past the byte budget |
| Resident | The index, the manifest, the compiled CSS, the active branch's git dates | Never. They are small and nearly every request needs them |

Resident values sit in named slots, such as `"manifest"` or `"css"`, one value per slot, outside the budget. Each is replaced as a whole when it changes, so a new value drops the old one without a scan.

## The byte budget

The evictable tier holds at most the budget, in bytes. The default is 256 MB. A machine can change it in `~/.agentks/settings.json`:

```json
{ "cache": { "memory_mb": 512 } }
```

`MachineSettings` reads this file. An unknown key is a warning. A known key with a bad value, such as a `memory_mb` that is not a whole number above zero, is an error, never a guess.

When an insert pushes the total past the budget, the cache evicts the least recently used entries until it fits. A value larger than the whole budget is not stored at all, because keeping it would evict everything else.

Bounded memory is a requirement, not an optimisation. The server holds no unbounded map anywhere.

## How it finds the least recently used entry

The cache uses no LRU crate. It keeps a `HashMap` from key to entry and a `BTreeMap` from a use counter to key, under one mutex. Every hit moves the entry to a new, higher counter. The first item of the `BTreeMap` is always the least recently used. The hit, miss and eviction counters are atomics outside the lock.

## Single flight

`get_or_insert_with(key, render)` returns the entry, or runs `render` once to make it. While one caller renders a key, every other caller for that key waits and then receives the same value. So fifty requests for one missing page run one render.

- The wait blocks on a mutex and a condition variable, because rendering runs on blocking threads, not on the async runtime.
- **A failed render is never shared.** The waiters do not receive an error from someone else's render. One of them takes over and renders again.
- A render that panics finishes its flight on the way out, so waiters never hang.

## Invalidation

Entries are keyed by content, so a change never has to find and delete them: the new key misses, and old entries age out through the budget. `clear()` drops every evictable entry and keeps the resident slots.

## The order of lookups

The site crate holds both the memory cache and the build cache, and uses them in this order:

1. look in memory;
2. on a miss, look in the build cache on disk;
3. on a second miss, render, then store the result in both.

A restart therefore starts with an empty memory cache but a warm disk cache.

## Metrics

`MemoryCache::metrics()` returns a `LayerMetrics` snapshot: hits, misses, evictions, and the entries and bytes held now, resident ones included. See [cleanup and metrics](./35_cleanup-and-metrics.md).

## Tests

The crate's tests check that the cache stays under its budget and evicts the least recently used first, that a handed-out value survives eviction, that resident slots are never evicted, that fifty concurrent requests for one missing key run exactly one render, and that a failed render is not shared.

```bash
cargo test -p agentks-cache
```

## Related

- [Keys and invalidation](./05_keys-and-invalidation.md): the keys this cache is indexed by.
- [The build cache on disk](./15_build-cache.md): the layer behind this one.
- [Site: the engine as one object](../10_engine/45_site.md): the runtime model the cache lives in.
