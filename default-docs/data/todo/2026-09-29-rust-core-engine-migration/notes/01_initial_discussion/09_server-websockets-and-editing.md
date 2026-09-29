---
title: "Server and WebSocket"
---

A Rust web server (axum, or something better if found) runs the local site. In production it serves the embedded Vite build and **one WebSocket that carries everything**: the frontend pulls page data and Rust pushes changes. In dev, the Vite dev server runs the frontend and proxies to Rust. Editing mode (Phase 2) uses the same WebSocket. **Multi-user editing comes in a later stage**, because it needs auth first. A published site (Phase 3) runs no Rust server at all.

# 03 References

- [The architecture: a local SPA over WebSocket](./17_local-spa-over-websocket.md) — why one WebSocket, and how caching works.
- [Why and the prior audit](./02_why-and-prior-audit.md) — the audit found server-side Yjs is not a blocker.
- [Config folder and .env](./06_config-folder-and-env.md) — ports, and later auth secrets.
- [Editing mode](../02_future-stages/02_editing-mode.md) (Phase 2) and [multi-user editing and auth](../02_future-stages/04_multi-user-editing-and-auth.md) (later stage).
- [Phase 3: publishing](../02_future-stages/07_phase-3-publishing.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): one server. `/api` is the WebSocket endpoint and `/**` serves the frontend.
- Decided (sidhantha, 2026-09-29): the WebSocket carries both pulls (data the frontend asks for) and pushes (changes Rust announces). There is no separate HTTP data API.
- Decided (sidhantha, 2026-09-29): in dev, the Vite dev server is the proxy in front of Rust. In production, the Rust server serves the embedded Vite build.
- Decided (sidhantha, 2026-09-29): editing mode talks to the server directly, over the same WebSocket.
- Decided (sidhantha, 2026-09-29): multi-user editing moves to a later stage, after Phase 2. Auth is needed first and will be designed then.
- Decided (sidhantha, 2026-09-29): no Rust server in a published site. The Phase 3 export is served by nginx or any static host.

# 05 Notes & Analysis

## 01 Serving, by mode

| Mode | Frontend served by | Data |
|---|---|---|
| Dev (working on agentks itself) | Vite dev server, with hot reload | Vite proxies `/api` to Rust |
| Local use (`agentks start`) | Rust serves the embedded Vite build | WebSocket to Rust |
| Published (Phase 3) | nginx or any static host | Prebuilt files; no Rust, no WebSocket |

## 02 What travels over the WebSocket (claude, proposed shape)

- **Pull:** "manifest", "page X", "sidebar for section Y", "issues index", "render this markdown" (the Phase 2 preview).
- **Push:** "these hashes changed" after a file changes on disk; later, editing and presence messages.
- Every response carries the content hash it was built from, so the frontend can cache it ([the architecture note](./17_local-spa-over-websocket.md)).

## 03 Building blocks

| Need | Rust option |
|---|---|
| HTTP and WebSockets | axum |
| File watching | `notify` (the user expects a better watcher than today's) |
| CRDT for shared editing (later stage) | `yrs`, the Rust port of Yjs |
| Static files | the embedded frontend bundle, plus project assets and artifacts from disk |

## 04 Security now, not later (claude, proposed)

The current dev server listens on the whole network (it printed a `192.168.x.x` address) and `site.yaml` sets `allowedHosts: true`. With the live editor on, anyone on that network can reach it. The new server should listen on **localhost only by default**, with network access as an explicit opt-in once auth exists. This should hold from Phase 1, not wait for the multi-user stage.
