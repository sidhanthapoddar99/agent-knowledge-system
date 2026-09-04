---
name: agent-ks-issue-logs
description: Use for any agent log in an agent-knowledge-system issue tracker — the working folder of one run, under an issue's agent-log/. Covers when a run earns a log and when it does not, who decides, the six kinds (lp loop, rf refactor, au audit, re research, it iteration, wf workflow), the file shape of each, what a log never holds, the run statuses, and the commands that scaffold one. Trigger on agent log, loop, overnight or long-horizon run, audit, several reviewers on one target, research over many segments, refactor log, iteration, workflow, handover, "where do these findings go", "so the next session can pick it up", or any file under agent-log/. For subtasks, plans, notes and the rest of the tracker use agent-ks-issues.
---

# agent-ks-issue-logs — the agent's working folders

A log does two jobs. An agent writes it for a human to read later, so it stays simple. It also stores what fits nowhere else, like an audit's two hundred findings. Every rule below follows from those two jobs.

## What a log never holds

A log that repeats the tracker gives the reviewer noise. It also makes a second copy to keep in sync. A log holds the path the run took and the bulk material. It never holds the only copy of a result.

| It goes | Not here |
|---|---|
| the result, the decisions, the caveats, the Q&A | the subtask's `02`, `04`, `05`. The subtask owns the job |
| the order of work, what blocks what | the plan |
| a conclusion another issue will cite, or an HTML report | `notes/`. The log links to it and renders no `.html` |
| a durable fact about the issue | `agent-memory/` |
| a step-by-step narration of edits | nowhere. Git holds the edits |

## When a run earns a log

Most work earns no log. When one agent does one subtask in one session, the result goes in the subtask. Open a log when:

- the work spans days, sessions or several agents, and progress must be tracked
- a run makes files worth keeping: reports, research segments, benchmarks
- the user asks for one

Do not open a log when the user edits the files by hand.

Never open a second log for work that belongs to an open log. One run's record in two folders leaves the next session two half handovers. Add a file, or a child log, to the open log. A check never earns a file. A check is a typecheck, a build, or one curl. Its answer is expected, and it changes nothing about what you did.

## The six kinds

| Kind | What it is |
|---|---|
| `lp` loop | days of work across sessions, parent of the runs done inside it |
| `rf` refactor | one refactor: the map a reader needs when names moved |
| `au` audit | several reviewers on one target, one file each |
| `re` research | many segments compared: products, approaches, standards |
| `it` iteration | odds and ends: pointers, benchmarks, scratch |
| `wf` workflow | agents in stages, each handing data to the next. Rare |

Before you create a log, open its section in [kinds.md](./references/kinds.md). That file gives the tree, the slots and the commands for each kind. Open an `au`, `rf` or `re` log yourself when its files are worth keeping, and say so in the reply. Ask before you open an `lp` or `wf` log, because each one commits days of work that the user scopes. Ask before you open an `it` log too. A folder of odds and ends that nobody asked for is clutter the user has to read.

## The shape

Every log is a folder named `NNN_<kind>_<name>/`. It holds `settings.json` and `00_index.md`. The index says in one screen what the run was for. It lists every file and every child log, one line each. It ends with the handover. `new-agent-log` writes the kind's slots into the index. A slot is a suggested file name. Nothing checks the shape of the folder. The slots exist because an agent that starts from a blank folder writes too much.

A child log nests inside the run it serves. Number it from `120` up. The engine reads a folder inside a log as a child run only when its prefix is `100` or higher. `100` and `110` stay free for a results folder or a debrief folder. Aim for two levels. Three levels is the most that stays readable.

## Status

`settings.json` holds the run's status. The status takes one of five values from [lifecycle](../agent-ks-issues/references/02_lifecycle.md): `open`, `in-progress`, `input-needed`, `done`, `dropped`. The status says whether the agent finished. It never says what the agent found. An audit that found two hundred defects is `done`. `new-agent-log` writes `in-progress` for you. You close your own log and your own rounds, because the user's ceiling rule covers issues and subtasks, not runs. A file may carry its own `status:` in its frontmatter. `agent-ks check issues` does not check the shape of the folder. It checks the values: the status, the kind code, and that the JSON and the frontmatter parse.

## Before you continue an issue

Read the open log's `00_index.md` and `agent-memory/memory.md` first. Do not repeat an approach that the handover says failed. Run `/agent-ks-index-check <path>` to check an index against its folder. Keep the index current. Add a line for every file you add. Rewrite the handover when the run moves on. A reviewer cannot recover from an index that lags behind its folder, because the index is the only map of the run. A log may carry an `assets/` folder beside the index.
