---
title: "The skill and docs rewrite"
status: done
agent: claude
---

# Goal

Subtasks 030, 040, 080 and 110 — put the responsibility split into the places it
is read: the `agent-ks-issues` skill, the bundled `guide.ts`, and the user guide.
This is the round that fixes the measured problem; everything else supports it.

# Inputs

- `notes/60_section-responsibilities.md` — the source the three restate
- `notes/20_agent-log-structure.md` — the shape
- `notes/30_skill-authoring-rules.md` — how to write the instruction

# Expected Outcome

The change, and what it touched.

# Outcome

Shipped. Detail in the four subtasks; what belongs here is what the round found
and decided.

## The measurement that matters, and the one that misleads

| | Before | After |
|---|---:|---:|
| Skill total | 2,412 | 2,718 |
| `24_agent-logs.md` prose | **205** | **160** |
| — its fenced example | 68 | **125** |
| — its table | 15 | **67** |

**The total went UP and that is not the failure it looks like.** 174 of the
increase is `28_plans.md`, a section that had no documentation at all. In the
file the audit actually named, prose fell 22% while examples grew 84% and tables
4.5× — which is the authoring rule applied, not violated. Reporting the total
alone would have been the wrong number.

## Two things the round found

**The skill contradicted itself where the sweep expected it to.**
`26_agent-memory.md` said a superseded section is deleted on one line and never
deleted on another. Both were live; the file now says it once.

**The rule kept reproducing because a scaffolder emitted it.**
`new-memory-plan.mjs` wrote the never-delete instruction into every plan file it
created. Deleting the rule from the prose without deleting the scaffolder would
have left it regenerating itself.

## One decision taken inside the round

**The "one agent, one file" rule had to be replaced, not just deleted.** Removing
the six slots without it leaves the file-per-agent floor in place, which is the
same defect one level down. Replaced with: **a file exists because something was
produced, not because an agent ran.**

## Correction

This subtask's todo listed `agent-ks check skill-links` as the gate. **That
command does not exist.** A direct link check was run instead — 0 broken links
across the skill, excluding code fences — and the subtask now records that.
