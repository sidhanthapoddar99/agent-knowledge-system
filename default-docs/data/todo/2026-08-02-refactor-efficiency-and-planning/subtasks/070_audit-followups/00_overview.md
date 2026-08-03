---
title: "Audit follow-ups — what the three readers found"
status: done
---

# Overview

**Everything in this group came out of
[`130`](../040_execution/130_independent-skill-audit.md).** Three neutral readers
compared the old `agent-ks-issues` skill against the new one, having seen neither
this issue nor the reasoning behind either version. Their verdicts are stored
verbatim at
[`071`](../../agent-log/020_wf_ship-the-split/02_working/071_verdict-opus.md) ·
[`072`](../../agent-log/020_wf_ship-the-split/02_working/072_verdict-sonnet.md) ·
[`073`](../../agent-log/020_wf_ship-the-split/02_working/073_verdict-sol.md).

> [!NOTE]
> **All seven are now at `review`, done 2026-08-03** —
> [the round](../../agent-log/020_wf_ship-the-split/02_working/160_audit-followups.md).
> They were written as proposals for Sid to choose from; he asked for them to be
> discussed and finished in one pass instead. Every one of the seven was taken —
> six fixed, one (`050`) closed on evidence that a later sweep had already fixed
> it. Nothing was rejected, so nothing is owed a `dropped` reason.

# References

- The audit that produced these: [`130`](../040_execution/130_independent-skill-audit.md)
- The three verdicts, verbatim:
  [reader 1 — Opus](../../agent-log/020_wf_ship-the-split/02_working/071_verdict-opus.md) ·
  [reader 2 — Sonnet](../../agent-log/020_wf_ship-the-split/02_working/072_verdict-sonnet.md) ·
  [reader 3 — sol](../../agent-log/020_wf_ship-the-split/02_working/073_verdict-sol.md)
- The merged picture and what was mechanically verified:
  [`070`](../../agent-log/020_wf_ship-the-split/02_working/070_independent-audit.md)
- What the skill is supposed to be:
  [What each section is for](../../notes/60_section-responsibilities.md)

# Todo list

- [x] Sid decides which of the seven below to take, and in what order —
      **answered 2026-08-03: all of them, in one pass.** *"Can't we just discuss
      this and get it over with?"*
- [x] Anything taken gets a plan stage; anything rejected gets `dropped` with the
      reason — **nothing was rejected**, so no `dropped` reason is owed. The
      seven ran as a single round rather than as staged work

# Outcomes and Next Steps

**All seven at `review`, 2026-08-03** —
[the round](../../agent-log/020_wf_ship-the-split/02_working/160_audit-followups.md).
`done` is Sid's.

| # | Disposition |
|---|---|
| `010` | Fixed. `64_phase-index.md` rewritten whole — the earlier pass had changed one line and left the tree teaching the old model |
| `020` | Fixed. The rule has one home: `00_overview.md#closing-authority`, 14 inbound links |
| `030` | Fixed — four named contradictions plus **seven more** the end-to-end re-read found |
| `040` | Fixed. `28_plans.md` gained a stage-status section; a stage's status describes the **schedule**, never the work |
| `050` | **Already fixed** — closed on a grep showing zero remaining `--issue` examples |
| `060` | Fixed, and one claim in the subtask itself corrected: the loader `warn`s, it does not truncate silently |
| `070` | Fixed rather than dropped. The `title` claim was settled **by running a build**, and it was false |

**Two things came out of this round that were not in the audit at all**, both
recorded rather than folded away:

- [`130`](../090_silent-failure-defects/030_skill-links-checks-the-wrong-tree.md) — **`agent-ks check
  skill-links` reads the installed plugin, not the working tree.** Every
  "skill-links clean" line in this issue's record was measured against a copy
  nobody had edited.
- `42_updating.md` named `check section` — a *docs* validator — as the way to
  validate the tracker. It would pass a tracker with a broken vocabulary.

**The original assessment held up.** `010` and `050` were called *the two that
make the skill actively wrong to follow*, and that was right: `050` turned out
to be already fixed, and `010` turned out to be worse than described.

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
| `070` | [Defects present in BOTH versions](./070_defects-in-both-versions.md) | Sonnet, sol | **yes** — the `title` claim disproved by a build, 2026-08-03 | low |

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
