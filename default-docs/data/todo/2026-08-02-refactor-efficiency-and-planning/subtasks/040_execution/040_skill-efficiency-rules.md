---
title: "Skill — the responsibility split, and the agent-log rewrite"
status: done
---

# Overview

Put the responsibility split into `agent-ks-issues`, where it gets read mid-run.
**This is the subtask that fixes the measured problem**; everything else in the
group supports it.

The skill currently lets every section hold everything, and separately instructs
maximal detail. Both have to go, and they are one change: once each section has a
single purpose, "how much do I write" stops being a question the agent has to
answer from an adjective.

**Done when** the skill states the seven section purposes and what each section
must **not** hold; the agent-log section describes the new shape and nothing of
the old one; the vocabulary sweep is complete; a bracketing example pair ships;
and no surviving line licenses an essay.

# References

- **What the split is**: [What each section is for](../../notes/60_section-responsibilities.md)
  — the source. Decided
- **How to write the rules**: [How the skills are written](../../notes/30_skill-authoring-rules.md)
  — forward-looking imperatives, examples over prose, delete and rephrase freely,
  template in the scaffolder
- **The agent-log shape**: [The agent-log structure](../../notes/20_agent-log-structure.md)
- Measured basis: [the recording-overhead audit](../../notes/10_efficiency-audit-2026-08-02.md)
- Twins that must not contradict this:
  [`guide.ts` + user-guide](./050_docs-update-plans-section.md) ·
  [~/.claude/CLAUDE.md](./020_update-global-claude-md.md)
- Skill source: `plugins/agent-ks/skills/agent-ks-issues/` — **2,412 lines**, of
  which `24_agent-logs.md` is 341 (205 prose / 68 example / 15 table)

# Todo list

## The split

- [x] State the **seven section purposes** in `SKILL.md`, as one table
- [x] Give every `references/20_sections/2N_*.md` a **"does not hold"** block —
      the half that is missing today
- [x] Rewrite the routing guidance around the split: *which of the seven is this
      sentence?* replaces *thinking in motion / thinking settled*
- [x] State the subtask ↔ agent-log boundary explicitly: **a subtask defines the
      work, the agent log carries it out.** Scope in one, execution in the other

## The agent-log rewrite

- [x] Replace the six standard slots with three. **Renamed 2026-08-03** to
      `01_summary.md` + `02_working/` + `03_debrief/`
      ([the numbering spec](../../notes/80_agent-log-numbering-spec.md)); the
      skill's second naming sweep is below
- [x] Delete the milestone rhythm, the `MNN_` naming, the `iteration:`
      frontmatter and the `#N` badge prose — none of it exists any more
- [x] Ship the **iteration-file head** — `# Goal` / `# Inputs` /
      `# Expected Outcome` / `# Outcome`, plus the kind → expected-outcome table
- [x] State the **agent log opens only when work is delegated or runs over
      multiple rounds** rule — small changes are grouped, not filed
- [x] State the audit-report rule: **conclusive in itself, plus a simplified
      table in `01_summary.md`**; depth below that is the agent's business

## The sweeps

- [x] **Vocabulary: *activity* → *agent log*, and the agent log's `notes/` →
      `debrief/`.** Every occurrence across the skill — a half-done rename is
      worse than none
- [x] **A second naming sweep, 2026-08-03, for the same reason and done
      elsewhere.** The three slots gained prefixes and the child-agent-log rule
      became *prefix `≥ 100`* rather than *not one of the reserved names*
      ([the numbering spec](../../notes/80_agent-log-numbering-spec.md)). The
      half-done-rename argument above applied unchanged, so the sweep ran across
      the whole skill in one pass under
      [number the agent log's own slots](../100_agent-log-slot-numbering.md)
- [x] Delete the four lines that mandate maximal detail (table below)
- [x] **No superseded wording** — apply [`110`](./110_superseded-wording-sweep.md)
      to this skill as part of the same pass

## Examples and enforcement

- [x] Ship the **large worked example** — the overnight-loop tree in
      [the spec](../../notes/20_agent-log-structure.md), verbatim
- [x] Ship the **small** end of the bracket — a two-file agent log for a
      one-round change
- [x] Move every template the scaffolder can carry **into the scaffolder**, and
      point the skill at it rather than restating it
- [x] `agent-ks check skill-links` clean
- [x] Re-read `SKILL.md` whole: does any surviving line still license an essay?
- [x] Report the skill's line count before and after

# Outcomes and Next Steps

The split is in `SKILL.md` as one table of seven purposes, under the rule it
follows from: **no file stores a fact another file owns.** Every
`references/20_sections/2N_*.md` now opens with a **Holds / Does not hold**
table — the half that was missing, and the half that stops duplication.

The four boundaries that get crossed most are stated outright rather than left to
be inferred: subtask defines / agent log carries out · plan owns order / subtask
owns what · note states the conclusion / subtask states what to do · deliberation
stays in brainstorm.

## The agent-log rewrite

Gone: the six standard slots, the milestone rhythm, `MNN_` naming, the
`iteration:` field and the `#N` badge. In their place `01_summary.md` (five
sections, State first, and it **is** the brief) + `02_working/` + `03_debrief/`,
with child agent logs for sub-goals at prefix `≥ 100`.

**The three names and the child rule are as of 2026-08-03**
([the numbering spec](../../notes/80_agent-log-numbering-spec.md)). This subtask
shipped the skill with the unprefixed names and a reserved-name rule; the second
sweep that renamed them is
[number the agent log's own slots](../100_agent-log-slot-numbering.md). Nothing
about what the three slots hold changed, which is why it was a sweep and not a
rewrite.

Two rules carry the volume reduction, and the second is the one that would have
been easy to miss:

- **An agent log opens only when work is delegated or runs over multiple rounds.**
- **An iteration is a GROUP, and a file exists because something was PRODUCED,
  not because an agent ran.** The retired "one agent, one file" rule guaranteed a
  file per agent whether or not it had anything to say — the same defect as the
  six-slot floor, one level down. Deleting the slots without this would have left
  half the volume in place.

## The four essay-mandating lines

| Line | What happened |
|---|---|
| *"detailed, line-rich records… a few vague bullets is a malformed milestone"* | **Deleted.** A quality adjective with no referent; replaced by the worked-example pair |
| *"Every file … is structured, context-setting prose, never a bare dump"* | **Deleted.** It restated what the templates enforce |
| *"Keep all six present even when blank"* | **Deleted with the slots.** `new-agent-log` now emits two files, not six |
| *"whenever in doubt, persist"* | **Kept, with what doubt resolves to changed** — from *how much* to *where*, and a routing table for it |

The rule that had to survive intact — *the tracker is the durable home; a run's
transcript is not* — survives verbatim, with "persist when it is produced, not at
wrap-up" alongside it.

## The example bracket

Both ends ship, labelled: a **two-file** agent log for a one-round change (with
the debrief folder deliberately absent, called out as the correct shape rather
than an unfinished one), and the **overnight-loop tree** verbatim from the spec.
One example alone sets a floor as much as a ceiling.

Templates moved into the scaffolder where it can carry them: `new-agent-log`
emits the summary's five headings, `new-iteration` emits the four-section head
with the expected-outcome line pre-filled per work unit. The skill points at the
commands rather than restating the shapes.

## Line count — measured, and the raw number is not the story

| | Before | After |
|---|---:|---:|
| Skill total | 2,412 | 2,718 |
| — of which `28_plans.md`, a section that did not exist | — | 174 |
| `24_agent-logs.md` | 341 | 492 |
| — prose | **205** | **160** |
| — fenced example | 68 | **125** |
| — table | 15 | **67** |

**Prose fell 22% in the file the audit named, while example lines grew 84% and
table lines 4.5×.** That is the authoring rule applied rather than violated:
spend tokens on examples and structure, not prose. Reporting the total alone
would have read as a failure and been the wrong measurement.

## Verified

- Vocabulary sweep complete: `grep -rniE "activity|milestone|new-memory-plan|00_goal|01_summary|02_task_list|MNN_"`
  over the skill returns **one** hit, and it is the deliberate negative *"a
  phase, a stage, or a milestone"* in the subtasks rule.

  > [!WARNING]
  > **Do not re-run that pattern as-is after 2026-08-03.** `01_summary` is now a
  > **live** filename, not a retired marker
  > ([the numbering spec](../../notes/80_agent-log-numbering-spec.md)), so the
  > alternation would report every correct use of the new shape as a leftover.
  > Drop that one alternative before re-running; the result recorded above was
  > taken when the name was genuinely retired and still stands for that day.
- 0 broken internal links.
- `./start build` clean; `agent-ks check issues` exit 0.

# Details

## Why this is not a density rule

**Scoped originally as *the proportionality rules* — a size input, a
canonical-home rule, a deliberately-empty slot form.** That framing was replaced:
the problem is not that agents write too much, it is that no section was ever
told what it is not for, so the same fact gets written eight to twelve times.

Two consequences for how this subtask is executed:

- **There is no measured size input to add.** Proportionality is structural
  instead — an agent log opens only for delegated or multi-round work, and file
  count follows what was *produced*, not how many agents ran.
- **There is no deliberately-empty slot form to define.** The slots are gone, so
  the problem they created has gone with them.

## The exact lines that cause the problem

These are the instructions the audit traced the behaviour to. Each is defensible
in isolation; together, with no section boundaries anywhere, they mandate essays.

| Current text | Effect measured |
|---|---|
| *"Agent-log files are detailed, line-rich records… a few vague bullets is a malformed milestone"* | Every milestone becomes prose regardless of what happened |
| *"Every file — goal, summary, task-list, milestone, subtask — is structured, context-setting prose, never a bare dump"* | Applies to a five-line change identically to a 27k-line stage |
| *"This is an inclusive rule — whenever in doubt, persist"* | Doubt resolves toward more writing, always |
| *"Keep all six present even when blank — a stub plus a fill-me callout beats a missing slot"* | Six-file floor per agent log; the stub reads as unfinished so it gets filled |

**Do not simply soften them.** They exist because the opposite failure — a run
that records nothing and dies with its reasoning — is worse and has happened.
The replacement is the split plus the templates, not a weaker instruction.

The third one keeps its persistence and changes what doubt resolves to: **from
*how much* to *where*.** That is the only question with a right answer.

## The rule that must survive intact

> *The tracker is the durable home — a run's transcript is not.*

Nothing here may make it easier for a run to die with its findings. The audit's
own conclusion was that verification and decision records earned their cost; the
**restatement** did not. A rule that cuts recording by dropping findings has
failed even if it saves more tokens.

## Why the big example is a deliverable

The tree in [the spec](../../notes/20_agent-log-structure.md) is the case that
breaks every naive reading of the rules at once: a plan, a multi-stage overnight
loop, several workflows, and mixed iterations inside each. Ship it verbatim.

It teaches five things nothing else in the skill states plainly:

1. A schedule never becomes a folder tree — plan stages stay in the plan.
2. Iterations are digits, not directories.
3. **A file exists because something was produced, not because an agent ran.**
   Two executors writing code produce one iteration file between them; two
   auditors writing reports produce two, plus the iteration's own.
4. One producer making several artifacts is the only reason to nest inside
   `02_working/`.
5. Depth stops at four.

**With the small end, it is a bracket.** One example alone sets a floor as much
as a ceiling ([skill authoring](../../notes/30_skill-authoring-rules.md)) — ship
a two-file agent log for a one-round change alongside it, or the large one reads
as the expected size.

## Acceptance — how to know it worked

**The primary test is the split, not a line count.** Take an arbitrary paragraph
from a real run and ask which of the seven purposes it is. If the skill gives one
answer, it worked. If two sections could plausibly host it, the boundary is still
soft and that is where the duplication will regrow.

**Then the volume test.** Take the audited run's agent-log folder (13 files, 1,928
lines) and ask, against the new skill: what would each file have been? Roughly
one agent log note plus one findings list is the target — and the defect that run
found must still be recorded, or the rules cut the wrong thing. This is
[the back-test](../020_brainstorm-efficiency-remedies.md).

**Then the opposite case.** Confirm the new rules do not shrink a genuinely large
stage. A rule that flattens everything to the same small size is the same bug
pointing the other way.
