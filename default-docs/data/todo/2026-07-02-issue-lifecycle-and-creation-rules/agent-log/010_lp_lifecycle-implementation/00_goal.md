---
title: "Goal — implement the decided lifecycle model end-to-end (loop)"
---

## Goal

Execute every open subtask of `2026-07-02-issue-lifecycle-and-creation-rules` in an
autonomous loop, taking the tracker from the 4-flat-state model to the decided
**4-category / 7-status hardcoded vocabulary** — code, migration, docs, guide.ts,
skill plugin — then self-verify and leave everything in `review` for sidhantha's
sign-off.

## Ground truth — read before ANY work

1. `notes/01_lifecycle-vocabulary.md` — the decided model. It wins over every other
   file, including subtask bodies and issue.md, if anything conflicts.
2. `brainstorm/01_discuss_lifecycle-decisions.md` — the *why* behind each decision
   (resolved; consult when a subtask hits an ambiguity the note doesn't cover).
3. The subtask files themselves — each is written to be executable cold.

## Constraints and rules for the loop

- **Order:** 03 + 07 together (one migration wave: constant + validation first,
  then the rename+value script, then hard validation verified) → 04 → 05 → 06 →
  08 (consistency sweep) → 09 (skill restructure — LAST, it renames files 06/08
  touch).
- **Sequencing inside 03/07:** don't turn on the hard startup error until the
  migration script has converted all trackers (`data/todo/`, `data/todo-testing/`,
  demo issues) — otherwise the dev server can't even boot to test with.
- **Plugin edits land twice:** repo source `plugins/documentation-guide/` AND the
  installed cache (`~/.claude/plugins/cache/sids-plugin-marketplace/...`),
  diff-verified. One version bump per subtask that touches the plugin (06, 09).
- **Agent status rules apply to this issue itself:** set each subtask (field name:
  whatever is canonical *at that moment* — `state` before 07's migration runs,
  `status` after) to in-progress equivalent when starting isn't possible pre-07
  (no such state exists yet) — so pre-migration, just work; post-migration, use
  the new vocabulary on the remaining subtasks. Finished subtasks → `review`,
  NEVER closed/done. If stuck on something only sidhantha can answer →
  post-migration `input-needed` (pre-migration: `review`) + write the question
  inline in the subtask file and continue with the next unblocked subtask.
- **Verify per subtask:** full build (`./start build`) + `docs-guide check issues`
  + the subtask's own verification items. Never mark review with a red build.
- **Log milestones here** (~3–6 for the whole loop, `1NN_` files) — including
  failed approaches. Write `01_summary.md` when the loop ends. Keep
  `02_task_list.md` current as the running checklist (tick items as they land,
  add discovered work).
- **Update agent-memory** (`agent-memory/` in this issue) with durable working
  state: decisions made mid-flight, gotchas found, file maps.

## Done means

All subtasks 03–09 in review (or input-needed with a clear inline question),
build green, all trackers validator-green, milestones + summary written. The loop
then STOPS — sign-off and closing are sidhantha's.
