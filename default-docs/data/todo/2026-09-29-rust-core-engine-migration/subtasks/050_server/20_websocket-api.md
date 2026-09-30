---
title: "WebSocket API — the /api protocol: hello, requests, replies and pushes"
status: in-progress
---

Every piece of data the client shows travels over one WebSocket at `/api`: the client asks by name, the server answers with JSON and a hash, and the server pushes new hashes when files change. This leaf builds the server side of that protocol: the connection handshake, request routing to the core, the reply and error shapes, push fan-out, and back-pressure. Binary frames are reserved for collaboration sync ([060/20](../060_collaboration/20_sync-protocol.md)). The client side is [080/40](../080_ui-and-client/40_websocket-client.md).

# 01 To Do
- [ ] **Hello first.** The client's first frame is its `hello`; the server answers with its own before anything else. A connection that sends anything else first is closed with code `4400`.
      ```json
      { "op": "hello", "api_version": 1, "client_build": "a1b2c3" }
      { "op": "hello", "ok": true, "api_version": 1, "engine": "1.0.0", "project": "8c1f…", "role": "owner", "client_build": "a1b2c3" }
      ```
    - [ ] `role` is `owner` for a localhost connection, or the access key's role (`edit`, `read`) in share mode ([060/40](../060_collaboration/40_access-keys.md)).
    - [ ] A different `api_version` or `client_build` → the server's hello says `"ok": false, "reload": true`, and the client reloads itself. A `client_build` of `dev` (the Vite dev server) is accepted. The versioning rules are [140/50](../140_versioning-and-migrations/50_protocol-version-handshake.md); this leaf implements the server half.
- [ ] **Requests** carry `id` and `op`. `get` is the cacheable pull, with `what`, `params` and optionally `have` (the hash the client already holds). Implement every `what` in the server note's table: `manifest`, `page`, `sidebar`, `issues-index`, `issue`, `blog-index`, `custom`. An action has no hash to compare, so it is its own `op`: Phase 2 adds `render`, `open` and `save` ([050/35](./35_file-writes-and-echo-suppression.md)). [040/95](../040_caching/95_cache-metrics.md) adds `cache-stats`.
- [ ] **Replies:** `{ "id", "ok": true, "hash", "data" }`, or `{ "id", "ok": true, "hash", "unchanged": true }` when `have` matches, or `{ "id", "ok": false, "error": { "type", "message", "errors"? } }`. `type` is the closed `ReplyErrorKind` list in `agentks-api`: `not-found`, `invalid-request`, `forbidden`, `conflict`, `busy`, `fatal`, `internal`, `not-implemented`. `errors` holds the error records behind a `fatal` failure. A content problem never fails a request; it travels in the data's own `errors`. Map engine errors with `SiteError::to_reply`, the one mapping.
- [ ] **Serve from cache.** Look up the key in the memory cache ([040/30](../040_caching/30_in-memory-cache.md)); send the cached bytes as they are. `agentks_api::write_data_reply` writes the reply envelope around them without re-parsing.
- [ ] **Pushes** have no `id`: `changed` (a map of key → new hash, plus `removed` and `moved`), `errors` (the content errors of one file), `fatal` (config broke loading; carries `errors`, every problem as an error record), `resync` (below), `saved` (Phase 2). One broadcast channel per project; each connection filters to the keys it asked about during this connection plus `manifest`.
- [ ] **Concurrency.** Many requests in flight per connection; replies may come out of order, matched by `id`. Cap in-flight requests per connection (for example 64); beyond it reply `busy`.
- [ ] **Back-pressure.** A slow client must not grow server memory. Give each connection a bounded outgoing queue. If a push cannot be queued, drop pending pushes for that connection and send one `resync` push, which tells the client to re-fetch the manifest and compare hashes.
- [ ] **Keep-alive.** WebSocket ping every 20 s; close a connection with no pong for 60 s.
- [ ] **Catch panics per request.** The server layer catches a panic inside a request handler, logs it as an internal error with the request that caused it, and replies `internal`; the connection stays up. [030/20](../030_rust-engine/20_error-model.md) hands this piece to this leaf.
- [ ] **Role checks** on every request: `read` keys may use only pull requests; `render`, `open`, `save` and sync frames need `edit` or `owner`. The check is in the router, once, not in each handler.
- [ ] **Frame limits.** Text frames up to 8 MB (a `save` of a large file); larger is `invalid-request`. Binary frames go to the sync handler.
- [ ] **Use the shared message types.** Every message shape is a Rust type in `apps/agentks-engine/crates/api/src/messages/`, and `apps/agentks-engine/schema/api.schema.json` is generated from them together with the page data types ([030/80](../030_rust-engine/80_page-data-interface.md)). This leaf adds no second copy; a new message goes into that folder, and the schema and fixtures follow.

## Guardrails
- No HTTP data API next to the socket (sidhantha, 2026-09-29).
- Replies carry final values; the server never sends rules for the client to apply.
- Nothing user-specific enters the shared cache.

## Done when
- A protocol test client (Rust, using `tokio-tungstenite`) covers: hello mismatch → reload; every `what`; `have` → `unchanged`; errors of each type; out-of-order replies; `read` role refused on `save`.
- A test with a client that never reads its socket shows server memory stays bounded and the client gets `resync` when it resumes.
- Editing a file while two tabs are open pushes `changed` to both, and only to tabs that asked for the affected keys.

# 02 Status and Result
Review: the protocol for `get` and `render` is built and tested; `open`, `save` and `saved` wait for their message types in `agentks-api` (050/35).

## Result
- `src/ws.rs`: hello first (anything else first closes `4400`); a mismatched `api_version` or `client_build` gets `ok: false, reload: true` and close `4409`; `dev` is always accepted. Every connection is `owner` until access keys exist.
- `get` answers from `Backend::answer` with `write_data_reply` around the cached JSON; `have` equal to `current_hash` or to the answer's hash gives `unchanged`. `render` answers from `render_preview`. Engine errors map through `SiteError::to_reply`. A frame that does not parse but has an `id` gets `invalid-request`; without an `id` it closes `4400`.
- Many requests in flight per connection (cap `Limits::max_in_flight`, 64; beyond it `busy`), each on the blocking pool; a panic there is caught and answered `internal`, logged with the request (never the text of a render).
- `src/push.rs`: one broadcast channel per project; each connection forwards `changed` cut to the keys it asked about plus `manifest`, and all `errors`, `fatal`, `resync`. A connection that falls behind loses its pending pushes and gets one `resync`.
- Keep-alive: ping every 20 s, close after 60 s silent. Text frames up to 8 MB; a larger frame ends the connection. Binary frames close `4400` until sync exists.
- The role check is one function (`role_allows`), called once in the router.
- Tests: `the_protocol_hello_requests_and_errors`, `pushes_reach_only_the_tabs_that_asked`, `a_client_that_stops_reading_gets_resync` (tokio-tungstenite client).
- Not covered yet: the `read` role refused on `save` (no share mode, no `save`), and the `4409` constant in `agentks-api` (requested; the server keeps a private one).

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/server/` (package `agentks-server`). The message types live in `apps/agentks-engine/crates/api/src/messages/`, so the CLI and tests share them.

**Read first:**
- [Sync engine and server, section 03 The /api protocol](../../notes/02_engine/04_sync-engine-and-server.md).
- [Client application, sections 04–06](../../notes/03_frontend/02_client-application.md) — the client rules: ids, reconnect, version handshake, live updates.
- [The Rust engine, section 05](../../notes/02_engine/03_rust-engine.md) — the data each request returns.

**Depends on:** [050/10](./10_http-and-routes.md), [030/80](../030_rust-engine/80_page-data-interface.md), [040/10](../040_caching/10_cache-keys-and-dependencies.md), [040/30](../040_caching/30_in-memory-cache.md).
**Unblocks:** [050/30](./30_watcher-and-push.md), [050/35](./35_file-writes-and-echo-suppression.md), [060/20](../060_collaboration/20_sync-protocol.md), [080/40](../080_ui-and-client/40_websocket-client.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the WebSocket carries pulls and pushes.
- Proposed (claude, 2026-09-30), adopted here: the request, reply and push shapes of the server note.
- Decided (claude, 2026-09-30): a `hello` exchange opens every connection and carries `api_version`, the client build, the engine version, the project key and the role; the role check happens once, in the request router.
- Decided (claude, 2026-09-30): the client sends `hello` first, one number (`api_version`) versions every message and shape, `render`, `open` and `save` are ops rather than `what` names, and a content problem never fails a request, so there is no `content` reply type. The reasons are in [030/80](../030_rust-engine/80_page-data-interface.md) and [030/20](../030_rust-engine/20_error-model.md).
- Decided (claude, 2026-09-30): bounded per-connection queues; overflow sends `resync` instead of growing memory.
- Decided (claude, 2026-10-01): back-pressure uses a bounded tokio broadcast channel per project plus a bounded outgoing queue per connection; the channel's lag signal is the "push could not be queued" event, because it bounds memory with no per-connection push copies.
- Decided (claude, 2026-10-01): `errors`, `fatal` and `resync` go to every connection; only `changed` is filtered by key, because the other pushes are keyed by file or by nothing, and the client shows file errors in the dev toolbar anyway.
- Decided (claude, 2026-10-01): a text frame over 8 MB closes the connection (the WebSocket library refuses it before it is parsed), not an `invalid-request` reply, because an unparsed frame has no `id` to reply to.
- Decided (claude, 2026-10-01): a malformed frame with a readable `id` gets `invalid-request`; one without an `id` closes `4400`, because only the first can be matched to a request.

# 05 Notes & Analysis

## 01 Close codes
| Code | Meaning |
|---|---|
| `4400` | Protocol error (no hello, bad frame) |
| `4401` | Missing or revoked access key ([060/40](../060_collaboration/40_access-keys.md)) |
| `4409` | Version mismatch after hello (client should reload) |
| `1001` | Server shutting down |

`4400` and `4401` already exist as `CLOSE_PROTOCOL_ERROR` and `CLOSE_UNAUTHORISED` in `crates/api/src/messages/`. Add `4409` there when this leaf builds the mismatch path.

## Watch out
- The Vite dev proxy (state 1) forwards the socket; the `Origin` will be the Vite origin. [050/50](./50_security.md) allows exactly that origin in dev mode only.
