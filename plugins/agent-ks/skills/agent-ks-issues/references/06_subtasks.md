# Subtasks — scope

A subtask is one work item. It is the file an agent picks up when it takes over the work. Each leaf file has its own status, URL and count. A subtask owns the job from start to finish. It says what to do, when the job is done, what came out, what went wrong, what to watch for, what was decided, and what was asked and answered.

| Holds | Does not hold |
|---|---|
| the work item and the detail needed to execute it | when it runs. Order is the plan's |
| links to the notes that scope it | the deliberation behind those notes |
| the result, with evidence | how the result was reached, step by step. That is the log's |
| acceptance criteria | a narration of the run |
| the decision taken | the options tried before it. Those are the log's |

The line between a subtask and a log is this: the subtask holds the outcome, and the log holds the path. When there is no log, the subtask holds a short version of the path under `05 Notes & Analysis`. Never write the path in both.

A log never holds the only copy of a result. A log may serve many subtasks. So each subtask copies its own conclusion back as one line under `## Result`. It links to the log for the rest.

## Category, not order

A subtask number is a stable id and a sort key inside its group. It does not imply sequence. Order lives in a [plan](07_plans.md). A subtask may be scheduled by several plans, or by none.

| Thing | Means | Does not mean |
|---|---|---|
| the group folder | an area of work, a noun: `validator`, `migration`, `ui` | a phase, a stage or a milestone |
| the number | a stable id and a sort position inside the area | when it runs, or what it depends on |

The grouping test: group by area, one level deep. Open a group for three or more leaves. If the group name needs the word "phase" or "step", you are writing a plan, not a group.

## Shape

The frontmatter holds `title` and `status`. The body is the full [template](03_writing.md), with all five sections. The skeleton is [subtask.md](../../agent-ks-cli/templates/subtask.md).

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

A group folder has no body file. An optional `settings.json` with `{ "title": "..." }` sets its sidebar label. Folders and leaves share one numbering per level, and they sort together by number. One level is the convention. The loader's cap is 5 levels. A folder past the cap is ignored, with one console warning. The sidebar shows done/total per group, and Closed counts as done. A review dot marks any subtask in the Review category.

## Numbering

`NN_` is the default width. `NNN_` suits a large or grouped set. There the leading digit may mark the group: `110_` and `120_` in group 1, `210_` in group 2. `NNNN_` is rare. Leave gaps at either width: step 10, or step 5 for dense sets. The digit widths and the separator are in [anatomy](01_anatomy.md).

## The index leaf

A group with six or more leaves may open with an index leaf: a subtask file with the `00_` prefix. Work orders start at `10_`. Scaffold it with `agent-ks issue new-subtask <id> --group <g> --index`. It uses the same template. Its `01` holds a status table of the group. Its `03` holds the notes and rulings that govern every leaf. Its `02` stays a placeholder until the series closes.

Its status follows its siblings. It is `open` while every sibling is `open`. It is `in-progress` once any sibling has started. It is `done` once every sibling is Closed. Setting it is bookkeeping, and the ceiling is the same as for any subtask: `review` or `input-needed`. The user sets `done` ([closing authority](02_lifecycle.md)). `agent-ks check issues` warns when the stored status disagrees with the value the siblings give.

## Write a work order

The test: a competent person with none of your context can build the right thing from the file. If they would ask "but what exactly", it is not written. When the scope is still in the user's head, get it out by question and answer first. [The qna skill](../../agent-ks-qna/SKILL.md) lists the seven things a work order must answer, and where each answer goes.

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

## Guardrails
The user's limits for this job: what not to touch, what must stay true, which gate must pass.
Read them before the first step. Never edit them, except to add a limit the user stated in
conversation. They sit here because a limit is part of the work order, not a note about it.
- Do not touch the engine. The check stays in the plugin.
- Keep `agent-ks check link-form` passing after every step.

## Questions
Transient. Only questions still unanswered, so the reader sees at once what is blocked.
While one is here, the status is `input-needed`. When the user answers, do not keep the
question: write the answer as a decision under `04`, say what was asked, and delete the
question. No open question, no section. A stored question goes stale the moment it is
answered; a decision does not.
- Should the check also run in CI?

## Done when
A plain list of tests, not a checklist. The job is complete when every line holds.
- `agent-ks check link-form` passes on the user guide with the check moved.
- The engine tree has no link-checking code left.

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
- Decided (sid, 2026-09-03): what and why. When it answers a question, say what was asked:
  asked whether the check belongs in the engine; no, because a consumer has no build.

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

`agent-ks check issues --template` warns on four things:

- a section is missing
- a `review`, `done` or `superseded` subtask still carries the placeholder in its `02`
- the `## Agent log` sub-head is missing, is not `none`, is not exactly one link, or links to a path that does not exist
- the `## Questions` sub-head has an entry while the status is not `input-needed`

## Create a subtask

1. When your context on the area is thin, run the [duplicate check](09_operations.md). If it finds an existing subtask, tell the user instead of creating one.
2. Pick the area, not the phase.
3. Run `agent-ks issue new-subtask <id> --name <slug> [--group <g>] [--title <t>] [--overview <t>]`. It takes the next prefix, with a gap left for later inserts. It writes the template, and it writes `--overview` as the lead paragraph. It fills nothing else. Every section arrives as a placeholder.
4. Fill the sections yourself. Link any related item the duplicate check returned. When the scope is thin, run [the qna skill](../../agent-ks-qna/SKILL.md) before the run starts.

## Update a status

```bash
agent-ks issue set-state <issue>/subtasks/NN_<slug>.md review
agent-ks issue set-state <issue> review --subtask NN
```

Set `in-progress` when you start. Hand off at `review`, or `input-needed` with the question inline. When the scope moves into another item, set `superseded` and write the `→` line. Who may set `done` or `dropped` is in [closing authority](02_lifecycle.md).
