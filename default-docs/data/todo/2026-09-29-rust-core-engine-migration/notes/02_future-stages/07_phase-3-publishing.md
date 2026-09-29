---
title: "Phase 3: publishing as a static export"
---

Publishing a site, for search engines or for readers outside the team, is **Phase 3**. agentks produces a **fully static build**: every page pre-built with its content filled in, served over HTTPS by nginx or any static host, with **no Rust server**. The local tool (Phases 1 and 2) stays a WebSocket app for one or two developers and never has to serve the public. **Until Phase 3 ships, anyone who publishes stays on the last 0.x release.**

# 03 References

- [The architecture: a local SPA over WebSocket](../01_initial_discussion/17_local-spa-over-websocket.md) — the two safeguards that keep this phase cheap.
- [Versioning and forced migrations](../01_initial_discussion/12_versioning-and-forced-migrations.md) — pinning 0.x with mise.
- [Docker design](../../../2026-05-08-runtime-stack-migration/notes/deployment-methods/02_docker-design.md) — static build behind nginx, `base_url`, from the Go issue.
- User guide `30_deployment/` — how publishing works today; it must be rewritten for this phase.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): publishing is Phase 3, after editing (Phase 2).
- Decided (sidhantha, 2026-09-29): a published site is a 100% static build (SSG), served by nginx or similar over HTTPS. No Rust server runs.
- Decided (sidhantha, 2026-09-29): search-engine friendliness is this phase's job only.
- Decided (sidhantha, 2026-09-29): publishers stay on the last 0.x release, pinned with mise, until Phase 3 ships.

# 05 Notes & Analysis

## 01 Why publishing is separate

- The local tool serves one or two developers. It does not need search engines, CDNs or static hosting.
- A published site changes only when someone publishes, so every page can be built once, ahead of time.
- Serving files with nginx is the smallest and safest thing to run in public: no application server, nothing to authenticate.

## 02 How to prerender (decide when the phase starts)

| Option | How | Cost |
|---|---|---|
| **Headless browser** (Puppeteer or Playwright) | Run the SPA against the local server, visit every route, save the finished HTML | Needs Chrome, so run it inside the Docker publish image, never on the user's machine |
| **Rust writes each page** | Rust writes each page's HTML directly: the body it already renders, the layout's essential markup and metadata, with the SPA loading on top | No browser needed; the layout markup has to be expressed on the Rust side for export |
| **Prebuilt data files** | The export writes the same JSON the WebSocket would send; the SPA reads files through its data interface | Fast and simple, but pages are empty without JavaScript, so this alone is not enough for search engines |

The first two can be combined with the third: prerendered HTML for crawlers, prebuilt data for the SPA once it starts.

## 03 What Phase 1 must already do

- All frontend data access goes through one interface, so Phase 3 swaps WebSocket for files without touching components.
- The router uses real URL paths, so exported pages keep the same URLs and relative links keep resolving.

## 04 The gap between 1.0.0 and Phase 3

The current engine already builds a static site, and the user guide documents deploying it. 1.0.0 ships Phases 1 and 2 first, so publishing is unavailable in 1.x until Phase 3. The plan is:

- The 1.0.0 release notes say so plainly.
- Publishers pin the last 0.x release with mise and keep publishing with it.
- The deployment section of the user guide points to that pin until Phase 3 replaces it.

## 05 Also for this phase

- Serving each page's raw markdown next to its HTML (`<url>.md`), so agents fetching a published site read markdown directly (claude, proposed).
- Deciding whether search or filtering must work in the static site. If so, that one feature may need a WASM build of the relevant Rust code ([WASM and HTMX](../01_initial_discussion/04_wasm-and-htmx.md)).
