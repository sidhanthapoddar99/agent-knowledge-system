---
title: "Docs layouts: default and compact"
status: in-progress
---

Most pages are docs pages, so the docs layout is the first real layout and the one parity is measured on first. `@docs/default` has the sidebar tree, the body, the outline and prev/next pagination; `@docs/compact` drops the sidebar for a wider body. This leaf rebuilds both from today's Astro components as pure components fed by the `docs` page data, the section's sidebar tree and the manifest.

# 01 To Do
- [ ] **Components** in `agentks-ui/src/layouts/docs/default/`: `Layout`, `Sidebar` (tree), `SidebarNode`, `Body` (places Rust's `body_html`), `Outline` (from `outline`), `Pagination` (from `prev` and `next`), `Breadcrumbs` (from `breadcrumbs`). `docs/compact/` reuses the parts without the sidebar.
- [ ] **Sidebar tree from Rust.** Labels, URLs, order, file-type kind (for the trailing glyph of diagram and artifact pages), `collapseKey`, default collapsed state and the open-page path all arrive in the `sidebar` payload. The sidebar-collapse island handles toggling and state ([080/50](../080_ui-and-client/50_islands.md), [090/10](../090_frontend-performance/10_ui-state-persistence.md)).
- [ ] **Outline.** Built from `outline` (depth, id, text); highlights the heading in view with an intersection observer island; clicking scrolls with the navbar offset.
- [ ] **Frontmatter display.** Title, description, and any display-only frontmatter the page data carries (tags, draft badge in the local client for dev-only content).
- [ ] **Errors for the page.** In the local client, a small marker when the page data carries `errors`; the full list is the Problems tool ([110/10](../110_editing/10_dev-toolbar.md)).
- [ ] **Parity.** Compare against today's layout on every docs page of this repository (user-guide, dev-docs): heading IDs, link targets, text, tables, code, sidebar order and labels, outline entries, prev and next. Screenshots of one page per section in light and dark mode.

## Guardrails
- Never strip an `NN_` prefix, sort children or build a URL in the component; all of it comes from Rust.
- The sidebar's markup exposes the documented hooks ([10](./10_theme-contract-and-css.md)).

## Done when
- Every docs page of this repository draws in the client with no parity differences except listed, accepted visual improvements.
- The compact layout draws a section configured with it, with a wider body and no sidebar.

# 02 Status and Result
In progress. Both layouts are built as pure components and render every fixture. Left: parity against today's layout on every docs page of this repository (needs the Rust pipeline and the server), screenshots in light and dark, and the islands a published page needs (sidebar collapse, outline highlight, [080/50](../080_ui-and-client/50_islands.md)).

## Result
- `apps/packages/agentks-ui/src/layouts/docs/default/`: `Layout.tsx`, `Sidebar.tsx`, `SidebarNode.tsx` (folders nest to any depth, fold and unfold live, open when they hold the page on screen), `Body.tsx`, `PageBody.tsx` (markdown and video bodies as Rust sent them; diagram source marked `data-island="diagram-<lang>"`; artifacts in a frame), `Outline.tsx` with `outline-spy.client.ts` (the heading in view), `Pagination.tsx`, `Breadcrumbs.tsx`, `docs.css`.
- `docs/compact/Layout.tsx`: the same parts without the sidebar (`docs-layout docs-layout--minimal`).
- The site frame the layouts need: `navbar/default/` (brand, links, menus, external marks from Rust's `external`, the theme toggle island, the small-screen menu), `footer/default/`, `site/` (the frame, notices, not-found, fatal-errors and load-error pages).
- Rendered and compared in the package's tests; drawn live in the client's app test.

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/packages/agentks-ui/src/layouts/docs/`.
- **Read first:** [theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) (sections 01, 03), [the Rust engine](../../notes/02_engine/03_rust-engine.md) (section 05, the page and sidebar payloads).
- **Today's code:** [the docs default layout](../../../../../../agent-ks-engine/src/layouts/docs/default), [the compact layout](../../../../../../agent-ks-engine/src/layouts/docs/compact), [the base layout](../../../../../../agent-ks-engine/src/layouts/BaseLayout.astro); docs: [docs layout](../../../../dev-docs/10_layouts/02_docs-layout), [the docs user guide](../../../../user-guide/17_docs/01_overview.md).
- **Depends on:** [10](./10_theme-contract-and-css.md), [080/20](../080_ui-and-client/20_shared-ui-package.md), [030/80 page data interface](../030_rust-engine/80_page-data-interface.md).
- **Checked by:** [170/20 route and content parity](../170_testing/20_route-and-content-parity.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): `docs` keeps `default` and `compact` as built-in layouts ([theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) section 01).
- Decided (claude, 2026-10-01): the layout draws the outline Rust sent without filtering levels, and does not render a title header (the page's h1 comes from its markdown, as today), because level choice is config and a rule, and parity says the page looks as it did.
- Decided (claude, 2026-10-01): breadcrumbs appear above the body when the page data carries them, a small addition the old layout lacked, because the subtask lists them and the data has them.
- Decided (claude, 2026-10-01): a heading anchor lands below the fixed navbar through `scroll-margin-top` in `docs.css`, so the browser, the outline and the router all use the same offset with no script.
- Decided (claude, 2026-10-01): the sidebar folds a folder with `useState` in the client; state kept between visits and the published-page island wait for [080/50](../080_ui-and-client/50_islands.md) and [090/10](../090_frontend-performance/10_ui-state-persistence.md), because the sidebar payload has no stable collapse key yet.

# 05 Notes & Analysis
## Watch out
- Heading IDs must match today's exactly, or bookmarks and cross-links break. If a difference appears, fix it in Rust's pipeline ([030/50](../030_rust-engine/50_markdown-pipeline.md)), not in the layout.
