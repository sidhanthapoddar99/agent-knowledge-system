---
title: "The plan table, reworked on first contact"
status: done
---

# Overview

The plans section shipped on 2026-08-02 and Sid opened the built page on
2026-08-03. Four things came back, and all four are the kind of finding only a
person looking at a screen produces:

> *"we can remove the subtask count column, its not as useful"* · *"Status: add
> hover effect"* · *"make the table like the normal MD table, and the colour of
> the link in the table should match the normal link thing"* · *"content of
> status column align to center"*

Then, separately, on the sidebar:

> *"currently agent log folder sidebar looks like `NN symbol name` — make it
> `symbol NN Name`"* · *"make it same for Plans. simple order according to NN.
> `status symbol NN Name`, sorted according to NN, ascending"*

**Done when** the table has the columns Sid asked for, the `notes:` field they
need exists end to end (loader, CLI, validator, docs, skill), both sidebars lead
with their symbol, and the design record says what was reversed.

# References

- The design this revises, with its own *Revised* section appended:
  [the plans section spec](../notes/50_plans-section-spec.md)
- The round: [the plan table rework](../agent-log/020_wf_ship-the-split/02_working/120_plan-table-and-sidebar.md)
- The subtask that built the original: [code the plans section](./040_execution/010_code-the-plans-section.md)
- Obviated half of: [stage status semantics](./070_audit-followups/040_stage-status-semantics.md)

# Todo list

- [x] Columns are now **# · Stage · Status · Who · Outcome · Notes**
- [x] The subtask **count column is gone**; `CATEGORY_REPRESENTATIVE` and the
      `counts` field went with it rather than sitting unread
- [x] New `notes:` stage field — loader, `agent-ks issue new-stage --notes`,
      validator key list, both skills, the user-guide, the in-app guide
- [x] `outcome:` and `notes:` render as **inline markdown**, one implementation
      shared, so either can carry a link
- [x] The table is wrapped in `.markdown-content` instead of restating markdown
      table CSS — which is where the link colour comes from
- [x] Status column centred, and the icon **names itself on hover**
- [x] Agent-log folder rows and plan rows both lead with their symbol
- [x] Plans list in plain ascending prefix order; the active one is bold, not moved
- [x] Demo fixture carries a worked `notes:` on every stage
- [ ] **Sid to eyeball it.** Everything above is structural and was verified in
      the built HTML; whether the six-column table is too wide to read is not
      something a build can answer

# Outcomes and Next Steps

## A dead tooltip, in six places, found by asking why one did not fire

Sid asked for a hover effect on the status column. The status icon **already
had** `data-tip="in-progress"`.

The site's tooltip has one display rule, in `src/scripts/tooltip.ts`: a text
element shows its tip only when the text is **cropped**; anything that is not
text — an icon, a dot, a glyph — opts in with `data-tip-always`. An SVG icon
never overflows, so it never qualifies, and the tip never appeared.

Every older surface gets this right: `SubtaskTree`, `MetaSidebar`,
`Comprehensive`, `OverviewSubtasks`, `SubdocTree` all pass `data-tip-always`.
**The plans section — the newest code — missed it on every one of its six
`data-tip` sites**, so the whole feature was inert there and nothing said so.

| Site | Was |
|---|---|
| Plan table, status icon | tip set, never fired |
| Plan table, count chips ×4 | tip set, never fired |
| Plan table + stage page, subtask ref chips | tip set, never fired |
| Sidebar, the active-plan dot | tip set, never fired |

Fixed at all of them; the count chips were deleted instead. **A tooltip that
never fires looks exactly like a tooltip nobody hovered.** The only reason this
surfaced is that Sid asked for a feature that was already supposedly there.

## Why the count column was worth deleting rather than keeping

The tally read `0/1/0/3` per stage. The same subtasks are listed **by name, with
live status icons, one screen below** — so the column was a summary of something
already on the page, and the summary is the copy that goes wrong.

It was also the less useful of the two. `2/1/1/0` cannot say *which* subtask is
blocked, and "which one" is the question a schedule exists to answer.

Deleting it removed `CATEGORY_REPRESENTATIVE` (a 15-line mapping with a docblock)
and the `counts` field from `PlanStageResolution`. The **broken-reference
warning is untouched** — that is the correctness guard, and it was never the
count's job.

## Why `notes:` is inline markdown and not plain text

The four original columns are all structural — id, name, definition-of-done,
owner. None of them can say *why this stage sits here* or *what it is actually
waiting on*, which is what a reader arriving cold needs first.

Rendering it as inline markdown costs one shared helper and buys the thing that
matters: a note can **point at another file with a real link**. Given this
issue's own standing rule — [reference by link, never by
number](../notes/70_reference-by-link-never-by-number.md) — a Notes column that
could only hold flat text would have quietly taught the opposite.

`outcome:` was converted at the same time. Two one-line frontmatter fields with
two different capabilities is a distinction nobody could remember the reason for.

## Styling by inheritance, not by restatement

Sid asked for the table to look like a normal markdown table with normal link
colours. The tempting fix is to copy the border, header-fill, striping and link
rules from `markdown.css` into `detail.css`.

That is the exact defect this issue has spent itself removing, so instead the
table is **wrapped in `.markdown-content`** and inherits all of it. Only column
widths and the centred status cell are specified locally.

One trap worth naming: `.markdown-content th, td { text-align: left }` is a
class-plus-element selector, so a bare `.issue-plan__col-status { text-align:
center }` **loses to it**. The rule is qualified with the table class to win.
Centring silently not applying is the failure mode a build cannot catch.

## Symbol before number, in both sidebars

The symbol is the only *categorical* mark on the row and it is status-coloured.
Leading with it gives the column one vertical run of icons to scan. Behind a
number, every icon sits at a different x-offset (`9` vs `010`) and there is
nothing left to scan down.

Subtask rows already led with their status icon, so this makes agent-log folders
and plans consistent with the rows above them rather than introducing a third
arrangement.

## Sorting: the reversal worth writing down

The active plan was **pinned to the top** of the sidebar group — decided by Sid
on 2026-08-02, built as specified, and overturned by him on sight.

He is right, and the reason generalises: hoisting made the list's *order* depend
on a *derived* value. Close a plan and the list silently reorders. The prefix is
the only ordering a reader can predict, so nothing derived is allowed to move a
row — it may only mark one.
