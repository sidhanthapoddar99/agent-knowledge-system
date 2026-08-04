---
title: "02_working/ has no index — scaffold one, and make it say what each round was and who did it"
status: done
---

# Overview

**Two halves of one thing.** `agent-ks issue new-agent-log` seeds
`settings.json` and `01_summary.md` and nothing else — `02_working/` appears only
when the first round file is written, and `03_debrief/` only if the run produces
one. So a fresh agent log shows one file, and **a reader or agent cannot tell
that two-thirds of the structure exists.**

Sid's fix is not an empty marker. **The seeded file is an index, and it carries
the shape of the run**: a clean table of the round files saying what kind of work
each was (audit · iteration · workflow · fan-out), **who did it** — the
orchestrator, or which subagent — and how it ended.

Today `02_working/` is a flat list of filenames. Reading a run means opening
every one to find out whether it was a delegated audit, an inline round, or a
fan-out across several agents. **That information already exists in each round
file's frontmatter (`agent:`, `status:`) and is collected nowhere.**

**Done when** a freshly scaffolded agent log shows its full shape, and opening
`02_working/` answers *"what happened in this run, in order, and who did each
part"* without opening a single round file.

# References

- The scaffolders: `plugins/agent-ks/skills/agent-ks-docs/scripts/issues/new-agent-log.mjs`
  and `new-iteration.mjs`
- What the slots are:
  `plugins/agent-ks/skills/agent-ks-issues/references/20_sections/24_agent-logs.md`
- The run that surfaced it:
  [`040_wf_fix-the-tools-then-the-links`](../../agent-log/040_wf_fix-the-tools-then-the-links/01_summary.md)
- **The precedent that decides the design:**
  [the execution group's overview](../040_execution/00_overview.md) — a
  hand-typed status column that spent a day disagreeing with the files it copied

# Todo list

- [x] **Decide derived vs typed first.** Everything else follows from it — see
      Details. Recommendation: derived, or not at all
- [x] Seed `02_working/` with the index at scaffold time. **A directory alone
      will not do: git does not track empty directories**, so the folder would
      vanish on clone. That constraint is why it must be a *file*
- [x] Settle the columns. Candidate set: number · round · kind · who · status ·
      one line of what it found
- [x] `kind` needs a source. Round files carry `agent:` and `status:` but nothing
      saying *audit / iteration / workflow / fan-out* — add a field or derive it
      from the agent-log kind. **Do not guess it from the title**
- [x] `who` must distinguish **the orchestrator** from **a named subagent**, and
      handle a round that used several — a fan-out is one round with N workers,
      not N rounds
- [x] Rewrite the index on every `new-iteration`, not only at scaffold, or it is
      stale from the second round onward
- [x] **`03_debrief/` is a separate decision** — see the recommendation; do not
      seed it by reflex
- [x] Check `agent-ks check issues` accepts the index. The validator has opinions
      about numeric prefixes and agent-log anatomy; a seed that trips it is worse
      than no seed

# Outcomes and Next Steps

> [!CAUTION]
> **The generated half of this was reversed the same day it shipped, and the
> reversal is [`025`](./025_an-index-is-checked-not-generated.md).** Read it
> before acting on anything below.

**What survives:** the problem statement, and the seeded file. A scaffolded log
still shows its shape, still through `02_working/00_index.md`, still as a file
because git does not track empty directories.

**What was wrong:** *derived* was treated as the safe answer because the
alternative — a hand-typed table — had a receipt against it. The generator did
avoid that defect and introduced a worse one. It read only round files that were
**files**; a round stored as a folder was skipped silently. The staleness
validator then compared the file against that same generator, inherited the same
blind spot, and certified a table with a round missing. **Two things that make
the same mistake cannot check each other**, which no amount of determinism fixes.

Reproduced on real tracked data: the demo showcase's table jumps `03 → 05`.

**And what shipped could not carry what the index was for.** The columns restated
frontmatter. The line worth reading is what a round *found*, and no generator can
write that — so the answer was hand-written prose, checked by reading.

The run: [`070_rf_tracker-ergonomics-three-fixes`](../../agent-log/070_rf_tracker-ergonomics-three-fixes/01_summary.md).

# Details

## The one decision this turns on

**A typed table will drift, and this issue has the receipt.**

[The execution group's overview](../040_execution/00_overview.md) carried a
hand-written Status column beside fourteen subtasks. It read `review` for
thirteen rows while every one of those files already said `done` — for a day —
and its own conclusion names the cause:

> *"The defect was the duplication, not the number. A status lived in the
> frontmatter **and** in a hand-typed column, with nothing keeping the two
> honest."*

An index listing round files with their status is **the same construction**. If
an agent types it, it is wrong the moment a round's status changes and nobody
re-types it — and a stale index is worse than none, because it reads as
authoritative.

**So: derived, or not at all.** Two viable shapes:

| Shape | How | Cost |
|---|---|---|
| **Rendered** — the layout builds the table from the round files at build time | like the plan's stage chips, which resolve live and store nothing | needs layout work; no file exists on disk |
| **Regenerated** — `new-iteration` rewrites the index every round | one script, no layout change | it is a generated file; hand-edits get overwritten, and it must say so at the top |

Regenerated is the smaller change and fits the seeded-file idea. **Rendered is
the stricter answer and matches how `plans/` already solves exactly this
problem** — the plan stores no status because the renderer resolves it.

## Seed `02_working/`, but not `03_debrief/`

The two slots are not symmetric:

| Slot | Used by | If seeded and unused |
|---|---|---|
| `02_working/` | **every** run that does any work | never happens — a run with no round is not a run |
| `03_debrief/` | runs that produce a handover, proposal or artefact | an empty section on most agent logs |

Seeding `03_debrief/` everywhere creates exactly the noise a deletable
placeholder is meant to avoid — and *"delete it if you don't need it"* is a rule
that gets skipped, which is the failure mode this whole issue keeps finding. For
that slot the better fix is a line in the scaffolder's printed `next:` hint,
naming it and when to open one.

## Why the current behaviour was chosen, so it is overridden knowingly

The scaffolder's docblock states the intent: seed the minimum, let structure
appear as it is earned. That is the same instinct behind *"a change you make
inline gets a line in the plan and no folder"*, and it is a good one.

The counter-argument is that this structure **is not discoverable anywhere else
at the moment of use.** An agent scaffolds a log, sees one file, and writes
everything into it. The convention lives in a skill that may not be loaded. An
index is documentation delivered where it is needed — and the version Sid
described is more than documentation, because it also answers the question a
reader of someone else's run actually has: **how much of this was done by an
agent, and how much was judged?**

A round that ran inline and a round that fanned out to three independent auditors
are different kinds of evidence, and today they look identical from outside.
