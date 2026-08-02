---
title: "Audit follow-ups — what the three readers found"
status: open
---

# Overview

**Everything in this group came out of
[`130`](../040_execution/130_independent-skill-audit.md), and none of it has been
acted on.** Three neutral readers compared the old `agent-ks-issues` skill
against the new one, having seen neither this issue nor the reasoning behind
either version. Their verdicts are stored verbatim at
[`071`](../../agent-log/020_wf_ship-the-split/working/071_verdict-opus.md) ·
[`072`](../../agent-log/020_wf_ship-the-split/working/072_verdict-sonnet.md) ·
[`073`](../../agent-log/020_wf_ship-the-split/working/073_verdict-sol.md).

**Each subtask here is a proposal, not a plan.** They sit at `open` because the
decision to do any of them is Sid's, taken with the verdicts in front of him.

# References

- The audit that produced these: [`130`](../040_execution/130_independent-skill-audit.md)
- The three verdicts, verbatim:
  [reader 1 — Opus](../../agent-log/020_wf_ship-the-split/working/071_verdict-opus.md) ·
  [reader 2 — Sonnet](../../agent-log/020_wf_ship-the-split/working/072_verdict-sonnet.md) ·
  [reader 3 — sol](../../agent-log/020_wf_ship-the-split/working/073_verdict-sol.md)
- The merged picture and what was mechanically verified:
  [`070`](../../agent-log/020_wf_ship-the-split/working/070_independent-audit.md)
- What the skill is supposed to be:
  [What each section is for](../../notes/60_section-responsibilities.md)

# Todo list

- [ ] Sid decides which of the seven below to take, and in what order
- [ ] Anything taken gets a plan stage; anything rejected gets `dropped` with the
      reason, so the next reader does not re-raise it

# Outcomes and Next Steps

**Nothing is scheduled.** The one thing worth saying up front: **`010` and `050`
are the two that make the skill actively wrong to follow**, and they are both
mechanical. Everything else is a judgment call or a polish pass.

# Details

## The findings, merged as a union

Union, not vote — a finding stands on one reader's evidence regardless of what
the other two said. **"Verified" means the orchestrator checked the claim against
the files mechanically** before recording it; that is establishing whether a
claim is true, which is not the same as acting on it.

| # | Subtask | Found by | Verified | Severity |
|---|---|---|---|---|
| `010` | [The worked examples still teach the retired model](./010_migrate-the-worked-examples.md) | all three | **yes** — `64:31` quoted verbatim | **high** |
| `020` | [Two files disagree on who may close an agent log](./020_who-closes-an-agent-log.md) | Opus (worst passage), sol | **yes** | **high** |
| `030` | [`24_agent-logs.md` contradicts itself in four places](./030_agent-log-self-contradictions.md) | sol (worst passage), Opus | **yes** — `060_` vs `061_` | medium-high |
| `040` | [A stage's `status` has no stated meaning](./040_stage-status-semantics.md) | sol only | **yes** — absent from the skill | medium |
| `050` | [Every new CLI example is a command that errors](./050_cli-examples-do-not-run.md) | Opus (as a style nit) | **yes — reproduced** | **high** |
| `060` | [Countable defects](./060_countable-defects.md) | sol, Opus | **yes** — "Three" lists four | low |
| `070` | [Defects present in BOTH versions](./070_defects-in-both-versions.md) | Sonnet, sol | not yet | low |

## What the readers actually concluded

| Reader | Q1 reads | Q2 coherent | Q3 structured | Q4 follow | Overall |
|---|---|---|---|---|---|
| Opus | B | B | B | B | **B** |
| Sonnet | B | **A** | B | **A** | **A** |
| sol | B | B | B | B | **B** |

**Unanimous on Q1 and Q3** — every reader preferred the new version on
readability and structure, and all three named the same cause: the
`Holds / Does not hold` table at the top of each section page.

**The split on Q2 and Q4 is one disagreement, not two.** Sonnet flipped both on a
single ground: the worked examples were never migrated, so following the new
skill can mean copying a pattern it forbids elsewhere. Opus reached the same
defect independently and ranked it fourth; sol found a third instance of it. That
is `010`, and it is the most strongly corroborated finding in the audit.

**A reader that preferred the new version and still called this decisive is worth
more than the two that preferred it and did not.** Sonnet's verdict is the useful
one precisely because it went against the other two.

## What no reader complained about

Named clean areas are signal; silence is not. Across three independent reads,
**nobody argued the responsibility split itself was wrong** — not the seven
one-word purposes, not "no file stores a fact another file owns", not moving
order out of `agent-memory/` into `plans/`. sol called the ownership model
"substantially easier to navigate and operate"; Sonnet, which preferred the old
version overall, still called the new architecture "genuinely better factored"
and listed the missing plans section as a capability the old one lacks.

**Every finding in this group is an execution defect, not a design defect.** No
reader attacked the thesis. That distinction is why none of these is a
`not-ready`.
