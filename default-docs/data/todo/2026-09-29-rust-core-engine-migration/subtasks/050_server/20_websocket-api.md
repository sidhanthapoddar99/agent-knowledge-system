---
title: "WebSocket API — the /api protocol: hello, requests, replies and pushes"
status: open
---

Every piece of data the client shows travels over one WebSocket at `/api`: the client asks by name, the server answers with JSON and a hash, and the server pushes new hashes when files change. This leaf builds the server side of that protocol: the connection handshake, request routing to the core, the reply and error shapes, push fan-out, and back-pressure. Binary frames are reserved for collaboration sync ([060/20](../060_collaboration/20_sync-protocol.md)). The client side is [080/40](../080_ui-and-client/40_websocket-client.md).

# 01 To Do
- [ ] **Hello first.** The first frame from the client is `hello`; the server answers before anything else. A connection that sends anything else first is closed with code `4400`.
      ```json
      { "op": "hello", "protocol": 1, "client": "1.0.0", "cache": ["b3:…manifest hash the client holds"] }
      { "op": "hello", "ok": true, "protocol": 1, "engine": "1.0.0", "project": "8c1f…", "role": "owner", "cache_format": 1 }
      ```
    - [ ] `role` is `owner` for a localhost connection, or the access key's role (`edit`, `read`) in share mode ([060/40](../060_collaboration/40_access-keys.md)).
    - [ ] A different `protocol` or `client` version → reply `{ "op": "hello", "ok": false, "reload": true }`, and the client reloads itself. The versioning rules are [140/50](../140_versioning-and-migrations/50_protocol-version-handshake.md); this leaf implements the server half.
- [ ] **Requests** carry `id`, `op`, `what`, `params` and optionally `have` (the hash the client already holds). Implement every `what` in the server note's table: `manifest`, `page`, `sidebar`, `issues-index`, `issue`, `blog-index`, `custom`, then Phase 2 `render`, `open`, `save` ([050/35](./35_file-writes-and-echo-suppression.md)), and `cache-stats` ([040/95](../040_caching/95_cache-metrics.md)).
- [ ] **Replies:** `{ "id", "ok": true, "hash", "data" }`, or `{ "id", "ok": true, "hash", "unchanged": true }` when `have` matches, or `{ "id", "ok": false, "error": { "type", "message", "file"?, "line"? } }`. Error types are a closed list in the core (`not-found`, `invalid-request`, `forbidden`, `conflict`, `content`, `fatal`, `internal`).
- [ ] **Serve from cache.** Look up the key in the memory cache ([040/30](../040_caching/30_in-memory-cache.md)); send the cached bytes as they are. The reply envelope is written around them without re-parsing.
- [ ] **Pushes** have no `id`: `changed` (a map of key → new hash, plus `removed`), `errors` (content errors for a file), `fatal` (config broke loading), `saved` (Phase 2). One broadcast channel per project; each connection filters to the keys it asked about during this connection plus `manifest`.
- [ ] **Concurrency.** Many requests in flight per connection; replies may come out of order, matched by `id`. Cap in-flight requests per connection (for example 64); beyond it reply `busy`.
- [ ] **Back-pressure.** A slow client must not grow server memory. Give each connection a bounded outgoing queue. If a push cannot be queued, drop pending pushes for that connection and send one `resync` push, which tells the client to re-fetch the manifest and compare hashes.
- [ ] **Keep-alive.** WebSocket ping every 20 s; close a connection with no pong for 60 s.
- [ ] **Role checks** on every request: `read` keys may use only pull requests; `render`, `open`, `save` and sync frames need `edit` or `owner`. The check is in the router, once, not in each handler.
- [ ] **Frame limits.** Text frames up to 8 MB (a `save` of a large file); larger is `invalid-request`. Binary frames go to the sync handler.
- [ ] **A schema file.** Write the message types once in Rust and generate the JSON schema the client type-checks against, together with the page data types ([030/80](../030_rust-engine/80_page-data-interface.md)).

## Guardrails
- No HTTP data API next to the socket (sidhantha, 2026-09-29).
- Replies carry final values; the server never sends rules for the client to apply.
- Nothing user-specific enters the shared cache.

## Done when
- A protocol test client (Rust, using `tokio-tungstenite`) covers: hello mismatch → reload; every `what`; `have` → `unchanged`; errors of each type; out-of-order replies; `read` role refused on `save`.
- A test with a client that never reads its socket shows server memory stays bounded and the client gets `resync` when it resumes.
- Editing a file while two tabs are open pushes `changed` to both, and only to tabs that asked for the affected keys.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/agentks-server/` (protocol types may live in the core so the CLI and tests share them).

**Read first:**
- [Sync engine and server, section 03 The /api protocol](../../notes/02_engine/04_sync-engine-and-server.md).
- [Client application, sections 04–06](../../notes/03_frontend/02_client-application.md) — the client rules: ids, reconnect, version handshake, live updates.
- [The Rust engine, section 05](../../notes/02_engine/03_rust-engine.md) — the data each request returns.

**Depends on:** [050/10](./10_http-and-routes.md), [030/80](../030_rust-engine/80_page-data-interface.md), [040/10](../040_caching/10_cache-keys-and-dependencies.md), [040/30](../040_caching/30_in-memory-cache.md).
**Unblocks:** [050/30](./30_watcher-and-push.md), [050/35](./35_file-writes-and-echo-suppression.md), [060/20](../060_collaboration/20_sync-protocol.md), [080/40](../080_ui-and-client/40_websocket-client.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the WebSocket carries pulls and pushes.
- Proposed (claude, 2026-09-30), adopted here: the request, reply and push shapes of the server note.
- Decided (claude, 2026-09-30): a `hello` exchange opens every connection and carries protocol, versions, project key and role; the role check happens once, in the request router.
- Decided (claude, 2026-09-30): bounded per-connection queues; overflow sends `resync` instead of growing memory.

# 05 Notes & Analysis

## 01 Close codes
| Code | Meaning |
|---|---|
| `4400` | Protocol error (no hello, bad frame) |
| `4401` | Missing or revoked access key ([060/40](../060_collaboration/40_access-keys.md)) |
| `4409` | Version mismatch after hello (client should reload) |
| `1001` | Server shutting down |

## Watch out
- The Vite dev proxy (state 1) forwards the socket; the `Origin` will be the Vite origin. [050/50](./50_security.md) allows exactly that origin in dev mode only.
