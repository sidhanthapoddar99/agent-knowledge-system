---
title: "The plan table and both sidebars, reworked on sight"
status: done
agent: claude
---

# Goal

Take the six changes Sid asked for after opening the built plans page, and make
each one structural rather than local — the table inherits its look instead of
copying it, the removed column takes its dead helpers with it, and the new field
exists on every surface that has to know about it.

# Inputs

- Sid, on the table: remove the subtask count column · columns become
  `# / Stage / Status / who / Outcome / Notes` · *"Notes — the good detailed one,
  with some message or emoji or whatever looks informative"* · make it a normal
  markdown table, with normal markdown link colour · status column centred ·
  *"Status: add hover effect"*
- Sid, on the sidebars: agent-log folders go from `NN symbol name` to
  `symbol NN Name` · plans do the same, *"simple order according to NN,
  ascending"*
- What already existed: `PlanPage.astro`, `PlanStagePage.astro`,
  `DetailSidebar.astro`, `SubdocTree.astro`, `helpers.ts`, `markdown.css`,
  `tooltip.ts`

# Expected Outcome

A table Sid asked for, a `notes:` field carried end to end, both sidebars
symbol-first, and every doc surface that described the old shape corrected —
plus the design note amended rather than rewritten.

# Outcome

## What shipped

| Change | Where |
|---|---|
| Columns → `# · Stage · Status · Who · Outcome · Notes` | `PlanPage.astro` |
| Subtask count column deleted | `PlanPage.astro`, `helpers.ts` |
| `notes:` stage field, inline markdown | `issues.ts`, `new-stage.mjs`, `check.mjs` |
| `outcome:` also inline markdown | `issues.ts`, `PlanStagePage.astro` |
| Table inherits `.markdown-content` | `PlanPage.astro`, `detail.css` |
| Status centred, hover names itself | `detail.css`, `PlanPage.astro` |
| Agent-log folder rows lead with the symbol | `SubdocTree.astro` |
| Plans list ascending, active marked not moved | `DetailSidebar.astro`, `detail.css` |

## The finding: six dead tooltips, and how they got found

Sid asked for a hover effect on Status. The icon **already carried**
`data-tip`.

`src/scripts/tooltip.ts` shows a text element's tip **only when the text is
cropped**; non-text triggers must opt in with `data-tip-always`. An SVG never
overflows, so the tip could not fire. The plans section — the newest code in the
layout — missed `data-tip-always` on **all six** of its `data-tip` sites, while
every older surface (`SubtaskTree`, `MetaSidebar`, `Comprehensive`,
`OverviewSubtasks`, `SubdocTree`) has it.

**A tooltip that never fires is indistinguishable from one nobody hovered**, so
nothing was ever going to report this. It surfaced only because Sid asked for a
feature that was already nominally present. Four of the six were on the count
chips and went away with the column; the other two are fixed.

## Deletions the column took with it

- `CATEGORY_REPRESENTATIVE` in `helpers.ts` — a 15-line status-per-category map
  with a docblock explaining a choice that no longer has a caller
- `counts` in `PlanStageResolution`, and the `CATEGORIES` / `CategoryId` imports
  that existed only to build it
- Four CSS rules for the count chips

`missing` and the broken-reference warning are untouched: that is the
correctness guard and it never depended on the count.

## The CSS trap, stated because it fails silently

`.markdown-content th, .markdown-content td { text-align: left }` is
class-plus-element — specificity `0,1,1`. A bare `.issue-plan__col-status`
(`0,1,0`) **loses to it**, so the centring would simply not apply, with no error
anywhere. The rule is written as `.issue-plan__table .issue-plan__col-status`
(`0,2,0`) to win, with the reason in a comment beside it.

## Verified in the built HTML, not by reading

```
Plan sidebar rows      kind > num > label,  01 then 02 ascending,
                       02 carries `is-current`
Agent-log folder rows  4/4 render kind > num > subgroup-name
Notes column           renders inline HTML — emoji, <strong>, <code> all present
Status cell            data-tip-always present, aria-label set, colour from
                       --status-<name>
```

Build: **938 pages, clean.** No before/after numbers — this is markup, CSS and a
frontmatter field, so there is nothing measurable and inventing a number would
be worse than saying so.

## What is NOT verified, and cannot be here

Whether a six-column table reads well on Sid's screen. Everything above says the
markup is what was asked for; only Sid can say the result is legible. That is
the open item on
[the subtask](../../../subtasks/090_plan-table-rework.md).
