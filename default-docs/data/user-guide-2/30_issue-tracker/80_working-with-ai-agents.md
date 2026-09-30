---
title: "Working with AI agents"
description: "The skills that teach an agent the tracker, the rules an agent follows, and how to hand an agent a run."
---

agentks ships skills that teach an AI agent, such as Claude Code or Codex, how to read and write the tracker. A skill is a folder of instructions the agent loads when a task matches it. With the skills installed, you name an issue and the agent works within the rules on this page. This page lists the skills, the rules, and how to brief an agent for a long run.

## The skills

The skills come in the `agentks` plugin. [Getting started](../05_getting-started/01_overview.md) shows how to install it. Once installed, a skill loads on its own when the task matches: naming an issue, a subtask, a status or any file in a tracker is enough.

| Skill | Teaches the agent |
|---|---|
| `agentks-issues` | The whole tracker: the anatomy, the statuses, where each fact belongs, and when a thought earns an issue |
| `agentks-issue-logs` | Agent logs: when a run earns one, the six kinds, and the shape of each |
| `agentks-qna` | How to scope a subtask or a plan stage by question and answer before a long run |
| `agentks-quick-idea-note` | How to park a half-formed idea in the dump, as one subtask |
| `agentks-index-check` | How to check an index, such as a plan, a log's `00_index.md` or a subtask group, against the files it names. It only reports |
| `agentks-cli` | The `agentks` commands, their output and their exit codes |

The skills describe how to work. For facts that the installed version owns, such as the exact flags, they send the agent to `agentks help`, so a skill cannot fall behind the binary.

Every issue page in the app also carries a Guide, a short map of the issue anatomy. agentks builds it, so it is there even without the plugin. The skills are the full manual; the Guide is the map.

## How an agent picks up an issue

An agent reads in this order before it continues someone else's work. It skips a step when the file is absent.

1. `agentks issue context <id>`: the metadata, the active plan, the active subtasks and the recent logs, in one bounded answer.
2. `issue.md`: the goal and the scope.
3. `agent-memory/memory.md`: the facts it must not rediscover.
4. The `00_index.md` of every agent log that is not closed, newest first: where each run stands, and its handover.
5. The active plan's `overview.md` and its stages: what comes next.

## The rules an agent follows

| Rule | What it means |
|---|---|
| Set `in-progress` when starting | No ceremony: the status says work is running |
| Hand off at `review`, with evidence | A diff, test output, a screenshot or a page. Never a bare claim |
| Stuck on a question: `input-needed` | The question goes in the item, under `## Questions`. `blocked` is only for a dependency on another item |
| Never `done` or `dropped` on an issue or a subtask | Those are a person's decisions. The agent may set `superseded`, with its arrow line |
| Close its own logs, plans and stages | Those record the agent's own run and schedule |
| Search everything that is not closed, by default | It includes closed issues when the question needs history |
| Use the `agentks` commands, not text search or `mv` | The commands know the tracker's shape. `agentks move` keeps every link intact |
| Ask before opening a loop, workflow or iteration log | A loop commits days of work that you scope |
| Keep agent memory current | It writes each fact when it finds it, and corrects wrong entries in place |
| Save a conversation only when you ask | It offers once when a conversation carries decisions, and waits for your yes |

## Hand an agent a run

For a short task, naming the issue is enough: "work on subtask 20 of 2026-10-01-search-index." For a run that lasts hours, brief the agent properly first.

1. **Point at the issue and the subtask.** The skills load from there. You do not paste the tracker's rules.
2. **Scope the work before the run.** A subtask for a long run needs a reason, guardrails, a `## Done when` and its decisions written down. The `agentks-qna` skill gets these out of you by question and answer and writes them into the subtask, so the run never stops to ask.
3. **Set the stop criteria.** For example: "stop when every subtask is in review or closed, or after three approaches that make no progress, and hand the issue to review."
4. **Ask for a log when the run spans sessions.** A loop log gives the next session a handover to start from.

A well-briefed agent with the skills and the CLI can work for hours and leave a batch you can review in one sitting ([Review and close](./75_review-and-close.md)).

## An agent without the skills

A different tool, a hosted model or a narrowly briefed sub-agent may not have the skills. Give it at least these rules in its brief:

- Read `issue.md`, then `agent-memory/memory.md`, then the `00_index.md` of every agent log that is not closed, before you act.
- Set `in-progress` when you start. Hand off at `review` with evidence, or `input-needed` with the question written in the item.
- Never set `done` or `dropped` on an issue or a subtask.
- Write the result under `02 Status and Result` in the subtask, not only in a log.
- Use `agentks` commands to find, change and move tracker files.

The worst outcome is an agent that silently closes its own work. These rules prevent it.
