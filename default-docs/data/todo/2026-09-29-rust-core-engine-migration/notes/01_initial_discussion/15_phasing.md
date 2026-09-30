---
title: "Phasing"
---

**Phase 1 is rendering**: the Rust engine and the single-page frontend show every page with the same correct results as today, locally. **Phase 2** adds the new editing mode, the dev toolkit and libraries (`config/dep.yaml`). **Phase 3** is publishing: `agentks build` generates a static site (SSG) from the shared layout components. **The launch** then moves the project to Neuralabs and puts the homepage and docs online. **Later stages** add multi-user editing with auth, agent hooks with retrieval, the GitHub issues layout and extensions. 1.0.0 ships with Phases 1 and 2; publishers stay on the last 0.x release until Phase 3. Inside Phase 1, claude proposes an order of steps so the project always has a working engine, which is how this plan answers the prior audit's 6–12 month estimate.

# 03 References

- [The architecture: a local SPA over WebSocket](./17_local-spa-over-websocket.md)
- [Future stages](../02_future-stages/01_index.md) — Phase 2 onwards, one note each.
- [Why and the prior audit](./02_why-and-prior-audit.md)
- `scripts/checks/check-route-parity.mjs` — an existing check that compares old and new builds route by route.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): Phase 1 is rendering and correct results only.
- Decided (sidhantha, 2026-09-29): Phase 2 is editing mode, the dev toolkit, its toolbar, cache clearing and the other dev tools.
- Decided (sidhantha, 2026-09-29): Phase 3 is publishing — a fully static export for nginx or any static host, search-engine friendly, with no Rust server.
- Decided (sidhantha, 2026-09-29): publishers stay on the last 0.x release, pinned with mise, until Phase 3 ships.
- Decided (sidhantha, 2026-09-29): multi-user editing (with auth), agent hooks with retrieval, and the GitHub issues layout are later stages.

# 05 Notes & Analysis

## 01 Phase 1 — rendering

What Phase 1 contains, from the decisions so far:

- **Rust engine:** config, file watching, the site index, the markdown pipeline, the issue tracker, derived JSON for every page, theme CSS compilation.
- **Rust server:** serves the embedded frontend and the WebSocket, on localhost.
- **Vite frontend:** a mobile- and PWA-friendly single-page app with every built-in layout (docs, blog, issues, custom pages, navbar, footer), diagrams, artifacts in iframes, and the browser cache keyed by content hash. Its layouts and components live in the shared package `apps/packages/agentks-ui`.
- **The three safeguards for Phase 3:** one data interface in the frontend, real URL paths in its router, and pure layouts and components in a shared package that the static build reuses.
- **Project setup:** mandatory `config/` with `.env` inside it; `~/.agentks/` and the build cache; the `agentks` rename everywhere.
- **Content:** forced migrations covering every 0.x format, run by `agentks migrate` from scripts fetched from git; custom layouts removed.
- **CSS:** the CSS listing command, because CSS becomes the only way to brand a site.
- **First-class diagram and artifact pages:** `.mmd`, `.dot`, `.excalidraw`, `.drawio` and `.html` pages with their `.meta.json` sidecars keep appearing in sidebars and routes as today.
- **Proof:** the checks in [open questions](./16_open-questions.md) 06 pass against today's engine.

## 02 Proposed steps inside Phase 1 (claude, not agreed)

The work happens in a new repository started from scratch ([the repositories](../02_future-stages/12_repositories-and-three-states.md)), while this repository's Astro engine keeps serving users until the switch-over. So the order is about what can be checked early, not about keeping one engine running:

1. **Rust content core.** Config, parsing, loaders and the tracker as a Rust library, and the CLI on top of it. The duplicated rules disappear. It can be checked against this repository's content before any UI exists.
2. **Rust server, the shared UI package and the client.** The WebSocket, derived JSON, and the layouts rebuilt as shared components. Done when the correctness checks match the Astro engine on the same content.
3. **Migrations.** The docs migration scripts that bring every 0.x format to 1.0.0, tried on this repository's own docs and tracker first.

## 03 Phase 2 — editing and dev tools

[Editing mode](../02_future-stages/02_editing-mode.md), [the dev toolkit](../02_future-stages/03_dev-toolkit.md) and [libraries](../02_future-stages/09_libraries-and-dependencies.md). The live preview is rendered by Rust over the WebSocket; there is no WASM build. 1.0.0 ships when Phases 1 and 2 are done.

## 04 Phase 3 — publishing

[`agentks build`](../02_future-stages/07_phase-3-publishing.md): every page pre-built with its content, served by nginx, any static host or a CDN, no Rust server. A basic Dockerfile ships for users who host with Docker. Until it ships, publishers stay on 0.x.

## 05 The launch

[The launch order](../02_future-stages/10_launch-order-and-hosting.md), decided by the user on 2026-09-30:

1. Build the Rust engine, the client and the default library, and test them end to end.
2. Get the Neuralabs plugin marketplace running.
3. The agentks homepage.
4. The docs migration: a complete rewrite.
5. Hosting at agentks.neuralabs.org: the homepage at `/`, the docs at `/docs`. `agentks docs` ships here.
6. The official archival of this repository.

Hosting needs Phase 3's `agentks build`, so Phase 3 is finished by step 5. Until the new docs are complete, this repository's docs and skills stay in use; then everything switches at once. The work happens in a new main repository and a separate library repository ([the repositories and three states](../02_future-stages/12_repositories-and-three-states.md)).

## 06 Later stages

[Multi-user editing and auth](../02_future-stages/04_multi-user-editing-and-auth.md), [agent hooks and retrieval](../02_future-stages/05_agent-hooks-and-retrieval.md), [the GitHub issues layout](../02_future-stages/06_github-issues-layout.md), [extensions](../02_future-stages/11_extensions.md).

## 07 Tracked separately

Narrated video pages and their audio are tracked in [2026-09-29-narrated-video-pages](../../../2026-09-29-narrated-video-pages/issue.md). The player is browser code and can continue at any time. The audio and the voice model land with or after Phase 1, because they need the `~/.agentks` home. The libraries videos draw on are [project libraries](../02_future-stages/09_libraries-and-dependencies.md), in Phase 2.
