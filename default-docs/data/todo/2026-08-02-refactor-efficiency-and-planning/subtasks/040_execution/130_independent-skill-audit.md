---
title: "Audit — three neutral readers compare the old skill against the new"
status: review
---

# Overview

**The last thing that happens, and its result is stored, not acted on.**

When the skill rewrite has landed, put the **previous** version of the
`agent-ks-issues` skill and the **new** one side by side and ask three
independent readers which is better. None of them has seen this issue, this
conversation, or the reasoning behind either version.

**Store the verdicts. Do not act on them.** Acting on the audit turns it into
another round of work with no independent check of its own, and the point of this
subtask is to have one honest read of what shipped. Anything worth fixing becomes
a new subtask that Sid decides on.

**Done when** three verdicts sit in the issue's `agent-log/`, each naming which
version it preferred and why, and nothing in the skill has been changed in
response.

# References

- What the new skill is supposed to be:
  [What each section is for](../../notes/60_section-responsibilities.md) ·
  [How the skills are written](../../notes/30_skill-authoring-rules.md)
- The rewrite this audits: [`040`](./040_skill-efficiency-rules.md),
  [`030`](./030_skill-plans-section.md), [`080`](./080_skill-subtasks-by-category.md)
- Tool contract for the sol half: `neurasutra-docs/memory/codex-sol.md`
  (invocation, background discipline, the never-cancel rule)

# Todo list

- [x] Capture the **old** skill version somewhere both readable and clearly
      labelled — a git tag or a copy outside the working tree. The comparison is
      worthless if either side is ambiguous
- [x] Write **one brief**, used verbatim by all three readers
- [x] Run **Opus** — neutral subagent, no context from this issue
- [x] Run **Sonnet** — same brief
- [x] Run **Codex sol** — same brief, `--background`, `xhigh`, read-only
- [x] Store all three verdicts in the issue's `agent-log/`
- [x] **Change nothing in response.** Anything worth fixing becomes a new subtask

# Outcomes and Next Steps

**Done, and the skill is untouched.** Three verdicts stored verbatim at
[`071`](../../agent-log/020_wf_ship-the-split/working/071_verdict-opus.md) ·
[`072`](../../agent-log/020_wf_ship-the-split/working/072_verdict-sonnet.md) ·
[`073`](../../agent-log/020_wf_ship-the-split/working/073_verdict-sol.md), merged
at [`070`](../../agent-log/020_wf_ship-the-split/working/070_independent-audit.md).

| Reader | Q1 reads | Q2 coherent | Q3 structured | Q4 follow | Overall |
|---|---|---|---|---|---|
| Opus | B | B | B | B | **B** |
| Sonnet | B | **A** | B | **A** | **A** |
| sol | B | B | B | B | **B** |

**Unanimous that the new version reads better and is better structured**, all
three naming the `Holds / Does not hold` tables. **Not unanimous overall** —
Sonnet preferred the old skill, on one ground: the worked examples were never
migrated, so following the new skill can mean copying a pattern it forbids
elsewhere. The other two found the same defect and ranked it lower.

**Seven follow-up subtasks written**, all `open`, at
[`070_audit-followups/`](../070_audit-followups/00_overview.md). None acted on.

Two of them make the skill actively wrong to follow and are both mechanical:
[the unmigrated examples](../070_audit-followups/010_migrate-the-worked-examples.md)
and [nine CLI examples that error](../070_audit-followups/050_cli-examples-do-not-run.md).
One is a genuine design gap:
[what a stage's `status` means](../070_audit-followups/040_stage-status-semantics.md).

**Countable claims were verified against the files before being recorded** —
five confirmed, one reproduced, one narrowed from "flatly wrong" to an ambiguity,
and one upgraded from a style nit to a reproduced failure. Checking whether a
claim is true is not acting on it.

**No reader attacked the design.** Every finding is an execution defect — a stale
example, a wrong number, an unmigrated command. Sonnet, which preferred the old
version, still called the new architecture *"genuinely better factored"*.

> [!NOTE]
> **Sid — this is at `review`, not `done`.** What is waiting on you is which of
> the seven follow-ups to take, and in what order. Anything rejected is worth
> `dropped` with a reason, so the next reader does not re-raise it.

# Details

## The four questions, asked of both versions

The brief asks each reader to compare, not to review one in isolation:

| Question | Why it is asked |
|---|---|
| **Which reads better?** | The skill is read mid-run, under time pressure |
| **Which is more coherent and consistent?** | The old one contradicts itself in at least two places — does the new one? |
| **Which is more structured?** | Structure is the whole thesis of the rewrite; if a neutral reader cannot see it, it is not there |
| **Which would you rather follow?** | The only question that matters in practice |

Each verdict names a winner per question and gives its reason. **A reader that
says "both are fine" has not answered.**

## Why three, and why these three

Three independent readers, one brief, no sight of each other. **Union, not vote**
— if one of them finds a real incoherence, that finding stands regardless of what
the other two said. Silence is not a dissenting vote.

The mix is deliberate: two different model families and two different tiers, so a
shared blind spot is less likely than with three of the same. sol also runs in its
own shell and bills separately, so it costs almost nothing to add.

## Why "store, do not act" is the rule and not a preference

An audit acted on immediately becomes a fix round with no independent check of
its own — which is where the last several rounds of this kind went wrong. The
value here is a clean read of what actually shipped, recorded while it is still
true. Fixes are a decision for Sid, taken with the verdicts in front of him.

## Blocked on

`030`, `040` and `080` — there is nothing to compare until the new skill exists.
