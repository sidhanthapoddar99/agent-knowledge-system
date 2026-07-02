---
title: Update code for the new states (frontend + backend)
state: open
---

Implement the vocabulary decided in subtask 02 end-to-end. Subtask `state` mirrors
issue `status` (decided) — every surface below covers both levels.

**Backend**
- [ ] Root `settings.jsonc` — new `status` values, colors, category grouping,
      updated comments
- [ ] Issues loader (`src/loaders/issues.ts`) — accept the new values, any
      category-aware derivation, drop assignees→in-progress derivation if present
- [ ] `docs-guide` CLI — `issue set-state`, `issue list` filters, `check issues`
      validation against the new vocabulary
- [ ] Migrate existing issues' `status` (and labels) AND all subtask `state` values
      per the subtask-02 mapping

**Frontend** (`src/layouts/issues/default/`)
- [ ] Status badges + colors in `IssuesTable` / detail header
- [ ] `FilterBar` — filter by state and/or category
- [ ] Views (root `settings.jsonc` `views`) — replace the label-based "Blocked"
      view with the status; revisit "Assigned"
- [ ] Subtask state badges / checklist rendering + subtask state counts under the
      new vocabulary
- [ ] Review tab / review-debt promotion logic still correct under the new model
- [ ] Validator green + build green after migration
