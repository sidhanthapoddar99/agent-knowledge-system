# Subtasks — scope

A subtask is one work item and the AI handoff anchor. Each leaf file has its own status, URL and count. A subtask defines the work. The agent log carries it out.

| Holds | Does not hold |
|---|---|
| the work item and the detail needed to execute it | when it runs. Order is the plan's |
| links to the notes that scope it | the deliberation behind those notes |
| the result, with evidence | how the result was reached, step by step. That is the log's |
| acceptance criteria | a narration of the run |

One exception: an agent log opened for one subtask only. Then the log holds the narration, and the subtask holds the result.

## Category, not order

A subtask number is a stable id and a sort key inside its group. It does not imply sequence. Order lives in a [plan](07_plans.md). A subtask may be scheduled by several plans, or by none.

| Thing | Means | Does not mean |
|---|---|---|
| the group folder | an area of work, a noun: `validator`, `migration`, `ui` | a phase, a stage or a milestone |
| the number | a stable id and a sort position inside the area | when it runs, or what it depends on |

Grouping test: group by area, one level. Open a group for three or more leaves. If the group name needs the word "phase" or "step", you are writing a plan.

## Shape

Frontmatter is `title` and `status`. The body is the full [template](03_writing.md): all five sections. Skeleton: [subtask.md](../../agent-ks-cli/templates/subtask.md).

| Rule | Detail |
|---|---|
| a group folder has no body file | an optional `settings.json` `{ "title": "..." }` sets the sidebar label |
| folders and leaves share one numbering per level | they sort interleaved |
| 5 levels is the loader's cap | past it the folder is ignored with one console warning. One level is the convention |
| the sidebar shows done/total per group | the Closed category counts as done. A review dot marks any Review subtask |

## Numbering

| Width | When |
|---|---|
| `NN_` | the baseline for most lists |
| `NNN_` | a large or grouped flat set. The leading digit may mark a group: `110_`, `120_` in group 1; `210_` in group 2 |
| `NNNN_` | rare |

Gap-number either width: step 10, or 5 for dense sets. `_` is canonical; the loader tolerates `-`. Widths coexist: `01_` and `010_` sort as 1 and 10.

## The index leaf

A group with six or more leaves may open with an index leaf: a subtask file with the `00_` prefix. Work orders start at `10_`. Scaffold it with `agent-ks issue new-subtask <id> --group <g> --index`. It uses the same template. Its `01` holds a status table of the group. Its `03` holds the notes and rulings that govern every leaf. Its `02` stays a placeholder until the series closes.

Its status is derived from its siblings: `open` while every sibling is `open`; `in-progress` once any sibling started; `done` once every sibling is Closed. Flipping it is bookkeeping. You may do it. `agent-ks check issues` warns when it disagrees with the derived value.

## Write a work order

Test: a competent person with none of your context can build the right thing from the file. If they would ask "but what exactly", it is not written.

| Section | Must hold |
|---|---|
| opening | what triggered it and what "done" looks like |
| `01 To Do` | deliverables, concrete and enumerable: which actions, what they return, what gets recorded. Include the acceptance criteria |
| `02 Status and Result` | filled before the status flips to `review`: what landed with evidence, what was deferred, next steps |
| `03 References` | the notes that scope it, the log that ran it, the brainstorm it came from. A spec that lives only in a conversation is not a scope |
| `04 Decisions` | rulings taken mid-flight, with author and date |
| `05 Notes & Analysis` | the spec, inline. Shared material stays in `notes/`; link it |

`agent-ks check issues --template` warns on a missing section, and on a Review or Closed subtask whose `02` still carries the placeholder.

## Create a subtask

1. When your context on the area is thin, run the [duplicate check](09_operations.md). If it finds an existing subtask, tell the user instead of creating one.
2. Pick the area, not the phase.
3. Run `agent-ks issue new-subtask <id> --name <slug> [--group <g>] [--title <t>]`. It takes the next gap-spaced prefix and writes the template.
4. Fill the sections. Link any related item the duplicate check returned.

## Update a status

```bash
agent-ks issue set-state <issue>/subtasks/NN_<slug>.md review
agent-ks issue set-state <issue> review --subtask NN
```

Set `in-progress` when you start. Hand off at `review`, or `input-needed` with the question inline. When the scope moves into another item, set `superseded` and write the `→` line. Who may set `done` or `dropped`: [closing authority](02_lifecycle.md).

## Rapid mechanical changes

For a burst of small changes, one subtask serves as a running checklist. Create it once. Append one line per change. Tick them off. When each change carries reasoning worth keeping, open one agent log of kind `it` instead. When unsure, ask.
