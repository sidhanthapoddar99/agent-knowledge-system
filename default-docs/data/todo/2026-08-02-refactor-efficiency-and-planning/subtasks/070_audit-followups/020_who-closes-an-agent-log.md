---
title: "Two files disagree on who may close an agent log"
status: review
---

# Overview

The skill deliberately gives one word two authorities: `done` on an **issue or
subtask** is human-only, `done` on an **agent log** is the agent's to set.
`SKILL.md` states this outright — *"Same word, opposite authority"*.

`references/00_anatomy/00_overview.md` did not get the second half. It carries
the older, unqualified rule — *"`done`/`dropped` are human-only"* — nine lines
after correctly describing the five-value run vocabulary, and its status table
still says *"Terminal; both **human-only**"* with no exception.

**Done when** exactly one file states who may set `done` on a run, and every
other mention points at it.

# References

- [reader 1 — Opus](../../agent-log/020_wf_ship-the-split/02_working/071_verdict-opus.md)
  — named this *the worst passage in my winner*, and *"I cannot pick without
  guessing"*
- [reader 3 — sol](../../agent-log/020_wf_ship-the-split/02_working/073_verdict-sol.md)
  — same defect under *what my winner does worse*
- The rule as intended: [the status vocabulary](../040_execution/100_migration-script.md)

# Todo list

- [x] Decide where the authority rule lives — one file, not two
- [x] Correct `00_overview.md:72,83` and its status table
- [x] Check `SKILL.md:167-180`, `24_agent-logs.md:327-329` and `28_plans.md:131`
      all agree with it and do not restate it
- [x] Sweep for any other copy of the AI-rules block

# Outcomes and Next Steps

**Done 2026-08-03** — [the round](../../agent-log/020_wf_ship-the-split/02_working/160_audit-followups.md).

**The rule's one home is `00_overview.md`, in a new `### Closing authority`
section — not `SKILL.md`, which is what *The likely fix* below proposed.**

The proposal assumed `SKILL.md` should keep it "because it is always loaded".
That is the wrong test. The question an agent actually arrives with is *may I
close this thing*, and it arrives while reading whichever file describes the
thing — `24_agent-logs.md` for a run, `28_plans.md` for a stage,
`23_subtasks.md` for a subtask. A rule those three link to has to sit in a file
they can all point at as a peer; `SKILL.md` is the entry point, not a reference.
So `SKILL.md` now carries a pointer and states the rule nowhere.

The section answers the question **for every kind of thing a status can sit on**,
which is what neither previous statement did:

| Status sits on | Who closes |
|---|---|
| issue / subtask | the user only; the agent's ceiling is `review` / `input-needed` |
| agent log, child log, iteration file | the agent — it records its own run |
| plan / plan stage | the agent — closing ends a *schedule*, and certifies nothing about the work |

It also settles what an agent-log `status` means, which was never written down:
it answers *did the agent finish its assignment*, never *was the news good*. A
completed audit that found five defects is `done`. `dropped` means crashed,
refused or superseded — **a run is never `dropped` for reporting bad news.**

**Fourteen inbound links from eight files** now point at
`00_overview.md#closing-authority`; the duplicate statements in `SKILL.md`,
`28_plans.md`, `23_subtasks.md`, `24_agent-logs.md`, `43_moving-restructuring.md`
and `61_multiple-subtasks.md` are gone. Anchor and links verified by grep, and
the link checker passes against the working tree.

**One decision taken rather than escalated:** `done`/`dropped` on a *plan stage*
is agent-settable. Nothing in the skill or the code stated it either way; it is
read off two facts already written — the agent may close a plan, and a stage
carries no status of the work. Reversible in one line, and it is the third row
of the table above.

**AI-rule numbering in `00_overview.md` was deliberately left stable**, because
`21_comments.md`, `41_searching.md` and `61_multiple-subtasks.md` cite those
rules by number. `SKILL.md`'s list has no inbound citations and renumbered
freely.

# Details

## What an agent does wrong because of it

Opus stated the consequence precisely:

> If I load `00_overview.md` and not `SKILL.md`, I will refuse to close my own
> agent log and hand it to the user, which is precisely the ceremony B set out to
> delete.

That is the failure mode that matters: the file is *reachable on its own*, so the
contradiction is not theoretical. An agent that loads the anatomy reference for a
folder-shape question inherits a rule the skill does not intend.

## The uncomfortable part

The block that went stale is the **AI-rules block, copied into both `SKILL.md`
and `00_overview.md`** — and the skill's own headline rule is *"No file stores a
fact another file owns."* The one fact it duplicated is the one that drifted,
inside the section whose heading calls itself *the most important rules in the
whole skill*.

That is not an argument against the rule. It is the rule's own prediction coming
true in the file that states it, which is about as clean a demonstration as the
audit could have produced.

## The likely fix, for whoever takes it

`SKILL.md` keeps the authority rule, because it is always loaded.
`00_overview.md` keeps the *vocabulary* (what the seven values mean, which five
apply to a run) and drops the authority sentence entirely, replacing it with a
pointer. Two facts, two homes, no copy.

Worth confirming that `00_overview.md` is genuinely always co-loaded with
`SKILL.md` before relying on the pointer — if it is reachable alone, a pointer is
enough but silence is not.
