---
title: "Skill — the proportionality rules"
status: open
---

# Overview

Put the agreed rule set into `agent-ks-issues`, where it will actually be read
mid-run. This is the subtask that fixes the measured problem; everything else in
the group supports it.

**Done when** the skill contains a size input, a one-canonical-home rule, and a
form for a slot that is deliberately empty — and when re-reading the audited run
against the new skill would plausibly have produced ~120 lines instead of 1,928.

# References

- **How to write the rules**: [How the skills are written](../../notes/30_skill-authoring-rules.md)
  — decided; forward-looking imperatives, examples over prose, delete and
  rephrase freely, template in the scaffolder
- **What the structure is**: [The agent-log structure](../../notes/20_agent-log-structure.md)
  — decided
- Remaining open rules: [Brainstorm: cutting the recording overhead](../020_brainstorm-efficiency-remedies.md)
- Measured basis: [the recording-overhead audit](../../notes/10_efficiency-audit-2026-08-02.md)
- Global twin: [Update ~/.claude/CLAUDE.md](./020_update-global-claude-md.md) — the two
  must not contradict each other
- Skill source: `plugins/agent-ks/skills/agent-ks-issues/` — **2,412 lines**, of
  which `24_agent-logs.md` is 341 (205 prose / 68 example / 15 table)

# Todo list

- [ ] Add the proportionality rule to the agent-log section of `SKILL.md`
- [ ] Rewrite the lines that currently mandate maximal detail (below)
- [ ] Define the deliberately-empty slot form, and update the scaffolder to emit
      it
- [ ] Add the one-canonical-home rule to the routing guidance, with the
      link-instead-of-retell instruction stated concretely
- [ ] Revise `24_agent-logs.md` — the six slots, the milestone rhythm
- [ ] **Vocabulary sweep: *activity* → *agent log*, and the agent log's `notes/`
      → `debrief/`.** Every occurrence across the skill, the user-guide and
      `guide.ts` — a half-done rename is worse than none
- [ ] **Ship the iteration-file head** — `# Goal` / `# Inputs` /
      `# Expected Outcome` / `# Outcome`, plus the kind → expected-outcome table
      ([the spec](../../notes/20_agent-log-structure.md))
- [ ] **Ship the large worked example** — the overnight-loop tree in
      [the spec](../../notes/20_agent-log-structure.md), verbatim. It is a
      deliverable, not an illustration; see below
- [ ] Add a worked before/after example drawn from the audited run — the **small**
      end of the bracket
- [ ] `agent-ks check skill-links` clean
- [ ] Re-read `SKILL.md` whole: does any surviving line still license an essay?

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## Why the big example is a deliverable

The tree in [the spec](../../notes/20_agent-log-structure.md) is the case that
breaks every naive reading of the rules at once: a plan, a multi-stage overnight
loop, several workflows, and mixed work units inside each. Ship it verbatim.

It teaches five things nothing else in the skill states plainly:

1. A schedule never becomes a folder tree — plan stages stay in the plan.
2. Work units are digits, not directories.
3. A paired review is two files, and both survive.
4. One agent producing several artifacts is the only reason to nest inside
   `working/`.
5. Depth stops at four.

**With the small end, it is a bracket.** One example alone sets a floor as much
as a ceiling ([skill authoring](../../notes/30_skill-authoring-rules.md)) — ship
a two-file agent log for a one-round change alongside it, or the large one reads
as the expected size.

## The exact lines that cause the problem

These are the instructions the audit traced the behaviour to. Each is defensible
in isolation; together, with no size input anywhere, they mandate essays.

| Current text | Effect measured |
|---|---|
| *"Agent-log files are detailed, line-rich records… a few vague bullets is a malformed milestone"* | Every milestone becomes prose regardless of what happened |
| *"Every file — goal, summary, task-list, milestone, subtask — is structured, context-setting prose, never a bare dump"* | Applies to a five-line change identically to a 27k-line stage |
| *"This is an inclusive rule — whenever in doubt, persist"* | Doubt resolves toward more writing, always |
| *"Keep all six present even when blank — a stub plus a fill-me callout beats a missing slot"* | Six-file floor per agent log; the stub reads as unfinished so it gets filled |

**Do not simply soften them.** They exist because the opposite failure — a run
that records nothing and dies with its reasoning — is worse and has happened.
The fix is a **size input and a canonical-home rule**, not a weaker instruction.

## The rule that must survive intact

> *The tracker is the durable home — a run's transcript is not.*

Nothing here may make it easier for a run to die with its findings. The audit's
own conclusion was that verification and decision records earned their cost; the
**restatement** did not. A rule that cuts recording by dropping findings has
failed even if it saves more tokens.

## Acceptance — how to know it worked

Take the audited run's agent-log folder (13 files, 1,928 lines) and ask, against
the new skill: what would each file have been? If the answer is not roughly
"one agent log note plus one findings list", the rules are still not biting.

Then take the *opposite* case — a genuinely large stage — and confirm the new
rules do not shrink it. A proportionality rule that flattens everything to the
same small size is the same bug pointing the other way.
