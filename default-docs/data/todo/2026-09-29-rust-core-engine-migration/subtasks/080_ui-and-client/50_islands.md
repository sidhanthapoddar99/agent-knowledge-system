---
title: "Islands: the interactive parts"
status: open
---

An island is a component that needs JavaScript in the reader's browser; everything else on a page is plain markup. The same island components run in the local client and, in Phase 3, on published pages, so there is one implementation, not a live copy and a static copy. This leaf ports today's browser scripts into islands in `agentks-ui` and builds the client's mounting logic. Heavy islands load only on pages that use them.

# 01 To Do
- [ ] **Mounting** in `apps/agentks-client/src/islands.ts`: after a page is drawn, find `[data-island]` elements in the layout and the body, read props from the adjacent `script[type="application/json"][data-island-props]` or the element's data attributes, lazy-import the island, mount it, and unmount everything on navigation.
- [ ] **Port each island** into `apps/packages/agentks-ui/src/islands/<name>/`:
    - [ ] **theme-toggle** — light, dark, system. Sets `data-theme` on the root. The choice is UI state ([090/10](../090_frontend-performance/10_ui-state-persistence.md)).
    - [ ] **sidebar-collapse** — opens and closes folders on the tree Rust sent; follows the opened page; stores deviations only ([090/10](../090_frontend-performance/10_ui-state-persistence.md)). Port from the docs sidebar and the issues sub-doc tree.
    - [ ] **issue-filters** — the tracker index's filter bar, state tabs, presets, view toggle, groups and pagination. It **matches values only**: Rust sends each issue's facet values, the option lists, the status categories and the default order ([the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) section 05). Port from [the index scripts](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/index).
    - [ ] **issue-detail panels** — the detail page's panels, subtask state view and table-of-contents observer, from [the detail scripts](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/detail). Delete the rule copies in `types.ts`; read the category Rust sent.
    - [ ] **code-copy and code labels** — from [code labels](../../../../../../agent-ks-engine/src/scripts/code-labels.ts).
    - [ ] **tooltip** — one shared script: `data-tip` shows only when the text is cropped, `data-tip-always` always; keep `data-tip` and `aria-label` in step. From [tooltip](../../../../../../agent-ks-engine/src/scripts/tooltip.ts).
    - [ ] **diagram viewers** — Mermaid, Graphviz, Excalidraw (a React island), draw.io (the vendored viewer), with pan, zoom and lightbox. From [diagrams](../../../../../../agent-ks-engine/src/scripts/diagrams.ts), [diagram actions](../../../../../../agent-ks-engine/src/scripts/diagram-actions.ts), [draw.io](../../../../../../agent-ks-engine/src/scripts/drawio.ts), [pan and zoom](../../../../../../agent-ks-engine/src/scripts/panzoom.ts), [lightbox](../../../../../../agent-ks-engine/src/scripts/lightbox.ts). Each library loads only when a diagram of its kind is on the page.
    - [ ] **artifact-frame** — the iframe with expand and open-full-page, `data-theme` passed in both modes. Sandboxed only for library HTML ([120/50](../120_libraries/50_lib-route-and-sandbox.md)). From [artifacts](../../../../../../agent-ks-engine/src/scripts/artifacts.ts).
    - [ ] **video-player** — owned by [100/40 video pages](../100_layouts/40_video-pages.md); register it here.
- [ ] **Island markers from Rust.** Agree with [030/50 markdown pipeline](../030_rust-engine/50_markdown-pipeline.md) on the body markers: `<div data-island="mermaid" data-src-hash="…"><pre>…</pre></div>` and the like. The static renderer may replace the `<pre>` with a pre-rendered SVG ([150/30](../150_publishing/30_diagrams-to-svg.md)); the island must then attach only pan and zoom.
- [ ] **Tests**: each island mounts on fixture markup, unmounts cleanly (no leaked listeners after 100 navigations), and works on static HTML with no client around it.

## Guardrails
- An island never computes a rule. Filter options, status categories and orders arrive from Rust.
- Props are serialisable JSON; never script variables, because a bundled module cannot read them.
- Heavy libraries (Mermaid, Excalidraw, draw.io, the video player) are dynamic imports, never in the start-up bundle ([090/40](../090_frontend-performance/40_code-splitting-and-lazy-islands.md)).

## Done when
- Every page kind in this repository's docs and tracker shows its interactive parts working in the client, including a Mermaid, a Graphviz, an Excalidraw and a draw.io diagram, an artifact embed, and the tracker filters.
- The tracker index filters give the same issue list as today's engine for each preset (compare against the old engine in [170/20](../170_testing/20_route-and-content-parity.md)).
- A docs page with no diagram loads no diagram library (checked in the network log).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `apps/packages/agentks-ui/src/islands/` and `apps/agentks-client/src/islands.ts`.
- **Read first:** [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) (sections 04, 05), [publishing with SSG](../../notes/05_delivery/02_publishing-ssg.md) (section 05), [UX standards](../../../../dev-docs/05_architecture/05_layout-internals/08_ux-standards.md).
- **Today's code:** [the scripts folder](../../../../../../agent-ks-engine/src/scripts), [the issues layout scripts](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts), the vendored draw.io viewer and its [renderer note](../../../2026-04-10-editor-diagrams/notes/05_drawio-renderer.md).
- **Depends on:** [20](./20_shared-ui-package.md), [30](./30_client-shell-and-routing.md).
- **Unblocks:** [100_layouts](../100_layouts/00_overview.md) interactive parts, [150/20 SSG renderer](../150_publishing/20_ssg-renderer.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): published pages are not hydrated as a whole; only interactive parts carry JavaScript.
- Decided (sidhantha, 2026-09-29): the frontend holds display logic only.
- Proposed (claude, 2026-09-30): the island contract — stable name, props type, `mount(el, props) => unmount`, props as a JSON script tag ([the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) section 05).

# 05 Notes & Analysis
## Watch out
- draw.io's viewer is a 3 MiB vendored file with no npm package; keep it vendored in the package with its licence and upgrade notes, and load it only for `.drawio` pages.
- Excalidraw in a non-React framework: mount React in the island only. Measure its cost once in [10](./10_ui-framework-decision.md).
- The theme toggle must run before first paint to avoid a flash; the tiny inline script that sets `data-theme` from storage stays in `index.html`, not in a lazy island.
