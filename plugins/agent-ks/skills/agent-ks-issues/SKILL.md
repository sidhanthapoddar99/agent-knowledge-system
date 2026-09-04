---
name: agent-ks-issues
description: Use for any work in an agent-knowledge-system issue tracker (data/todo/ or any folder-per-issue tracker): issues, subtasks, comments, brainstorms, notes, plans, agent logs, agent memory, glossaries, the tracker vocabulary, review queues and the issue dump. Also use for audit, refactor, loop, autonomous run or discuss on a tracked issue, and to record agent progress or issue-scoped memory. Trigger on issues, tickets, subtasks, tracker, backlog, priority, component, label, status, or any file under a tracker folder. Outside the tracker (docs, blog, site config, themes, images) use agent-ks-docs.
---

# agent-ks-issues — the issue tracker

Default tracker: `data/todo/`. Every tracker has one shape. Terms: [anatomy](references/01_anatomy.md).

Source of truth: when the framework folder is present, its bundled user guide at `<framework>/default-docs/data/user-guide/19_issues/` wins over this skill. When the two disagree, follow the guide, update this skill, and tell the user.

## The one rule

No file stores a fact another file owns. Write each fact in the section that owns it. Link to it from everywhere else.

The routing test, for any sentence you are about to write: which one section owns it? One answer: that section is its home. Two answers: you are about to write it twice. Split it.

## Sections and duties

| Section | Owns | Never holds |
|---|---|---|
| `issue.md`, `settings.json` | the problem, its context, its metadata | design detail |
| `brainstorm/` | scratch: research, options, dead ends | a conclusion others cite |
| `notes/` | formal conclusions, things to refer back to | work orders |
| plan overview | the goal, what goes where, stage order, plan-level decisions and result | subtask detail |
| plan stage | its subtasks, its result, its decisions, a link to the log that ran it | a copied status |
| subtask | one work item, full template | when it runs |
| agent log | the working folder of a long run: the path, reports, caveats, the handover | the outcome. That is the subtask's |
| agent memory | agent working state: index plus topic files | decisions, the plan |
| comments | two lines and a pointer | debate |

## The four boundaries

| Boundary | The line |
|---|---|
| subtask ↔ agent log | The subtask holds the outcome. The log holds the path. A decision goes in the subtask; the options tried go in the log |
| plan ↔ subtask | The plan owns order and blocking. The subtask owns what the work is |
| notes ↔ subtask | A note states the conclusion. The subtask states what to do about it |
| brainstorm ↔ notes | Deliberation stays in brainstorm. Only the conclusion moves to notes |

## Status

Eight values, four categories, fixed in framework code. Full rule: [lifecycle](references/02_lifecycle.md).

| Category | Statuses |
|---|---|
| Not Started | `open` · `blocked` |
| In Progress | `in-progress` |
| Review | `input-needed` · `review` |
| Closed | `done` · `dropped` · `superseded` |

A run uses five: `open`, `in-progress`, `input-needed`, `done`, `dropped`.

## Never

| Never | Do instead |
|---|---|
| Write anything in frontmatter the schema does not name | Body text, or nothing |
| Put a mark, an emoji, or a status before or after a `subtasks:` link | One plain link per entry |
| Set `done` or `dropped` on an issue or a subtask | `review`, `input-needed`, or `superseded` with its `→` line |
| Restate a subtask or a plan inside a log | Link to it |
| Keep old wording next to new wording | Correct in place |
| Search the tracker with `Grep` | `agent-ks issue list` or `agent-ks find` |
| Rename or move with `mv` | `agent-ks move` |
| Write a document path in backticks | A relative markdown link with a name |
| Save a discussion nobody asked to save | Offer once |
| Open a `lp`, `wf` or `it` log without asking | Ask once, wait for yes. `au` and `rf` need no ask |
| Open a log for a one-pass change | The result goes in the subtask's `## Result` |
| Open a second log for work that belongs to an open one | Append a file there |

## Triage

| Task | Read |
|---|---|
| tree, terms, settings, vocabulary | [01_anatomy.md](references/01_anatomy.md) |
| statuses, closing authority, AI rules | [02_lifecycle.md](references/02_lifecycle.md) |
| template, frontmatter, links, prefixes | [03_writing.md](references/03_writing.md) |
| issue body, comments, glossary | [04_issue-comments-glossary.md](references/04_issue-comments-glossary.md) |
| brainstorm, notes, memory, artifacts | [05_brainstorm-notes-memory.md](references/05_brainstorm-notes-memory.md) |
| subtasks | [06_subtasks.md](references/06_subtasks.md) |
| plans and stages | [07_plans.md](references/07_plans.md) |
| agent logs | [agent-ks-issue-logs](../agent-ks-issue-logs/SKILL.md), its own skill |
| search, create, validate, move | [09_operations.md](references/09_operations.md) |
| examples | [10_examples.md](references/10_examples.md) |

## Links

Markdown mechanics and the link rule: [writing.md](../agent-ks-docs/references/writing.md). Every command and flag: [cli-toolkit.md](../agent-ks-cli/references/cli-toolkit.md). HTML artifacts: [agent-ks-artifacts](../agent-ks-artifacts/SKILL.md).
