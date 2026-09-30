---
title: "Cache metrics — hit rate, size and evictions, where people can see them"
status: open
---

A cache nobody can observe is a cache nobody can trust or tune. This leaf counts what each cache layer does — hits, misses, evictions, bytes, render and walk times — and exposes the numbers to the dev toolbar's cache view and to `agentks cache status`. It replaces today's cache inspector, which reads the Astro engine's in-memory caches.

# 01 To Do
- [ ] **Counters per layer** (memory, build cache, git dates, library cache): hits, misses, evictions, entries, bytes. Lock-free atomics; no measurable cost on the request path.
- [ ] **Timings:** render time (p50, p95 over a rolling window), git walk time (last, and full vs diff), CSS compile time.
- [ ] **A `/api` request** `get what=cache-stats` returning one JSON snapshot, for the dev toolbar ([110/10](../110_editing/10_dev-toolbar.md)). Available only on localhost connections or to `edit` access keys, never to `read` keys (it reveals file paths).
- [ ] **`agentks cache status --json`** includes the running server's snapshot when one runs for the project (read through the run record's control channel, or skip with a note).
- [ ] **Log line at shutdown** with the session's hit rate, at debug level.

## Guardrails
- Metrics never change behaviour. No adaptive logic reads them.
- No user-identifying data in metrics (no access-key labels, no display names).

## Done when
- The snapshot's counters move as expected in a test (one miss then one hit for the same page; an eviction after exceeding a tiny budget).
- The dev toolbar's cache view shows the snapshot on a running project.
- A benchmark shows no measurable slowdown of a cached page request with metrics on (within noise).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/` (counters in the cache crate, the request in the server crate).

**Read first:**
- [Dev toolbar](../../notes/03_frontend/05_dev-toolbar.md) — which tools return (open question 04), the cache view.
- Today's cache inspector and metrics: [metrics.ts](../../../../../../agent-ks-engine/src/dev-tools/server/metrics.ts) and the [cache-inspector](../../../../../../agent-ks-engine/src/dev-tools/cache-inspector) toolbar app.
- [Sync engine and server, section 03](../../notes/02_engine/04_sync-engine-and-server.md) — the request shape.

**Depends on:** [040/30](./30_in-memory-cache.md), [040/40](./40_build-cache-on-disk.md), [040/70](./70_git-dates-cache.md), [050/20](../050_server/20_websocket-api.md).
**Unblocks:** the cache view of [110/10 dev toolbar](../110_editing/10_dev-toolbar.md).

# 04 Decisions
- Decided (claude, 2026-09-30): cache stats are a `/api` request, visible to localhost and `edit` keys only.

# 05 Notes & Analysis

## Watch out
- Which dev tools come back is still open question 04 ([open questions](../../notes/01_overview/05_open-questions-and-risks.md)). Build the data source either way; the CLI uses it even if the toolbar view is dropped.
