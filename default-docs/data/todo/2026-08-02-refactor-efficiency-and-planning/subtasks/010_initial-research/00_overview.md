---
title: "Initial research — measuring the overhead, then deciding what to do about it"
status: done
---

# Overview

**The three pieces of work that opened this issue: one measurement and two
deliberations.** Everything the issue later executed was scoped from these.

[`010`](./010_audit-efficiency-losses.md) measured where effort was actually
going — the finding that only **8.8%** of written output was code. The two
brainstorms then argued out what to change: [`020`](./020_brainstorm-efficiency-remedies.md)
on cutting the recording overhead itself, and [`030`](./030_brainstorm-plans-section.md)
on the `plans/` section, which became the structural answer to "where does
*what is left, in what order* live".

Grouped together because they share a lifecycle, not a topic: all three are
**closed deliberation**. Nothing here is rewritten as work lands — the execution
that followed lives in [`040`](../040_execution/).

# References

- The measurement itself: [the recording-overhead audit](../../notes/10_efficiency-audit-2026-08-02.md)
- The run that produced it: [`010_au_recording-overhead`](../../agent-log/010_au_recording-overhead/)
- The spec the plans brainstorm graduated into: [plans section spec](../../notes/50_plans-section-spec.md)
- What was built from these: [`040` — execution](../040_execution/)

# Todo list

- [x] Measure where the effort actually goes, rather than estimating it
- [x] Brainstorm remedies for the recording overhead
- [x] Brainstorm the `plans/` section and graduate the conclusion into a spec

# Outcomes and Next Steps

**All three closed.** The measurement stands as the issue's premise; both
brainstorms graduated — the remedies into the skill's efficiency rules, the plans
design into [the spec](../../notes/50_plans-section-spec.md) and then into code.

The single number worth carrying forward: **8.8% of written output was code.**
That is what justified treating recording overhead as a first-class problem
rather than a style complaint.

# Details

## Why these three sit in one folder

They are the **research phase**, and research has a different lifecycle from
execution: it is written once, argued to a conclusion, and then never revised.
Filing by lifecycle rather than topic is what stops a settled deliberation from
reading as an open question.

| # | Kind | What it settled |
|---|---|---|
| [`010`](./010_audit-efficiency-losses.md) | Measurement | Where the effort goes — 8.8% code |
| [`020`](./020_brainstorm-efficiency-remedies.md) | Deliberation | What to change about recording |
| [`030`](./030_brainstorm-plans-section.md) | Deliberation | That `plans/` should exist, and its shape |

Two of the three graduated into `notes/`, which is the correct end state for a
brainstorm whose conclusion something downstream cites.
