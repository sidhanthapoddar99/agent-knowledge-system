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
  so read literally it said *always*. The fix is one question, three triggers,
  two floor conditions, and a stated default when neither fires.
- [`025`](./025_an-index-is-checked-not-generated.md) — the index built for
  [`015`](./015_the-working-index-is-a-table-of-the-round.md) was **generated**,
  and its checker shared the generator's blind spot. Hand-written now, checked by
  reading.
- [`035`](./035_the-plugin-declares-no-dependencies.md) — `gray-matter` was
  imported and never declared, resolving only because the CLI execs `bun`, which
  auto-installs. Removed rather than declared: `Bun.YAML` was already in the
  runtime. The plugin now ships **zero** dependencies.
- [`045`](./045_a-link-whose-label-wraps-is-never-checked.md) — eight links no
  gate had ever seen, because every caller matched one line at a time and their
  labels wrap. One shared whole-document walker now; two of the eight turned out
  to be broken, and nothing could have said so.
- [`055`](./055_an-index-is-checked-by-a-cheap-agent.md) — the reading job from
  [`025`](./025_an-index-is-checked-not-generated.md), built as the plugin's first
  agent. Report-only, two directions, and the second one needs a directory listing
  because an index cannot lead you to an entry it does not have.
- [`065`](./065_the-skill-audit-and-its-rulings.md) — two audits of the issues
  skill, the findings that survived checking, and the rulings that closed them.
- [`075`](./075_move-skips-a-backticked-label.md) — `move` silently declined every
  link whose label is backticked, this tracker's commonest shape. A second blind
  spot beside [`045`](./045_a-link-whose-label-wraps-is-never-checked.md)'s, found
  by running the tool rather than by testing it.

**Done when** each entry is fixed *in the place that will be read next time* —
the skill, the scaffolder, the validator — and not merely in a record of the
conversation that noticed it.

# References

- The run that surfaced both:
  [`040_wf_fix-the-tools-then-the-links`](../../agent-log/040_wf_fix-the-tools-then-the-links/01_summary.md)
- The plan it executed:
  [`01_fix-the-tools-then-the-links`](../../plans/01_fix-the-tools-then-the-links/overview.md)

# Todo list

- [x] [`010`](./010_plan-execution-needs-an-agent-log.md) — `done`
- [x] [`015`](./015_the-working-index-is-a-table-of-the-round.md) — `done`; its
      *problem* was solved, its *design* was reversed by
      [`025`](./025_an-index-is-checked-not-generated.md)
- [x] [`020`](./020_when-a-run-earns-an-agent-log.md) — one home, a stated
      default, `done`
- [x] [`025`](./025_an-index-is-checked-not-generated.md) — `done`
- [x] [`035`](./035_the-plugin-declares-no-dependencies.md) — `done`; zero
      runtime dependencies, licensed by a differential test over 1,035 documents.
      The offline case is measured: old hangs at 90 s, new exits 0
- [x] [`045`](./045_a-link-whose-label-wraps-is-never-checked.md) — `done`;
      rendered-but-unscanned 8 → 0, measured against micromark and controlled
      against the old per-line scan
- [x] [`055`](./055_an-index-is-checked-by-a-cheap-agent.md) — `done`; five drafts,
      two control tests, and it found this overview's own staleness on first run
- [x] [`065`](./065_the-skill-audit-and-its-rulings.md) — `done`
- [x] [`075`](./075_move-skips-a-backticked-label.md) — `done`; 1 of 3 links
      rewritten before, 3 of 3 after

# Outcomes and Next Steps

**All nine closed.** The group was a place to put small things
rather than a milestone, and entries closed individually. The last two were
**raised by the reviews**, not planned: the parser swap paid for itself twice over
in things it revealed, and was then reverted.

**This overview was itself the first thing the new checker caught.** It named
[`055`](./055_an-index-is-checked-by-a-cheap-agent.md) and
[`065`](./065_the-skill-audit-and-its-rulings.md) as MISSING — two entries that
existed on disk and appeared nowhere here — plus a wrong count and a status that
had moved. That is the direction a reference-walking check cannot reach, which is
the argument the subtask was built on, demonstrated on the file that describes it.

**What the four cost, and what they were worth.** Two review rounds over one
diff, 44 findings, and **two of this group's own three deliverables were reversed
by its own review.** The generated index was deleted the day it shipped; the
hand-rolled markdown scanner was replaced by a parser after its third rewrite.

The single lesson, and it is the one to carry: **every defect here came from a
check scoped to the thing it was checking.** The acceptance test read the
paragraph it had just written. The fixture tested the bugs it had already met.
The staleness gate compared against a generator carrying its own blind spot. A
validator gap was called cosmetic by reasoning rather than by running it.

What worked, twice, was an **oracle** — something that answers the question
independently of the code under test. The link fixture is now a differential
test against the same markdown engine the site renders with, and the reviewer
that found the most was the one with a shell.

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
