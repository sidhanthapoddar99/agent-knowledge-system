---
title: "An index is hand-written and checked by reading — not generated"
status: review
---

# Overview

**[`015`](./015_the-working-index-is-a-table-of-the-round.md) was built as a
generated table, and the generator was the mistake.** This subtask reverses that
half of it and keeps the half that was right.

The generator read each round's frontmatter; a validator compared the file
against the generator. **Both shared one blind spot** — a round stored as a
*folder* was invisible to each — so a table with a round missing was certified
correct. Reproduced on real tracked data: the demo showcase's table jumps from
`03` to `05`.

> **Two things that make the same mistake cannot check each other.** That is the
> finding, and it generalises well past this file.

Sid, 2026-08-04, on what to do instead: *"we hand write it, it's not just an
index but additional content as we're giving some brief summary — not a hard and
fast table like that."* And on the checking: a fast read-only agent that reports,
covering **not just the agent log** but every index in the tracker — subtask
indexes, `issue.md`, notes, and **plans, which is the important one.**

**Done when** nothing generates an index, the scaffolder still makes a run's
shape visible, and the way to keep an index honest is written down where the
work happens.

# References

- What it reverses:
  [`015`](./015_the-working-index-is-a-table-of-the-round.md)
- The reviews that found it:
  [Sol](../../agent-log/070_rf_tracker-ergonomics-three-fixes/02_working/044_sol-the-reviewer-that-executes.md)
  (the folder-form omission, on real data) and
  [Sonnet](../../agent-log/070_rf_tracker-ergonomics-three-fixes/02_working/042_sonnet-the-index-as-a-system.md)
  (no CI or hook runs the gate at all)
- Where the rule now lives:
  `plugins/agent-ks/skills/agent-ks-issues/references/20_sections/24_agent-logs.md`

# Todo list

- [x] Delete the generator, the `reindex` verb, its manifest entry, the staleness
      error, and the persisted `unit:` field
- [x] Keep the seeded `02_working/00_index.md` — as an empty **stub**, because the
      discoverability problem `015` opened with is real and a bare folder vanishes
      on clone
- [x] Write the checking procedure into the skill, and **not as a new tool**
- [x] Remove the four backfilled tables from the historic runs
- [x] Sweep every surface that described the generated form

# Outcomes and Next Steps

**Reversed 2026-08-04. The plugin ends up smaller than before the whole
exercise.**

| | Change |
|---|---|
| CLI verbs | **−1** — `issue reindex` gone |
| Scripts | **−2**, `+1` tiny stub |
| Frontmatter fields | **−1** — `unit:` no longer persisted |
| Validator rules | **−1** — the staleness error |
| New tools / agents / slash commands | **0** |

**Why no new tool, which was the first plan.** A read-only `/agent-ks-index-check`
agent was designed and dropped. Sid: *"additional tools create additional memory
burden… agent-ks is meant to make things simple, not more complicated."* The
check needs no new surface — it belongs to the skill that is **already loaded**
whenever someone is in the tracker. The subagent is a *pattern the skill
describes*, not a thing that ships.

**What replaced the generator**, in
[24_agent-logs.md](../../../../../../plugins/agent-ks/skills/agent-ks-issues/references/20_sections/24_agent-logs.md):
a procedure, not a script. Its first instruction is the one that matters —
**`ls` the folder two levels deep first: the filesystem is the source of truth
and the index is the claim under test.** A generator asked *"what should be
here?"* can only answer from its own assumptions, which is exactly how a missing
round got certified.

**It covers what a script never could**, and this is why it is worth having at
all: a plan stage whose scheduled subtasks are all closed while the stage still
says `in-progress`; a checklist item ticked in an index whose target file says
`open`; anything present on disk and absent from the index. Each of those
requires reading *through* a reference into another file's state.

**Deliberately not automated and deliberately not a gate.** An index is prose
with judgement in it, and a gate that fails on judgement gets worked around.

# Details

## Why the seeded stub survives the reversal

`015`'s opening problem stands on its own: a scaffolded log showed one file, so an
agent could not tell that two thirds of the structure existed and wrote
everything into the summary. Removing the generator does not remove that.

An `ls` cannot fix it either, and the distinction is worth keeping straight —
**two different agents, two different moments.** The *checker* reads a folder
that already has contents; the *author* is standing in front of a folder that has
none, so there is nothing to discover. The stub is what makes the shape visible
at the moment of use, and it has to be a file because git does not track empty
directories.

It is no longer a placeholder, either. The index Sid asked for is hand-written
with a line per round of **what that round found** — so seeding it empty *is*
starting it.
