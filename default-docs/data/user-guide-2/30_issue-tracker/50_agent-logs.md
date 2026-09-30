---
title: "Agent logs"
description: "The record of one agent run: when a run earns a log, the six kinds, the folder shape, and the run statuses."
---

An agent log is the folder of one run: one goal, one start, one outcome. It keeps the path the run took and the material that fits nowhere else, such as an audit's two hundred findings.

## When a run earns a log

Most work earns no log. When one agent does one subtask in one session, the result goes in the subtask and that is enough. Open a log when:

- the work spans days, sessions or several agents, and progress must be tracked;
- the run produces files worth keeping, such as reports, research or benchmarks;
- you ask for one.

Never open a second log for work that belongs to a log still running. Add a file, or a child log, to that log instead.

An agent opens an audit, refactor or research log on its own when the files are worth keeping, and says so. It asks you before it opens a loop, a workflow or an iteration log, because a loop commits days of work you scope, and a folder of odds and ends nobody asked for is clutter.

## What a log never holds

| Content | Where it goes instead of the log |
|---|---|
| The result, decisions, caveats, questions and answers | The subtask the run served |
| The order of work, and what blocks what | The plan |
| A conclusion another issue will rely on, or an HTML report | `notes/`. The log links to it |
| A lasting fact about the issue | `agent-memory/` |
| A step-by-step account of edits | Nowhere. Git holds the edits |

## The six kinds

| Code | Kind | What it is |
|---|---|---|
| `lp` | loop | Days of work across sessions. It is the parent of the runs done inside it |
| `rf` | refactor | One refactor: the map a reader needs when names moved |
| `au` | audit | Several reviewers on one target, one file per reviewer |
| `re` | research | Many segments compared: products, approaches, standards |
| `it` | iteration | Odds and ends: pointers, benchmarks, scratch files |
| `wf` | workflow | Agents in stages, each handing data to the next. Rare |

An issue can add its own kinds in `agentLogKinds` ([Issue settings](./20_issue-settings.md)).

## The folder

A log is a folder named `NNN_<kind>_<name>/`, for example `010_lp_ship-search/`. It holds a `settings.json` with the run's status, and an index file, `00_index.md`.

```
agent-log/
└── 010_lp_ship-search/
    ├── settings.json            { "status": "in-progress" }
    ├── 00_index.md              the goal, every file, the handover
    ├── 05_guidelines.md         rules every agent in this loop follows
    ├── 10_findings.md           things found on the way that need a home later
    ├── 120_au_loader/           an audit done inside the loop: a child log
    │   ├── settings.json
    │   ├── 00_index.md
    │   ├── 10_codex.md          the first reviewer's findings
    │   └── 11_opus.md           the second reviewer, in the same round
    └── 130_re_search-backends/
```

**The index** says in one screen what the run was for, lists every file and child log in one line each, and ends with the **handover**: where the run stands and what the next session must read first. It is the only map of the run, so keep it current.

**Rounds and reports.** Files inside a log have free names, with two numbering conventions. A **round** is one pass of work, numbered `10_`, `20_`, `30_`. A **report** is one agent's output inside a round, numbered `11_` to `19_` in round one. That is how an audit gives each reviewer their own file.

**Child logs.** A log may hold another log for work done inside the run. agentks treats a folder inside a log as a child log only when its number is `100` or higher. Number child logs from `120` up, and keep `100` and `110` free for a results or debrief folder. Aim for two levels of logs; three is the most that stays readable.

Keep files short: an index under about 60 lines, any other file under about 40. Write one finding per line, with a link. A log may keep an `assets/` folder beside its index.

## Status

`settings.json` holds the run's status, one of five: `open`, `in-progress`, `input-needed`, `done` or `dropped`. A file inside the log may carry its own `status` in its frontmatter.

| Rule | Detail |
|---|---|
| The status says whether the agent finished | Never what it found. An audit that found two hundred defects is `done` |
| The agent closes its own log | A person's sign-off covers issues and subtasks, not runs |
| A log's `done` proves nothing about the subtask | The subtask still goes to `review`, and a person sets `done` |
| `dropped` means the run did not deliver | It crashed, was refused, or its scope moved. The handover says what happened |

`agentks check issues` checks the values in a log: the status, the kind code, and that the JSON and frontmatter parse. It does not check the folder's shape.

## Commands

```bash
# Open a loop that serves subtasks 010 and 020
agentks issue new-agent-log 2026-10-01-search-index --kind lp --name ship-search \
  --goal "Ship search for the docs sections" --for 010,020

# Open an audit inside that loop
agentks issue new-agent-log 2026-10-01-search-index --kind au --name loader \
  --group 010_lp_ship-search

# One file per reviewer: a round, then a report in the same round
agentks issue new-round 2026-10-01-search-index --log 010_lp_ship-search/120_au_loader \
  --name codex --agent codex
agentks issue new-round 2026-10-01-search-index --log 010_lp_ship-search/120_au_loader \
  --name opus --report --agent opus
```

`new-agent-log` takes the next free number, writes `settings.json` and an `00_index.md` with suggested files for the kind, and links the subtasks named in `--for`. `new-round` adds the next round file, or with `--report` the next report, and lists it in the index. Name the tool that wrote the file in `--agent`, so each finding belongs to its reviewer. `agentks issue agent-logs <issue> --last 3` lists an issue's recent logs.
