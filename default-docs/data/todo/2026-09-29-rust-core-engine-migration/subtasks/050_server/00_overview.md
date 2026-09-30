---
title: "Server — HTTP, the /api WebSocket, the watcher and the server lifecycle"
status: open
---

The index leaf of the server group. `agentks start` runs one local server per project, built on axum (a Rust web framework). It serves the embedded client at every path, the project's files at a few fixed routes, and **one WebSocket at `/api`** that carries every data request and every push. A file watcher turns changes on disk into pushed hashes. This group builds the server itself; the data it serves comes from the engine (030) and the caches (040), and multi-user sync on the same socket is [060/00](../060_collaboration/00_overview.md).

# 01 To Do

| Leaf | Delivers | Status |
|---|---|---|
| [050/10 HTTP and routes](./10_http-and-routes.md) | axum, the route table, the embedded client, static file serving | open |
| [050/20 WebSocket API](./20_websocket-api.md) | The `/api` protocol: hello, requests, replies, pushes, errors | open |
| [050/30 Watcher and push](./30_watcher-and-push.md) | `notify`, debounce, git refs, change batches, pushed hashes, `fatal` | open |
| [050/35 File writes and echo suppression](./35_file-writes-and-echo-suppression.md) | `open` and `save`: path checks, conflict by base hash, atomic write, echo suppression | open |
| [050/40 Lifecycle, ps, stop, logs](./40_lifecycle-ps-stop-logs.md) | Run records, attach, detach, graceful shutdown, machine-wide `ps` and `stop`, logs | open |
| [050/45 Stable ports](./45_stable-ports.md) | One stable port per project; fail rather than move | open |
| [050/50 Security](./50_security.md) | Localhost bind, `Host` and `Origin` checks, path canonicalisation, the MIME allowlist, headers | open |

**Order of work inside the group.** 10 and 50 together (routes and their safety rules are one piece of work), then 20, 45 and 40, then 30, then 35 (Phase 2).

## Guardrails
- One server per project, one WebSocket. No separate HTTP data API (sidhantha, 2026-09-29).
- Localhost only unless the owner opts in with `--share` and an access key ([060/50](../060_collaboration/50_network-exposure-and-tls.md)).
- The server never decides a rule. It transports what the core computes.
- No Rust server in a published site. Nothing here may be needed by `agentks build` output.

## Done when
- Every leaf in the table is closed.
- The route-parity and end-to-end suites ([170/20](../170_testing/20_route-and-content-parity.md), [170/30](../170_testing/30_end-to-end.md)) pass against the server.
- A security test suite covering every rule of [050/50](./50_security.md) passes.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where the work happens:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, crate `agentks-server` in `apps/agentks-engine/crates/server/` ([030/10](../030_rust-engine/10_workspace-and-crate-boundaries.md) fixes the crates and their folders).

**Read first (every leaf):**
- [Sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) — the design this group builds.
- [Client application](../../notes/03_frontend/02_client-application.md) — the other end of the socket.
- [The Rust engine, section 05](../../notes/02_engine/03_rust-engine.md) — the data interface the server transports.
- [Machine home](../../notes/02_engine/06_machine-home-and-build-cache.md) — run records and logs.
- [Server, WebSockets and editing (brainstorm)](../../brainstorm/01_initial-discussion/09_server-websockets-and-editing.md), [local SPA over WebSocket](../../brainstorm/01_initial-discussion/17_local-spa-over-websocket.md).
- [Toolchain versions](../../agent-memory/toolchain-versions.md): Rust 1.98.1, edition 2024; take the latest axum, tokio and `notify` releases at start.

# 04 Decisions
- Decided (sidhantha, 2026-09-29): one server; `/api` is the WebSocket and `/**` serves the frontend.
- Decided (sidhantha, 2026-09-29): the WebSocket carries pulls and pushes; no separate HTTP data API.
- Decided (sidhantha, 2026-09-29): in development the Vite dev server proxies to Rust; when installed, Rust serves the embedded client.
- Decided (sidhantha, 2026-09-29): no Rust server in a published site.
- Decided (claude, 2026-09-30): each project keeps a stable port ([server note](../../notes/02_engine/04_sync-engine-and-server.md)).

# 05 Notes & Analysis

## Watch out
- The server note's opening paragraph still says multi-user "needs auth first"; its decisions and section 06 say access keys, no sign-in. Follow the decisions.
