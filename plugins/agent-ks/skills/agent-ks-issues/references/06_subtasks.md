# Subtasks — scope

A subtask is one work item and the AI handoff anchor. Each leaf file has its own status, URL and count. A subtask owns the job, start to finish: what to do, when it is done, what came out, what went wrong, what to watch for, what was decided, what was asked and answered.

| Holds | Does not hold |
|---|---|
| the work item and the detail needed to execute it | when it runs. Order is the plan's |
| links to the notes that scope it | the deliberation behind those notes |
| the result, with evidence | how the result was reached, step by step. That is the log's |
| acceptance criteria | a narration of the run |
| the decision taken | the options tried before it. Those are the log's |

The line between a subtask and a log: the subtask holds the outcome, the log holds the path. When there is no log, the subtask holds a short version of the path under `05 Notes & Analysis`. Never both.

A log never holds the only copy of a result. A log may serve many subtasks, so each subtask pulls its own conclusion back as one line under `## Result`, and links to the log for the rest.

## Category, not order

A subtask number is a stable id and a sort key inside its group. It does not imply sequence. Order lives in a [plan](07_plans.md). A subtask may be scheduled by several plans, or by none.

| Thing | Means | Does not mean |
|---|---|---|
| the group folder | an area of work, a noun: `validator`, `migration`, `ui` | a phase, a stage or a milestone |
| the number | a stable id and a sort position inside the area | when it runs, or what it depends on |

Grouping test: group by area, one level. Open a group for three or more leaves. If the group name needs the word "phase" or "step", you are writing a plan.

## Shape

Frontmatter is `title` and `status`. The body is the full [template](03_writing.md): all five sections. Skeleton: [subtask.md](../../agent-ks-cli/templates/subtask.md).

```
subtasks/
├── 010_loader-refactor.md         a leaf at the root: one job
├── 020_sidebar-tree.md
├── 030_validator/                 a group: an area of work, not a phase
│   ├── settings.json              optional { "title": "Validator" }
│   ├── 00_overview.md             optional index leaf, six or more leaves
│   ├── 010_link-form.md
│   ├── 020_template-lint.md
│   └── 030_agent-log-line.md
└── 040_docs/
    ├── 010_user-guide.md
    └── 020_release-note.md
```

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

````markdown
---
title: "Move the link checker into the plugin"
status: in-progress
---

Why this exists. What triggered it. Two or three lines, no heading.

# 01 To Do
- [ ] **Concrete item.** The things to do. Enumerable, no implied order.
    - [ ] A sub-item, with the paths it touches.
        - [ ] Nest as deep as the work needs.
- [ ] **Another item.**

## Questions
- A question only the user can answer. Present only while it is open; status is `input-needed`.

## Done when
- A plain test that says the job is complete. A list, not a checklist.
- Another test.

# 02 Status and Result
One line: where it stands now.

## Result
What came out, with evidence. Filled before the status flips to `review`.

## Agent log
none

# 03 References
- [the note that scopes it](../notes/link-rules.md)
- [the benchmark](../agent-log/030_lp_run/21_benchmark.md) as a link. The file lives in the log.

# 04 Decisions
## 01 Keep the check in the plugin
- Decided (sid, 2026-09-03): what and why. Asked whether the check belongs in the engine; the answer was no, because a consumer has no build.

# 05 Notes & Analysis
## Issues hit
What went wrong and how it was handled.

## Watch out
Caveats for the next person.

## 01 Any other point
Shared material stays in `notes/`. Link it.
````

A spec that lives only in a conversation is not a scope. Write it into `03` or `05`.

The five `#` sections are fixed. The `##` sub-heads are the standard set. Drop one you do not need. Never add a `#` section.

`## Questions` is transient. It holds only the questions still unanswered, and it sits right under the to-do list so the reader sees at once what is blocked. While it has an entry, the status is `input-needed`. When the user answers, the question is not kept: write the answer as a decision under `04`, and say in that line what was asked, so the reader knows the ruling was made for this case and why. Then delete the question. When nothing is open, delete the section. A stored question is a fact that goes stale the moment it is answered; a decision does not.

`agent-ks check issues --template` warns on a missing section, on a Review or Closed subtask whose `02` still carries the placeholder, on an `## Agent log` that is missing, is not `none`, is not exactly one link, or links to a path that does not exist, and on a `## Questions` sub-head with an entry while the status is not `input-needed`.

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
