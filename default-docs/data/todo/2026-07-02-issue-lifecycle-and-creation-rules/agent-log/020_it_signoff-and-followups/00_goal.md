---
title: "Goal — post-loop sign-off + follow-up subtasks 10–13"
---

The wave after the lifecycle loop (`010_lp_lifecycle-implementation`). Sidhantha
reviewed the shipped 7-status/4-category lifecycle, found it good, and asked for
three things in one pass:

1. **Sign off the loop.** Tick the internal checkboxes inside subtasks 01–09
   (the loop left them unchecked though the milestones confirm the work shipped)
   and move 01–09 from `review` to `done`.
2. **Fix subtask 13** — the `docs-guide issue subtasks --status all` regression
   found while validating the loop.
3. **Complete the remaining follow-up subtasks 10–12** — the product changes he
   directed at sign-off (captured earlier as subtasks):
   - **10** — the index status badge inherits `review` from review-debt so the
     badge agrees with the Review tab;
   - **11** — a tracker Guide modal on the issues index + component/label
     descriptions promoted from JSONC comments to required, renderable data;
   - **12** — root settings status becomes colours-only (`statusColors`), with a
     hard error on a `fields.status` block.

Ground truth for the lifecycle itself remains `notes/01_lifecycle-vocabulary.md`.
Approach: land 13 (isolated), then 11+12 as one schema+validation+UI wave (they
reshape the same root-settings surface), then 10 (display derivation), verifying
build + `docs-guide check issues` green throughout; one plugin version bump for
the whole wave. Agent ceiling is Review — 10–13 stop at `review` for sidhantha's
sign-off (he owns `done`).
