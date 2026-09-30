---
title: "Choose the UI framework (open question 12)"
status: open
---

Every layout, island, the client and the static renderer are written in one UI framework, and it is not chosen yet ([open question 12](../../notes/01_overview/05_open-questions-and-risks.md)). This leaf chooses it by a short, measured spike, records the choice with its reasons in the design notes, and unblocks the rest of the frontend. The decision is Claude's to make under sidhantha's delegation (2026-09-30); it must be written down before any other frontend leaf starts.

# 01 To Do
- [ ] **Shortlist.** Start from the candidates in [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) section 07: React, Preact, Solid, Svelte, Vue. Drop any that fails a hard requirement on paper (below). Keep at most three for the spike.
- [ ] **Spike each finalist** in a throwaway folder of the main repository (`spikes/ui-framework/<name>/`, deleted after the decision), with Vite 8.3.1:
    - [ ] **The docs layout** — sidebar tree, body HTML from a fixture, outline, prev/next — drawn from a JSON fixture of the docs `page` payload ([030/80](../030_rust-engine/80_page-data-interface.md); until it exists, hand-write the JSON from the example in [the Rust engine](../../notes/02_engine/03_rust-engine.md) section 05).
    - [ ] **Rendered to an HTML string** under Bun 1.4.2 and under Node 24, with no DOM available.
    - [ ] **Two islands mounted into that static HTML** without hydrating the page: the theme toggle and the sidebar collapse. Props from a `<script type="application/json">` tag.
    - [ ] **The same components as a live SPA** with a real-path router: navigate between two fixture pages, back and forward restore scroll, `#heading` scrolls.
    - [ ] **A React island inside it** (Excalidraw's viewer, lazy-loaded), to measure the cost of the React-only diagram components on the one page that uses them.
- [ ] **Measure and record** per finalist: gzipped JS for a docs page (initial, and with the Excalidraw island), time to render 1,300 fixture pages to HTML strings, time for an in-app navigation, lines of code for the spike, and any hard edge hit.
- [ ] **Decide and write it down.**
    - [ ] Add the decision with its numbers and reasons to [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) (section 07) and close question 12 in [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md). This repository is frozen for commits: edit the files, never commit them here.
    - [ ] Record the router and the island-mount approach the framework implies, because [30](./30_client-shell-and-routing.md) and [50](./50_islands.md) build on them.
- [ ] **Delete the spike folder** once the numbers are in the note.

## Guardrails
- The hard requirements are not negotiable: build-time rendering to an HTML string in Bun or Node; islands in static HTML with no whole-page hydration; lazy loading of layouts and islands; a router for real paths, anchors and scroll restoration.
- Pick the latest stable major of the chosen framework and its router at the time of the spike.
- No application code is written before the decision is recorded. The spike is throwaway.

## Done when
- The shared UI package note names the framework, the router and the island approach, with the measured numbers and the reason in one paragraph.
- Question 12 is marked decided in the open questions note, linking to it.
- `spikes/ui-framework/` no longer exists in the main repository.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system` for the spike; the decision is written into this tracker's notes.
- **Read first:** [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) (sections 03, 05, 07), [the client application](../../notes/03_frontend/02_client-application.md) (section 03, routing), [publishing with SSG](../../notes/05_delivery/02_publishing-ssg.md) (section 05, islands), [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md) (question 12).
- **Today's code the spike imitates:** the docs layout in [the docs layout folder](../../../../../../agent-ks-engine/src/layouts/docs/default), the island-like scripts in [the scripts folder](../../../../../../agent-ks-engine/src/scripts).
- **Unblocks:** every other leaf in this group, [090_frontend-performance](../090_frontend-performance/00_overview.md), [100_layouts](../100_layouts/00_overview.md), [110_editing](../110_editing/00_overview.md), [150/20 SSG renderer](../150_publishing/20_ssg-renderer.md), and the video player in [100/40](../100_layouts/40_video-pages.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the framework must render the shared components to HTML at build time and support islands ([the shared UI package](../../notes/03_frontend/01_shared-ui-package.md)).
- Decided (sidhantha, 2026-09-30): published pages are never hydrated as a whole and never load their content as JSON.
- Decided (sidhantha, 2026-09-30): Claude has full control of the design and implementation of the new repositories; this choice is Claude's to make and record ([permissions](../../agent-memory/permissions-and-repositories.md)).

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
