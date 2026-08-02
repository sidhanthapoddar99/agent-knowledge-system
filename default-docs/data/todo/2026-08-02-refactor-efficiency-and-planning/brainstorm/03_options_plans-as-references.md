---
title: "03 — Plans as references, and why ordering leaves the folder tree"
---
**Resolved → [The plans section (decided)](../notes/50_plans-section-spec.md)** — the decided spec. This thread is the
argument and is kept for the reasoning, including where it was overturned.


# Plans as references, not copies

Thread question: **how do we get a plan that cannot go stale?**

A plan is the most-read file in an active issue and the one most likely to rot,
because it duplicates state that lives elsewhere. Every convention that says
"keep it updated" loses eventually.

## The proposal

**A plan file declares ordering and blocking, and stores no status at all.**

```
Plan 002 — close the read path

1. subtasks/16_slide-type/80_mandatory-catalog     → blocks 2
2. subtasks/16_slide-type/95_read-path-followups
3. subtasks/13_memory/86_byte-stability            ← current focus
   blocked-by: rig measurement from Sid
```

Status is already a field on every subtask. If the plan *references* subtasks and
the renderer pulls their live status, then **the plan cannot drift from reality,
because it does not store reality.**

No sync rule, no staleness, no restatement — and no convention anyone has to
remember. This is the difference between an invariant that is documented and one
that is structural; only the second survives.

## What the plan uniquely holds

Everything here is information that exists **nowhere else**, which is the test
for whether a section earns its place:

- **Order** — a subtask cannot know about its siblings.
- **Blocking edges** — including blocked-on-a-human, which no status expresses.
- **Current focus** — which of the unblocked items is actually being worked.
- **Scope of this plan** — which subtasks it covers and which it deliberately
  leaves for later.

And on close: what shipped, what was dropped rather than finished, and why. See
the decision-history question in
[02](./02_discuss_section-model-and-leaks.md).

## Consequence 1 — subtasks are categorical, ordering is not theirs

**Subtasks are filed by category. Execution order and grouping-for-execution
live in the plan.** (Sid, 2026-08-02.) This follows directly: if order lived in
both, they would disagree, and the folder tree would win by being more visible.

Practical fallout that must be stated explicitly, because it is
counter-intuitive:

- **A subtask's number is a stable id and a sort key within its category. It does
  not imply sequence.** People read `010, 020, 030` as an order. Under this model
  they are labels.
- A subtask may be executed in several plans, or never.
- **This issue currently gets it wrong.** `subtasks/040_execution/00_overview.md`
  says *"reading order is execution order"* and lists a dependency chain. That
  ordering belongs in a plan; the group should only say these six are *execution*
  work. Fix when plans land — a live example of the confusion this cures.

## Consequence 2 — groups shrink, because the folder tree stops being the plan

Groups are not the disease, they are the symptom: **with no plan, the folder tree
becomes the plan.** A path like
`09_rf_memory-and-persistence/022_wf_stage-6.10-offmain-heap/113_slice3-build.md`
encodes *when* — which is the plan's job — inside a filename.

Proposed rules once plans exist:

| Section | Grouping rule |
|---|---|
| **Subtasks** | By **area** — a noun: a subsystem, a concern. **One level.** No group for fewer than ~3 leaves. |
| **Agent-log** | **Flat by default**, or mirroring plan structure (see [04](./04_discuss_agent-log-shape.md)). Never per phase or per stage invented ad hoc. |
| **Notes / brainstorm** | By topic, one level, same ~3-leaf threshold. |

The general rule: **nesting may mirror a structure that already exists, and may
never invent one.**

## Cost of the section, counted

If `plans/` becomes a top-level section rather than a folder inside
`agent-memory/`, section names are hard-coded in ~10 framework files — the loader
enumeration, route matching, static paths, sidebar, subdoc tree, note page,
sub-doc layout, panel helpers, client panel routing, and the bundled guide. Full
list in
[the execution subtask](../subtasks/040_execution/010_code-the-plans-section.md).

That is the price, not an argument against. It **is** an argument for deciding
whether a section registry is the cheaper long-term shape, since ten files
agreeing on one string is its own smell.

## Answered (sidhantha, 2026-08-02)

| Question | Answer |
|---|---|
| Top-level section, or a folder in `agent-memory/`? | **Top-level `plans/`.** Pay the ~10-file section cost |
| Who may close a plan? | **The agent may** — on its own, or when told to. Unlike a subtask's `done`, closing a plan ends a *schedule*; it is not a sign-off on work quality, so the self-certification objection does not apply |
| Is "one active plan" enforced? | **No — convention only.** Nothing validates it |
| Migration of existing `agent-memory/plans/` | **None.** One consumer, migrated by hand. Dropped from scope, and deliberately not recorded further |

**Does the renderer need framework work to pull live subtask status? No.**
Measured 2026-08-02: `IssueSubtask` already carries `slug`, `status`, `category`
and `groupPath`, and the whole array is on the issue object the plan page renders
from (`issues.ts`, `export interface IssueSubtask`). Resolving a subtask
reference to its live status is an in-memory array lookup — **no new read path,
no cross-file resolution, no cache work.** Plans-as-references is therefore
cheap, which is unusual for a structural invariant and was worth knowing before
choosing a shape.

The shape of the section itself:
[thread 06](./06_discuss_plan-file-shape.md).
