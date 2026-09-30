---
title: "Memory and concurrency — snapshots, bounded queues and a memory budget"
status: in-progress
---

Today's Astro dev server reached 874 MB of memory after 24 minutes. The Rust engine must stay small and responsive while files change, several browser tabs and (later) several users are connected, and the CLI runs beside the server. This leaf sets the runtime model every crate follows: readers never wait for writers, every queue has a bound, expensive work runs off the network threads, and memory has a budget that is measured.

# 01 To Do
- [x] **Immutable snapshots**: `agentks-site` holds the current state (config, index, derived trees) as an `Arc<Snapshot>` behind a lock held only to clone the `Arc` (see Decisions). A request takes the current snapshot and works on it without holding a lock. A file change builds the next snapshot from the current one (sharing unchanged parts through `Arc`) and swaps it in. A reader in the middle of a request keeps a consistent view.
- [ ] **One writer**: file changes are applied by a single task, in order, from a bounded channel. Bursts are debounced (a save that writes a temp file then renames it is one change).
- [ ] **Threads**: tokio multi-threaded runtime for I/O; CPU work (rendering, hashing a large tree, highlighting) on a bounded blocking pool (`spawn_blocking` or rayon) so the WebSocket stays responsive. Git history walks run on the pool too.
- [ ] **Bounded per-client queues**: each WebSocket connection has a bounded send queue. A slow client that fills it is sent a "resync" marker and dropped from push until it asks again; it never grows server memory.
- [ ] **Memory rules**:
    - [x] The index holds hashes, frontmatter and metadata, never page bodies.
    - [ ] Shared strings (`Arc<str>`) for paths, URLs and labels that appear in several structures.
    - [x] Rendered pages live in the in-memory cache with a byte budget and least-recently-used eviction ([040/30](../040_caching/30_in-memory-cache.md)); the disk cache holds the rest.
    - [ ] A configurable budget (machine settings, default 256 MB for the page cache), reported in the dev toolbar ([040/95 cache metrics](../040_caching/95_cache-metrics.md)).
- [x] **Measure**: a benchmark that loads the corpus, renders every page, applies 1,000 random edits, and reports resident memory and request latency (p50, p95) throughout. Targets: resident memory under 150 MB with the corpus loaded and every page rendered once; no growth across the 1,000 edits; page request p95 under 20 ms while edits are applied. Record the results here and hand the budget to [170/40 performance budget](../170_testing/40_performance-budget.md).
- [ ] **CLI beside the server**: a CLI command reads the project itself (it does not talk to the server) and shares the on-disk cache safely through atomic writes and immutable entries ([040/40](../040_caching/40_build-cache-on-disk.md)).

## Guardrails
- No global mutable state and no `static mut`. State lives in the site object.
- No lock held across an `.await` or across a render.
- Never trade correctness for memory: an evicted page is re-rendered, never served stale.

## Done when
- The benchmark meets the targets above, or the leaf records the measured numbers and why a target moved (a decision line).
- A load test with 50 connections subscribed while 100 edits land shows no request blocked behind an edit (max latency recorded).
- Killing a client mid-stream frees its queue (memory returns to the baseline).

# 02 Status and Result
In progress. The site side is built: the snapshot, one writer, the page cache with its budget, and the measurement. Left: the server's threads, queues and load test, the memory target, and the CLI passing the budget from machine settings.

## Result
- **Built**, in the worktree `apps/agentks-engine/crates/site/` (branch `wave3/site`). The state is one immutable `Snapshot` (config, index, theme, trackers, custom data, git dates, derived keys and lists) behind `RwLock<Arc<Snapshot>>`, locked only to clone the `Arc`. `Site::apply_changes` takes one writer mutex, builds the next snapshot from the current one (unchanged parts shared through `Arc`), swaps it in, and releases the mutex before any page renders. A reader keeps the snapshot it took for its whole request.
- **The page cache** is `agentks-cache`'s `MemoryCache` (byte budget, least-recently-used eviction, one producer per key) over the build cache on disk, keyed by answer hash. The budget comes in through `SiteOptions::memory_budget_bytes`; `Site::cache_metrics()` reports both layers. A render reads every file through the snapshot's hashes, so an answer is never cached under a key whose bytes it did not render.
- **Tests:** `cargo test -p agentks-site`, 29 tests in about 0.3 s. `readers_keep_working_while_changes_land` runs 300 reads while 20 edits land and checks that no key ever maps to two different answers.
- **Measured** on a copy of `default-docs` (1,905 files, 1,573 routes, 1,512 pages), release build: `AGENTKS_CORPUS=<copy> AGENTKS_CORPUS_EDITS=1000 cargo test -p agentks-site --release --test corpus -- --ignored --nocapture`.
    - Open: 160–172 ms; resident memory 17 MB.
    - Every route rendered once: 1.5 s, no failures. Resident memory 279 MB, of which the page cache holds 19.2 MB (1,569 entries).
    - The memory stays at 286 MB after the site is dropped, so it is held outside the site. Most of it is the render crate's code highlighter: syntect's grammar set compiles and keeps regexes per grammar for the life of the process. A probe measured 118 MB for 20 fence languages on a six-line sample.
    - 1,000 edits: resident memory 279 → 322 MB. The page cache grew 19 → 59 MB (3,325 entries): each edit adds its re-rendered answer under a new hash, and the old answer stays until the budget evicts it. The growth is bounded by the budget, but it is not flat.
    - `apply_changes`: p50 20 ms, p95 40 ms, max 47 ms (every key recomputed, plus the edited page rendered). A request between edits: p50 3.5 µs, p95 7.4 µs, max 28 µs.
- **Targets:** resident memory under 150 MB is not met (279 MB). No growth across 1,000 edits is not met (+43 MB, all in the page cache). Request p95 under 20 ms is met. The targets are not moved; the causes above go to the render and cache crates.
- **Left:**
    - One writer: the bounded channel and the debounce live in the server's watcher ([050/30](../050_server/30_watcher-and-push.md)).
    - Threads and bounded per-client queues, the 50-connection load test and the killed-client test: the server.
    - Memory: a smaller highlighter footprint in the render crate; a `MemoryCache::remove` so the site can drop a changed key's old answer; checking the `Arc<str>` rule across crates.
    - The budget: the CLI reads `cache.memory_mb` from machine settings and passes it in; the dev toolbar shows `Site::cache_metrics()` ([040/95](../040_caching/95_cache-metrics.md)).
    - CLI beside the server: the CLI opens its own `Site`; the disk cache's atomic writes make that safe, but the CLI does not call it yet.

## Agent log
none

# 03 References
- **Where:** `agentks-site` (snapshots, writer task), `agentks-server` (runtime, client queues), the ignored measurement test `crates/site/tests/corpus.rs`.
- **Read first:** [brainstorm: performance and size](../../brainstorm/01_initial-discussion/13_performance-and-size.md); [brainstorm: why, and the prior audit](../../brainstorm/01_initial-discussion/02_why-and-prior-audit.md); [02/04 Sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md); [02/06](../../notes/02_engine/06_machine-home-and-build-cache.md) section 06 (concurrency on the machine home).
- **Depends on:** [10](./10_workspace-and-crate-boundaries.md); measured once [40](./40_site-index.md) to [80](./80_page-data-interface.md) exist.
- **Unblocks:** [040/30](../040_caching/30_in-memory-cache.md), [050/20](../050_server/20_websocket-api.md), [060/00 collaboration](../060_collaboration/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): memory and cache management are designed deliberately, not left to defaults.
- Decided (claude, 2026-09-30): immutable snapshots behind an atomic swap, one writer task, bounded queues everywhere; the targets above.
- Decided (claude, 2026-10-01): the snapshot sits behind a standard `RwLock<Arc<Snapshot>>` held only to clone the `Arc`, plus one writer mutex, instead of `arc-swap`, because the lock is held for one clone and the crate would add a dependency that changes nothing a test can see.
- Decided (claude, 2026-10-01): a batch recomputes every key, and the change set is the difference of the old and new key maps, because patching keys from a dependency graph can miss a dependant, and the recompute costs 20 ms p50 on 1,512 pages.
- Decided (claude, 2026-10-01): after a batch, the site renders the changed pages and issues that read a file of the batch, after it releases the writer lock, because the change set must carry each touched file's full problem list, render problems included, and no lock may be held across a render.
- Decided (claude, 2026-10-01): every render reads files through the snapshot's hashes, and a file whose bytes no longer match is an error that is not cached, because otherwise a request between a save and its batch caches the new bytes under the old key, and an undo would serve them.
- Decided (claude, 2026-10-01): answers are kept on disk only by a release build or a dev build compiled with `AGENTKS_DEV_COMMIT`, because any other dev build changes its code under one version, so its disk entries could be another build's output.
- Decided (claude, 2026-10-01): the benchmark is an ignored integration test (`crates/site/tests/corpus.rs`), not a `benches/` binary, because it needs only the public `Site` API and runs under the test harness `ctl` already drives.

# 05 Notes & Analysis
## Watch out
- The audience today is one or two developers; multi-user access adds a few more. Design for tens of connections, not thousands, and do not add machinery for scale nobody has.
