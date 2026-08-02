---
title: "Skill — the responsibility split, and the agent-log rewrite"
status: open
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

- [ ] State the **seven section purposes** in `SKILL.md`, as one table
- [ ] Give every `references/20_sections/2N_*.md` a **"does not hold"** block —
      the half that is missing today
- [ ] Rewrite the routing guidance around the split: *which of the seven is this
      sentence?* replaces *thinking in motion / thinking settled*
- [ ] State the subtask ↔ agent-log boundary explicitly: **a subtask defines the
      work, the agent log carries it out.** Scope in one, execution in the other

## The agent-log rewrite

- [ ] Replace the six standard slots with `summary.md` + `working/` + `debrief/`
- [ ] Delete the milestone rhythm, the `MNN_` naming, the `iteration:`
      frontmatter and the `#N` badge prose — none of it exists any more
- [ ] Ship the **iteration-file head** — `# Goal` / `# Inputs` /
      `# Expected Outcome` / `# Outcome`, plus the kind → expected-outcome table
- [ ] State the **agent log opens only when work is delegated or runs over
      multiple rounds** rule — small changes are grouped, not filed
- [ ] State the audit-report rule: **conclusive in itself, plus a simplified
      table in `summary.md`**; depth below that is the agent's business

## The sweeps

- [ ] **Vocabulary: *activity* → *agent log*, and the agent log's `notes/` →
      `debrief/`.** Every occurrence across the skill — a half-done rename is
      worse than none
- [ ] Delete the four lines that mandate maximal detail (table below)
- [ ] **No superseded wording** — apply [`110`](./110_superseded-wording-sweep.md)
      to this skill as part of the same pass

## Examples and enforcement

- [ ] Ship the **large worked example** — the overnight-loop tree in
      [the spec](../../notes/20_agent-log-structure.md), verbatim
- [ ] Ship the **small** end of the bracket — a two-file agent log for a
      one-round change
- [ ] Move every template the scaffolder can carry **into the scaffolder**, and
      point the skill at it rather than restating it
- [ ] `agent-ks check skill-links` clean
- [ ] Re-read `SKILL.md` whole: does any surviving line still license an essay?
- [ ] Report the skill's line count before and after

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

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
   `working/`.
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
