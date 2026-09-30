---
title: "Large-list virtualisation"
status: open
---

A tracker can hold thousands of issues and a docs section thousands of pages. Drawing every row of a long sidebar or tracker table at once makes scrolling and filtering stutter. This leaf renders only the rows in view (virtualisation) for the lists that can grow without bound, while keeping keyboard use, find-in-page expectations and accessibility intact.

# 01 To Do
- [ ] **Measure first.** Build a synthetic fixture project with 5,000 issues and a docs section with 5,000 pages (a script in `apps/agentks-engine/tests/fixtures/`), and record frame times for scroll and filter with plain rendering.
- [ ] **Virtualise where the fixture fails the budget**, expected to be:
    - [ ] The tracker index table and card view ([100/25](../100_layouts/25_issues-layouts.md)): fixed row height, windowed rendering, overscan of 10 rows.
    - [ ] The docs sidebar ([100/15](../100_layouts/15_docs-layouts.md)) when a section passes 1,000 visible items: windowed tree rendering over the flattened open nodes.
- [ ] **Keep what readers expect.**
    - [ ] Keyboard: arrow keys and Page Up and Down move through all rows, scrolling rows into existence.
    - [ ] Accessibility: `aria-rowcount` and `aria-rowindex` on tables; tree items keep `aria-level`, `aria-setsize`, `aria-posinset`.
    - [ ] The active sidebar item is scrolled into view on navigation even if it was not rendered.
    - [ ] Browser find-in-page cannot see unrendered rows; the tracker's own filter box is the search. Document that in the layout's help text.
- [ ] **Static pages.** The static renderer ([150/20](../150_publishing/20_ssg-renderer.md)) writes the full list as HTML; the island virtualises only after it mounts, if the list is long.

## Guardrails
- Do not virtualise short lists. The threshold is measured, not guessed.
- Filtering still only matches values Rust sent ([080/50](../080_ui-and-client/50_islands.md)).

## Done when
- Scrolling and filtering the 5,000-row fixtures meet the budgets in [00](./00_overview.md) (60 frames a second, no long task over 50 ms).
- Keyboard and screen-reader checks pass on the virtualised table and tree.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/packages/agentks-ui` (the table and tree components) and the fixture generator in `apps/agentks-engine/tests/fixtures/`.
- **Read first:** [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) (section 05), today's [issues table](../../../../../../agent-ks-engine/src/layouts/issues/default/parts/index/IssuesTable.astro) and [docs sidebar](../../../../../../agent-ks-engine/src/layouts/docs/default/Sidebar.astro).
- **Depends on:** [100/15](../100_layouts/15_docs-layouts.md), [100/25](../100_layouts/25_issues-layouts.md).

# 04 Decisions
- Decided (claude, 2026-09-30): virtualise only the unbounded lists, and only past a measured threshold.

# 05 Notes & Analysis
## Watch out
- Today's index paginates; keep pagination as a view option, because a paginated table needs no virtualisation and prints well.
