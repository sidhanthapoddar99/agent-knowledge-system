---
title: "Issues layouts: tracker index, issue detail and sub-documents"
status: in-progress
---

The tracker is the most complex layout: an index with filters, presets, state tabs, groups, table and card views; an issue detail page with its anatomy (brainstorm, notes, plans, subtasks, agent logs, memory, comments, glossary); sub-document pages; and the guide panel. Today much of it is computed in browser scripts that copy tracker rules. This leaf rebuilds it as pure components fed by `issues-index`, `issue` and `page` payloads, with every rule — status categories, derived statuses, ordering, filter options, `updated` dates — computed in Rust. The demo issue is the fixture.

# 01 To Do
- [ ] **Index** (`agentks-ui/src/layouts/issues/default/index/`): `FilterBar`, `StateTabs`, `PresetStrip`, `ViewToggle`, `IssuesTable`, `IssuesCards`, `Pagination`, `GuideModal`, from today's [index parts](../../../../../../agent-ks-engine/src/layouts/issues/default/parts/index).
    - [ ] Data from `issues-index`: each issue with id, title, URL, status, status category, priority, component, labels, author, assignees, created and `updated` (from git), subtask counts, plus the vocabulary option lists and presets. The order is `priority desc, updated desc`, computed by Rust.
    - [ ] The filters island matches values only ([080/50](../080_ui-and-client/50_islands.md)); state tabs use the category Rust sent.
- [ ] **Detail** (`…/detail/`): `DetailLayout`, `IssueThread`, `MetaSidebar`, `DetailSidebar`, `SubdocTree`, `SubtaskTree`, `Comprehensive`, and the pages `NotePage`, `PlanPage`, `SubtaskPage`, `AgentLogPage`, from today's [detail parts](../../../../../../agent-ks-engine/src/layouts/issues/default/parts/detail).
    - [ ] Data from `issue`: metadata, `issue.md` body HTML, the anatomy sections with each file's title, URL, status and category, subtask groups with done/total and review dots, plans with stages and the live status of each stage's subtasks, logs with kind and status, comments in order, glossary.
    - [x] Sub-document pages from `page` answers whose layout is `@issues/default`: one file of an issue with its own body, the tree, and first-class diagram and artifact sub-docs.
- [x] **Shared parts:** `StatusBadge`, `IssueCard`, `MetaPanel`, the state icons and agent-log icons (display lookups by the value Rust sent).
- [x] **The guide panel.** Today's static issue-anatomy legend in [guide.ts](../../../../../../agent-ks-engine/src/layouts/issues/default/guide.ts) moves into the package as data the component draws. It must stay in step with the `agentks-issues` skill ([130_ai-plugins](../130_ai-plugins/00_overview.md)).
- [x] **Delete the rule copies.** [detail types](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/detail/types.ts) and [index filters](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/index/filters.ts) hold copies of tracker rules; none of that logic crosses over.
- [ ] **Fixture and parity.** [2026-07-01-demo-issue-anatomy-showcase](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md) exercises every section; compare it and this repository's whole tracker against today's layout: routes, statuses, categories, counts, order, filter results per preset, rendered bodies.
- [ ] **Live edits.** In the multi-user stage the tracker updates status, labels and comments live for everyone ([060/70](../060_collaboration/70_tracker-live-edits.md)); the components only redraw from new data.

## Guardrails
- The eight statuses and four categories are fixed in Rust; the layout never maps a status to a category.
- `updated` comes from git through Rust ([030/60](../030_rust-engine/60_tracker-loader.md)); never from file times in the browser.
- Keep each file under about 400 lines; the tracker is where this rule matters most.

## Done when
- The demo issue and every issue in this repository's tracker draw with the same statuses, categories, counts and order as today, and each index preset returns the same issues.
- No file under `apps/packages/agentks-ui/src/layouts/issues/` contains status-category or ordering logic (reviewed, and checked by a grep test for the status names outside the display lookup).

# 02 Status and Result
In progress. The tracker list, the issue page, its file pages and the Guide panel are built and drawn in the local client over the mock engine (branch `wave3/layout-tracker`). Still open: parity against today's layout, presets, the fields the API does not send yet, the static-site islands, and live edits.

## Result
- **Layouts** in `apps/packages/agentks-ui/src/layouts/issues/default/` (42 files, the largest `detail/detail.css` at 399 lines):
    - `index/`: the tracker list. `FilterBar` (search, add-filter menus per field, group-by, compact mode), `StateTabs`, `ViewToggle`, `IssuesTable` with column sort and subtask progress bars, `IssuesCards`, `Groups`, `Pagination`. The reader's choices (search, filters, tab, sort, group, page) live in the URL query through `index/model/url-state.client.ts`.
    - `detail/`: `DetailLayout` (the issue page), `SubdocLayout` (one file of an issue: markdown, diagram or artifact), `DetailSidebar` with the anatomy trees, `IssueHeader` and `MetaPanel`, `RightRail`, and the panels (overview, comments, comprehensive, guide, glossary) switched by the URL hash.
    - `guide/`: the Guide panel as data (`guide-data.ts`) that `Guide.tsx` draws.
    - `shared/display.ts`: the one lookup from a status, category or log kind to its label, icon and colour.
- **Registry:** `@issues/default` in `src/layouts/registry.ts`, as `ISSUES_LAYOUTS` (index and issue) and as a page layout with `needs: ['issue']` for tracker files. The public hooks are listed in `src/hooks.json`.
- **Client** (`apps/agentks-client`): `src/app/views.ts` picks the data and layout for a route (page, tracker list or issue). A tracker file gets its issue through the breadcrumb the manifest routes to an issue, and a file with none is an error. `AppController.stop()` lets tests detach each app. The mock tracker at `/todo` is `dev/mock-tracker.ts` and `dev/mock-tracker-specs.ts`: 15 issues across every status, and the demo issue with every anatomy section.
- **Tests:** package `bun test` 34 pass in about 260 ms, including `tests/issues-model.test.ts` (11), `tests/issues-render.test.tsx` (5) and `tests/issues-rules.test.ts` (2: no status name outside the display lookup and the Guide text; every drawn tracker class is a listed hook). Client `bun run test` 25 pass in under a second, including three tracker tests in `tests/app.test.tsx` and `tests/views.test.ts`.
- **Gate:** `./ctl gate` from the worktree, exit 0, all four rungs green in 30 s.
- **Screenshots** (1440×900, headless Chromium over `ctl dev client`): the list, an issue and a file page, each in light and dark, plus the Guide panel and the empty state.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/packages/agentks-ui/src/layouts/issues/default/`.
- **Read first:** [the Rust engine](../../notes/02_engine/03_rust-engine.md) (section 05, `issues-index` and `issue`), [content format](../../notes/02_engine/01_content-format.md) (the tracker), [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) (section 03, the page kinds), the tracker user guide at [issues overview](../../../../user-guide/19_issues/01_overview.md).
- **Today's code:** [the issues layout](../../../../../../agent-ks-engine/src/layouts/issues/default), its [server helpers](../../../../../../agent-ks-engine/src/layouts/issues/default/server) (TOC, state icons, agent-log icons) and [styles](../../../../../../agent-ks-engine/src/layouts/issues/default/styles).
- **Depends on:** [10](./10_theme-contract-and-css.md), [080/50](../080_ui-and-client/50_islands.md), [030/60 tracker loader](../030_rust-engine/60_tracker-loader.md), [030/80](../030_rust-engine/80_page-data-interface.md).
- **Unblocks:** [090/60 large-list virtualisation](../090_frontend-performance/60_large-list-virtualisation.md), [060/70 tracker live edits](../060_collaboration/70_tracker-live-edits.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): every rule stays in Rust; the frontend receives results as data.
- Decided (sidhantha, 2026-09-29): `issues` keeps one built-in layout, `default`, with index, detail and sub-document pages ([theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) section 01).
- Decided (claude, 2026-10-01): a tracker file is a `page` answer whose layout is `@issues/default`, and the layout's registry entry says `needs: ['issue']`; the client finds the issue through the breadcrumb the manifest routes to an `issue:` key, and a file with no such breadcrumb is an error, because the API has no `issue-subdoc` kind and the page kinds already cover markdown, diagram and artifact files. An explicit issue reference on `PageData` would be better and is requested.
- Decided (claude, 2026-10-01): the state tabs are Active (every category but closed), then Rust's categories in Rust's order, then All, and they match only the category value Rust sent, because the layout must never map a status to a category. Review debt (an issue shown under Review because a subtask awaits review) is left out until Rust sends a flag for it.
- Decided (claude, 2026-10-01): column sort is the reader's display choice; its status and priority ranks come from the order of Rust's option lists, the sort is stable, and with no sort chosen the rows keep Rust's order, because order rules stay in Rust.
- Decided (claude, 2026-10-01): grouping by created or updated date (Today, Past week, then by month) uses the reader's clock, read only in the browser after the first draw, because "today" belongs to the reader, and a string render must not depend on the build machine's clock.
- Decided (claude, 2026-10-01): the package carries the tracker CSS in `@layer components` and keeps today's `issue-…` and `issues-…` class names as the public hooks; a class today's layout did not have gets the `aks-` prefix, and a test checks that every drawn tracker class is in `hooks.json`, because the built-in theme has no tracker CSS (today it lives inside the layout files) and user themes target those names.
- Decided (claude, 2026-10-01): the Guide is structured data in the package, and its status, run-status and log-kind tables are generated from the same display lookup the badges use, because a hand-written legend drifts from how statuses actually look.
- Decided (claude, 2026-10-01): the Comprehensive panel lists subtask files by category with their titles and links, and comments show their title, author and date, because the `issue` answer carries no subtask or comment bodies.
- Decided (claude, 2026-10-01): the search, filters, tab, sort, group and page live in the URL query so a view can be shared; the table or cards view, the page size and the compact filter bar are held in memory only, because saving them per project belongs to the project-key storage work (090/10).
- Decided (claude, 2026-10-01): the list's title is the section name and the back link is the section's `base_url` from the manifest, shown only when the manifest routes it, because `IssuesIndex` and `IssueDetail` carry no tracker label or index URL.
- Decided (claude, 2026-10-01): the mock tracker is hand-written in the client's `dev/`, modelled on the demo issue, because the tests must stay fast and the mock must name every status and every anatomy section.

# 05 Notes & Analysis
## Watch out
- The index can hold thousands of rows; design the table so [090/60](../090_frontend-performance/60_large-list-virtualisation.md) can window it without restructuring.
- Folder prefixes with the legacy `-` separator may still exist in old trackers; Rust handles them, the layout never parses prefixes.
