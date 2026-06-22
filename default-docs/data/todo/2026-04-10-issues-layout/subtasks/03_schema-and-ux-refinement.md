---
title: "Schema & UX refinement (post-migration tuning)"
state: closed
---

After the initial implementation landed and we started actually using the tracker, several fields and UI decisions felt heavier than the workflow needed. This pass tightened both the data model and the index UI to match how a small AI-augmented team (2–3 people) actually moves.

## Data model — fewer fields, more freedom

### Removed `type`

Dropped the single-select `type` field (`bug`, `feature`, `task`, `performance`, `refactor`, `docs`).

- **Why:** real work is composite — a perf fix is bug + perf + refactor at once. Forcing a single primary type was lossy and required a daily decision that didn't pay off. In practice almost every issue ended up tagged `feature` or `task`, so the field stopped discriminating.
- **What replaced it:** every former type value moved into the multi-select `labels` vocabulary. An issue can now carry `feature + refactor + perf` simultaneously without contortion.

### Status: 6 → 3 with stateful labels

Status went from `open / in-progress / blocked / done / cancelled / archived` (six values) down to **`open / closed / cancelled`** (three).

- **Why fewer states:** in a 2–3 person team, "what's WIP" and "what's blocked" are conversations, not tracker fields. They go stale instantly. The remaining axes that *do* matter for retros and reporting are: is it shipped, is it dead, or is it still on the table.
- **`closed` vs `cancelled`:** kept separate so we can distinguish "shipped" from "won't fix / scope-cut". Folding them loses a real signal.
- **`wip` and `blocked` moved to labels:** transient state still has a home, but as labels that can stack with anything else and don't churn the primary status. AI loops can toggle `wip` freely without polluting the status field.

Per-issue migration: `in-progress` → `open + wip` label, `done` → `closed`, others unchanged.

### Component vocabulary collapsed: `layouts` + `themes` → `layouts-and-themes`

The two were almost always co-edited and the split forced an arbitrary call. Merging cleans up filters and the index "group by component" view.

## Index UI — GitHub-style state tabs

Replaced the `status` filter chip with **four tabs above the list**: Open · Closed · Cancelled · All.

- **Why tabs over a chip:** state is the primary axis you filter on — `open` is the default view 95% of the time. A persistent tab (with live counts) is one click and zero ceremony, vs. a chip dropdown that hides the current filter.
- **Counts respect other filters:** the count badge on each tab updates as you narrow by component / priority / search, so you can see "how many open `live-editor` items are there?" at a glance.
- **Default tab = `open`** (matches GitHub).
- **`?state=` URL param** persists tab choice (omitted when default).

## Table column rework

Column order shifted to put the *primary scan axis first*:

```
Component | Title | Status | Milestone | Subtasks | Created | Due
```

- **Component first:** it's how you triage; you scan down a single column to find your area.
- **Status column auto-hides on Open / Closed / Cancelled tabs** (the tab itself encodes status). Reappears on the All tab.
- **Priority moved into the title sub-line** (next to the issue id). Frees a column slot, keeps priority visible alongside the title where it actually matters.
- **Added Created column** so you can sort by age.
- **Date formatting**: `Jun 25, 2025` instead of `2025-06-25` for human readability; UTC to avoid timezone drift on date-only strings.

## Why these changes together

The pre-refinement model copied a generic project tracker (GitHub Issues + Jira-ish status). What we actually need is a *small-team AI-driven* tracker:

- Less single-select, more multi-select (labels do the work)
- Primary status reflects *terminal* state (shipped / dead / still alive), not micro-transitions
- The index defaults to "what's still alive" with one-click access to history
- Columns serve scanning, not reporting

Net effect: faster triage, less field maintenance, no loss of expressiveness (everything that was a status or type is still queryable via labels or the state tab).
