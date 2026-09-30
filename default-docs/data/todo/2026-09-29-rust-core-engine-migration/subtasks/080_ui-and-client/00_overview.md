---
title: "UI package and client — group index"
status: in-progress
---

This group builds the two frontend pieces every page goes through. The shared package `apps/packages/agentks-ui` holds every layout, component and island, and is pure: data in, markup out. The client `apps/agentks-client` is the Vite single-page app of the local tool: it routes real URL paths, talks to the Rust engine over one WebSocket at `/api`, caches data by content hash, mounts islands, and is embedded in the `agentks` binary. The static renderer of Phase 3 uses the same package ([150_publishing](../150_publishing/00_overview.md)), so nothing here may assume a browser while rendering.

# 01 To Do

| Leaf | Status | Delivers | Waits on |
|---|---|---|---|
| [080/10 UI framework decision](./10_ui-framework-decision.md) | review | The framework for the package, the client and the static renderer, chosen by a spike and recorded | [020/10 golden fixtures](../020_content-contract/10_golden-fixtures.md) for the spike pages |
| [080/20 Shared UI package](./20_shared-ui-package.md) | review | `agentks-ui` scaffold: `DataSource`, page-data types, layout registry, island contract, purity check | 10, [030/80 page data interface](../030_rust-engine/80_page-data-interface.md) |
| [080/30 Client shell and routing](./30_client-shell-and-routing.md) | in-progress | The app shell, the real-path router, link interception, scroll, focus, not-found | 20 |
| [080/40 WebSocket client](./40_websocket-client.md) | in-progress | The one `/api` connection: requests with ids, pushes, reconnect, version handshake, `DataSource` over the socket | 20, [050/20 WebSocket API](../050_server/20_websocket-api.md) |
| [080/50 Islands](./50_islands.md) | in-progress | Theme toggle, sidebar collapse, issue filters, code copy, tooltips, diagram viewers, artifact frame, lazy mounting | 20, 30 |
| [080/60 PWA and mobile](./60_pwa-and-mobile.md) | open | Web app manifest, app-shell service worker, the "server is off" state, mobile shell behaviour | 30, 40, [090/30 service worker and offline](../090_frontend-performance/30_service-worker-and-offline.md) |
| [080/70 Embed in binary](./70_embed-in-binary.md) | in-progress | `vite build` output compressed into the binary and served from memory with the right cache headers; the dev proxy | 30, [050/10 HTTP and routes](../050_server/10_http-and-routes.md) |
| [080/80 Binary size](./80_binary-size.md) | open | The release binary without symbols and without the raw copies of compressed client files | 70 |

**Order inside the group.** 10 first, because every other leaf is written in the chosen framework. Then 20. Then 30 and 40 in parallel. Then 50. Then 60 and 70, then 80. Performance work lives in [090_frontend-performance](../090_frontend-performance/00_overview.md) and the layouts in [100_layouts](../100_layouts/00_overview.md); both build on 20.

## Guardrails
- **Rules stay in Rust.** No leaf here computes an order, a URL, a slug, a status category, a filter option list or a config-dependent date format. If a helper could give a wrong answer about the content, it is a rule, and Rust sends the answer.
- **One data interface.** Every piece of data reaches the UI through `DataSource`. Components never call it; the route level does and passes props down.
- **Real URL paths.** The router uses the same URLs a published site has. It never derives a URL from a file name.
- **Pure components.** Nothing in `agentks-ui` opens the WebSocket, reads `window`, `document` or storage, sets a timer or fetches while rendering.
- **The dev toolbar and editor never enter `agentks-ui`.** They live in the client's `devtoolbar/` and `editor/` folders ([110_editing](../110_editing/00_overview.md)).
- **Theme contract only.** Component CSS reads declared theme variables and semantic tokens. No hex codes, no invented names, no freezing fallbacks.

## Done when
- Every leaf in the table is `review` or closed.
- `ctl gate` passes in the main repository with the package's purity check and render checks included.
- The client opens this repository's docs and tracker from `agentks start` and passes route parity ([170/20](../170_testing/20_route-and-content-parity.md)).

# 02 Status and Result
In progress. 10 and 20 are in review; 30, 40, 50 and 70 are in progress; 60 and 80 are open.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, local folder `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`; work in `apps/packages/agentks-ui` and `apps/agentks-client`.
- **Design, read first:** [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md), [the client application](../../notes/03_frontend/02_client-application.md), [theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md), [the Rust engine's data interface](../../notes/02_engine/03_rust-engine.md), [the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md).
- **Discussion:** [the local SPA over WebSocket](../../brainstorm/01_initial-discussion/17_local-spa-over-websocket.md), [Phase 3 publishing](../../brainstorm/02_future-stages/07_phase-3-publishing.md), [repositories and three states](../../brainstorm/02_future-stages/12_repositories-and-three-states.md).
- **Toolchain:** [toolchain versions](../../agent-memory/toolchain-versions.md) — Vite 8.3.1, Bun 1.4.2, Node 24.

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the frontend is a Vite single-page app over one WebSocket; it holds display logic only ([the client](../../notes/03_frontend/02_client-application.md)).
- Decided (sidhantha, 2026-09-29): the three Phase 1 safeguards — one data interface, real URL paths, pure shared components ([the shared UI package](../../notes/03_frontend/01_shared-ui-package.md)).
- Decided (sidhantha, 2026-09-30): layouts live in `apps/packages/agentks-ui`, used by `apps/agentks-client` and `apps/agentks-ssg`.
- Decided (sidhantha, 2026-09-30): use the latest Vite ([toolchain versions](../../agent-memory/toolchain-versions.md)).
- Decided (claude, 2026-09-30): Preact 11.0.0, a small manifest-driven router of our own, islands hydrated one by one, and types generated from the engine's `api.schema.json` ([10](./10_ui-framework-decision.md); [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) section 07 has the reasons and the measurements).

# 05 Notes & Analysis
## 01 Where the pieces sit

```
apps/
  packages/
    agentks-ui/        layouts, components, islands, component CSS, page-data types
  agentks-client/      the SPA: router, socket, cache, UI state, islands mount, PWA,
                       devtoolbar/ and editor/ (Phase 2, client only)
  agentks-ssg/         Phase 3: renders agentks-ui to static HTML
  agentks-engine/      Rust: computes every value both builds draw
```

## Watch out
- The prior audit counted the single-page app chores a server-rendered site gets free: `#heading` anchors, back-and-forward scroll, focus and announcements, first-load size. They are acceptance items in [30](./30_client-shell-and-routing.md), not polish.
- Excalidraw and tldraw are React components. They run on real React in their own lazy chunk, only on the pages that use them, never on Preact's compatibility layer ([10](./10_ui-framework-decision.md)).
