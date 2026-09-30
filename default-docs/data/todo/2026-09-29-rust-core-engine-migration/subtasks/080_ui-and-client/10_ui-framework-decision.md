---
title: "Choose the UI framework (open question 12)"
status: review
---

Every layout, island, the client and the static renderer are written in one UI framework ([open question 12](../../notes/01_overview/05_open-questions-and-risks.md)). This leaf chooses it by a short, measured spike, records the choice with its reasons in the design notes, and unblocks the rest of the frontend. The decision is Claude's to make under sidhantha's delegation (2026-09-30); it must be written down before any other frontend leaf starts.

# 01 To Do
- [x] **Shortlist.** Start from the candidates in [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) section 07: React, Preact, Solid, Svelte, Vue. Drop any that fails a hard requirement on paper (below). Keep at most three for the spike.
- [x] **Spike each finalist** in a throwaway scratch folder outside the main repository, deleted after the decision, with Vite 8.3.1:
    - [x] **The docs layout** — sidebar tree, body HTML from a fixture, outline, prev/next — drawn from a JSON fixture of the docs `page` payload ([030/80](../030_rust-engine/80_page-data-interface.md); until it exists, hand-write the JSON from the example in [the Rust engine](../../notes/02_engine/03_rust-engine.md) section 05).
    - [x] **Rendered to an HTML string** under Bun 1.4.2 and under Node 24, with no DOM available.
    - [x] **Two islands mounted into that static HTML** without hydrating the page: the theme toggle and the sidebar collapse. Props from a `<script type="application/json">` tag.
    - [x] **The same components as a live SPA** with a real-path router: navigate between two fixture pages, back and forward restore scroll, `#heading` scrolls.
    - [x] **A React island inside it** (Excalidraw's viewer, lazy-loaded), to measure the cost of the React-only diagram components on the one page that uses them.
- [x] **Measure and record** per finalist: gzipped JS for a docs page (initial, and with the Excalidraw island), time to render 1,300 fixture pages to HTML strings, time for an in-app navigation, lines of code for the spike, and any hard edge hit.
- [x] **Decide and write it down.**
    - [x] Add the decision with its numbers and reasons to [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) (section 07) and close question 12 in [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md). This repository is frozen for commits: edit the files, never commit them here.
    - [x] Record the router and the island-mount approach the framework implies, because [30](./30_client-shell-and-routing.md) and [50](./50_islands.md) build on them.
- [x] **Delete the spike folder** once the numbers are in the note.

## Guardrails
- The hard requirements are not negotiable: build-time rendering to an HTML string in Bun or Node; islands in static HTML with no whole-page hydration; lazy loading of layouts and islands; a router for real paths, anchors and scroll restoration.
- Pick the latest stable major of the chosen framework and its router at the time of the spike.
- No application code is written before the decision is recorded. The spike is throwaway.

## Done when
- The shared UI package note names the framework, the router and the island approach, with the measured numbers and the reason in one paragraph.
- Question 12 is marked decided in the open questions note, linking to it.
- The spike folder is deleted, and no spike code is in the main repository.

# 02 Status and Result
Review. Decided: Preact 11.0.0, with a manifest-driven router of our own and islands hydrated one by one. The spike is deleted.

## Result
- **The decision and its numbers** are in [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) section 07. Question 12 is marked decided in [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md).
- **The spike** ran in a scratch folder outside the main repository, so the main repository stayed clean. It built the same docs layout (sidebar tree, body HTML, outline, prev and next, theme toggle) in Preact 11.0.0, Solid 1.9.15 and Svelte 5.57.1 with Vite 8.3.1, from a hand-written payload in the shape of [the Rust engine](../../notes/02_engine/03_rust-engine.md) section 05. The payload types came from a JSON Schema through `json-schema-to-typescript` 16.0.0. The folder is deleted.
- **Checks that passed for all three** (headless Chromium, one script per framework, about 4 s each): the theme and sidebar islands hydrate on a static page and work; the static page loads no layout code; the Excalidraw viewer mounts lazily as a React 19.3.0 island on the static page and in the SPA; the SPA scrolls to `#caching` on first load, starts a new page at the top, restores scroll 1,500 on back, returns to the top on forward, and jumps to a same-page `#routing` link. Rendering ran under Bun 1.4.2 and Node 24.21.0 with no DOM present.

| Measured | Preact | Solid | Svelte |
|---|---|---|---|
| Static page, two islands: gzipped JS | 8.0 KiB | 11.1 KiB + 0.4 KB inline script | 16.5 KiB |
| With the Excalidraw island | 417.5 KiB | 420.6 KiB | 426.0 KiB |
| SPA first load: gzipped JS | 9.2 KiB | 12.6 KiB | 18.2 KiB |
| 1,300 pages to HTML, Bun / Node (median of 3) | 44 / 54 ms | 29 / 48 ms | 24 / 33 ms |
| In-app navigation, median of 10 | 12.7 ms | 11.4 ms | 12.3 ms |
| Lines of code (components and entries) | 100 | 110 | 116 |

## Agent log
none

# 03 References
- **Where:** a scratch folder outside the main repository for the spike; the decision is written into this tracker's notes.
- **Read first:** [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) (sections 03, 05, 07), [the client application](../../notes/03_frontend/02_client-application.md) (section 03, routing), [publishing with SSG](../../notes/05_delivery/02_publishing-ssg.md) (section 05, islands), [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md) (question 12).
- **Today's code the spike imitates:** the docs layout in [the docs layout folder](../../../../../../agent-ks-engine/src/layouts/docs/default), the island-like scripts in [the scripts folder](../../../../../../agent-ks-engine/src/scripts).
- **Unblocks:** every other leaf in this group, [090_frontend-performance](../090_frontend-performance/00_overview.md), [100_layouts](../100_layouts/00_overview.md), [110_editing](../110_editing/00_overview.md), [150/20 SSG renderer](../150_publishing/20_ssg-renderer.md), and the video player in [100/40](../100_layouts/40_video-pages.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the framework must render the shared components to HTML at build time and support islands ([the shared UI package](../../notes/03_frontend/01_shared-ui-package.md)).
- Decided (sidhantha, 2026-09-30): published pages are never hydrated as a whole and never load their content as JSON.
- Decided (sidhantha, 2026-09-30): Claude has full control of the design and implementation of the new repositories; this choice is Claude's to make and record ([permissions](../../agent-memory/permissions-and-repositories.md)).
- Decided (claude, 2026-09-30): the finalists are Preact, Solid and Svelte. React and Vue are dropped on paper because React's runtime is several times Preact's on every page, and Vue offers nothing the three finalists lack.
- Decided (claude, 2026-09-30): the framework is Preact 11.0.0, because it has the smallest island and SPA JavaScript (8.0 and 9.2 KiB gzipped), its hydration needs no markers or bootstrap script, one compile serves server and browser, and JSX with hooks is what AI agents write most reliably. Render and navigation times were equal enough not to matter.
- Decided (claude, 2026-09-30): the router is our own, about 60 lines, in `agentks-client`, because the manifest is the route table and a pattern router adds nothing. It keeps scroll in `history.state`, handles `#heading` and moves focus and the title.
- Decided (claude, 2026-09-30): islands mount one by one: `<div data-island="name">` plus a `<script type="application/json" data-props>` tag, a registry of lazy imports keyed by name, and Preact `hydrate` on that element alone, because this ships no layout code to a published page.
- Decided (claude, 2026-09-30): React-only components run on real React in their own lazy chunk, with Preact's React aliases off, because the compatibility layer is a risk for Excalidraw and tldraw and the saving is small next to their size.
- Decided (claude, 2026-09-30): component CSS is a plain CSS file beside each component with layout-prefixed classes, because CSS modules would hash the class names users may style.
- Decided (claude, 2026-09-30): the TypeScript types are generated from the engine's `api.schema.json` with `json-schema-to-typescript`, not with `ts-rs`, because 030/80 already publishes the JSON Schema and one source is enough.

# 05 Notes & Analysis
## 01 What each requirement protects

| Requirement | Protects |
|---|---|
| HTML string at build time, no DOM | The static renderer of Phase 3, and the purity check that runs every component under Bun with no DOM |
| Islands without whole-page hydration | Published pages that ship JavaScript only for interactive parts |
| Lazy layouts and islands | The first download of the local client |
| Real-path router with anchors and scroll | Safeguard 2 and a usable SPA |
| Written well by AI agents | The AI writes most of the changes |

## 02 What is already known
- Preact, Solid and Svelte do build-time rendering with islands well. React can, with more work.
- Excalidraw and tldraw are React components. Any other framework mounts them inside a React island. That costs React's runtime only on the pages that show them.
- The video player's widgets will be written in the chosen framework ([video pages](../../notes/04_ecosystem/05_video-pages.md) section 08).

## Watch out
- Measure with production builds, not dev servers; Vite's dev mode hides bundle size.
- A framework whose "islands" story needs a meta-framework (a full app router with its own server) fails the requirement: the client routes itself, and the static renderer is ours.
