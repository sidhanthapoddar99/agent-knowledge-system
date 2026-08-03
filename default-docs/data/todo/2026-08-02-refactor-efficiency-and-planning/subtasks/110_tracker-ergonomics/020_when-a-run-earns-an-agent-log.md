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

# The rule — decided with Sid, 2026-08-03

**The test is STAGES, not effort and not file count.**

> **An agent log records work that had stages** — where a later stage acts on
> what an earlier one produced. **A single self-contained pass has no stages and
> earns no log**, however long it took or however many files it touched; it
> belongs in the subtask's own Outcomes.
>
> **Two things always earn one:** work with stages, and anything Sid explicitly
> asks to have recorded.

Sid's own framing of the trigger, which is the clearest statement of it:

> *"Anything which is large enough and multi-stage warrants an agent log."*

And of the two modes the tracker is used in — this is why a floor is needed at
all rather than a single always-rule:

> *"The user would run this in two modes. One is autonomous, fully fledged,
> multi-step reasoning, audits, multi-stage. The other is he would sit and solve
> subtasks one by one. In the second case we have to be a little cautious — hint
> the user."*

## The three verdicts

| | When |
|---|---|
| 🟢 **Required** | the work has stages, or Sid asked for a record |
| ⬜ **Not required** | one self-contained pass — no stage acted on another's output |
| 🟡 **Ask** | the interactive mode, and anything whose value only becomes clear from what it produced |

**Never make it a validator error.** Whether a run had stages is a judgement, and
a gate that fails on judgement gets worked around. A hint at most.

## Eight cases, answered

Worked through with Sid so the rule has instances and not only a principle.

| Case | Verdict | Why |
|---|---|---|
| Plan execution, single or multi level | 🟢 Required | stages by construction |
| Loop over 3–4 subtasks | 🟢 Required | one log |
| Loop over 30–40 subtasks | 🟢 Required | one log, possibly nested |
| Multi-stage or multi-level audit; a built workflow | 🟢 Required | the canonical case |
| **Content migration** — one command, but detect → dry-run → migrate → re-detect | 🟢 Required | a stage chain with numbers at each step, rewriting content in place. Small diff, large blast radius |
| **Substantial refactor** | 🟢 Required | **and not for the size.** Sid: *"refactors are not just moving files, it also contains audit, refixes etc — so it's a multi-stage process"* |
| **A hard bug: an hour, three wrong diagnoses, a four-line fix** | 🟢 Required | the wrong diagnoses *are* the stages, and a four-line diff hides every one of them |
| **One subagent, one bounded job** (a rename across 12 files, one round, nothing found) | ⬜ Not required | delegation alone is not a stage chain. Subtask Outcomes |
| **An investigation that changed no code** — e.g. the fifteen-link live check | ⬜ Not required | it already produced a subtask carrying the numbers; a log would restate it |
| A commit of 20–30 lines · a text change · a quick check audit | ⬜ Not required | Sid, verbatim |
| Anything so small it questions whether it deserved a subtask | ⬜ Not required | Sid, verbatim |
| **One independent review, one round, returning findings** | 🟡 Ask | Sid: *"generally not required, but if the findings are something to note then maybe ask me — depends on the output."* Judge on what came back, not on the fact a review ran |
| **The interactive sitting** — subtasks one by one for an hour | 🟡 Ask | the mode Sid named as needing caution. **Hint once for the session, never per subtask** |
| **A discussion that settles a design decision**, no code | 🟡 Ask | matches how the skill already treats discussion — offer when dense, never auto-save. The decision goes in the subtask either way; the question is only whether the reasoning earns its own file |

## Why "stages" is the test — reason from this, not from the table

**The table above will never cover the case in front of you.** It is instances;
this is the thing to apply when none of them matches.

**What an agent log is for: recovering the path, when the artefact does not
show it.** A subtask says what is true now. A log says how it was arrived at —
what was tried, what it returned, and what that changed. So the question is
never *how big was this* or *how long did it take*. It is:

> **Is there something here that the finished work does not show?**

Stages are the reliable signal for that, because a stage boundary is exactly
where information was produced and acted on. If stage two did something
different because of what stage one returned, that "because" exists nowhere in
the diff. **A single pass has no such moment: the work and the record of the
work are the same object, and a log can only restate it.**

Three tests that follow from this, in order of usefulness:

1. **Would a reader of the final diff be surprised?** If the answer is *"four
   lines? that's it?"* — the interesting part is the path, and the path needs a
   home. This is why the four-line trailing-slash fix earns a log and a
   thirty-file rename does not.
2. **Did anything get discarded?** A rejected approach, a wrong diagnosis, a
   measurement that came back other than expected. **Discarded work is invisible
   by construction** — it is the one category that cannot be reconstructed from
   the repository at all.
3. **Would the log restate the subtask?** If yes, do not open it. This is the
   floor, and it catches the cases the first two over-trigger on.

**The mirror of that, and the reason this cuts both ways:** when there *is* a
path and no log, it is not merely unrecorded — the retraction earlier in this
issue was only possible because two reviews had been written down and could be
named, quoted and overturned. A finding nobody wrote down cannot be withdrawn;
it just quietly keeps being believed.

**A note on effort, which is the trap.** Effort correlates with stages often
enough to be misleading. An hour of grinding through one mechanical change has
no stages and earns nothing; ten minutes that overturned an assumption has one
and earns a log. **Ask what was learned, not what was spent.**

## The two failure modes this must avoid

**Opening one for a two-minute task costs more than the task.** Sid:
*"creating an agent log would be more effort."* That is not a stylistic
objection — it is the reason the rule needs a floor at all.

**And the rule must not become a checkbox.** *"If the log would only restate the
subtask, do not open it"* is the test to apply when the table above does not
obviously decide it.

# Todo list

**The rule is decided. What remains is landing it.** Deliberately not done in
the same sitting that decided it — a rule written straight after the
conversation that produced it tends to encode the conversation.

- [ ] Land it on the same surfaces
      [`010`](./010_plan-execution-needs-an-agent-log.md) changed — the issues
      skill, and `guide.ts`, its plugin-independent twin. **The stages test and
      the three verdicts, not the fourteen cases** — a skill carries the rule,
      and a table of instances will rot
- [ ] **Carry the reasoning across, not just the verdicts.** The three tests
      under *Why "stages" is the test* are what decide a case the table does not
      list, and every real case will be one of those. A rule shipped without its
      reason gets applied literally — which is exactly how
      [`010`](./010_plan-execution-needs-an-agent-log.md) came to read "always"
- [ ] Say it **at the point of use**: `agent-ks issue new-agent-log` is where
      someone is already committing to one. A line in its help text is worth
      more than a paragraph in a reference
- [ ] Give the interactive mode its hint, and make it **once per session** —
      a prompt on every subtask is the thing Sid asked to avoid
- [ ] Check the reverse case still holds: the [`010`](./010_plan-execution-needs-an-agent-log.md)
      gate must keep firing for real runs once the floor exists. **Control-test
      both directions** — a plan execution still demands a log, and a two-minute
      subtask no longer does

# References

- The opposite failure, and the surfaces to edit:
  [`010`](./010_plan-execution-needs-an-agent-log.md)
- The principle this is an application of: the global orchestration reference,
  *Recording* — *"scale the record to the change, not to the effort"*
- The run that prompted it: the routing fixes on
  [`2026-06-09` `05`](../../../2026-06-09-issue-link-resolution/subtasks/05_dual-slug-url-resolution.md)
  and [`06`](../../../2026-06-09-issue-link-resolution/subtasks/06_plans-auto-resolution.md)
  — a log was scaffolded and deleted unused
