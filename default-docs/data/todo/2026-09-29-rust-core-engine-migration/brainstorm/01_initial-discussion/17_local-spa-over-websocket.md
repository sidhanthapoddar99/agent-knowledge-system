---
title: "The architecture: a local single-page app over WebSocket"
---

agentks is a **local tool for one or two developers at a time**, not a website for thousands of readers. So the engine splits cleanly. The **Rust engine** watches files, indexes the site, transforms content and sends ready-to-display JSON over **one WebSocket**. The **Vite frontend** is a single-page app (SPA) that does all layouts and all UI, holding no rules of its own. Search engines and publishing are not this architecture's concern: **Phase 3's `agentks build`** covers them: it renders the same layout components to static HTML once, served by nginx or a CDN with no Rust server at all.

# 03 References

- [Rust engine and Vite frontend](./03_rust-core-and-vite-frontend.md) — what each side owns.
- [Server and WebSocket](./09_server-websockets-and-editing.md) — dev and production serving.
- [Phase 3: publishing](../02_future-stages/07_phase-3-publishing.md) — the static export.
- [Open questions](./16_open-questions.md) — questions 01 and 10, which this note settles, and question 12 (the UI framework), which it opens.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): agentks is a local tool for one or two developers at a time. It is not built for search engines or large audiences.
- Decided (sidhantha, 2026-09-29): the frontend is a Vite single-page app that renders every layout. Rust does not render page layouts, and there is no template language (no minijinja, no askama).
- Decided (sidhantha, 2026-09-29): Rust sends derived JSON. The frontend holds display and UI logic only. Every rule — what to show, which options exist, how things are ordered and grouped — is computed in Rust.
- Decided (sidhantha, 2026-09-29): no TypeScript is generated from Rust rules. Rules stay in Rust; the frontend receives their results as data.
- Decided (sidhantha, 2026-09-29): one WebSocket carries both directions: the frontend pulls data and Rust pushes changes.
- Decided (sidhantha, 2026-09-29): in dev, the Vite dev server runs the frontend and proxies to Rust. In production, the Rust (axum) server serves the embedded Vite build and the WebSocket.
- Decided (sidhantha, 2026-09-29): layouts and major data are cached in the browser, versioned so that updates still show.
- Decided (sidhantha, 2026-09-29): Rust compiles and caches each project's theme CSS; the frontend fetches it. Common assets ship in the frontend build; other assets are served by Rust.
- Decided (sidhantha, 2026-09-29): search-engine visibility is handled only by the Phase 3 static export.
- Decided (sidhantha, 2026-09-29): two safeguards in Phase 1 keep Phase 3 cheap — all data access goes through one small interface, and the router uses real URL paths.
- Decided (sidhantha, 2026-09-30): a third safeguard — the layouts and components live in a shared package, `apps/packages/agentks-ui`, used by both the client app and the static build ([Phase 3](../02_future-stages/07_phase-3-publishing.md)).

# 05 Notes & Analysis

## 01 The division of work

| Rust engine | Vite frontend (SPA) |
|---|---|
| Watches files | Every layout: docs, blog, issues, custom pages, navbar, footer, in the shared package `apps/packages/agentks-ui` |
| Builds and updates the site index | Routing, with real URL paths |
| Parses markdown and renders page bodies to HTML | Places the body HTML inside the layout |
| Computes everything derived: order, URLs, status categories, sidebar trees, outlines, filters' option lists | Displays what it is given; UI state only (open panels, scroll, tabs) |
| Compiles and caches theme CSS | Loads the CSS it is served |
| Serves assets, artifacts and the embedded frontend | Shows artifacts in an iframe; renders diagrams and video in the browser |
| Pushes changes over the WebSocket | Caches data by content hash; refreshes only what changed |

The rule of thumb: **if a value could be wrong, Rust computes it.** The frontend decides only how things look and behave on screen.

## 02 Why no templates

An earlier proposal (claude) used minijinja templates in Rust to lay out pages. It came from treating "the built site must be real HTML for crawlers and no-JS readers" as a Phase 1 requirement. With the local-tool framing that requirement moves to the Phase 3 export. Without it, templates would only split each layout across two languages. With the SPA, a layout is one frontend component.

## 03 Why no shared-rules code generation

Rules such as the issue statuses and their categories, the `NN_` ordering prefix, and URL slugs exist today in up to three copies: the TypeScript engine, the Rust CLI and browser scripts (for example [the detail types](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/detail/types.ts) and [the index filters](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/index/filters.ts) in the issues layout). After the migration the engine and CLI copies merge into the Rust core. The browser copies disappear because Rust sends results, not rules: each issue arrives with its category, each page with its order and URL. Nothing is left to generate.

## 04 Why WebSocket for everything

- One channel does both jobs. Pulling data and pushing file changes share one connection and one message format.
- The audience is one or two people on localhost, so browser and CDN caching, which HTTP would give for free, are not needed. The frontend's own hash-versioned cache covers repeat loads.
- Static hosting, the one place a WebSocket cannot exist, is the Phase 3 export's job, and the export does not need a server.

## 05 Caching in the browser

- Rust's site index stores a content hash for every file, with folder hashes rolled up from their children (Merkle style). See [the build cache](./07_agentks-home-and-build-cache.md).
- On connect, the frontend receives the manifest of hashes, compares it with what it has cached, and fetches only what changed.
- When a file changes on disk, Rust pushes the new hashes. The frontend refetches only the affected pages and folders.
- Cached data survives a refresh (browser storage such as IndexedDB) and is versioned by hash, so updates always show.
- **A page's hash covers everything it inlines.** A page that embeds another file (`[[../assets/flow.mmd]]`) hashes its own bytes plus the hashes of every embedded file; otherwise editing the embedded file leaves the page stale in Rust's cache and the browser's ([2026-08-07-content-embed-cache-dependencies](../../../2026-08-07-content-embed-cache-dependencies/issue.md)).

## 06 The three Phase 1 safeguards

1. **One data interface.** Every component asks through one small module: "page X", "sidebar for section Y", "issues index". In Phases 1 and 2 it talks to the WebSocket. In Phase 3 the static build hands each page's data to the same components directly. A few dozen lines now instead of a rewrite later.
2. **Real URL paths** (`/dev-docs/architecture/overview`, not `/#/dev-docs/...`), so exported pages keep the same URLs. Files on disk keep their relative links; **Rust resolves every link and outputs root-absolute hrefs**, because a relative href left for the browser to resolve breaks under routing and on static hosts ([2026-08-04-absolute-link-resolution](../../../2026-08-04-absolute-link-resolution/issue.md)).
3. **Pure shared components.** Every layout and component lives in `apps/packages/agentks-ui` and only turns data into markup: no WebSocket and no browser-only objects such as `window` while rendering. The client app wires them to live data; the static build renders them to HTML once per page. One implementation of every layout, so the local tool and the published site cannot drift ([Phase 3](../02_future-stages/07_phase-3-publishing.md)).

## 07 What this drops

- Server-side page templates (minijinja, askama).
- The WASM build of the core. The Phase 2 live preview asks Rust to render over the WebSocket, which takes milliseconds on localhost ([WASM and HTMX](./04_wasm-and-htmx.md)).
- HTMX.
- A separate HTTP data API.

## 08 Costs to plan for

- **Frontend chores** a server-rendered site gets for free: `#heading` anchors, scroll position on back and forward, focus and accessibility, and keeping the first download small with lazy loading.
- **Agents reading the local site** get an empty page without JavaScript. That is acceptable: agents read the files on disk and use the CLI.
- **The project's three-stage model** in `AGENTS.md` names the built static site as the Host stage. After this migration, hosting is Phase 3's `agentks build`, and the stages become the three states in [the repositories note](../02_future-stages/12_repositories-and-three-states.md). Update that text when the migration lands.
- **Which UI framework** is a new open question.
