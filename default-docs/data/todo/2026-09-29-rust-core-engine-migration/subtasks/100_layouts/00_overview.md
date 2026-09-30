---
title: "Layouts — group index"
status: in-progress
---

This group rebuilds every built-in layout as components in the shared UI package `apps/packages/agentks-ui`, one leaf per layout kind. A layout takes one typed page-data object from Rust and draws it; it computes nothing. The same components draw the local client and, in Phase 3, the published site. Custom user layouts are gone: branding is CSS only, through the theme contract and documented hooks. The new output may differ from today's only by small visual improvements — nothing drastic — and route and content parity with today's engine is the acceptance test ([170/20](../170_testing/20_route-and-content-parity.md)).

# 01 To Do

| Leaf | Status | Delivers | Source it absorbs |
|---|---|---|---|
| [100/10 Theme contract and CSS](./10_theme-contract-and-css.md) | in-progress | The contract, the built-in theme, `@layer` order, hooks, the contract check | — |
| [100/15 Docs layouts](./15_docs-layouts.md) | open | `@docs/default`, `@docs/compact`: sidebar, body, outline, pagination, breadcrumbs | — |
| [100/20 Blog layouts](./20_blog-layouts.md) | open | `@blog/default` index and post, pagination, tags, authors | [2025-06-25-blog-testing-polish](../../../2025-06-25-blog-testing-polish/issue.md) |
| [100/25 Issues layouts](./25_issues-layouts.md) | open | Tracker index, issue detail, sub-document pages, the guide panel | the demo issue as fixture |
| [100/30 Artifact pages](./30_artifact-pages.md) | open | Artifact embeds and pages, `/artifacts/` full page, site-theme mode, HTML fragments | [2026-07-07-artifact-component](../../../2026-07-07-artifact-component/issue.md) 110, 120 |
| [100/35 Diagram pages](./35_diagram-pages.md) | open | First-class `.mmd`, `.dot`, `.excalidraw`, `.drawio` pages and embeds | [2026-04-10-editor-diagrams](../../../2026-04-10-editor-diagrams/issue.md) display half |
| [100/40 Video pages](./40_video-pages.md) | open | The video page layout and player island | [2026-09-29-narrated-video-pages](../../../2026-09-29-narrated-video-pages/issue.md) UI side |
| [100/45 Custom pages](./45_custom-pages.md) | open | `home`, `info`, `countdown` from YAML | [2025-06-25-layouts-and-variations](../../../2025-06-25-layouts-and-variations/issue.md) 02 |
| [100/50 Navbar and footer](./50_navbar-and-footer.md) | open | `default` and `minimal` navbar and footer, logos per mode | layouts-and-variations 03 |
| [100/55 Responsive](./55_responsive.md) | open | Breakpoints and mobile layouts as acceptance checks for every layout | [2025-06-25-sizing-and-responsive](../../../2025-06-25-sizing-and-responsive/issue.md) |
| [100/60 Roadmap and releases](./60_roadmap-and-releases.md) | open | Two new content types, built on demand after 1.0.0 | [2026-04-10-new-layout-types](../../../2026-04-10-new-layout-types/issue.md) |
| [100/65 Layout variations](./65_layout-variations.md) | open | What survives of the variations backlog, as a demand-driven list | [2025-06-25-layouts-and-variations](../../../2025-06-25-layouts-and-variations/issue.md) 01, 04 |
| [100/70 GitHub issues layout](./70_github-issues-layout.md) | open | Later stage: a layout over a linked GitHub repository's issues | brainstorm future stage 06 |

**Order inside the group.** 10 first. Then 15 and 50 (every page needs them), then 25, 30, 35, 20 and 45, then 55 across all of them. 40 follows the video issue's player spike. 60, 65 and 70 are after 1.0.0 and start only on demand.

## Rules for every layout
- **A component in `agentks-ui`** under `src/layouts/<type>/<style>/`, beside its parts. It takes one page-data object and draws it ([080/20](../080_ui-and-client/20_shared-ui-package.md)).
- **It computes nothing.** Order, URLs, status categories, filter options, dates and trees arrive from Rust. If the data is missing a value, add it to the Rust payload ([030/80](../030_rust-engine/80_page-data-interface.md)); never derive it.
- **Small files.** Split any file past about 400 lines into parts.
- **Islands** for interactive parts only ([080/50](../080_ui-and-client/50_islands.md)).
- **CSS** reads only the theme contract and semantic tokens; classes carry the layout's prefix; public hooks are documented ([10](./10_theme-contract-and-css.md)).
- **UX standards** carry over unchanged ([UX standards](../../../../dev-docs/05_architecture/05_layout-internals/08_ux-standards.md)).
- **An unknown layout name** in config is an error at start-up listing the names available, never a silent fallback.
- **Parity.** Every page the layout draws matches today's in routes, heading IDs, link targets, text, tables and code; screenshots in light and dark mode show nothing drastic.

## Done when
- Leaves 10 to 55 are `review` or closed, and this repository's docs and tracker pass route and content parity in the new client.
- Leaves 60, 65 and 70 are scheduled or closed by the plan.

# 02 Status and Result
In progress. 10 is in progress; the rest are open.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, local folder `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`; work in `apps/packages/agentks-ui/src/layouts/`.
- **Design, read first:** [theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md), [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md), [the Rust engine's data interface](../../notes/02_engine/03_rust-engine.md) (section 05), [content format](../../notes/02_engine/01_content-format.md).
- **Discussion:** [layouts: built-in only](../../brainstorm/01_initial-discussion/11_layouts.md), [CSS and theming](../../brainstorm/01_initial-discussion/10_css-and-theming.md).
- **Today's layouts:** [the layouts folder](../../../../../../agent-ks-engine/src/layouts), [layout internals](../../../../dev-docs/05_architecture/05_layout-internals/01_overview.md), [the layout types](../../../../dev-docs/05_architecture/05_layout-internals/02_layout-types.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): drop user-authored custom layouts; branding is CSS.
- Decided (sidhantha, 2026-09-29): add built-in layouts over time, only on demand.
- Decided (sidhantha, 2026-09-29): layouts are standard frontend components, chosen by name in config, fed by data from Rust.
- Decided (sidhantha, 2026-09-29): the new output may differ only by small visual improvements.
- Decided (sidhantha, 2026-09-30): layouts live in `apps/packages/agentks-ui`.

# 05 Notes & Analysis
## Watch out
- Astro's scoped CSS (`data-astro-cid-*`) disappears. Prefixed classes replace it; the old gotcha with runtime-created elements goes away, but every class must carry its prefix.
