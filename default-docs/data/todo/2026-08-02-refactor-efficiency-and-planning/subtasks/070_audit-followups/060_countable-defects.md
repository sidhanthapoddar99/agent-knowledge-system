---
title: "Countable defects — a heading that miscounts, and three numbers that disagree"
status: done
---

# Overview

Small, mechanical, and each one checkable in seconds. Grouped into one subtask
because they share an owner and a fix shape, not because they are related.

**Done when** each item below is either corrected or dropped with a reason.

# References

- [reader 3 — sol](../../agent-log/020_wf_ship-the-split/02_working/073_verdict-sol.md)
  — the vocabulary-layer miscount and the two-round ambiguity
- [reader 1 — Opus](../../agent-log/020_wf_ship-the-split/02_working/071_verdict-opus.md)
  — the subtask depth numbers and the plan prefix width

# Todo list

- [x] **`03_overall-issue-tracker-vocabulary.md:57`** — the heading says *"Three
      vocabulary layers"* and the list has four. **Verified.** The fourth
      (per-plan-stage / per-agent-log / per-iteration-file) was added by this
      issue; the heading was not updated
- [x] **`23_subtasks.md:36,62`** — group depth given as *"one level"*, *"3 levels
      or fewer"* and *"up to 5 levels deep"*, two of them in the same line
- [x] **`24_agent-logs.md:395`** — `plans/020_decoder-and-retention/` where
      `28_plans.md` and `01_folder-layout.md` specify `plans/NN_<name>/` and every
      other example uses two digits. **Verified**
- [x] **`63_agent-loops.md:81-85`** — *"A two-round bugfix does not need any of
      this"* immediately above *"An agent log opens when work is delegated or
      runs over multiple rounds"*. See below — the fix is a word, not a rule
      change

# Outcomes and Next Steps

**All four done 2026-08-03** — [the round](../../agent-log/020_wf_ship-the-split/02_working/160_audit-followups.md).

| Site | Fix |
|---|---|
| `03_overall-issue-tracker-vocabulary.md:57` | "Three vocabulary layers" → **"Four"** |
| `23_subtasks.md:36,62` | The three conflicting caps replaced by one blockquote — see below |
| `24_agent-logs.md:395` | `plans/020_…` → `plans/02_…` |
| `63_agent-loops.md:81` | "A two-round bugfix" → **"A one-round bugfix you do yourself"** |

The `63` fix is the word-change Details argued for, not a rule change: *"any of
this"* was always defensible, and "two-round" was the only thing colliding with
the bolded rule beneath it.

## The depth blockquote — and a claim of my own that was wrong

The three caps are now one statement: **five levels is the loader's hard cap, one
level is the convention**, with what happens when you exceed it.

**Details above says the loader "silently truncates at five levels". It does
not, and I wrote that overstatement into the skill before checking the source.**
`issues.ts:1338` prints:

```
[issues] "<id>": subtasks/<path>/ exceeds the 5-level depth cap — ignored
```

That is a `console.warn` — the build still succeeds and the entries still do not
render, so the *consequence* is exactly as described, but it is not silent. The
skill now says the accurate thing: the cap is enforced by **one warning line in a
build log of hundreds of pages**, which is easy to miss but is not nothing.

Worth keeping the distinction rather than smoothing it: "silent" and "warns
somewhere nobody looks" call for different fixes. The first needs a new
diagnostic; the second needs the existing one surfaced. Recorded because the
correction is to my own just-written text, caught by reading the loader instead
of trusting the subtask that briefed me.

# Details

## The two-round one is narrower than reported

sol filed this under *flatly wrong*. Read in context it is an **ambiguity, not a
contradiction** — the passage is:

> ## When this is overkill
>
> A two-round bugfix does not need any of this. **An agent log opens when work is
> delegated or runs over multiple rounds** — otherwise the change gets a line in
> the plan and no folder at all.

*"Any of this"* refers to the whole plans + subtasks + agent-log apparatus the
example just demonstrated, not to the agent log specifically. The sentence is
defensible.

But "two-round" is literally multiple rounds, so a reader taking the bolded rule
at face value gets the opposite answer from the sentence before it — and sol, who
had no context, did. **The finding is real; the diagnosis was one notch too
strong.** Changing the example to a one-round bugfix removes the collision
without touching the rule.

Recorded this way on purpose: a follow-up subtask that repeats an overstated
severity gets fixed at the wrong altitude, and the readers' verdicts are stored
verbatim precisely so a narrowing like this is visible rather than silent.

## Why the depth numbers are worth more than they look

Three different caps in one file is a small defect with a specific consequence:
an agent that picks the largest builds a tree the loader **silently truncates at
five levels**. There is no error — the deep entries simply do not appear.

So the fix is not just picking a number. It is stating which number is the
loader's hard cap and which is the convention, and saying what happens when you
exceed the cap. A convention that reads like a limit, next to a limit that fails
silently, is the shape worth removing.
