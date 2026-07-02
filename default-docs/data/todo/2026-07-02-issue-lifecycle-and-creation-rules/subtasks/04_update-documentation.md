---
title: Update the user-guide documentation
state: open
---

Rewrite the lifecycle story in `default-docs/data/user-guide/19_issues/` for the new
model, and fold in the threshold rules from subtask 01.

- [ ] `04_setup/06_lifecycle-and-review.md` — new state table, categories,
      transitions; drop the "deliberately missing: in-progress, blocked" paragraph
- [ ] `04_setup/02_vocabulary.md` — new status enum + the "finer-grained states are
      labels" guidance
- [ ] `02_design-philosophy.md` — record the policy reversal honestly (why the
      label-doctrine was revised for in-progress/blocked)
- [ ] **Remove the assignee-derived in-progress signal everywhere:**
      `04_setup/01_per-issue.md` ("assignees doubles as the in-progress signal"
      section) and `07_ui/01_list-view.md` ("Assignee — the in-progress shortcut")
- [ ] `05_sub-docs/03_subtasks.md` — subtask `state` mirrors the issue vocabulary;
      update its state table to the expanded enum
- [ ] `09_using-with-ai.md` — agent rules under the new states (ceiling stays
      `review`)
- [x] Add/extend a page with the creation-threshold rules (subtask 01 output) —
      landed 2026-07-02 as "§0" of `19_issues/08_workflows/01_create-an-issue.md`
      (via anatomy-restructure subtask 07; don't duplicate)
