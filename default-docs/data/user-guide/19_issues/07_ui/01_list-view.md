---
title: List View
description: The index page — category tabs, filter chips, preset views, grouping, sort
sidebar_position: 1
---

# List View

The list view renders at the tracker's base URL (e.g. `/todo`). It's the primary surface for scanning open work, filtering to a subset, and jumping into individual issues.

## Anatomy

```
┌──────────────────────────────────────────────────────────────────┐
│  Todo                                     42 issues              │  ← header
├──────────────────────────────────────────────────────────────────┤
│  High priority │ Blocked │ By component                          │  ← preset strip
├──────────────────────────────────────────────────────────────────┤
│  Active  In Progress  Review  Not Started  Closed  All           │  ← category tabs
├──────────────────────────────────────────────────────────────────┤
│  Search …    Priority ▾   Component ▾   Labels ▾   Assignee ▾    │  ← filter bar
│                                                  Group ▾  Sort ▾ │
├──────────────────────────────────────────────────────────────────┤
│  2026-04-19  Documentation update — phase 2       🔶 review 2/6  │  ← issue rows
│  2026-04-10  Issues layout + settings.json UX     🟢 review 17/17│
│  …                                                               │
└──────────────────────────────────────────────────────────────────┘
```

Four bars, top to bottom: **header**, **preset strip**, **category tabs**, **filter bar**. Then the result list.

## Category tabs

```
Active (18)   In Progress (5)   Review (4)   Not Started (9)   Closed (24)   All
```

Six tabs. Four map to the lifecycle **categories** — In Progress, Review, Not Started, Closed — plus **Active** (everything not Closed, the default) and **All**. Click to filter by category; each row still shows its own status as a colored badge. Counts reflect the current filter set (changing a priority filter below recalculates the tab counts).

### Subtask-debt promotion

The **Review** tab isn't just issues whose own status is in the Review category (`input-needed` / `review`) — it's highlighted, and it also absorbs **review-debt**: active (non-closed) issues with one or more subtasks in the Review category. See [Lifecycle and Review — subtask-debt promotion](../lifecycle-and-review).

This matters: it surfaces work waiting on a human even when the issue's own status still sits in an earlier category. The tab count often reads like:

```
Review (4 total — 2 with review subtasks)
```

For a promoted issue, the **status badge on the row displays `review` too** — not just its tab placement. So a `2/6` issue that's really `in-progress` but has a subtask awaiting sign-off shows a `review` badge, keeping the badge honest about the Review tab it's filed under. This is **display-only**: the stored status in `settings.json` is unchanged (the CLI and `--json` still report the real status), and the badge reverts on its own once the review subtask moves on. A closed issue never inherits `review`, and an issue already in the Review category shows its own status.

### Default tab

The default is **Active** — everything not yet Closed. Bookmark the base URL to land there. Adding `?state=review` to the URL jumps straight to the Review tab.

## Preset views

```
High priority │ Blocked │ By component
```

One-click filter + group configurations, declared in the tracker's root `settings.json`:

```json
"views": [
  { "name": "High priority", "filters": { "priority": ["high", "urgent"] } },
  { "name": "Blocked",       "filters": { "status": ["blocked"] } },
  { "name": "By component",  "group": "component" }
]
```

Clicking a preset applies its filters + group at once. The URL updates to reflect the applied state — bookmarkable.

See [Vocabulary — preset views](../settings/vocabulary#preset-views) for the full schema.

## Filter bar

### Search

Free-text match against title, description, and issue ID (`2026-04-19-docs-phase-2`). Case-insensitive substring.

### Field filter chips

One dropdown per enum field in the tracker vocabulary:

- `priority` — low / medium / high / urgent. **Sortable column** in the table view; default sort is `priority desc, updated desc`.
- `component` — whichever components are declared
- `labels` — any label values
- `assignee` — coarse pseudo-values (`assigned` / `unassigned`) plus per-person values from the tracker root's `authors[]`

Multi-select per field. Chip colors come from the vocabulary's color declarations.

**Filter logic:**
- **Within a field** — OR (`priority=high,urgent` matches either)
- **Across fields** — AND (`priority=high AND component=docs`)

#### Assignee filter

The `assignee` row exposes two layers in the same dropdown:

- Top — `assigned` / `unassigned`: coarse "is anybody on this?" Use these to scan for idle work or owned work without picking a specific person.
- Below the divider — per-person names from `authors[]`: fine "what is X working on?"

Assignees are just who's on the issue — nothing more. Progress is the explicit `in-progress` status, not a side effect of being assigned. See [`author` vs `assignees`](../settings/per-issue#author-vs-assignees).

### Group-by

Pick one of `component` or `priority` (or *none*). Applies a visual grouping — results split into sections with a header per value. Empty groups are hidden.

For multi-valued fields (`component`), an issue with multiple values appears under **each** of its groups. Per-group counts reflect membership, so the sum across groups can exceed the unique-issue total — that's intentional ("how many issues touch live-editor?" should include cross-cutting work).

### Sort

Default is `priority desc, updated desc` — high-priority recently-touched first. Click any sortable column header to override. Options:

| Option | Meaning |
|---|---|
| `priority` | Enum order (urgent > high > medium > low) |
| `updated` | Most recent git commit touching any file in the issue folder (derived) |
| `created` | Folder name's date prefix |
| `component` / `assignees` / `status` / `title` | Alphabetical / enum order |

Each with `asc` / `desc` toggle.

## URL state

Every filter, sort, and tab choice serialises to the URL:

```
/todo?state=review&priority=high,urgent&component=docs&sort=priority&dir=desc
```

Shareable, back/forward navigable, survives refresh. The client reads the URL on load and restores everything.

## View toggle (table vs cards)

A small toggle in the header switches between:

- **Table** — dense tabular rows. Default for ≥10 visible issues.
- **Cards** — one card per issue with more visual breathing room. Better for small result sets.

The choice persists via URL param (`?view=cards`).

### Guide button

Beside the view toggle sits a **Guide** button. It opens a tracker-level reference modal that lays out the fixed lifecycle — the seven statuses and four categories with their built-in meanings — alongside this tracker's own `component`, `labels`, and `priority` values and their descriptions, tagged to show what's **fixed in code** versus **editable** in `settings.json`. It's the in-app companion to the vocabulary: the same `descriptions` maps you write in the root settings render here. (Distinct from each issue's own **Guide** panel, which explains that one issue's anatomy.)

## Issue rows

Each row / card shows:

| Field | Where on the row |
|---|---|
| Component | Chip group (one chip per value) |
| Title | Prominent |
| Status badge | Colored chip. Shows the issue's stored status — except an active issue with a review-debt subtask displays `review` (see [Subtask-debt promotion](#subtask-debt-promotion)) |
| Priority badge | Colored chip — sortable column |
| Assignees | Avatar circles (initials) — first 3 then `+N`; `—` if unassigned |
| Subtasks | Two-line cell — count on top, progress bar below |
| Created date | Folder slug `YYYY-MM-DD` |
| Updated date | Derived from git history (most recent commit touching the folder) |

Clicking anywhere on the row navigates to the detail page — with the current filter state preserved, so the Back button returns to the exact view.

## Empty state

When filters match zero issues:

```
No issues match these filters.
[ Clear filters ]
```

A single button restores the default tab + no filters.

## See also

- [Detail View](./detail-view) — what clicking through takes you to
- [Vocabulary](../settings/vocabulary) — how preset views and enum colors are declared
- [Lifecycle and Review](../lifecycle-and-review) — category tab semantics, review-debt promotion
