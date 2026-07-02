---
title: "Group by component / milestone / priority"
status: done
---

Add a **Group by** control that splits the table into sub-sections grouped by a chosen dimension.

## Behaviour

- Group-by dimensions: `component`, `milestone`, `priority` (not `status` — the state tabs already group by status)
- Group control lives in the search & filter box (mid-iteration position; can move later)
- When a group is active:
  - Table renders one segmented section per group value (with the group value as a section header + count)
  - The grouped column is **hidden from the row** (don't repeat the value already in the section header)
  - Section order: vocabulary order for component / milestone / priority
- Filters / search / state-tab still apply globally — grouping is visual segmentation of the filtered set
- Pagination stays **global** (paginate the flat visible set, then group what's on the current page)
- Sort still works inside each group

## Defaults

- No grouping (current behaviour) when no group is selected
- Group state persists in URL as `?group=component` (or whichever)
- Empty groups (zero rows after filters) are hidden
