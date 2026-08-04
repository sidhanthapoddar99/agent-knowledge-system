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

# The rule — decided with Sid 2026-08-03, restructured 2026-08-04

**One question, one trigger, one floor. Never effort, never file count.**

> **A log exists so a finding can be withdrawn.** A finding nobody wrote down
> cannot be retracted — it just quietly keeps being believed. So the question is
> always:
>
> ### Is there something here that the finished work does not show?
>
> **TRIGGER — any one, and it earns a log:**
> 1. a later step changed course because of what an earlier step **returned**
> 2. something was **tried and discarded** — a rejected approach, a wrong
>    diagnosis, a measurement that came back other than expected
> 3. **Sid asked** for a record
>
> **FLOOR — any one, and it does not, and the floor wins:**
> 1. the log would **restate the subtask**
> 2. one self-contained pass with **nothing discarded**
>
> Then, and only then, a separate question: **a run already open? append to it.
> None open? start one.**

## Why this shape rather than a weighing — the 2026-08-04 revision

The rule as first written was *"a judgement over five factors weighed together —
stages, marginal cost, difficulty, future impact, whose hands — and no single
factor decides."*

**That is not a rule. It is a vibe with a table**, and it fails this subtask's own
test: *a rule with a trigger and no floor is only half-written… the reader still
has to invent the missing half, and two readers invent different ones.* Five
co-equal factors with no ordering leaves exactly the same gap one step later.

**The structural fault: factor 2 answers a different question from the rest.**

```
   "Should this be recorded?"          "Where does the record go?"
   ─────────────────────────           ──────────────────────────
    stages                              marginal cost
    difficulty                          whose hands
    future impact
```

Whether a run is already open has nothing to do with whether the path is worth
recovering — it says where to put it. Averaging a *whether* with a *where* is
why the rule needed weighing at all, and why no clean answer could fall out.
Separate them and most of the judgement disappears.

**And the other three collapse into the first**, because they are symptoms of it
rather than independent inputs. *Difficulty* matters because hard problems
produce wrong diagnoses — which is discarded work. *Future impact* matters
because unrecoverable reasoning is what a log holds — which is discarded work
again. *Whose hands* raises the cost of being wrong; it never triggers alone
(one bounded job, one round, nothing found, is still one pass).

**What is kept unchanged**, because it was right: the three verdicts, the
verify-is-not-a-stage distinction, and *never a validator error*.

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
| 🟢 **Required** | any trigger fires and no floor condition holds |
| ⬜ **Not required** | a floor condition holds — it wins even against a trigger |
| 🟡 **Ask** | the interactive mode, and anything whose value only becomes clear from what it produced. **Capped at once per session** |

**Never make it a validator error.** Even with a trigger and a floor this stays a
judgement — *did a later step act on what came back* is not something a script can
answer — and a gate that fails on judgement gets worked around. A hint at most.

## The 14 cases, answered

Worked through with Sid so the rule has instances and not only a principle.

| Case | Verdict | Why |
|---|---|---|
| Plan execution, single or multi level | 🟢 Required | stages by construction — and a log is usually already open, so the marginal cost is a line |
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

## The reasoning to apply when the table does not fit

**The table above will never cover the case in front of you.** It is instances;
this is the thing to apply when none of them matches.

**What an agent log is for: recovering the path, when the artefact does not
show it.** A subtask says what is true now. A log says how it was arrived at —
what was tried, what it returned, and what that changed. So the question is
never *how big was this* or *how long did it take*. It is:

> **Is there something here that the finished work does not show?**

**Every test in this subtask is an approximation of that one question.** Stages are the
most reliable signal for it, because a stage boundary is exactly where
information was produced and acted on. If stage two did something
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

## The limits — what counts, and what is never allowed to count

**A rule without numbers gets applied by mood.** These are the limits; the last
two are prohibitions and matter as much as the triggers.

| Limit | Value | Why this, and not something else |
|---|---|---|
| **Stages** | **≥ 2**, and the second must have *acted on* what the first returned | `edit → build → curl` is one pass however many commands it took. `audit → findings → fix` is two, because the findings changed what got fixed |
| **Discarded work** | **≥ 1** rejected approach, wrong diagnosis, or measurement that surprised you | The only category **unrecoverable from the repository at all**. On its own it justifies a log |
| **Delegated / unattended** | raises the weight of recording, **never triggers alone** | A completion message is not evidence — but one bounded job, one round, nothing found, is still one pass |
| **Sid asked** | always, no other test applies | — |
| **File count** | 🚫 **never a factor** | A thirty-file rename has no path. A four-line fix after three wrong diagnoses has nothing *but* path |
| **Time spent** | 🚫 **never a factor** | An hour of grinding through one mechanical change has no stages. Ten minutes that overturned an assumption has one. **Ask what was learned, not what was spent** |

**The `🟡 Ask` verdict is capped: once per session, never per subtask.** An
un-capped prompt becomes the noise it exists to prevent, which is the failure
Sid named directly.

## Marginal cost — a routing question, not a recording one

**Sid, 2026-08-03:** *"Is this a one-line addition to an already-present agent
log, or is this demanding an agent log in itself? If it is part of a plan and a
stage has one working file and this is just one line — add it. But if there is no
agent log and nothing is coming after this, it is not worth explaining the whole
issue."*

That is entirely right, and it is **the second question, asked after the first has
already said yes.** Almost all of a log's cost is setup — creating it,
establishing context, explaining the issue to a reader arriving cold. Appending
to a run in flight costs a line.

| Situation | Where it goes |
|---|---|
| A run is open and this belongs to it | **Append**, even one line. Never start a second log for work belonging to the first |
| No run open, and nothing follows | **Subtask Outcomes.** Setup exceeding the work is net negative |
| No run open, but this is the first of several | **Open one now** — cheaper than reconstructing it at step four, when the early reasoning is already lost |

**This is where the old rule's "no log" cases actually came from**, which is why
demoting it changes no verdict in the fourteen cases above. It changes what a
reader has to hold in their head: two ordered questions instead of five
simultaneous ones.

## The triggers in detail

### Trigger 1 · a step that acted on what came back — and the distinction that does the work

Stages alone over-trigger, because almost any change can be narrated as having
steps. **A VERIFY is not a stage.**

| | What it is | A stage? |
|---|---|---|
| **Verify** | *did I break it* — a check whose expected answer is "no". Typecheck, build, gate, one curl against the fixed URL | **No.** The answer changes nothing about what you did; it only says whether you may stop |
| **Audit / review** | *what is wrong here* — an open question whose answer you cannot predict, and which redirects the work | **Yes.** Its output is information that did not exist before |

So `edit → build → curl → done` is **one pass**, however many commands it took.
`audit → findings → fix → re-audit` is **staged**, because the findings changed
what got fixed.

### Trigger 2 · discarded work — and why difficulty is a symptom of it, not a factor

**Difficulty is not an input. It is a predictor of trigger 2**, because hard
problems are the ones that produce wrong diagnoses, and a wrong diagnosis *is*
discarded work.

**This is the one place scale and diff come apart**, and it is why the four-line
trailing-slash fix earns a log while a thirty-file rename does not. An hour and
three wrong diagnoses did not fit in one pass; the rename did.

The signal: *"four lines? that's it?"* from a reader of the diff means the
interesting part is the path, and the path has no other home.

**Worked the other way, on today's routing fixes:** read the code, edit, curl,
build, done. Every check was a verify — nothing came back that changed the
approach. One pass. No log, which is what Sid said before the rule existed to
say it.

### Why trigger 2 is the load-bearing one — recoverability

**"Future impact" was the fourth of the old five factors, and it is the same
question as trigger 2 asked from the other end.** A log is only worth its cost if
what it holds is **not reconstructable** from anywhere else:

| | Recoverable later from | Needs a log? |
|---|---|---|
| What changed | the diff | no |
| What it was for | the subtask | no |
| **What was tried and discarded** | **nothing** | **yes** — this is the category that disappears silently |
| **Why an alternative was rejected** | nothing | yes |
| **What a measurement returned** | only if re-run, and often the tree has moved | usually |

Weight this up sharply for anything that **changes a rule, an instruction or a
skill.** Those are applied by people and agents who will not re-derive them, they
outlive the code that motivated them, and when one turns out wrong the only way
to withdraw it is to find the reasoning that produced it. This issue is the
instance: the retraction worked *because* two reviews had been written down and
could be named and overturned. **A finding nobody recorded cannot be withdrawn —
it just quietly keeps being believed.**

### Whose hands — a weight, never a trigger

Delegated or unattended work has a gap attended work does not: **the only account
of what happened is the one the worker gives**, and a completion message is not
evidence. That is why it raises the value of recording what was actually run.

**It never triggers on its own.** One bounded job, one round, nothing found, is
still one pass — the same verdict as if you had done it yourself. This is the
factor most likely to be over-applied, because delegation *feels* like it should
be recorded; what is worth recording is what came back, not that someone else
went.

### The corollary, which matters more than the rule

**If you are reaching for an audit on something small, the mistake is the audit,
not the missing log.** The weight of the process must be proportionate to the
change. A slug update gets verified; commissioning a review for it wastes a
round and then invents a record to justify it.

This has already happened in this issue in the opposite direction — two
independent reviews commissioned on a diff, both of which read `dist/` and
neither of which opened a URL. **A verify would have caught it and an audit did
not.** Reach for the audit when you cannot predict the answer; reach for the
verify when you can, and the only question is whether you got it.

## The two failure modes this must avoid

**Opening one for a two-minute task costs more than the task.** Sid:
*"creating an agent log would be more effort."* That is not a stylistic
objection — it is the reason the rule needs a floor at all.

**And the rule must not become a checkbox.** *"If the log would only restate the
subtask, do not open it"* is the test to apply when the table above does not
obviously decide it.

# Todo list

**The rule is decided and now restructured. What remains is landing it.**
Deliberately not done in the same sitting that decided it — a rule written
straight after the conversation that produced it tends to encode the
conversation.

**What goes in the skill, exactly** — this list is the deliverable, and its
shortness is the point:

1. the question — *is there something here the finished work does not show?*
2. the three triggers
3. the two floor conditions, and that **the floor wins**
4. the limits table, including the two prohibitions
5. the verify-vs-audit distinction
6. *append to an open run; never open a second* — as a **separate** step, asked
   only after the answer is already yes

**What stays here and does not ship:** the 14 worked cases, the revision
reasoning, and the factor archaeology. Instances rot; the tracker is their home.

- [ ] Land the six items above on the surfaces
      [`010`](./010_plan-execution-needs-an-agent-log.md) changed — the issues
      skill, and `guide.ts`, its plugin-independent twin
- [ ] **Carry the reasoning, not just the verdicts.** *A log exists so a finding
      can be withdrawn* is the sentence to lead with; a rule shipped without its
      reason gets applied literally, which is exactly how
      [`010`](./010_plan-execution-needs-an-agent-log.md) came to read "always"
- [ ] Say it **at the point of use**: `agent-ks issue new-agent-log` is where
      someone is already committing to one. A line in its help text beats a
      paragraph in a reference
- [ ] Give the interactive mode its hint, **capped at once per session** — a
      prompt on every subtask is the thing Sid asked to avoid, and an uncapped
      hint becomes the noise it exists to prevent
- [ ] **Control-test both directions**, which is the acceptance test:
      a plan execution still demands a log, and a two-minute subtask no longer
      does. The [`010`](./010_plan-execution-needs-an-agent-log.md) gate must
      keep firing once the floor exists
- [ ] **Re-run the 14 cases against the new shape** and confirm every verdict is
      unchanged. That is the claim this restructure rests on — it changes what a
      reader holds in their head, not a single answer. If any verdict moves, the
      restructure is wrong rather than the case

# References

- The opposite failure, and the surfaces to edit:
  [`010`](./010_plan-execution-needs-an-agent-log.md)
- The principle this is an application of: the global orchestration reference,
  *Recording* — *"scale the record to the change, not to the effort"*
- The run that prompted it: the routing fixes on
  [`2026-06-09` `05`](../../../2026-06-09-issue-link-resolution/subtasks/05_dual-slug-url-resolution.md)
  and [`06`](../../../2026-06-09-issue-link-resolution/subtasks/06_plans-auto-resolution.md)
  — a log was scaffolded and deleted unused
