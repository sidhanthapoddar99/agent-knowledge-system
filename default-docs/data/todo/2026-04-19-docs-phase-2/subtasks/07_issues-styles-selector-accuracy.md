---
title: "Themes doc — issues-styles page documents CSS selectors that don't exist"
status: open
---

Surfaced by the four-agent consistency audit on the lifecycle issue
(`2026-07-02-issue-lifecycle-and-creation-rules/agent-log/030_au_four-agent-consistency-audit/`,
milestone 102, finding D5) and deliberately deferred out of that wave — it's a
standalone rewrite, not a lifecycle concern.

`user-guide/25_themes/05_component-styles/07_issues-styles.md` documents a
fictional BEM taxonomy: its "Key classes" table and CSS samples reference
`.issues-state-tab`, `.issues-state-tab--active`, `.issues-state-tab__count`,
`.issues-row`, `.issues-row__title`, `.issues-row__badges`,
`.issues-row__status-badge`, `.issues-filter-chip(--selected)`,
`.issues-filter-bar`, and `.issue-subtask__state--*` — none of which exist under
`src/layouts/issues/`. The shipped classes are `.issues-state-tabs__btn` /
`.issues-state-tabs__count`, `.issues-table__row`, `.issue-card`,
`.issues-filters__tag`, `.state-done` etc. A theme author copying the documented
selectors styles nothing. (The lifecycle *vocabulary* on that page was already
fixed during the audit wave; only the selector taxonomy is still fictional.)

- [ ] Inventory the real class names from the live layout source
      (`src/layouts/issues/default/` — IndexBody, StateTabs, FilterBar,
      IssuesTable, IssuesCards, StatusBadge, DetailLayout parts) and/or the
      built DOM, rather than from memory.
- [ ] Rewrite the "Key classes" table and every CSS sample on the page against
      that inventory; keep the theme-contract rules (semantic tokens only)
      intact.
- [ ] Note the new index Guide modal's themable surface (`.issues-guide*`,
      v0.7.0) while there — it postdates the page.
- [ ] Verify: each documented selector greps to a hit under
      `src/layouts/issues/`; build green.
