---
title: "An index is checked by a cheap agent, not by a human remembering to look"
status: done
---

# Overview

**An index is a claim about files that live somewhere else, so it goes stale
without anything going wrong.** Nothing errors, nothing renders badly — the claim
just quietly stops being true.

This is not one file's problem. Every one of these is an index:

| Index | How it goes stale |
|---|---|
| an agent log's `02_working/00_index.md` | a round is added and never listed |
| an agent log's `01_summary.md` todo list | rounds finish, the boxes stay unticked |
| a subtask group's `00_overview.md` | an entry closes, the overview still calls it open |
| `issue.md`, where it indexes its own sections | a note or plan is added and not mentioned |
| `notes/` and `brainstorm/` cross-references | a note graduates, the pointer stays |
| **a plan stage** | **every subtask it schedules is `done` and the stage still says `in-progress`** |

**The plan case is the important one and it is live right now** — this issue's
own active plan is stale in exactly that way.

**What this subtask builds: one report-only agent, run on demand.** Point it at a
path — an index file, or a whole issue folder — and it reads the index, reads
what the index points at, and says where the two disagree. It never edits and it
is never automatic.

**Why an agent rather than a CLI check.** The question is *does this prose still
describe those files* — reading a summary line against a file's real state, and
judging whether "the round table was built" is still a fair description of a
round that got reversed. That is not a schema rule; a validator would either miss
it or produce noise. It is also cheap: a fast model reading a folder is the right
size of tool for the job.

**Done when** a fresh session with no context can run the agent against an issue
folder and get back a list of *"this index says X, the file says Y"* — with no
edits made, and no invocation from any automation.

# References

- Where the procedure currently lives, written as instructions for whoever is
  already reading: `plugins/agent-ks/skills/agent-ks-issues/references/20_sections/24_agent-logs.md`
  → *"Keeping an index honest — a reading job, not a script"*
- The generator this replaces, and why it was withdrawn:
  [`025`](./025_an-index-is-checked-not-generated.md)
- The run that removed the generator:
  [`070_rf_tracker-ergonomics-three-fixes`](../../agent-log/070_rf_tracker-ergonomics-three-fixes/01_summary.md)

# Todo list

- [x] **Read how a Claude Code plugin defines an agent** — `agents/*.md` is
      auto-discovered and `plugin.json` needs **no field**. Frontmatter is
      `name` · `description` · `model` · `color` (all required) + optional
      `tools:` as a YAML array
- [x] Write the agent: report-only, `model: haiku`, accepts a single index file
      or a folder. `tools: [Read, Grep, Glob]` — report-only is enforced by the
      absence of a write tool, not by an instruction it could talk itself out of
- [x] Make it work on **all six index kinds** — each carries both directions
- [x] Register it so `/agent-ks-fast-index-check [path]` invokes it
- [x] Point the skill at it, manual `ls` kept as the no-plugin fallback
- [x] Control test on this issue's own active plan — **5 findings, the known
      staleness reported**
- [x] Second control test, both directions: an entry deleted from a scratch copy
      of an index is reported `MISSING`; the unmodified copy reports none

# Outcomes and Next Steps

**Built, at `review`.** Raised 2026-08-04. Sid proposed this agent earlier in the
same session; it was dropped once on a misread — *"additional tools create
additional memory burden"* was about **the CLI's eight `check` verbs**, not about
this agent. The agent is the thing that lets those shrink, so dropping it removed
the means and kept the cost.

Ships as `plugins/agent-ks/agents/agent-ks-index-checker.md` (the plugin's first
agent) plus `commands/agent-ks-fast-index-check.md`.

**The design decision worth recording: two directions, reported separately.**

```
  A   index ──► files    "is this claim still true?"   → STALE, ORPHAN, INFERENCE
  B   files ──► index    "is everything here listed?"  → MISSING
```

**B cannot be reached from A**, and that is the whole reason the listing is
mandatory rather than a warm-up: an index's own links can never lead you to an
entry it does not have, so a check that walks references returns clean over an
index missing five rounds. This is the same blind spot that let the deleted
generator and its validator certify each other — both asked *"what should be
here?"*, neither asked *"what is here?"*

**What the control tests cost, and what they bought.** Five drafts. The first
four each failed differently and none of the failures were visible by reading the
prompt:

| Draft | Failed how |
|---|---|
| 1 | found the plan-level staleness, missed three unticked boxes whose targets had closed — it treated *"the link resolves"* as the check |
| 2 | found the three boxes, lost the plan-level one |
| 3 | found the plan-level one, lost the three again |
| 4 | ran all checks and **explained every finding away** — a caveat scoped to one check had leaked onto all four |
| 5 | all five findings |

Draft 4 is the one worth remembering. The instruction said *report it and let the
reader judge*, which was correct for the inference case and licence to rationalise
everywhere else. The fix was to scope the caveat explicitly and to make the
coverage table carry **evidence rather than a verdict** — `080=done · 060=done`
instead of *"all explicitly marked NOT DONE with reasons"*. A summary of the
losing side's excuse is how a real disagreement gets talked out of existence.

**Next:** the agent is not reachable until the plugin is reinstalled — the
installed copy is frozen at 0.8.0 and has no `agents/` folder. Until then the
control tests are the only evidence it works.

# Details

## What it must not become

**It reports. It does not edit.** An index carries judgement — a one-line summary
of what a round found — and a tool that rewrites those replaces the judgement
with a restatement of the frontmatter. That is precisely the generator this
project already built, shipped, and deleted within a day
([`025`](./025_an-index-is-checked-not-generated.md)).

**It is not automatic.** No hook, no gate, no CI job. It runs when someone asks,
because a stale index is a thing to look at rather than a thing to fail a build
on.

## Why the plan case is listed separately

The other five are *"a file exists and the index does not mention it"* — findable
by comparing two lists. A stale plan stage is different: **every fact in it is
individually correct** and the conclusion is wrong. The stage links four
subtasks, all four are `done`, and the stage still reads `in-progress`. Nothing
disagrees with anything; what is missing is the inference.

That is the case a validator cannot reach and a reader can, which is the whole
argument for this being an agent.
