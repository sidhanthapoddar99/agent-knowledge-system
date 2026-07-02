---
title: "Milestone 2 — user-guide docs propagated (subtask 04)"
iteration: 2
status: success
---

## Goal

Rewrite the `19_issues` user-guide to describe the shipped 4-category / 7-status model
(subtask 04): drop the 4-state framing, remove the assignee-derived in-progress signal,
record the policy reversal honestly, and update every lifecycle mention.

## Approach

Hybrid parallelism: the main agent rewrote the five semantic pages (the ones carrying the
model + the reversal), while two general-purpose subagents handled six peripheral pages in
parallel, each given the full ground-truth vocabulary block so their edits stayed
consistent. Reconciled + swept + built at the end.

## Result — 11 pages updated

**Main agent (semantic core):**
- `04_setup/06_lifecycle-and-review.md` — full rewrite: 4 categories / 7 statuses table,
  the two Review statuses (`review` vs `input-needed` + the inline-question protocol), the
  agent ceiling, review-debt promotion by category, status-vs-labels.
- `02_design-philosophy.md` — honest policy-reversal record (why in-progress/blocked
  became statuses; assignee-derivation never matched practice; why the vocabulary is now
  fixed in code); updated the "what we have" sections.
- `04_setup/02_vocabulary.md` — replaced the "4-state contract / add-a-5th-state-across-
  8-files" section with the fixed seven-status contract + the single-source-of-truth
  pointer to `issue-status.ts`.
- `09_using-with-ai.md` — rewrote the agent rules (auto `in-progress`, `input-needed`
  protocol, ceiling = Review category, `done`/`dropped` human-only) and both transition
  tables.
- `05_sub-docs/03_subtasks.md` — subtasks share the issue `status` field + seven-status
  table; icons, cycle, and terminal-count prose updated.

**Main agent (unassigned peripherals):** `07_ui/02_detail-view.md`,
`08_workflows/01_create-an-issue.md`.

**Subagent A:** `01_overview.md`, `08_workflows/02_work-an-issue.md`,
`08_workflows/03_review-and-close.md` — model tables, cycle prose, "Cancelling"→"Dropping"
section renames. (Corrected its one over-reach: the shipped CLI keeps the `set-state`
verb, so the doc's `docs-guide issue set-state … --subtask` example was restored.)

**Subagent B:** `07_ui/01_list-view.md` (category tabs, Active default, review-debt,
removed the "Assignee = in-progress shortcut" framing), `04_setup/01_per-issue.md`
(status = fixed set, hard-error; removed assignee-in-progress subsection),
`04_setup/10_setup-new-tracker.md` (7-status example + colors, fixed-in-code rule).

Final sweep fixed three stragglers (two "4 states" link descriptions; the list-view
"Blocked" preset example → `status: blocked`). Anchor `#state-tabs`→`#category-tabs`
checked — nothing links to it.

## Verification

- `bun run build` — exit 0, Complete!, 25 issues-doc pages built, no new parse errors
  (the one YAML error is the pre-existing unrelated `03_standalone-theme.md`).
- `docs-guide check issues` — still only the 4 pre-existing unrelated warnings.

## Next

Subtask 05 (`guide.ts` panel — import the constant, thin legend) → 06 (skill plugin) →
08 (consistency sweep, incl. the out-of-scope find: `25_themes/…/07_issues-styles.md`
still names `.issue-subtask__state--cancelled`/`closed` CSS classes; also dev-docs) →
09 (skill restructure).
