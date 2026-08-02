---
title: "Audit — three neutral readers compare the old skill against the new"
status: blocked
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

- [ ] Capture the **old** skill version somewhere both readable and clearly
      labelled — a git tag or a copy outside the working tree. The comparison is
      worthless if either side is ambiguous
- [ ] Write **one brief**, used verbatim by all three readers
- [ ] Run **Opus** — neutral subagent, no context from this issue
- [ ] Run **Sonnet** — same brief
- [ ] Run **Codex sol** — same brief, `--background`, `xhigh`, read-only
- [ ] Store all three verdicts in the issue's `agent-log/`
- [ ] **Change nothing in response.** Anything worth fixing becomes a new subtask

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — the three verdicts, and any subtasks they generated.

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
