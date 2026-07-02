---
title: "Restructure src/layouts/issues/default folder"
status: done
---

The layout has grown organically; `DetailBody.astro` is now 1576 lines, `client.ts` is 752 lines, `parts/` mixes Astro components with JS modules, and large style blocks live inside `.astro` files. Time to restructure before adding new features.

## Current problems

- **`DetailBody.astro` is a monolith** (~60 KB). It owns the sidebar, thread, overview-subtasks list, comprehensive panel with tabs + expand, four flavours of doc pages (subtasks / notes / agent-log), right-sidebar TOC panels, a large inline `<script>` (state cycling, TOC observer, panel switching), and a long `<style>` block.
- **`parts/` mixes concerns** — `.astro` UI components sit next to `.ts` runtime modules with no separation by consumer (index vs detail).
- **Dead code**: `MetaPanel.astro` has an unused non-compact branch (only `compact={true}` is called); `index.ts` exports a `config` object that nothing imports.
- **CSS is embedded** in almost every `.astro` file. Most classes are already BEM-prefixed (`issues-*`, `issue-*`) — scoping buys nothing, and external CSS files would be easier to find and edit.
- **Server-side helpers live inline** — TOC extraction (`extractAndPrefixToc`) and state-icon SVGs are functions inside `DetailBody.astro` frontmatter, not reusable.

## Target structure

```
src/layouts/issues/default/
├── IndexLayout.astro                     (unchanged thin wrapper)
├── IndexBody.astro                       (orchestrator)
├── DetailLayout.astro                    (unchanged thin wrapper)
├── DetailBody.astro                      (orchestrator, ≤ 200 lines)
│
├── parts/
│   ├── shared/
│   │   ├── StatusBadge.astro
│   │   ├── IssueCard.astro
│   │   └── MetaPanel.astro               (compact-only, dead branch removed)
│   │
│   ├── index/                            (index-page components)
│   │   ├── FilterBar.astro
│   │   ├── PresetStrip.astro
│   │   ├── StateTabs.astro
│   │   ├── ViewToggle.astro
│   │   ├── Pagination.astro
│   │   ├── IssuesCards.astro
│   │   └── IssuesTable.astro
│   │
│   └── detail/                           (detail-page components, NEW)
│       ├── DetailSidebar.astro           (left nav)
│       ├── IssueThread.astro             (issue body + comments)
│       ├── OverviewSubtasks.astro        (flat list under Overview)
│       ├── Comprehensive.astro           (tabs + expandable inline list)
│       ├── SubtaskPage.astro
│       ├── NotePage.astro
│       ├── AgentLogPage.astro
│       └── MetaSidebar.astro             (right sidebar TOC panels)
│
├── scripts/
│   ├── index/
│   │   ├── client.ts                     (entry)
│   │   ├── types.ts
│   │   ├── filters.ts
│   │   ├── groups.ts
│   │   └── presets.ts
│   └── detail/
│       └── client.ts                     (panel switching + state cycling + TOC observer)
│
├── server/                               (server-side utilities, NEW)
│   ├── toc.ts                            (extractAndPrefixToc)
│   └── state-icon.ts                     (stateIconSvg)
│
└── styles/                               (extracted CSS, NEW)
    ├── index.css
    ├── detail.css
    ├── filter-bar.css
    ├── table.css
    ├── cards.css
    ├── tabs.css
    ├── sidebar.css
    ├── thread.css
    ├── comprehensive.css
    ├── meta.css
    └── toc.css
```

## Phases

1. Create subtask doc (this file).
2. Extract server utilities (`toc.ts`, `state-icon.ts`) — used by the DetailBody split in phase 3.
3. Split `DetailBody.astro` into `parts/detail/*`.
4. Move existing `parts/*.astro` into `parts/index/` and `parts/shared/`, rename `issues-*.ts` into `scripts/index/` without the `issues-` prefix, and the detail `<script>` into `scripts/detail/client.ts`.
5. Extract large `<style>` blocks into `styles/*.css` and import from the `.astro` frontmatter (`import "../styles/xyz.css"`). Keep layout-local tweaks in `<style>` blocks when scoping actually matters.
6. Delete dead code: `index.ts` + MetaPanel non-compact branch.
7. Build + smoke-test both the index page and a detail page (grouping, state cycling, TOC, filter cache).

## Non-goals

- Changing any runtime behaviour — refactor is structural, not functional.
- Introducing a CSS framework.
- Server-side changes (loader, parser, middleware).

## Out of scope

- User theme layouts in `dynamic_data/layouts/issues/*` — out of tree.
