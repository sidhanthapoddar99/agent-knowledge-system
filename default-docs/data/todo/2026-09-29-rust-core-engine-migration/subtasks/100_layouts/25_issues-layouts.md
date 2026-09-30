---
title: "Issues layouts: tracker index, issue detail and sub-documents"
status: open
---

The tracker is the most complex layout: an index with filters, presets, state tabs, groups, table and card views; an issue detail page with its anatomy (brainstorm, notes, plans, subtasks, agent logs, memory, comments, glossary); sub-document pages; and the guide panel. Today much of it is computed in browser scripts that copy tracker rules. This leaf rebuilds it as pure components fed by `issues-index`, `issue` and `issue-subdoc` payloads, with every rule — status categories, derived statuses, ordering, filter options, `updated` dates — computed in Rust. The demo issue is the fixture.

# 01 To Do
- [ ] **Index** (`agentks-ui/src/layouts/issues/default/index/`): `FilterBar`, `StateTabs`, `PresetStrip`, `ViewToggle`, `IssuesTable`, `IssuesCards`, `Pagination`, `GuideModal`, from today's [index parts](../../../../../../agent-ks-engine/src/layouts/issues/default/parts/index).
    - [ ] Data from `issues-index`: each issue with id, title, URL, status, status category, priority, component, labels, author, assignees, created and `updated` (from git), subtask counts, plus the vocabulary option lists and presets. The order is `priority desc, updated desc`, computed by Rust.
    - [ ] The filters island matches values only ([080/50](../080_ui-and-client/50_islands.md)); state tabs use the category Rust sent.
- [ ] **Detail** (`…/detail/`): `DetailLayout`, `IssueThread`, `MetaSidebar`, `DetailSidebar`, `SubdocTree`, `SubtaskTree`, `Comprehensive`, and the pages `NotePage`, `PlanPage`, `SubtaskPage`, `AgentLogPage`, from today's [detail parts](../../../../../../agent-ks-engine/src/layouts/issues/default/parts/detail).
    - [ ] Data from `issue`: metadata, `issue.md` body HTML, the anatomy sections with each file's title, URL, status and category, subtask groups with done/total and review dots, plans with stages and the live status of each stage's subtasks, logs with kind and status, comments in order, glossary.
    - [ ] Sub-document pages from `issue-subdoc`: one file of an issue with its own body, the tree, and first-class diagram and artifact sub-docs.
- [ ] **Shared parts:** `StatusBadge`, `IssueCard`, `MetaPanel`, the state icons and agent-log icons (display lookups by the value Rust sent).
- [ ] **The guide panel.** Today's static issue-anatomy legend in [guide.ts](../../../../../../agent-ks-engine/src/layouts/issues/default/guide.ts) moves into the package as data the component draws. It must stay in step with the `agentks-issues` skill ([130_ai-plugins](../130_ai-plugins/00_overview.md)).
- [ ] **Delete the rule copies.** [detail types](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/detail/types.ts) and [index filters](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/index/filters.ts) hold copies of tracker rules; none of that logic crosses over.
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
Open. Not started.

## Result
None yet.

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

# 05 Notes & Analysis
## Watch out
- The index can hold thousands of rows; design the table so [090/60](../090_frontend-performance/60_large-list-virtualisation.md) can window it without restructuring.
- Folder prefixes with the legacy `-` separator may still exist in old trackers; Rust handles them, the layout never parses prefixes.
