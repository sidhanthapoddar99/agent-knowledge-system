---
title: "Islands: the interactive parts"
status: in-progress
---

An island is a component that needs JavaScript in the reader's browser; everything else on a page is plain markup. The same island components run in the local client and, in Phase 3, on published pages, so there is one implementation, not a live copy and a static copy. This leaf ports today's browser scripts into islands in `agentks-ui` and builds the client's mounting logic. Heavy islands load only on pages that use them.

# 01 To Do
- [x] **Mounting**, as decided in [10](./10_ui-framework-decision.md) ([the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) section 07):
    - [x] **The islands entry** for static pages: scan the page for `[data-island]`, read each island's props from the `<script type="application/json" data-props>` that follows its `<div data-island="name">`, load the island from the registry of lazy imports keyed by name, and call Preact's `hydrate` on that element alone. Unmount is `render(null, el)`. The page never loads the layout's code.
    - [x] **In the client** (`apps/agentks-client/src/islands.ts`): the layout's interactive parts render live as components, with no island wrapper. After a page is drawn, mount the islands Rust marked in the body HTML (their input is in `data-` attributes) from the same registry, and unmount them all on navigation.
- [ ] **Port each island** into `apps/packages/agentks-ui/src/islands/<name>/`:
    - [ ] **theme-toggle** — light, dark, system. Sets `data-theme` on the root. The choice is UI state ([090/10](../090_frontend-performance/10_ui-state-persistence.md)).
    - [ ] **sidebar-collapse** — opens and closes folders on the tree Rust sent; follows the opened page; stores deviations only ([090/10](../090_frontend-performance/10_ui-state-persistence.md)). Port from the docs sidebar and the issues sub-doc tree.
        - [ ] Decide whether the static HTML carries the links inside collapsed folders (for example in `<details>`), so they work without JavaScript and search engines see them. The spike's sidebar island left them out. Settle it with [100/15 docs layouts](../100_layouts/15_docs-layouts.md).
    - [ ] **issue-filters** — the tracker index's filter bar, state tabs, presets, view toggle, groups and pagination. It **matches values only**: Rust sends each issue's facet values, the option lists, the status categories and the default order ([the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) section 05). Port from [the index scripts](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/index).
    - [ ] **issue-detail panels** — the detail page's panels, subtask state view and table-of-contents observer, from [the detail scripts](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/detail). Delete the rule copies in `types.ts`; read the category Rust sent.
    - [x] **code-copy and code labels** — from [code labels](../../../../../../agent-ks-engine/src/scripts/code-labels.ts).
    - [x] **tooltip** — one shared script: `data-tip` shows only when the text is cropped, `data-tip-always` always; keep `data-tip` and `aria-label` in step. From [tooltip](../../../../../../agent-ks-engine/src/scripts/tooltip.ts).
    - [x] **diagram viewers** — Mermaid, Graphviz, Excalidraw (a React island: real React in its own lazy chunk, with `@preact/preset-vite`'s `reactAliasesEnabled: false`), draw.io (the vendored viewer), with pan, zoom and lightbox. From [diagrams](../../../../../../agent-ks-engine/src/scripts/diagrams.ts), [diagram actions](../../../../../../agent-ks-engine/src/scripts/diagram-actions.ts), [draw.io](../../../../../../agent-ks-engine/src/scripts/drawio.ts), [pan and zoom](../../../../../../agent-ks-engine/src/scripts/panzoom.ts), [lightbox](../../../../../../agent-ks-engine/src/scripts/lightbox.ts). Each library loads only when a diagram of its kind is on the page.
    - [x] **artifact-frame** — the iframe with expand and open-full-page, `data-theme` passed in both modes. Sandboxed only for library HTML ([120/50](../120_libraries/50_lib-route-and-sandbox.md)). From [artifacts](../../../../../../agent-ks-engine/src/scripts/artifacts.ts).
    - [ ] **video-player** — owned by [100/40 video pages](../100_layouts/40_video-pages.md); register it here. It wraps `apps/packages/agentks-video` and loads that chunk on demand, only on video pages.
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
In progress (claude, 2026-10-01): the mounting, the registry and the docs islands (sidebar, outline, code copy, tooltip, diagram, artifact frame) work; the issue islands, the video player, Rust's markers and part of the tests are left.

## Result
- **Built** in `apps/packages/agentks-ui/src/islands/`, merged into `main` at `f108e19` and pushed; CI green:
    - `registry.ts`: every island by name, each a dynamic import with its attach mode (`hydrate` or `render`). Today: `theme-toggle`, `sidebar`, `outline`, `tooltip`, `code-copy`, `diagram`, `artifact-frame`, and from the pages track `blog-tag-filter` and `countdown`, both `hydrate`.
    - `marker.tsx`: `Island` (a hydrating island inside a layout: the component itself in the client, the component plus its marker and props on a static page) and `IslandMarker` (a lazy island with a fallback). Props JSON escapes `<`, `>`, `&` and the two line separators.
    - `mount.ts`: `IslandMounter`, the one mounter the client and a static page share. It reads the props, loads the island, and renders or hydrates that element alone; unmount is `render(null, el)`. A failure marks the element (`data-island-state`) and is logged, and the fallback stays.
    - `entry.ts`: `startStaticIslands(document)`, a static page's islands entry. `page.ts`: the page-wide tooltip, one host at the end of body, kept across navigations. `body.ts`: marks the diagram and code blocks of a Rust-rendered body.
    - `sidebar-collapse/`: `useFolderOpen` and the `FolderMemory` interface. The docs sidebar remembers folders by `collapse_key`, stores only deviations from Rust's default, and the folder holding the page opens without writing. The host supplies the storage.
    - `code-copy/`, `tooltip/`, `diagram/`, `artifact-frame/`, `outline/`: the islands themselves.
- In the client, `apps/agentks-client/src/islands.ts` marks the body, mounts after each draw and unmounts on navigation, keeping the page-wide tooltip.
- **Tests:** `apps/packages/agentks-ui/tests/islands.test.tsx` has 16 tests, about 0.1 s. They cover: props round trip and errors; the mounter replacing a fallback and emptying on unmount; an unknown island; no listener left on `document` or `window` after 100 mount and unmount cycles of the tooltip and code copy; the body adapter; a static page hydrating the theme toggle over its string render, keeping the nodes; and folder memory. The package has 32 tests in total. `./ctl gate` is green (30 s).
- **Checked** in a browser against the mock, light and dark: every island mounted, and a page fetched only the islands it holds. Screenshots are under `data/screenshots/layout-artifacts/` in the worktree.
- **Left:** drawing the theme toggle, the sidebar and the outline through `Island` in their layouts, since only the blog tag filter and the countdown use it so far, so a static page does not hydrate the other three yet; issue-filters and issue-detail (issues layout), video-player (video pages), theme-toggle's `system` choice, Rust writing island markers, the collapsed-links decision with [100/15](../100_layouts/15_docs-layouts.md), the issues sub-doc tree on `useFolderOpen`, and mount tests for the diagram, artifact, sidebar and outline islands.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `apps/packages/agentks-ui/src/islands/` and `apps/agentks-client/src/islands.ts`.
- **Read first:** [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) (sections 04, 05 and 07), [publishing with SSG](../../notes/05_delivery/02_publishing-ssg.md) (section 05), [UX standards](../../../../dev-docs/05_architecture/05_layout-internals/08_ux-standards.md).
- **Today's code:** [the scripts folder](../../../../../../agent-ks-engine/src/scripts), [the issues layout scripts](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts), the vendored draw.io viewer and its [renderer note](../../../2026-04-10-editor-diagrams/notes/05_drawio-renderer.md).
- **Depends on:** [20](./20_shared-ui-package.md), [30](./30_client-shell-and-routing.md).
- **Unblocks:** [100_layouts](../100_layouts/00_overview.md) interactive parts, [150/20 SSG renderer](../150_publishing/20_ssg-renderer.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): published pages are not hydrated as a whole; only interactive parts carry JavaScript.
- Decided (sidhantha, 2026-09-29): the frontend holds display logic only.
- Decided (claude, 2026-09-30): islands mount one by one: `<div data-island="name">` plus a `<script type="application/json" data-props>` tag, a registry of lazy imports keyed by name, and Preact `hydrate` on that element alone, because this ships no layout code to a published page ([10](./10_ui-framework-decision.md)).
- Decided (claude, 2026-10-01): a layout draws a hydrating island through `Island`, never as a bare component, because on a static page only the marker and its props let the entry find and hydrate it. The blog tag filter and the countdown were merged in this way.
- Decided (claude, 2026-10-01): each registry entry names how it attaches, `hydrate` (the static renderer drew the island's own markup) or `render` (the page holds a fallback the island replaces), because hydrating over a fallback would keep the wrong nodes. The client always renders.
- Decided (claude, 2026-10-01): a lazy island's fallback is set as inner HTML of its marker, because the layout's tree then never diffs the DOM the island draws there later.
- Decided (claude, 2026-10-01): a rendering island empties its element before it renders, because Preact keeps any old node it cannot reuse, which left the fallback under the island.
- Decided (claude, 2026-10-01): the tooltip is a page-wide island with one host at the end of body, kept across navigations, because it serves every `data-tip` on the page, not one element.
- Decided (claude, 2026-10-01): folder memory is an interface the host supplies (`FolderMemoryContext`), because the storage belongs to the UI state store ([090/10](../090_frontend-performance/10_ui-state-persistence.md)) and a static page may keep it differently. Without one, folders keep Rust's default.
- Decided (claude, 2026-10-01): an island's props come from the JSON tag after it, or else from its `data-` attributes, because a layout's props are structured while Rust's body markers carry a few short strings.
- Decided (claude, 2026-10-01): code copy is a small host element appended inside each `pre[data-language]`, reading the code at click time, because the props stay one word and the code is never copied twice into the page.

# 05 Notes & Analysis
## Watch out
- draw.io's viewer is a 3 MiB vendored file with no npm package; keep it vendored in the package with its licence and upgrade notes, and load it only for `.drawio` pages.
- Excalidraw and tldraw run on real React, only inside their own lazy chunk. The spike in [10](./10_ui-framework-decision.md) measured about 410 KiB of gzipped JavaScript for it, on the one page that shows such a diagram. Running Excalidraw on `preact/compat` instead might save about 60 KiB; that was not measured on purpose. Look at it only if that page's size becomes a problem.
- The theme toggle must run before first paint to avoid a flash; the tiny inline script that sets `data-theme` from storage stays in `index.html`, not in a lazy island.
- The docs sidebar today renders every link, and a collapsed folder hides its list with CSS. So search engines see the links, but with no JavaScript a collapsed folder cannot open.
