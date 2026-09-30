---
title: "Version handshake: stale tabs and PWAs reload instead of talking to a newer server"
status: open
---

The client is embedded in the binary, so a fresh page load always gets the client that matches the server. Two cases break that: a tab left open while the binary was upgraded, and an installed PWA whose service worker still serves an old client. An old client talking to a newer server can misread messages silently. This leaf adds a version handshake on the `/api` WebSocket: the server catches a mismatch on connect, the client reloads itself (bypassing the service worker's cache), and the server never talks to a client whose message shapes it does not share.

# 01 To Do
- [ ] **One number.** Besides the engine version (x.y.z), one integer, `api_version`, versions the whole `/api` message set and every data shape. It goes up on any breaking change: a removed or renamed field or message, or a changed meaning. An added optional field is not breaking. There is no separate `sync` number: the sync frames of [060/20](../060_collaboration/20_sync-protocol.md) are covered by the same one. The constant is `API_VERSION` in `apps/agentks-engine/crates/api/src/messages/`.
- [ ] **Hello, client first.** The client's first frame on every connection is `{ "op": "hello", "api_version": 1, "client_build": "<hash of the client bundle, set at build time>" }`. The server answers `{ "op": "hello", "ok": true, "api_version": 1, "engine": "1.2.0", "project": "<project key>", "role": "owner", "client_build": "<hash of the embedded client>" }`. [050/20 WebSocket API](../050_server/20_websocket-api.md) owns the message catalogue; the shapes are Rust types in `crates/api/src/messages/`.
- [ ] **Server check.** The server compares the hello's `api_version` and `client_build` with its own. On a mismatch its hello says `"ok": false, "reload": true`, and it serves nothing else on that connection. One place decides.
- [ ] **Client reaction.** When the server's hello says `reload: true`:
    - [ ] Show a one-line notice ("agentks was updated — reloading"), tell the service worker to drop its cached client ([090/30 service worker](../090_frontend-performance/30_service-worker-and-offline.md)), and reload. Keep UI state (sidebar, scroll) in local storage so the reload loses nothing.
    - [ ] Loop guard: if the reloaded client still mismatches (a proxy caching the old bundle), stop reloading and show the error with the two versions.
- [ ] **Reconnect.** After a server restart the client reconnects and sends a new `hello`; a changed `client_build` on the server side triggers the reload path.
- [ ] **Dev mode (state 1).** The Vite dev server's client is not embedded; its build hash is `dev`, and the server accepts `dev` without a reload.
- [ ] **Tests.** An end-to-end test that starts server build A with a tab open, swaps to build B, and checks the tab reloads once and shows B's `agentks --version` in its about panel.

## Guardrails
- Never let a mismatched client keep sending edits; editing is disabled until the reload.
- The handshake adds no extra round trip for normal page loads.

## Done when
- The end-to-end swap test passes in Chromium and Firefox.
- An installed PWA opened after an upgrade shows the new client within one reload.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: the message types in `apps/agentks-engine/crates/api/src/messages/`, the server crate `crates/server/` (the check) and `apps/agentks-client/` (the reload).

**Read first**
- [Client application](../../notes/03_frontend/02_client-application.md), section 04 ("Version handshake") and section 05 (the browser cache).
- [Sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) — the `/api` protocol.

**Depends on:** [140/10 version constants](./10_version-and-release-stream.md), [050/20 WebSocket API](../050_server/20_websocket-api.md), [080/70 embed in binary](../080_ui-and-client/70_embed-in-binary.md).
**Unblocks:** [090/30 service worker](../090_frontend-performance/30_service-worker-and-offline.md), [060/20 sync protocol](../060_collaboration/20_sync-protocol.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): layouts and major data are cached in the browser, versioned so updates still show ([client application](../../notes/03_frontend/02_client-application.md)).
- Decided (claude, 2026-09-30): the client sends `hello` first; the server compares `api_version` and `client_build` and answers `ok: false, reload: true` on a mismatch, with `dev` accepted in development. One number, `api_version`, covers the messages, the data shapes and the sync frames. The decision and its reasons are in [030/80](../030_rust-engine/80_page-data-interface.md).
- Decided (claude, 2026-09-30): the handshake compares the embedded client's build hash, not only the version, so two builds of one version (development builds) are told apart.

# 05 Notes & Analysis
## Watch out
- Service workers keep serving the old client until every tab closes unless told otherwise; the reload path must call `registration.update()` and use `skipWaiting` in the new worker.
