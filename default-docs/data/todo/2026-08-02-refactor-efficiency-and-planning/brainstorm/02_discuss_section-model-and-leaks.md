---
title: "02 — The six sections, the two leaks, and one gap"
---

# The section model

Thread question: **does each section have a question only it answers?** If two
sections can both legitimately hold a fact, that fact will be written twice —
which is the disease from [01](./01_discuss_why-logs-outweigh-code.md).

## The model (Sid, 2026-08-02)

| Section | The one question it answers | Explicitly NOT |
|---|---|---|
| **Brainstorm** | *What should we do?* — unsettled | anything already decided |
| **Notes** | *What is true?* — findings, with provenance | instructions, ordering |
| **Subtasks** | *What is the work?* — definition + acceptance | ordering, progress |
| **Plans** | *What order, where are we, what is blocked* | re-describing the work |
| **Agent Log** | *What happened when we ran it* — process | findings, state |
| **Agent Memory** | *What must an agent know to operate here* — binding | history, findings |

Six genuinely distinct questions. The model holds. Two seams leak.

## Leak 1 — Notes vs Agent Memory

Both hold "true things", so both attract the same content. "Historical vs not" is
close but does not decide cases: a *finding* is a fact discovered at a moment, so
it looks historical.

**Proposed cut — fact vs instruction:**

| | Ends in | Has provenance | Example |
|---|---|---|---|
| **Note** | something **learned** | yes — date, method, who | *"main writes 1068 bytes, the worker 1071"* |
| **Memory** | something **binding** | no — it is an order | *"the `.nsd` byte path is frozen"* |

Test: if removing the date and the method would damage it, it is a note. If it
reads as an instruction with no author, it is memory.

## Leak 2 — Subtasks vs Plans, and this one is dangerous

If a plan is "an ordered set of subtasks" and subtasks already have groups, the
plan becomes **a second copy of the subtask tree**. That would institutionalise
restatement inside the very section built to cure it.

**Proposed cut — taxonomy vs schedule:**

- A **subtask group** answers *where does this belong?* A subtask sits in exactly
  one group, forever. Categorical.
- A **plan** answers *what do we do next, and what is stopping us?* A subtask may
  appear in several plans over time, or none.

Structural enforcement in
[03 — plans as references](./03_options_plans-as-references.md): the plan must
not be able to *hold* a copy of the subtask, only a reference to it.

## The gap — where does decision history live?

> **Answered (sidhantha, 2026-08-02).** Routed by **scope**, not by kind:
>
> | Scope | Home |
> |---|---|
> | Within a single iteration — *"pick A, B, C or D here"* | the iteration, in the activity's `working/` |
> | Affects more than one iteration | **the issue's `notes/`** |
>
> So `notes/` is the durable decision home, and candidate 3 (a seventh section)
> is dropped. Spec: [`notes/20_agent-log-structure.md`](../notes/20_agent-log-structure.md).

The reasoning that led there is kept below.

If agent-memory carries no historical facts, and notes carry
findings, and the log is per-run, then **a decision** — *"we chose A over B on
this date, for this reason, and here is what we rejected"* — has no obvious home.

It must have one. A decision whose reasoning is lost gets re-litigated, and in
the absence of a home it will be written into all six sections, which is exactly
how we got here.

Candidates:

1. **`notes/` with a decisions topic** — decisions are findings about ourselves,
   they have provenance and a date. Fits the "has provenance" test cleanly.
2. **The plan's closed record** — a plan closes with what shipped and what was
   dropped, and *why* naturally attaches there.
3. **A seventh section.** Rejected on sight unless 1 and 2 both fail — a new
   section is expensive (see the framework cost in `03`) and the model is already
   at the limit of what someone can hold in their head.

**Leaning 1**, with 2 carrying only the plan-scoped version (what this plan
dropped) and linking to the note for reasoning. Needs deciding before any code.
