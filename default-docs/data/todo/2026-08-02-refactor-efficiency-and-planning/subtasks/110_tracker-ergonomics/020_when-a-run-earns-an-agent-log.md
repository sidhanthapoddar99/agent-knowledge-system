---
title: "The rule says when an agent log is required and never says when it is not"
status: open
---

# Overview

**Sid, 2026-08-03, on a run that had just been given one:** *"they are too small
to have an agent log."* He was right, and nothing in the instructions would have
told me that.

[`010`](./010_plan-execution-needs-an-agent-log.md) fixed the opposite failure —
a four-stage plan executed with no log at all — by making the rule a gate. That
correction has no floor. Read literally, the rule now says *executing tracked
work opens an agent log*, and a two-file routing fix qualifies.

**Done when** the same surfaces that say what requires an agent log also say what
does not, with a threshold someone can apply without asking.

# The two failures are the same failure

| | What happened | Why the instruction allowed it |
|---|---|---|
| [`010`](./010_plan-execution-needs-an-agent-log.md) | four-stage plan run, no log | the rule was prose that had to be remembered |
| this one | four-line routing fix, log scaffolded | the rule has a trigger and no floor |

**A rule with a trigger and no floor is only half-written.** It reads as
"always", which is exactly as unhelpful as "when it feels right" — the reader
still has to invent the missing half, and two readers invent different ones.

# The threshold to write down

The global orchestration reference already carries the principle, in one line:
*"scale the record to the change, not to the effort"* — and gives the shapes: a
one-line fix earns a line in the plan, a round earns one file, an agent earns a
file only if it produced something. **That is the missing floor, and the tracker
surfaces do not repeat it.**

Proposed wording to land, as a rule rather than a feeling:

> **An agent log records a RUN — work with rounds, or work someone else did.**
> It is earned by any of: a plan stage executed, a delegated agent, a review or
> audit, an iteration that changed course, or anything that produced findings
> outliving the change. **A single self-contained edit — however many files it
> touches — belongs in the subtask's own Outcomes, not a log.** If the log would
> only restate the subtask, do not open it.

Note the second clause carefully: **file count is not the test.** A mechanical
rename across forty files is one edit and earns no log; a two-line fix reached
through three wrong diagnoses is a run and earns one.

# Todo list

- [ ] Land the threshold on the same surfaces
      [`010`](./010_plan-execution-needs-an-agent-log.md) changed — the issues
      skill, and `guide.ts`, its plugin-independent twin
- [ ] Say it **at the point of use**: `agent-ks issue new-agent-log` is where
      someone is already committing to one. A line in its help text is worth
      more than a paragraph in a reference
- [ ] **Do not make it a validator error.** Whether a run deserved a log is a
      judgement, and a gate that fails on judgement gets worked around. A hint
      at most
- [ ] Check the reverse case is still covered — the [`010`](./010_plan-execution-needs-an-agent-log.md)
      gate must keep firing for real runs after the floor is added

# References

- The opposite failure, and the surfaces to edit:
  [`010`](./010_plan-execution-needs-an-agent-log.md)
- The principle this is an application of: the global orchestration reference,
  *Recording* — *"scale the record to the change, not to the effort"*
- The run that prompted it: the routing fixes on
  [`2026-06-09` `05`](../../../2026-06-09-issue-link-resolution/subtasks/05_dual-slug-url-resolution.md)
  and [`06`](../../../2026-06-09-issue-link-resolution/subtasks/06_plans-auto-resolution.md)
  — a log was scaffolded and deleted unused
