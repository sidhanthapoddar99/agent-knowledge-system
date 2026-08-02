---
title: "A stage's status has no stated meaning in the skill"
status: open
---

# Overview

The plans section rests on one claim: **a plan stores no status of its own about
the work, so it cannot drift.** A stage file nonetheless carries a required
`status` field, and agents are told to update it as work lands.

Those are compatible — a stage's `status` is the **stage's own lifecycle**, not a
rollup of the subtasks it references — but **the skill never says so.** The
user-guide page does (`19_issues/05_sub-docs/09_plans.md`: *"It is the plan's
**own** lifecycle — open, running, closed — not a summary of the work inside
it"*). The skill, which is what an agent actually loads, does not.

**Done when** `28_plans.md` states what a stage's `status` means, and answers
what it should be when the subtasks it references disagree.

# References

- [reader 3 — sol](../../agent-log/020_wf_ship-the-split/working/073_verdict-sol.md)
  — found it alone, under *instructions I could not follow*
- The wording that already exists and should be mirrored:
  `default-docs/data/user-guide/19_issues/05_sub-docs/09_plans.md`
- The design: [the plans section spec](../../notes/50_plans-section-spec.md)

# Todo list

- [ ] State in `28_plans.md` that a stage's `status` is the stage's own
      lifecycle, not a derived rollup
- [ ] Answer the question sol asked: **what is a stage's status when its
      referenced subtasks disagree?** The honest answer is that it is not derived
      at all — say that, and say who sets it
- [ ] Check the same gap does not exist for a plan's own `status` in
      `settings.json`
- [x] Confirm the Subtasks column's four buckets are visibly a *different* thing
      from the stage's `status`, since they sit in the same table row —
      **resolved by deletion, 2026-08-03.** The counts column is gone
      ([the plan table rework](../090_plan-table-rework.md)), so the two
      status-shaped things no longer sit side by side. The rest of this subtask
      still stands: the stage's own `status` is still undocumented as *stored,
      not derived*

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — nothing done. This is a proposal.

# Details

## Why this is the most valuable finding in the audit

Every other finding is a stale sentence, a wrong number, or an unmigrated
example — execution defects, all cheap to fix. This one is aimed at the plans
section's **central claim**, and it is a real gap rather than a contradiction:
the distinction that resolves it exists in the project, just not in the file that
needs it.

It is also the finding most likely to have been missed by a reader with context.
Anyone who had read the design notes would supply the missing distinction from
memory and never notice its absence. **A reader with no context could not, which
is the entire reason the audit was run without one.**

## The confusion, stated plainly

A stage row in the plan table shows two status-shaped things side by side:

| What | Where it comes from |
|---|---|
| The stage's `status` | **stored** in the stage's frontmatter; set by whoever owns the stage |
| The Subtasks column (`0/1/0/3`) | **derived** by resolving the `subtasks:` references and counting live statuses |

The design is coherent: the derived half is why the plan cannot drift, and the
stored half is about the stage as a unit of schedule. But the two sit in adjacent
columns of the same row, and the file explaining them says only that plans store
no status. A reader who takes that literally cannot account for the frontmatter
field, which is what sol reported.

## The likely wording, for whoever takes it

Two sentences in `28_plans.md`, next to the `status` row of the stage-field
table: `status` is the stage's own lifecycle and nothing else. It is never
computed from the referenced subtasks, and it is allowed to disagree with them —
a stage can be `done` with an open subtask still linked, because the stage's job
was to schedule it, not to finish it.

If that last clause is *not* the intended semantics, then the field genuinely is
a rollup and the no-drift claim needs narrowing instead. **That is a design call
for whoever takes this subtask, and the audit's job was to surface that a call is
owed.**
