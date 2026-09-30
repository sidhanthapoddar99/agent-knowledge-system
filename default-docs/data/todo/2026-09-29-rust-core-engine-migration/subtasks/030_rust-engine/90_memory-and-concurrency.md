---
title: "Memory and concurrency — snapshots, bounded queues and a memory budget"
status: open
---

Today's Astro dev server reached 874 MB of memory after 24 minutes. The Rust engine must stay small and responsive while files change, several browser tabs and (later) several users are connected, and the CLI runs beside the server. This leaf sets the runtime model every crate follows: readers never wait for writers, every queue has a bound, expensive work runs off the network threads, and memory has a budget that is measured.

# 01 To Do
- [ ] **Immutable snapshots**: `agentks-site` holds the current state (config, index, derived trees) as an `Arc<Snapshot>` behind an atomic swap (`arc-swap`). A request takes the current snapshot and works on it without a lock. A file change builds the next snapshot from the current one (sharing unchanged parts through `Arc`) and swaps it in. A reader in the middle of a request keeps a consistent view.
- [ ] **One writer**: file changes are applied by a single task, in order, from a bounded channel. Bursts are debounced (a save that writes a temp file then renames it is one change).
- [ ] **Threads**: tokio multi-threaded runtime for I/O; CPU work (rendering, hashing a large tree, highlighting) on a bounded blocking pool (`spawn_blocking` or rayon) so the WebSocket stays responsive. Git history walks run on the pool too.
- [ ] **Bounded per-client queues**: each WebSocket connection has a bounded send queue. A slow client that fills it is sent a "resync" marker and dropped from push until it asks again; it never grows server memory.
- [ ] **Memory rules**:
    - [ ] The index holds hashes, frontmatter and metadata, never page bodies.
    - [ ] Shared strings (`Arc<str>`) for paths, URLs and labels that appear in several structures.
    - [ ] Rendered pages live in the in-memory cache with a byte budget and least-recently-used eviction ([040/30](../040_caching/30_in-memory-cache.md)); the disk cache holds the rest.
    - [ ] A configurable budget (machine settings, default 256 MB for the page cache), reported in the dev toolbar ([040/95 cache metrics](../040_caching/95_cache-metrics.md)).
- [ ] **Measure**: a benchmark binary that loads the corpus, renders every page, applies 1,000 random edits, and reports resident memory and request latency (p50, p95) throughout. Targets: resident memory under 150 MB with the corpus loaded and every page rendered once; no growth across the 1,000 edits; page request p95 under 20 ms while edits are applied. Record the results here and hand the budget to [170/40 performance budget](../170_testing/40_performance-budget.md).
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
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** `agentks-site` (snapshots, writer task), `agentks-server` (runtime, client queues), a `benches/` binary in the workspace.
- **Read first:** [brainstorm: performance and size](../../brainstorm/01_initial-discussion/13_performance-and-size.md); [brainstorm: why, and the prior audit](../../brainstorm/01_initial-discussion/02_why-and-prior-audit.md); [02/04 Sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md); [02/06](../../notes/02_engine/06_machine-home-and-build-cache.md) section 06 (concurrency on the machine home).
- **Depends on:** [10](./10_workspace-and-crate-boundaries.md); measured once [40](./40_site-index.md) to [80](./80_page-data-interface.md) exist.
- **Unblocks:** [040/30](../040_caching/30_in-memory-cache.md), [050/20](../050_server/20_websocket-api.md), [060/00 collaboration](../060_collaboration/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): memory and cache management are designed deliberately, not left to defaults.
- Decided (claude, 2026-09-30): immutable snapshots behind an atomic swap, one writer task, bounded queues everywhere; the targets above.

# 05 Notes & Analysis
## Watch out
- The audience today is one or two developers; multi-user access adds a few more. Design for tens of connections, not thousands, and do not add machinery for scale nobody has.
