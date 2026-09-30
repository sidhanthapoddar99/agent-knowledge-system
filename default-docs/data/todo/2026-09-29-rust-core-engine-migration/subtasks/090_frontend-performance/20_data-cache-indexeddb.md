---
title: "The browser data cache in IndexedDB"
status: open
---

The client keeps a copy of the data it has fetched — page data, sidebars, indexes, the manifest — in IndexedDB, keyed by content hash, so a reload or a revisit costs one "unchanged" reply instead of a full payload. The server is always the source; this copy only saves round trips and allows offline reading. This leaf builds the store: its naming, versioning, keys, size limits and eviction.

# 01 To Do
- [ ] **Store naming.** Database `aks-<project key>-<engine version>`. A new engine version opens a fresh database and deletes the old ones of this project, so data shaped by an old engine is never read.
- [ ] **Object stores.**
    - [ ] `entries`: key `page:<url>` · `sidebar:<section>` · `issues-index:<section>` · `issue:<section>:<id>` · `blog-index:<section>` · `custom:<page>` · `manifest`; value `{ hash, data, size, lastUsed }`.
    - [ ] `meta`: total size, schema version.
- [ ] **API** in `apps/agentks-client/src/data/cache.ts`: `get(key)`, `put(key, hash, data)`, `drop(keys)`, `touch(key)`, `clear()`, used only by the `DataSource` over the socket ([080/40](../080_ui-and-client/40_websocket-client.md)).
- [ ] **On connect.** Compare the manifest's hashes with the stored ones; drop entries whose key vanished; keep the rest and let `have` hashes do the work lazily.
- [ ] **Size and eviction.**
    - [ ] Keep a running total. Above 50 MB (claude, proposed), evict least recently used entries down to 40 MB, never the manifest or the page on screen.
    - [ ] Call `navigator.storage.persist()` only when the PWA is installed; otherwise treat the store as disposable.
    - [ ] On `QuotaExceededError`, evict half and retry once; if it fails again, run without the cache for the session and log it to the Problems tool in dev.
- [ ] **Speed.** Batch writes in one transaction per animation frame; never block a draw on a cache write.
- [ ] **Failure mode.** If IndexedDB is unavailable (private window, blocked), fall back to an in-memory map for the session. The app must work, just slower.
- [ ] **Tests** with `fake-indexeddb`: version bump drops old databases, eviction keeps the manifest and the current page, quota error path, fallback path.

## Guardrails
- The cache never decides freshness by time. Only the hash decides.
- Never cache anything the server marks as private to a session (future access-key data) beyond the session.
- The key names match the push keys the server sends in `changed` ([050/20](../050_server/20_websocket-api.md)), so invalidation needs no translation.

## Done when
- A warm reload of a docs page makes one `manifest` request plus `have` requests that all return `unchanged`, and paints within the warm budget in [00](./00_overview.md).
- After an engine upgrade the old database is gone.
- A forced quota error does not break navigation.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, file `apps/agentks-client/src/data/cache.ts`.
- **Read first:** [the client application](../../notes/03_frontend/02_client-application.md) (section 05), [the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) (section 03, `have` and `changed`).
- **Related lesson:** [2026-08-07-content-embed-cache-dependencies](../../../2026-08-07-content-embed-cache-dependencies/issue.md) — a page's hash must cover the files it embeds; the server guarantees it ([040/10](../040_caching/10_cache-keys-and-dependencies.md)), the browser relies on it.
- **Depends on:** [080/40 WebSocket client](../080_ui-and-client/40_websocket-client.md).
- **Unblocks:** [090/30 service worker and offline](./30_service-worker-and-offline.md), [090/50 prefetch](./50_prefetch.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): major data is cached in the browser, versioned by hash.
- Proposed (claude, 2026-09-29): the store's name includes the engine version ([the client](../../notes/03_frontend/02_client-application.md) section 05).
- Decided (claude, 2026-09-30): the server owns derived data; the browser copy is never the source.

# 05 Notes & Analysis
## Watch out
- IndexedDB transactions auto-commit when the event loop turns; do not `await` unrelated promises inside one.
- Large tracker indexes can be several MB. Store them as one entry but measure; if an index passes 5 MB, raise it with [030/40 site index](../030_rust-engine/40_site-index.md) so Rust can page it.
