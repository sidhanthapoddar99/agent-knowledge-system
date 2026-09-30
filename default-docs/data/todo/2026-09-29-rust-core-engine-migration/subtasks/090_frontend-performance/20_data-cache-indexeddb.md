---
title: "The browser data cache in IndexedDB"
status: review
---

The client keeps a copy of the data it has fetched — page data, sidebars, indexes, the manifest — in IndexedDB, keyed by content hash, so a reload or a revisit costs one "unchanged" reply instead of a full payload. The server is always the source; this copy only saves round trips and allows offline reading. This leaf builds the store: its naming, versioning, keys, size limits and eviction.

# 01 To Do
- [x] **Store naming.** Database `aks-<project key>-<engine version>`. A new engine version opens a fresh database and deletes the old ones of this project, so data shaped by an old engine is never read.
- [x] **Object stores.**
    - [x] `entries`: key `page:<url>` · `sidebar:<section>` · `issues-index:<section>` · `issue:<section>:<id>` · `blog-index:<section>` · `custom:<page>` · `manifest`; value `{ hash, data, size, lastUsed }`.
    - [x] `meta`: total size, schema version.
- [x] **API** in `apps/agentks-client/src/data/cache.ts`: `get(key)`, `put(key, hash, data)`, `drop(keys)`, `touch(key)`, `clear()`, used only by the `DataSource` over the socket ([080/40](../080_ui-and-client/40_websocket-client.md)).
- [x] **On connect.** Compare the manifest's hashes with the stored ones; drop entries whose key vanished; keep the rest and let `have` hashes do the work lazily.
- [x] **Size and eviction.**
    - [x] Keep a running total. Above 50 MB (claude, proposed), evict least recently used entries down to 40 MB, never the manifest or the page on screen.
    - [x] Call `navigator.storage.persist()` only when the PWA is installed; otherwise treat the store as disposable.
    - [x] On `QuotaExceededError`, evict half and retry once; if it fails again, run without the cache for the session and log it to the Problems tool in dev.
- [x] **Speed.** Batch writes in one transaction per animation frame; never block a draw on a cache write.
- [x] **Failure mode.** If IndexedDB is unavailable (private window, blocked), fall back to an in-memory map for the session. The app must work, just slower.
- [x] **Tests** with `fake-indexeddb`: version bump drops old databases, eviction keeps the manifest and the current page, quota error path, fallback path.

## Guardrails
- The cache never decides freshness by time. Only the hash decides.
- Never cache anything the server marks as private to a session (future access-key data) beyond the session.
- The key names match the push keys the server sends in `changed` ([050/20](../050_server/20_websocket-api.md)), so invalidation needs no translation.

## Done when
- A warm reload of a docs page makes one `manifest` request plus `have` requests that all return `unchanged`, and paints within the warm budget in [00](./00_overview.md).
- After an engine upgrade the old database is gone.
- A forced quota error does not break navigation.

# 02 Status and Result
Review. The IndexedDB cache is built, bound per project and engine version, bounded, batched, and falls back to memory; a warm reload in a real browser sends only `have` requests.

## Result
Where: the main repository, branch `wave3/client-perf`, folder `apps/agentks-client/src/data/cache/`. `./ctl gate` green; `tests/cache.test.ts` has 10 tests with `fake-indexeddb` 6.2.5 (a new dev dependency), in about 50 ms.

- `idb.ts`: database `aks-<project key>-<engine version>`, schema version 1, stores `entries` (`{ hash, data }`) and `usage` (`{ size, lastUsed }`). Opening deletes this project's databases of other engine versions (through `indexedDB.databases()`) and closes itself on `versionchange`.
- `store.ts`: the `DataCache` (`get`, `put`, `drop`, `retain`, `pin`, `flush`, `clear`) over a backend, with the `Ledger` from `ledger.ts`. Writes queue and go out in one transaction about one frame later, and reads see queued writes. Above 50 MB it evicts the least recently used down to 40 MB, never `manifest` or a pinned key. A `QuotaExceededError` evicts half and retries once; a second failure, or any other write failure, moves the session to memory and logs it.
- `project.ts`: `ProjectCache` waits for the hello's `project` and `engine` (`bind`), and `unbound()` switches to memory when the engine refuses the tab (4401 or an outdated client). With no IndexedDB, or an open that fails, the session runs on memory. `persistIfInstalled` calls `navigator.storage.persist()` only in standalone display mode.
- `live-keys.ts`: on every manifest the source keeps `manifest`, every route key and `sidebar:<section>`, and drops the rest.
- `source.ts` now calls `put` (never awaited), `drop` on `changed`, `retain` on `learn`, and has `fresh(key)` and `showing(keys)`. The controller pins the page and sidebar on screen after each draw. `socket.ts` reports the reply frame's length as the answer's size.
- Browser check (headless Chromium over the mock engine): a cold load of `/dev-docs/architecture/overview` created `aks-8c1f0a2b3c4d5e6f-1.0.0`. The reload sent `manifest` with `have` and `sidebar` with `have`, and no request for the page.

Left: the Problems tool does not exist yet, so the quota and fallback notices go to the dev console log only. Nothing is marked session-private by the server yet, so there is nothing to keep out.

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

- Decided (claude, 2026-10-01): the size and last-use record lives in its own `usage` store, and there is no `meta` store. This is because a touch then rewrites a few bytes, not a multi-megabyte index. The total is summed from `usage` when the store opens, so it cannot drift, and the schema version is the IndexedDB version number.
- Decided (claude, 2026-10-01): there is no separate `touch(key)`: a hit in `get` marks the entry as used. `retain(live)` and `pin(keys)` are added for the on-connect cleanup and for the page on screen. This is because the source reads every copy through `get`, so a separate call would only be forgotten.
- Decided (claude, 2026-10-01): an entry's size is the length of the reply frame it came in. This is because a `JSON.stringify` of a large index would cost main-thread time for a number that only drives eviction.
- Decided (claude, 2026-10-01): writes flush on a 16 ms timer, not `requestAnimationFrame`. This is because animation frames stop in a hidden tab, and writes would pile up there.
- Decided (claude, 2026-10-01): answers wait until the hello names the project and engine version. When the engine refuses the tab for good, the cache binds to memory. This is because a copy from another project or engine version must never be read, and the old code opened its cache before it knew either.
- Decided (claude, 2026-10-01): a stored key of a shape the manifest does not name is dropped on connect. This is because a missing copy costs one request, while a stale one could be shown.
- Noted (claude, 2026-10-01): the package's data key for an issue is `issue:<section>/<id>`, not `issue:<section>:<id>` as the To Do says. The cache uses the package's `dataKey`, so it matches the server's push keys either way.

# 05 Notes & Analysis
## Watch out
- IndexedDB transactions auto-commit when the event loop turns; do not `await` unrelated promises inside one.
- Large tracker indexes can be several MB. Store them as one entry but measure; if an index passes 5 MB, raise it with [030/40 site index](../030_rust-engine/40_site-index.md) so Rust can page it.
