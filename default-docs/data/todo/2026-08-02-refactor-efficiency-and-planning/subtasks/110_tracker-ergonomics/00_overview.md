---
title: "Tracker ergonomics — conventions the tooling does not surface at the moment of use"
status: in-progress
---

# Overview

**Every entry here is a convention that already exists and does not reach the
person or agent who needs it.** Not a missing rule — an unenforced one, or one
that arrives too late to act on.

- [`010`](./010_plan-execution-needs-an-agent-log.md) — executing a plan opened
  no agent log. The rule said *"delegated, or multiple rounds"*, four stages is
  multiple rounds, and it still did not fire.
- [`015`](./015_the-working-index-is-a-table-of-the-round.md) — a scaffolded
  agent log shows one file, so two of its three slots are invisible. The fix is
  an index that carries the run's shape, not an empty placeholder.
- [`020`](./020_when-a-run-earns-an-agent-log.md) — and the correction to
  [`010`](./010_plan-execution-needs-an-agent-log.md) had a trigger and no floor,
  so read literally it said *always*. The fix is one question, three triggers and
  two floor conditions, with the floor winning.

**Done when** each entry is fixed *in the place that will be read next time* —
the skill, the scaffolder, the validator — and not merely in a record of the
conversation that noticed it.

# References

- The run that surfaced both:
  [`040_wf_fix-the-tools-then-the-links`](../../agent-log/040_wf_fix-the-tools-then-the-links/01_summary.md)
- The plan it executed:
  [`01_fix-the-tools-then-the-links`](../../plans/01_fix-the-tools-then-the-links/overview.md)

# Todo list

- [x] [`010`](./010_plan-execution-needs-an-agent-log.md) — at `review`
- [x] [`015`](./015_the-working-index-is-a-table-of-the-round.md) — decided
      *regenerated*, built, gated; at `review`
- [x] [`020`](./020_when-a-run-earns-an-agent-log.md) — landed on four surfaces,
      all 14 verdicts held; at `review`

# Outcomes and Next Steps

**Open, and expected to stay open.** This is a place to put small things, not a
milestone. Entries close individually.

# Details

## Why these are one group rather than loose fixes

They share a mechanism, and it is the one the rest of this issue has been chasing
one layer down: **a rule that is technically correct and does not fire.**

| Rule | Technically covered | Did not fire because |
|---|---|---|
| *"or the resolved URL — also works"* | the absolute form was documented as allowed | the consequence sat 44 lines away |
| *"delegated, or multiple rounds"* | four stages is multiple rounds | *"executing a plan"* does not read as *"rounds"* |
| the three agent-log slots | documented in the skill | the skill may not be loaded, and the scaffold shows one file |

None of them is wrong. All of them are **easy to read past**, which is the same
failure as a required rule written as a preference — and a fix that lands in a
conversation record rather than in the tool is one more rule nobody will read.
