---
title: "Skill — subtasks are grouped by CATEGORY, not execution order"
status: open
---

# Overview

Teach `agent-ks-issues` that a subtask's folder and number express **what kind of
work it is**, never **when it happens**. Order lives in a plan. Right now the
skill says neither, so every tracker drifts into using the folder tree as a
schedule.

**Done when** the skill states the rule, gives the grouping test, and explicitly
kills the "number implies sequence" reading — and when re-reading a real tracker
against it flags the places that got it wrong.

# References

- The reasoning, and the rule as decided:
  [Plans as references](../../brainstorm/03_options_plans-as-references.md) —
  *"Consequence 1 — subtasks are categorical, ordering is not theirs"*
- Where order goes instead: [The shape of a plan](../../brainstorm/06_discuss_plan-file-shape.md)
- Skill file to change: `references/20_sections/23_subtasks.md`, plus the routing
  table in `SKILL.md`
- Ships with: [Skill: the plans section](./030_skill-plans-section.md) — the two
  are one idea seen from both ends

# Todo list

- [ ] State the rule in `23_subtasks.md`: **groups are areas (nouns), numbers are
      stable ids and sort keys within an area. Neither implies sequence**
- [ ] Give the grouping test — by **area**, one level, no group for fewer than
      ~3 leaves
- [ ] Say outright that a subtask may run in several plans, or in none
- [ ] Add the counter-example: a group whose overview says *"reading order is
      execution order"* is the failure this rule prevents
- [ ] Cross-link from the plans skill work so the two do not drift
- [ ] Fix this issue's own `040_execution/00_overview.md`, which currently gets
      it wrong (see below)
- [ ] `agent-ks check skill-links` clean

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## The rule, in one line

> **A subtask's number is a stable id and a sort key within its category. It does
> not imply sequence.**

Counter-intuitive enough that it has to be said outright: people read
`010, 020, 030` as an order, because everywhere else in this framework a numeric
prefix *is* an order. In `subtasks/` it is a label.

## Why the folder tree keeps becoming the schedule

**With no plan section, it has to.** Order has to live somewhere, and the folder
tree is the most visible surface, so it wins by default. That is how paths like
`09_rf_memory-and-persistence/022_wf_stage-6.10-offmain-heap/113_slice3-build.md`
happen — *when* the work ran, encoded in a filename.

So this subtask cannot land before plans exist. Removing order from the folder
tree without giving it a home just loses it.

## This issue is its own counter-example

`subtasks/040_execution/00_overview.md` says *"Reading order is execution
order"* and lists a dependency chain. That ordering belongs in a plan; the group
should only say that these subtasks are **execution** work. Fix it in this
subtask — a live example of the confusion, in the issue that cures it.
