---
title: "Subtask page header — title + status, not checkbox + slug"
status: done
---

Sidebar list rendering is fine — leave it as-is. The bug is on the **center / content page** for a subtask.

## Problem

When you open a subtask page, the top of the content currently renders the checkbox + the slug-ish identifier. That reads like a list item, not a page header.

## Fix

Replace with: **title (from frontmatter) + status badge** (from [subtask 14](./14_four-state-status-with-review.md) — open / review / closed / cancelled).

- Title comes from the subtask file's `title` frontmatter field
- Status badge mirrors the index style (small pill, vocabulary-coloured)
- Drop the inline checkbox from the page header — toggling already works from the sidebar and from the overview's combined view ([subtask 09](./09_overview-combined-subtask-view.md))

## Sidebar — show subtask numbers

Surface the subtask's numeric prefix (`01`, `02`, …) in the sidebar list and on the subtask page header. Two reasons:

1. **Easier to refer to in chat with an AI** — "fix subtask 07" beats "fix the subtask-page-header one"
2. **Stable identity** — the prefix doesn't change when the title is edited

Rendering:

- Sidebar list item: `<num>` in muted color, then title. e.g. `07  Subtask page header — title + status, not checkbox + slug`
- Page header: same `<num>` prefix to the title, slightly muted, monospace optional
- Combined overview view (subtask 09): each inline subtask box shows `<num>` in its header too

## Sidebar — sort order after the 4-state status lands

Once [subtask 14](./14_four-state-status-with-review.md) ships, sort sidebar subtasks by:

1. **State group** — `open` and `review` first (active work), then `closed` and `cancelled` (terminal)
2. **Within a group, by numeric prefix ascending** — `01, 02, 03, …`

So a sidebar with mixed states reads as: open/review subtasks at the top in numeric order, then a visual break, then closed/cancelled subtasks in numeric order. The numeric prefix ordering is preserved within each group, so `07` always lives near `06` and `08` if they share a state.

A subtle separator (border-top + extra spacing) between the active group and the terminal group makes the split visible without a heading.

## Out of scope

- Sidebar list rendering itself (already correct apart from the number prefix + sort change above)
- Overview's per-subtask checkbox in the progress list
- Renumbering subtasks (numbers are append-only — gaps from cancelled subtasks are fine)
