---
title: Update the user-guide documentation
status: open
---

Rewrite the lifecycle story in `default-docs/data/user-guide/19_issues/` against
`notes/01_lifecycle-vocabulary.md` (4 categories / 7 statuses / hard-enum /
category-filtered UI), and keep the threshold-rules work already landed.

- [ ] `04_setup/06_lifecycle-and-review.md` — the new model in full: category/status
      table with colors, agent rules (auto `in-progress`, `input-needed` question
      protocol with inline-question convention, review ceiling, human-only
      `done`/`dropped`), transitions-are-guidance, review-debt promotion via the
      Review category; drop the "deliberately missing: in-progress, blocked"
      paragraph.
- [ ] `04_setup/02_vocabulary.md` — statuses are now **fixed in code** (only colors
      overridable in root settings); rewrite the "finer-grained states are labels"
      guidance to the new doctrine; document the `wip` label deprecation.
- [ ] `02_design-philosophy.md` — record the policy reversal honestly: why the
      label-doctrine was revised (assignee-derivation never matched practice), why
      statuses went hard-coded (fixed shared vocabulary for agentic workflows;
      the GitHub-simplicity argument; customization line drawn at colors), and why
      transitions stay unenforced.
- [ ] **Remove the assignee-derived in-progress signal everywhere:**
      `04_setup/01_per-issue.md` ("assignees doubles as the in-progress signal")
      and `07_ui/01_list-view.md` ("Assignee — the in-progress shortcut"); describe
      the category tabs in the list-view page.
- [ ] `05_sub-docs/03_subtasks.md` — subtasks share the issue enum AND the field
      name `status` (post subtask-07 rename); new state table; inline-question
      convention for `input-needed`.
- [ ] `09_using-with-ai.md` — agent rules under the new model (auto in-progress,
      input-needed protocol, ceiling = Review category, default search scope =
      everything not Closed).
- [ ] Sweep `19_issues/` for any remaining `closed`/`cancelled`-as-status,
      4-state, or `state:` field mentions (e.g. workflows pages, migration page if
      one exists) — update to the new vocabulary.
- [x] Creation-threshold rules page — landed 2026-07-02 as "§0" of
      `19_issues/08_workflows/01_create-an-issue.md` (via anatomy-restructure
      subtask 07; don't duplicate).
