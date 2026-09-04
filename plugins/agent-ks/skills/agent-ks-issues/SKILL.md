---
name: agent-ks-issues
description: Use for any work in an agent-knowledge-system issue tracker (data/todo/, or any folder-per-issue tracker) — issues, subtasks, plans and stages, comments, brainstorms, notes, agent memory, glossaries, the tracker vocabulary, the review queue and the issue dump. Also use for a discussion on a tracked issue, and whenever you must remember something for the next session on an issue. Trigger on issue, ticket, subtask, tracker, backlog, priority, component, label, status, plan, stage, or any file under a tracker folder, and on "where do I record this", "pick this back up", "what did we decide". Agent logs have their own skill, agent-ks-issue-logs. Outside the tracker, route it — docs pages to agent-ks-docs, a blog post to agent-ks-blog, site config or themes to agent-ks-config.
---

# agent-ks-issues — the issue tracker

Default tracker: `data/todo/`. Terms: [anatomy](references/01_anatomy.md).

Source of truth: the engine and the CLI own everything they implement — statuses, agent-log kinds, templates, commands, flags, and what renders. Verify a claim with `agent-ks help` or `agent-ks check issues`. The bundled user guide at `@root/default-docs/data/user-guide/19_issues/` wins only on convention the code does not enforce. When code and skill disagree, follow the code, correct the skill, and tell the user.

## Pick up an issue

Read these in order before you continue work. Skip a step whose folder is absent.

1. `agent-ks issue show <id>` — metadata, subtasks, logs.
2. `issue.md` — the goal and the scope.
3. `agent-memory/memory.md` — what you must not rediscover.
4. Every non-Closed log's `00_index.md`, newest first — where each run stands and its handover.
5. The [active plan](references/07_plans.md#the-active-plan) under `plans/` — its `overview.md` and its stages say what is next.

Check an index against its folder with `/agent-ks-index-check <path>`.

## Sections and duties

Each reference states what its section never holds.

| Section | Owns |
|---|---|
| `issue.md`, `settings.json` | the problem, its context, its metadata |
| `brainstorm/` | scratch: research, options, dead ends |
| `notes/` | settled conclusions |
| `plans/` | stage order, blocking, each stage's outcome, result and decisions |
| `subtasks/` | one work item, in full |
| `agent-log/` | one run: the path, the reports, the handover |
| `agent-memory/` | working state: an index plus topic files |
| `comments/` | two lines and a pointer |

## Status

Fixed in framework code. Full rule: [lifecycle](references/02_lifecycle.md).

| Category | Statuses |
|---|---|
| Not Started | `open` · `blocked` |
| In Progress | `in-progress` |
| Review | `input-needed` · `review` |
| Closed | `done` · `dropped` · `superseded` |

## Never

| Never | Do instead |
|---|---|
| Write anything in frontmatter the schema does not name | Body text, or nothing |
| Set `done` or `dropped` on an issue or a subtask | `review`, `input-needed`, or `superseded` with its `→` line |
| Keep old wording next to new wording | Correct in place |
| Search the tracker with `Grep` | `agent-ks issue list` or `agent-ks find`. `list` reads the schema and hides Closed by default |
| Rename or move with `mv` | `agent-ks move`. `mv` breaks every relative link in silence |
| Write a document path in backticks | A relative markdown link with a name |
| Save a discussion nobody asked to save | Offer once |
| Open a `lp`, `it` or `wf` log without asking | Ask once, wait for yes. `lp` and `wf` commit days the user scopes. An unasked `it` is clutter the user must read. Kinds that need no ask: [agent-ks-issue-logs](../agent-ks-issue-logs/SKILL.md) |
| Start a long run on a subtask with no why, no guardrails or no `Done when` | Scope it first: [agent-ks-qna](../agent-ks-qna/SKILL.md) |

## Triage

| Task | Read |
|---|---|
| tree, terms, settings, vocabulary | [01_anatomy.md](references/01_anatomy.md) |
| statuses, closing authority, AI rules | [02_lifecycle.md](references/02_lifecycle.md) |
| template, frontmatter, links, prefixes | [03_writing.md](references/03_writing.md) |
| issue body, comments, glossary | [04_issue-comments-glossary.md](references/04_issue-comments-glossary.md) |
| brainstorm, notes, memory, artifacts | [05_brainstorm-notes-memory.md](references/05_brainstorm-notes-memory.md) |
| subtasks | [06_subtasks.md](references/06_subtasks.md) |
| scope a subtask or stage before a long run | [agent-ks-qna](../agent-ks-qna/SKILL.md) |
| plans and stages | [07_plans.md](references/07_plans.md) |
| agent logs | [agent-ks-issue-logs](../agent-ks-issue-logs/SKILL.md) |
| search, create, validate, move | [09_operations.md](references/09_operations.md) |
| examples | [10_examples.md](references/10_examples.md) |

## Links

Markdown and the link rule: [writing.md](../agent-ks-docs/references/writing.md). Commands and flags: [cli-toolkit.md](../agent-ks-cli/references/cli-toolkit.md). HTML artifacts: [agent-ks-artifacts](../agent-ks-artifacts/SKILL.md).
