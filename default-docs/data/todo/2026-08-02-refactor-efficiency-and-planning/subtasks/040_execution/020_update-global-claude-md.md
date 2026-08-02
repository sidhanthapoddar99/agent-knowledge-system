---
title: "Update ~/.claude/CLAUDE.md"
status: review
---

# Overview

The global operating rules carry three of the six root causes the audit found.
They are outside every repo, so they cannot be fixed by a plugin release — this
subtask is a deliberate, reviewed edit to the user's own global instructions.

**Done when** the proportionality rule, the brief policy, and the audit-report
schema are updated, and each change names the audit finding it answers.

> [!NOTE]
> **All four edits were applied on 2026-08-03, on Sid's instruction** — *"apply
> all four edits to my CLAUDE.md"*. The four sections below are kept **verbatim
> as proposed**, so the record still shows what was asked for and what each one
> answers; they are now history rather than a pending diff. What actually landed
> is in *What was applied* under Outcomes.

# References

- Root causes: [the recording-overhead audit](../../notes/10_efficiency-audit-2026-08-02.md) — "Root cause" table
- Rules decided by: [Brainstorm: cutting the recording overhead](../020_brainstorm-efficiency-remedies.md) — **gate**
- The shapes the file must now describe:
  [the agent-log structure](../../notes/20_agent-log-structure.md) ·
  [the plans section](../../notes/50_plans-section-spec.md) ·
  [the responsibility split](../../notes/60_section-responsibilities.md)
- Already shipped and consistent with these edits:
  [`030`](./030_skill-plans-section.md) · [`040`](./040_skill-efficiency-rules.md)

# Todo list

- [x] Add the proportionality rule to the orchestration loop section — **edit 4**
- [x] Revise *"Instructions as files, prompts as pointers"* per the agreed brief
      policy — **edit 3**
- [x] Revise the audit-report expectations — findings-first, coverage as a line
      not an essay. **Not applicable to this file** — see *What turned out not to
      be here*
- [x] Re-point the agent-memory/plans references at the new plans section —
      **edit 2**
- [x] Re-read the whole file for rules that now contradict each other
- [x] **Confirm with Sid before writing** — this is his personal global file.
      Confirmed 2026-08-03; all four applied

# Outcomes and Next Steps

**All four edits are in `~/.claude/CLAUDE.md` as of 2026-08-03.** The file grew
332 → 352 lines. It sits at `review` rather than `done` because the ceiling on a
subtask is `review` — and because whether the new rules read correctly *in
practice*, across the other projects on this workstation, is a judgment only Sid
can make.

## What was applied

Each edit replaced its find-block verbatim; no other line of the file changed.

| Edit | Where it landed | Net |
|---|---|---:|
| 2 — the issue's memory no longer holds the plan | the Agent KS bullet list | 7 → 7 lines |
| 1 — the agent-log shape | the bullet immediately after | 3 → 9 lines |
| 4 — proportionality | `## What makes the loop work`, after *Delegate only what is large* | +8 lines |
| 3 — `summary.md` IS the brief | `## Agents and background work`, first bullet | 4 → 10 lines |

**How that was verified.** The file was copied before the first edit, and the
result diffed against that copy. The diff is exactly three hunks (edits 1 and 2
are adjacent and merge into one), and every removed line belongs to a
find-block. Nothing in Reply style, Codex Companion, Breaking code to test the
tests, What only I can answer, or Git was touched.

**One thing this deliberately did not do.** The four sections under *Details*
below were **not** rewritten into past tense or trimmed once applied. They are
the only place the reasoning lives — which finding each edit answers, and what
each one deliberately keeps. A record that shrinks to *"applied"* cannot be
audited later.

## What this unblocks

[`060`](../060_sidequest-neurasutra.md) — the NeuraSutra sidequest — named this
subtask as one of three gates, and it was the last of the three outstanding. It
is now unblocked and waiting only on Sid's word to start.

## What turned out not to be here

Two things this subtask expected to find in the global file are not in it, and
the record should say so rather than leave a todo that can never be ticked:

- **The audit-report schema** (*"Per finding: severity, `file:line`, the failure
  scenario, whether it was reproduced… also name the areas checked and found
  clean"*) lives in **NeuraSutra's** `memory/orchestration.md`, not the global
  file. It is covered by [`060`](../060_sidequest-neurasutra.md), which runs
  last. The global file's nearest equivalent — *"Nothing reported and nothing run
  means NOT REVIEWED"* — is a **correctness** rule, not a length rule, and stays.
- **The never-delete rule.** [`110`](./110_superseded-wording-sweep.md) records it
  at `~/.claude/CLAUDE.md:115`. **That is wrong** — line 115 is
  `Never below \`high\`.` in the Codex table, and
  `grep -niE "never delete|not deleted|answered|superseded"` over the whole
  332-line file returns only two unrelated hits. The rule the sweep was chasing
  lives in the *skill*, where it has now been deleted. Nothing is owed here.

# Details

---

## Edit 1 — the agent-log shape (required)

**Answers:** the audit's *six standard slots* root cause. The file currently
tells every agent on this workstation to scaffold a structure that was deleted.

**Find** (lines 78–80):

```markdown
- **Substantial work gets an activity folder** — one numbered folder holding one
  run's goal, task list and milestones. Scaffold it with the CLI, never by hand.
  A single quick edit does not need one.
```

**Replace with:**

```markdown
- **An agent log opens when work is DELEGATED, or when it runs over multiple
  rounds** — and nothing else opens one. It is one numbered folder holding a
  conclusive `summary.md`, a `working/` file per round, and a `debrief/` for what
  leaves the run. Scaffold it with the CLI, never by hand. Work you do inline
  gets a line in the plan and no folder.
- **A file exists because something was PRODUCED, not because an agent ran.** A
  round is one file however many agents it took; an agent that produced something
  substantial — an audit, a survey, a measured comparison — gets its own file
  beside it. Two executors writing code produce one file between them.
```

**Why the second bullet is not optional.** The retired rule was "one agent, one
file", which guaranteed a file per agent whether or not that agent had anything
to say. It is the same defect as the six-slot floor, one level down, and deleting
the slots without replacing this rule leaves half the volume in place.

---

## Edit 2 — the issue's memory no longer holds the plan (required)

**Answers:** `agent-memory/plans/` is gone; order is now a top-level `plans/`
section. An agent following the current text looks for a live plan in the one
place it is guaranteed not to be.

**Find** (lines 71–77):

```markdown
- **When the work is scoped to one issue, read that issue's own memory too**, not
  just the tracker entry. It holds what is already decided and what is already
  blocked: the live plan (what is left, in what order, who is waiting), the
  knowledge that is binding for that issue, and the history of how it got here.
  The tracker says what the work *is*; the issue's memory says what has already
  been settled about it — skipping it is how a decision gets re-litigated or a
  superseded plan gets followed.
```

**Replace with:**

```markdown
- **When the work is scoped to one issue, read its ACTIVE PLAN and its own memory
  too**, not just the tracker entry. The plan — `plans/`, highest-numbered one
  that is not done or dropped — holds what is left, in what order, and who is
  waiting. The issue's `agent-memory/` holds what is binding (`knowledge/`) and
  how it got here (`history/`). The tracker says what the work *is*; those two say
  what has already been settled about it — skipping them is how a decision gets
  re-litigated or a superseded ordering gets followed.
```

---

## Edit 3 — `summary.md` IS the brief (required)

**Answers:** the audit's largest single measured cost — **160 committed agent-brief
files, 2,037 lines in one day**, that nobody reads afterwards.

**Find** (lines 298–301):

```markdown
- **Instructions as files, prompts as pointers.** Write the detail once, as a
  file in the run's own folder, at goal altitude rather than code spec. The
  prompt is then three lines: read this, do it, never run a git write command,
  report as it says. Re-issues and fix rounds point at the same file.
```

**Replace with:**

```markdown
- **The run's `summary.md` IS the brief — prompts are pointers at it.** Its Goal
  and Trigger, Task List and Out of Scope already are the instruction, at goal
  altitude rather than code spec. The prompt is then three lines: read this, do
  it, never run a git write command, report as it says. Re-issues and fix rounds
  point at the same file, and it is a file that was going to exist anyway.
- **A run-specific brief never gets its own committed file.** Standing rules are
  referenced from the issue's `agent-memory/`, never re-typed into a prompt or a
  brief. Where a brief genuinely needs rephrasing for one agent — a classifier
  refusal, say — spend the prompt on the delta rather than committing a second
  copy of the run's own summary.
```

**What this deliberately keeps.** The re-issue benefit is the whole reason the
original rule exists and it survives intact: there is still one file to point a
fix round at. What ends is committing the prompt *verbatim* as the run's record,
alongside a `summary.md` that says the same thing.

---

## Edit 4 — proportionality, stated where it cannot be routed around (the new rule)

**Answers:** *nothing scales to change size.* The loop's sizing table has a
"small / mechanical / one-site → battery alone" row, but the rows around it —
"terminal, invariant-touching, or a frozen surface → 2 pairs" — match nearly
everything on a mature project, so the small row almost never fires.

**Find** (in `## What makes the loop work`, the first bullet):

```markdown
- **Delegate only what is large.** Agents are for breadth — many tool calls,
  heavy reading, a broad sweep, several big things at once. Reviews are the
  archetype. **The test: would writing the brief cost more than making the
  edit?** If yes, do it inline; surgical fixes, renames and local edits are
  yours. And one agent needs no orchestration script — that is a subagent with
  ceremony.
```

**Replace with:**

```markdown
- **Delegate only what is large.** Agents are for breadth — many tool calls,
  heavy reading, a broad sweep, several big things at once. Reviews are the
  archetype. **The test: would writing the brief cost more than making the
  edit?** If yes, do it inline; surgical fixes, renames and local edits are
  yours. And one agent needs no orchestration script — that is a subagent with
  ceremony.
- **The record scales to the CHANGE, not to the ceremony.** A one-line fix earns
  a line, not a folder; a round earns one file; an agent earns a file only if it
  produced something. The rule is structural rather than a length target: a size
  guideline gets rounded up, a rule about what opens a file does not.
- **Doubt about recording resolves to WHERE, never to HOW MUCH.** When unsure,
  still persist — in the one place that owns that fact, as a line plus a pointer.
  A run that dies with its reasoning is the worse failure, and the fix for
  verbosity was never to record less.
```

**Why it is stated as two bullets rather than a table row.** A row inside the
sizing table can be out-matched by the row below it, which is exactly what
happened to the existing small-change row. As a rule in `What makes the loop
work` it applies to every round regardless of which sizing row fired.

**The one thing this must not do.** *The tracker is the durable home; a run's
transcript is not* stays untouched, and nothing above weakens it. The audit's own
conclusion was that verification and decision records **earned** their cost; the
restatement did not. A rule that cuts recording by dropping findings has failed
even if it saves more tokens.

---

## Scope discipline

**This file is Sid's.** Propose the diff, explain each change against the finding
it answers, and get explicit sign-off before writing. It governs every project on
the workstation, not just this one — a change that helps here and hurts elsewhere
is a net loss, and only Sid can see the other projects.

Do **not** copy the new rules into any project's `CLAUDE.md` or `memory/`.
Project files link upstream; that precedence rule is what keeps a fixed rule from
going stale in five places at once.
