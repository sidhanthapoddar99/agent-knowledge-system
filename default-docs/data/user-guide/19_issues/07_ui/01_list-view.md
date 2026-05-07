---
title: List View
description: The index page — state tabs, filter chips, preset views, grouping, sort
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
│  Open (12)   Review (4)   Closed (24)   Cancelled (2)            │  ← state tabs
├──────────────────────────────────────────────────────────────────┤
│  Search …    Priority ▾   Component ▾   Labels ▾   Assignee ▾    │  ← filter bar
│                                                  Group ▾  Sort ▾ │
├──────────────────────────────────────────────────────────────────┤
│  2026-04-19  Documentation update — phase 2       🔶 review 2/6  │  ← issue rows
│  2026-04-10  Issues layout + settings.json UX     🟢 review 17/17│
│  …                                                               │
└──────────────────────────────────────────────────────────────────┘
```

Four bars, top to bottom: **header**, **preset strip**, **state tabs**, **filter bar**. Then the result list.

## State tabs

```
Open (12)   Review (4)   Closed (24)   Cancelled (2)
```

Four tabs, one per canonical state. Click to filter. Counts reflect the current filter set (changing a priority filter below recalculates the tab counts).

### Subtask-debt promotion

The **Review** tab isn't just issues with `status: review`. It also includes **issues with `status: open` whose subtasks include one or more in `review`**. See [Lifecycle and Review — subtask-debt promotion](../lifecycle-and-review).

This matters: it surfaces work waiting on a human even when the top-level status says "still open." The tab count often reads like:

```
Review (4 total — 2 with review subtasks)
```

### Default tab

The default is **Open** — the active queue. Bookmark the base URL to land there. Adding `?state=review` to the URL jumps straight to the Review tab.

## Preset views

```
High priority │ Blocked │ By component
```

One-click filter + group configurations, declared in the tracker's root `settings.json`:

```json
"views": [
  { "name": "High priority", "filters": { "priority": ["high", "urgent"] } },
  { "name": "Blocked",       "filters": { "labels": ["blocked", "blocked-external"] } },
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

#### Assignee — the in-progress shortcut

The `assignee` row exposes two layers in the same dropdown:

- Top — `assigned` / `unassigned`: coarse "is anybody on this?" Use these to scan for idle work or in-flight work without picking a specific person.
- Below the divider — per-person names from `authors[]`: fine "what is X working on?"

There's no separate `in_progress` field — `assignees.length > 0` is the in-progress signal. See [`author` vs `assignees`](../settings/per-issue#author-vs-assignees) for the rationale.

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

## Issue rows

Each row / card shows:

| Field | Where on the row |
|---|---|
| Component | Chip group (one chip per value) |
| Title | Prominent |
| Status badge | Colored chip |
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
- [Lifecycle and Review](../lifecycle-and-review) — state tab semantics, review-debt promotion
