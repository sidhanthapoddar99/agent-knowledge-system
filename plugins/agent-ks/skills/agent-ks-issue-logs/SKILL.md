---
name: agent-ks-issue-logs
description: Use for any agent log in an agent-knowledge-system issue tracker — the working folder of one run, under an issue's agent-log/. Covers when a run earns a log and when it does not, who decides, the six kinds (lp loop, rf refactor, au audit, re research, it iteration, wf workflow), the file shape of each, what a log never holds, the run statuses, and the commands that scaffold one. Trigger on agent log, loop, overnight or long-horizon run, audit, several reviewers on one target, research over many segments, refactor log, iteration, workflow, handover, "where do these findings go", "so the next session can pick it up", or any file under agent-log/. For subtasks, plans, notes and the rest of the tracker use agent-ks-issues.
---

# agent-ks-issue-logs — the agent's working folders

A log does two jobs. An agent writes it for a human to read later, so it stays simple. It also stores what fits nowhere else, like an audit's two hundred findings. Every rule below follows from those two jobs.

## What a log never holds

A log that repeats the tracker is noise for the reviewer and a second copy to keep in sync. A log holds the path and the bulk, never the only copy of a result.

| It goes | Not here |
|---|---|
| the result, the decisions, the caveats, the Q&A | the subtask's `02`, `04`, `05`. It owns the job |
| the order of work, what blocks what | the plan |
| a conclusion another issue will cite, or an HTML report | `notes/`. The log links to it and renders no `.html` |
| a durable fact about the issue | `agent-memory/` |
| a step-by-step narration of edits | nowhere. Git holds the edits |

## When a run earns a log

Most work earns none. One agent, one session, one subtask: the result goes in the subtask. Open one when:

- the work spans days, sessions or several agents, and progress must be tracked
- a run makes files worth keeping: reports, research segments, benchmarks
- the user asks for one

Stay without one when the user edits the files by hand.

Never open a second log for work that belongs to an open one: one run's record in two folders leaves the next session two half handovers. Add a file, or a child log, to the open one. A verify — a typecheck, a build, one curl — never earns a file, because its answer is expected and it changes nothing about what you did.

## The six kinds

| Kind | What it is |
|---|---|
| `lp` loop | days of work across sessions, parent of the runs done inside it |
| `rf` refactor | one refactor: the map a reader needs when names moved |
| `au` audit | several reviewers on one target, one file each |
| `re` research | many segments compared: products, approaches, standards |
| `it` iteration | odds and ends: pointers, benchmarks, scratch |
| `wf` workflow | agents in stages, each handing data to the next. Rare |

Open the row for the kind you are about to create: [kinds.md](./references/kinds.md) gives its tree, its slots and the commands. Open `au`, `rf` and `re` yourself when the files are worth keeping, and say so in the reply. Ask first for `lp` and `wf`: each commits days that the user scopes. Ask for `it` too: a miscellany nobody asked for is clutter the user has to read.

## The shape

Every log is `NNN_<kind>_<name>/` with `settings.json` and `00_index.md`. The index says in one screen what the run was for, lists every file and child one line each, and ends with the handover. `new-agent-log` writes the kind's slots into it. Nothing checks the shape; the slots exist because an agent with a blank folder writes too much.

A child log nests inside the run it serves, numbered from `120` up: the engine reads a folder inside a log as a child run only from prefix `100`, and `100` and `110` stay free for a results or debrief folder. Aim for two levels. Three is the most that stays readable.

## Status

`settings.json` holds the run's status. Five values, from [lifecycle](../agent-ks-issues/references/02_lifecycle.md): `open`, `in-progress`, `input-needed`, `done`, `dropped`. It says whether the agent finished, never what it found. An audit that found two hundred defects is `done`. `new-agent-log` writes `in-progress` for you, and you close your own log and your own rounds: the user's ceiling rule covers issues and subtasks, not runs. A file may carry its own `status:`. The shape is not checked; the values are — the status, the kind code, and that the JSON and the frontmatter parse.

## Before you continue an issue

Read the open log's `00_index.md` and `agent-memory/memory.md` first. Do not repeat an approach the handover says failed. To check an index against its folder: `/agent-ks-index-check <path>`. Keep the index current: every file you add gets its line, and you rewrite the handover when the run moves. An index that lags its folder is the one thing a reviewer cannot recover from. A log may carry an `assets/` folder beside the index.
