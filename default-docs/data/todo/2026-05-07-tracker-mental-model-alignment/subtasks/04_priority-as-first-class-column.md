---
title: "Make `priority` a first-class index column (sortable, filterable, prominent)"
state: open
done: false
---

- [ ] Add a dedicated **Priority** column to `IssuesTable.astro` and `IssuesCards.astro` (whatever shape fits cards — a small chip, probably). Today priority is encoded as a coloured dot or small chip alongside other metadata; once milestone goes, it should be its own visual column / row item.
- [ ] **Sortable**: clicking the column header sorts by priority order (`urgent → high → medium → low`, descending by importance). Use the vocabulary's `priorityOrder` from the tracker root `settings.json`.
- [ ] **Filterable**: priority becomes a filter chip in `FilterBar.astro` (or whichever component owns the filter row). Multi-select like component / labels.
- [ ] **Default sort**: with milestone gone, the default index sort should be `priority desc, updated desc` (after the derived-updated-date mechanism lands). This puts urgent / high-priority issues at the top by default.
- [ ] **Test in browser**: open `/todo`, confirm priority column appears, sort works in both directions, filter chips work, default ordering matches expectation.

## Why this matters

Once `milestone` is dropped, the index loses its primary "what to work on next" cue. Priority is the natural replacement — it's already declared in the schema with a colour palette. Promoting it from a small inline chip to a sortable column closes the gap.

## Files likely touched

- `astro-doc-code/src/layouts/issues/default/parts/index/IssuesTable.astro`
- `astro-doc-code/src/layouts/issues/default/parts/index/IssuesCards.astro`
- `astro-doc-code/src/layouts/issues/default/parts/index/FilterBar.astro`
- `astro-doc-code/src/layouts/issues/default/scripts/index/{filters,types,client}.ts`
- `astro-doc-code/src/layouts/issues/default/styles/` — small CSS additions for the new column.
