# Plans — order

A plan is a schedule: order, blocking, current focus, and the scope of one round of work. Everything else about the work lives in the subtasks it references.

| Holds | Does not hold |
|---|---|
| the order stages run in | what the work is. That is the subtask's |
| what blocks what, and who each stage waits on | a status of the work. The renderer pulls live subtask status into the stage |
| the outcome each stage aims at, in one line | a copy of the subtask list |
| stage-scoped items and questions | questions that outlive the plan. Those are `notes/` |

A plan stores no status of the work, so it cannot drift from the work. No other file states order. A log that lists its rounds as a schedule copies the plan.

## Shape

```
plans/
└── 01_decoder-and-retention/       one plan
    ├── settings.json               { "title": "...", "status": "open" }
    ├── overview.md                 reserved: the intro, never a stage
    ├── 10_decoder-swap.md          a stage; the prefix is its order and its id
    ├── 20_journal-compat.md
    └── 30_retention.md
```

`plans/` holds plan folders and nothing else. `overview.md` holds all five sections of the [template](03_writing.md): the goal, what goes where, stage order, plan-level decisions, and the result. Skeleton: [plan-overview.md](../../agent-ks-cli/templates/plan-overview.md). Say "stage", not "section". A section is a top-level issue folder.

## Numbering

| Rule | Detail |
|---|---|
| stages go `10`, `20`, `30` | nine free slots between any two stages |
| insert by spreading into the gap | `20`, `23`, `26`, `29`, `30`. Do not fill from one end |
| `--after NN` takes the midpoint of the gap | the space stays even for the next insertion |
| more than nine stages | usually two plans |

Refer to a stage as "stage 20". There is no id field. A reference is a markdown path, and the path holds the prefix. Renumbering is a move: `agent-ks move` rewrites every reference, frontmatter included.

## The stage file

Frontmatter: `title`, `status`, `outcome`, `notes`, `who`, `subtasks:`. Body: all five template sections. Skeleton: [plan-stage.md](../../agent-ks-cli/templates/plan-stage.md).

````markdown
---
title: "Journal compatibility"
status: in-progress
outcome: "6.7 journals open in the new reader"
notes: "Held until [the codec lands](../01_decoder/20_codec.md)"
who: sid
subtasks:
  - "[Mandatory catalog](../../subtasks/16_slide-type/80_mandatory-catalog.md)"
  - "[Byte stability](../../subtasks/13_memory/86_byte-stability.md)"
---

Why this stage exists. One or two lines.

# 01 To Do
- [ ] The stage's items. A small item needs no subtask.

# 02 Status and Result
What the stage produced. Never a copied subtask status.

# 03 References
- [010 the section loop](../../agent-log/010_lp_implement-sections/00_index.md), the log that ran it, with an ordering label.

# 04 Decisions
- Decided (sid, 2026-09-03): a ruling taken in this stage.

# 05 Notes & Analysis
## 01 Why it sits here
What would unblock it. What was tried and rejected.

## Questions
A question only the user can answer, in full.
````

`outcome` says what "done" means here. `notes` says why it sits here, what it waits on, what would surprise a reader. Both are one line. Both render as inline markdown: a link, `code`, emphasis. Point with a link, never a number. "Blocked on 14" is unreadable once 14 is renumbered.

Keep it short, but not thin. A stage with three unexplained checkboxes leaves its reasoning unrecorded. To get the why, the outcome and the open questions out of the user before the stage runs: [the qna skill](../../agent-ks-qna/SKILL.md).

## The `subtasks:` list

A `subtasks:` entry is one plain markdown link. Nothing before it. Nothing after it. The validator errors on anything else. The path is truth; the link text is a reading aid. The renderer resolves the path and shows the subtask's live title and status. A path that resolves to nothing is a validator error, and the plan page lists it in red.

`subtasks:` is the only structured list a stage carries. An `agent-logs:` key is a validator error. Link a run from `03 References` as an ordinary link with an ordering label. `agent-ks move` rewrites it, and it can sit in a sentence that says why the run matters.

## Stage status

Same eight values as everywhere. A stage's status describes the schedule, never the work. The subtasks it references render their own status under it.

| Status | On a stage |
|---|---|
| `open` | scheduled, not started. The default `new-stage` writes |
| `blocked` | cannot start until something outside the stage moves. Name it in one line of body text. There is no `blocked-by:` field |
| `in-progress` | the stage being worked. One at a time. A second usually means two plans |
| `input-needed` | stalled on an answer only the user can give. Write the question in full in `05` |
| `review` | the stage's work is finished; what remains is the user's sign-off or decision |
| `done` | the `outcome` line is met and nothing further is scheduled |
| `dropped` | the stage will not run. One line of body says why. Never delete it |
| `superseded` | the scope moved to another stage or plan. The `→` line says where |

A stage does not wait for its subtasks to reach `done`. Set the stage from the schedule's point of view. Who may set `done` or `dropped`: [closing authority](02_lifecycle.md).

## The plan page

One plan is one page. A stage is an anchored heading on that page, `<prefix> · <title>`, with the stage body under it. The page opens with a table: `#`, Stage, Status, Who, Outcome, Notes. There is no subtask count; the subtasks appear by name with live status under each stage. Link a stage file like any other file. `…/plans/<plan>/<stage>` redirects to the heading.

## The active plan

The active plan is the highest-numbered plan whose status is not Closed. It is derived, never stored. One active plan at a time is the convention. The sidebar lists plans in ascending prefix order and marks the active one in bold. `agent-ks check issues` warns when two plans are open.

## Close a plan

Closing a plan ends a schedule, not a piece of work. Write the closing record in the overview's `02 Status and Result`. It holds what shipped, what was dropped and why, and a link to the successor plan. Write it once. Never delete a closed plan. A plan whose scope moved into a successor closes as `superseded` with the `→` line.

## Ownership

| Who | Does what |
|---|---|
| you | update stage status, items, questions and references as work lands. Add a stage when you find necessary work. Reorder. Close a stage and close the plan |
| the user | owns the shape: which stages exist, their order, their outcomes |

A plan that cannot absorb a discovery gets abandoned mid-run. Questions about one stage go in that stage's `05`. Questions that outlive every plan go in `notes/`.

## Commands

```bash
agent-ks issue new-plan <id> --name decoder-and-retention
agent-ks issue new-stage <id> --plan 01_decoder-and-retention --name retention
agent-ks issue new-stage <id> --plan 01_decoder-and-retention --name journal-compat --after 10
```

Every flag: [cli-toolkit.md](../../agent-ks-cli/references/cli-toolkit.md).

To check an index against its folder: `/agent-ks-index-check <path>`. Run it on a plan when you doubt that its stages still match the subtasks and logs they name.
