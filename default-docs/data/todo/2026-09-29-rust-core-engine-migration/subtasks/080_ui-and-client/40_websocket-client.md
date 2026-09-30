---
title: "The WebSocket client and DataSource over /api"
status: open
---

The client talks to the Rust engine over exactly one WebSocket per tab, at `/api`. This leaf builds that connection and the `DataSource` implementation on top of it: requests with ids, the `have` hash so unchanged data is never resent, pushes, reconnect with backoff, and the version handshake that reloads a tab opened before the binary was upgraded. Caching in IndexedDB is [090/20](../090_frontend-performance/20_data-cache-indexeddb.md); this leaf calls it through a small interface.

# 01 To Do
- [ ] **`src/data/socket.ts`** — one connection to `ws(s)://<same host>/api`.
    - [ ] Requests: `{ id, op: "get", what, params, have }`. `id` is a per-connection counter; the reply echoes it. Several requests may be in flight.
    - [ ] Replies: `{ id, ok: true, hash, data }`, `{ id, ok: true, hash, unchanged: true }`, or `{ id, ok: false, error: { type, message } }`. Reject the pending promise with a typed error on `ok: false`.
    - [ ] Pushes (no `id`): `changed`, `errors`, `fatal`; later `presence` and binary `yrs` frames for [060_collaboration](../060_collaboration/00_overview.md). Expose a typed event emitter; unknown push types are logged in dev and ignored.
    - [ ] Timeouts: a request with no reply in 10 s rejects with `timeout`; the router shows a retry.
- [ ] **Reconnect.** On close, show a small "disconnected" notice, keep the current page on screen, retry with exponential backoff (250 ms doubling to 5 s, with jitter). On reconnect, fetch the manifest again, compare hashes, refetch what the screen shows.
- [ ] **Version handshake.** The manifest carries the engine version (and the protocol version from [140/50](../140_versioning-and-migrations/50_protocol-version-handshake.md)). If it differs from the version this client was built for, reload the tab once (guard against loops with a session flag) so an old client never talks to a new engine.
- [ ] **`src/data/source.ts`** — `DataSource` over the socket:
    - [ ] Look in the cache by key (`page:<url>`, `sidebar:<section>`, …); send its hash as `have`.
    - [ ] `unchanged` → return the cached data; otherwise store the new data under its hash and return it.
    - [ ] Coalesce identical in-flight requests so two components asking for the same sidebar send one message.
- [ ] **`changed` handling.** Drop cache entries whose hashes changed or that are listed in `removed`; tell the router which keys changed so it redraws what is on screen ([30](./30_client-shell-and-routing.md)).
- [ ] **Access-key session.** When the server requires an access key (network sharing, [060/40](../060_collaboration/40_access-keys.md)), the socket upgrade carries the session cookie; a `401`-style close code shows the key prompt. Nothing to build until 060/40 lands, but keep the close-code handling in one place.
- [ ] **Tests** against a small fake server (a Bun WebSocket server in the test): id matching with out-of-order replies, `unchanged`, timeout, reconnect and refetch, version mismatch reload, coalescing.

## Guardrails
- One socket per tab. No HTTP data API, no second channel, no polling.
- The message format belongs to [050/20 WebSocket API](../050_server/20_websocket-api.md). If the client needs a field, change the contract there first.
- The server is the source of derived data; the browser copy only saves a round trip ([the client](../../notes/03_frontend/02_client-application.md) section 05).

## Done when
- The fake-server tests pass.
- With the real engine, stopping and restarting `agentks start` while a page is open shows the notice, reconnects, and redraws only what changed.
- Upgrading the binary while a tab is open reloads that tab once on reconnect.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, folder `apps/agentks-client/src/data`.
- **Read first:** [the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) (section 03, the protocol), [the client application](../../notes/03_frontend/02_client-application.md) (sections 04 to 06).
- **Today's code to learn from:** the editor's WebSocket client in [the Yjs client](../../../../../../agent-ks-engine/src/dev-tools/editor/sync/yjs-client-v2.ts) (reconnect handling).
- **Depends on:** [080/20 shared UI package](./20_shared-ui-package.md) (the `DataSource` type), [050/20 WebSocket API](../050_server/20_websocket-api.md).
- **Unblocks:** [30](./30_client-shell-and-routing.md) live data, [090/20](../090_frontend-performance/20_data-cache-indexeddb.md), [110/20](../110_editing/20_edit-in-place.md), [060_collaboration](../060_collaboration/00_overview.md) on the client side.

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the WebSocket carries pulls and pushes; there is no separate HTTP data API.
- Decided (claude, 2026-09-30): derived data is cached once on the server; the browser keeps a hash-checked copy ([the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md)).
- Proposed (claude, 2026-09-30): request ids, `have` hashes and the reconnect and version rules above ([the client](../../notes/03_frontend/02_client-application.md) section 04).

# 05 Notes & Analysis
## Watch out
- In state 1 the Vite dev server proxies `/api` with `ws: true` ([70](./70_embed-in-binary.md)); the socket URL must stay relative to the page's host so both states work.
- A burst of `changed` pushes during a `git checkout` arrives already coalesced by the engine (about 50 ms), but the client should still debounce redraws to one per animation frame.
