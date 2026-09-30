---
title: "Phasing"
---

**Phase 1 is rendering**: the Rust engine and the single-page frontend show every page with the same correct results as today, locally. **Phase 2** adds the new editing mode, the dev toolkit, the `agentks docs` command and libraries (`config/dep.yaml`). **Phase 3** is publishing: a static export served by nginx. **Later stages** add multi-user editing with auth, agent hooks with retrieval, and the GitHub issues layout. 1.0.0 ships with Phases 1 and 2; publishers stay on the last 0.x release until Phase 3. Inside Phase 1, claude proposes an order of steps so the project always has a working engine, which is how this plan answers the prior audit's 6–12 month estimate.

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
- **Vite frontend:** a single-page app with every built-in layout (docs, blog, issues, custom pages, navbar, footer), diagrams, artifacts in iframes, and the browser cache keyed by content hash.
- **The two safeguards for Phase 3:** one data interface in the frontend, and real URL paths in its router.
- **Project setup:** mandatory `config/` with `.env` inside it; `~/.agentks/` and the build cache; the `agentks` rename everywhere.
- **Content:** forced migrations in Rust covering every 0.x format; custom layouts removed.
- **CSS:** the CSS listing command, because CSS becomes the only way to brand a site.
- **First-class diagram and artifact pages:** `.mmd`, `.dot`, `.excalidraw`, `.drawio` and `.html` pages with their `.meta.json` sidecars keep appearing in sidebars and routes as today.
- **Proof:** the checks in [open questions](./16_open-questions.md) 06 pass against today's engine.

## 02 Proposed steps inside Phase 1 (claude, not agreed)

1. **Rename, config, home.** The Astro engine can already be installed once per machine at this step, so most of "one install for ten projects" lands before any rewrite.
2. **Rust content core.** Parsing, loaders and the tracker move into a Rust library, and the CLI uses it. The duplicated rules disappear. Nothing user-facing changes.
3. **Rust server and the SPA.** The WebSocket, derived JSON, and the layouts rebuilt as frontend components. Switch over only when the correctness checks match the Astro engine. Forced migrations ship with this step.

## 03 Phase 2 — editing and dev tools

[Editing mode](../02_future-stages/02_editing-mode.md), [the dev toolkit](../02_future-stages/03_dev-toolkit.md) [the agentks docs command](../02_future-stages/08_agentks-docs-command.md) and [libraries](../02_future-stages/09_libraries-and-dependencies.md). The docs are fetched through the library machinery. The docs command belongs here because 1.0.0 is the first release with no framework checkout, which is where the docs live today. The live preview is rendered by Rust over the WebSocket; there is no WASM build. 1.0.0 ships when Phases 1 and 2 are done.

## 04 Phase 3 — publishing

[The static export](../02_future-stages/07_phase-3-publishing.md): every page pre-built with its content, served by nginx over HTTPS, no Rust server. Until it ships, publishers stay on 0.x.

## 05 Later stages

[Multi-user editing and auth](../02_future-stages/04_multi-user-editing-and-auth.md), [agent hooks and retrieval](../02_future-stages/05_agent-hooks-and-retrieval.md), [the GitHub issues layout](../02_future-stages/06_github-issues-layout.md).

## 06 Tracked separately

Narrated video pages and their audio are tracked in [2026-09-29-narrated-video-pages](../../../2026-09-29-narrated-video-pages/issue.md). The player is browser code and can continue at any time. The audio and the voice model land with or after Phase 1, because they need the `~/.agentks` home. The libraries videos draw on are [project libraries](../02_future-stages/09_libraries-and-dependencies.md), in Phase 2.
