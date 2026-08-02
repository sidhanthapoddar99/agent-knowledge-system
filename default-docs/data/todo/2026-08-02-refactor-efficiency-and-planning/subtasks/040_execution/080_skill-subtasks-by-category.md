---
title: "Skill — subtasks are grouped by CATEGORY, not execution order"
status: review
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

- [x] State the rule in `23_subtasks.md`: **groups are areas (nouns), numbers are
      stable ids and sort keys within an area. Neither implies sequence**
- [x] Give the grouping test — by **area**, one level, no group for fewer than
      ~3 leaves
- [x] Say outright that a subtask may run in several plans, or in none
- [x] Add the counter-example: a group whose overview says *"reading order is
      execution order"* is the failure this rule prevents
- [x] Cross-link from the plans skill work so the two do not drift
- [x] Fix this issue's own `040_execution/00_overview.md`, which currently gets
      it wrong (see below)
- [x] `agent-ks check skill-links` clean

# Outcomes and Next Steps

The rule is stated in three places and never restated twice in the same words:

- `23_subtasks.md` — the rule, the means/does-not-mean table, and the grouping
  test (**by area, one level, no group for fewer than ~3 leaves**).
- `SKILL.md` — one line in the creation rules, where an agent filing a subtask
  will hit it.
- `guide.ts` — one line in the `## Subtasks` block, for consumers without the
  plugin.

> **A subtask's number is a stable id and a sort key within its category. It does
> not imply sequence.**

Plus the two consequences the subtask asked for outright: **a subtask may be
scheduled by several plans, or by none**, and the counter-example — *a group whose
overview says "reading order is execution order" and then lists a dependency
chain*, with the concrete path that produced
(`09_rf_memory/022_wf_stage-6.10/113_slice3-build.md`, *when* the work ran encoded
in a filename).

## This issue's own counter-example is fixed

`subtasks/040_execution/00_overview.md` said *"Reading order is execution order"*
and listed a dependency chain. It now says these are **execution work, and that
is all the grouping says**.

The note narrating the old wording has also been deleted — under the rule
[`110`](./110_superseded-wording-sweep.md) writes, superseded wording goes, and
the history is this issue and its git log.

## Verified

- The demo fixture demonstrates it: `subtasks/04_verify/` is an **area** with a
  `00_` index leaf and three leaves in three different statuses
  (`input-needed` / `open` / `done`), and its overview says outright that the
  number is a sort key and order is the active plan's.
- Live DOM: the group renders its done/total count and the section header its
  review dot, so the mixed statuses have something to bite on.
- `./start build` clean; `agent-ks check issues` exit 0.

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
