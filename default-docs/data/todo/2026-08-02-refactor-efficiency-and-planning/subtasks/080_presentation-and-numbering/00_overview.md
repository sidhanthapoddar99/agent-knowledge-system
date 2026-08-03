---
title: "Presentation and numbering — how the tracker reads on screen"
status: done
---

# Overview

**Three reworks of how tracker structure is *displayed and numbered*, as opposed
to what it holds.** None changed a rule; all three changed what a reader sees
first.

- [`010`](./010_ordering-labels.md) — the `NN_` ordering number in link text:
  when it appears, when it is noise, and the guard that keeps it consistent.
- [`020`](./020_plan-table-rework.md) — the plan page's stage table and both
  sidebars, reworked on first contact and then again after review.
- [`030`](./030_agent-log-slot-numbering.md) — the agent-log slot numbering
  scheme: first two digits are the iteration, the last digit is the file within
  it.

Grouped because they share a failure mode: **each was got wrong on the first
attempt and corrected on sight.** Presentation is the one area in this issue
where Sid's eye is the instrument and no test substitutes for it.

# References

- The rounds that did the work:
  [`110_ordering-labels`](../../agent-log/020_wf_ship-the-split/02_working/110_ordering-labels.md) ·
  [`120_plan-table-and-sidebar`](../../agent-log/020_wf_ship-the-split/02_working/120_plan-table-and-sidebar.md)
- The numbering scheme as it now stands in the skill:
  `plugins/agent-ks/skills/agent-ks-issues/references/20_sections/24_agent-logs.md`
- The migration that retired the old `MNN_` shape:
  [`040/100`](../040_execution/100_migration-script.md)

# Todo list

- [x] `010` — ordering labels back in link text, with a guard so the two
      spellings cannot drift
- [x] `020` — stage table and sidebars reworked; one indent step per nesting
      level, both rails at one size
- [x] `030` — agent-log slot numbering settled: iteration in the leading digits,
      file index in the last

# Outcomes and Next Steps

**All three closed.** Each landed, was looked at, and was adjusted — in one case
reverted outright the moment Sid saw it (*"agent-log rows lead with the number
again — reverted on sight"*).

The durable output is the numbering scheme in `030`, which the migration then
had to encode: **the first two digits are the iteration and the last digit is the
file within it.** The retired shape counted something different — `MNN_` counted
*milestones* while the `iteration:` field counted *rounds* — and conflating the
two produced 83 false positives out of 83 when a later check compared them. See
[`040/100`](../040_execution/100_migration-script.md).

# Details

## Why presentation work is grouped separately

Everything else in this issue is settled by reading code or running a command.
**These three are settled by looking**, which puts them in a different class:

- A wrong layout builds green, passes every check, and looks deliberate.
- No test in this repo has an opinion about whether an indent step reads as
  nesting or as noise.
- The feedback loop is Sid opening the page, so the cost of a wrong guess is a
  round trip rather than a failed build.

That is why all three were iterated rather than specified — and why the record
keeps the reverted attempts instead of only the final state.

## The one rule these produced

**A number that appears in two places must have one definition.** `010`'s guard
exists because the ordering prefix shows up in the filename, in the sidebar, and
in link text, and nothing previously stopped those three from disagreeing.
`030`'s scheme exists for the same reason one level up — and the 83/83 false
positive rate in the migration is what a violation of it looks like when it goes
unnoticed for long enough.
