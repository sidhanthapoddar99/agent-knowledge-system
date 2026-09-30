---
title: "Plans and stages"
description: "Where the order of work lives: plan folders, stage files, and the active plan."
---

A plan holds the order of work: which stages come first, what blocks what, and what each stage aims at. The work itself stays in the subtasks the stages point to.

## What a plan holds

| Holds | Never holds |
|---|---|
| The order the stages run in | What the work is. That is the subtasks' |
| What blocks what, and who each stage waits on | The status of the work. Each subtask holds its own |
| The outcome each stage aims at, in one line | A copy of the subtask list |
| Items and questions that belong to one stage | Questions that outlive the plan. Those are notes |

So a plan cannot drift away from the work, and no second copy of the order goes stale.

## The shape

```
plans/
└── 01_search-launch/            one plan
    ├── settings.json            { "title": "Search launch", "status": "in-progress" }
    ├── overview.md              the plan's introduction, never a stage
    ├── 10_index-builder.md      a stage: its number is its order and its id
    ├── 20_search-page.md
    └── 30_ranking.md
```

| Rule | Detail |
|---|---|
| `plans/` holds plan folders only | A loose file in `plans/` gets a warning |
| Each plan has a `settings.json` | It holds `title` and `status`, and may hold `description`. A missing one is a warning |
| `overview.md` is reserved | It introduces the plan: the goal, the stage order, plan-wide decisions and the final result. It is never a stage |
| Stages are flat files | A folder inside a plan gets a warning |
| Every stage has a number | A missing number is a warning. Two stages with the same number is an error |

`overview.md` and each stage use the same five sections as a [subtask](./40_subtasks.md).

## Numbering stages

Number stages `10`, `20`, `30`. To insert a stage, take a number from the middle of the gap, such as `15` between `10` and `20`, so the next insert has room too.

Refer to a stage as "stage 20". Renumbering a stage is a move: use `agentks move`, which rewrites every link to it. More than nine stages usually means two plans.

## A stage file

````markdown
---
title: "Search page"
status: in-progress
outcome: "A reader can search every docs section from the navbar"
notes: "Waits on the index builder's output format"
who: sid
subtasks:
  - "[The search box](../../subtasks/020_ui/010_search-box.md)"
  - "[The result list](../../subtasks/020_ui/020_result-list.md)"
---

Why this stage exists. One or two lines.

# 01 To Do
- [ ] The stage's own items. A small item needs no subtask.

# 02 Status and Result
What the stage produced.

# 03 References
- The agent log that ran this stage, as a link.

# 04 Decisions
- Decided (sid, 2026-10-01): a ruling taken in this stage.

# 05 Notes & Analysis
## Questions
A question only a person can answer, written in full.
````

| Field | Meaning |
|---|---|
| `outcome` | One line: what "done" means for this stage |
| `notes` | One line: why it sits here, what it waits on |
| `who` | Who the stage waits on |
| `subtasks` | The subtasks this stage covers, one link per entry |

`outcome` and `notes` may hold a link, `code` or emphasis. Point at another stage with a link, never with a bare number: "blocked on 14" means nothing once stage 14 is renumbered.

### The `subtasks` list

Each entry is exactly one markdown link to a subtask file, with nothing before or after it. The path is what counts. `agentks check issues` reports an error when an entry is not a single link, or when its path does not lead to a subtask.

`subtasks` is the only list a stage carries. Link the agent log that ran a stage in `03 References`.

## Stage status

A stage's status describes the schedule, not the work. It uses the same eight values as everything else.

| Status | On a stage |
|---|---|
| `open` | Scheduled, not started. The default |
| `blocked` | Cannot start until something outside it moves. One line of text names it |
| `in-progress` | The stage being worked now. One at a time |
| `input-needed` | Stalled on an answer only a person can give. The question is written in full |
| `review` | The stage's work is finished. The person's sign-off remains |
| `done` | The `outcome` is met |
| `dropped` | The stage will not run. One line says why. Never delete it |
| `superseded` | Its scope moved to another stage or plan. An arrow line says where |

A stage does not wait for its subtasks to reach `done`. Set it from the schedule's point of view.

## The plan page

A plan is one page in the app: its `overview.md` and every stage. A stage file has no page of its own, so a link to it lands on that stage's heading on the plan page.

## The active plan

The active plan is the highest-numbered plan whose status is not closed. agentks works it out; you never store it. Keep one plan open at a time: `agentks check issues` warns when more than one is open.

## Closing a plan

Closing a plan ends a schedule, not a piece of work, so an agent may close it. Write the closing record once, in `overview.md` under `02 Status and Result`: what shipped, what was dropped and why, and a link to the next plan. Never delete a closed plan. A plan whose scope moved into a new plan closes as `superseded`, with its arrow line.

## Who owns what

| Who | Does what |
|---|---|
| The agent | Updates stage status, items, questions and references as work lands. Adds a stage when it finds necessary work. Closes stages and the plan |
| You | Own the shape: which stages exist, their order, their outcomes |

## Commands

```bash
agentks issue new-plan 2026-10-01-search-index --name search-launch --title "Search launch"
agentks issue new-stage 2026-10-01-search-index --plan 01_search-launch --name index-builder \
  --outcome "The index builds for every docs section" --subtask 010
agentks issue new-stage 2026-10-01-search-index --plan 01_search-launch --name ranking --after 20
```

`new-stage` numbers stages in steps of ten; `--after 20` takes the middle of the gap after stage 20. `--subtask` takes a number, a name or a path, and writes each as a link in the `subtasks` list.
