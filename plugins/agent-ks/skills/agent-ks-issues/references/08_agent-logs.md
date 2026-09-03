# Agent logs — the working folder of a long run

An agent log is the working folder of one long run. It holds what several agents or several sessions need to hand work to each other: findings, caveats, reports, benchmarks. It is a handover, not a diary. A finding nobody wrote down cannot be retracted.

| Holds | Does not hold |
|---|---|
| the goal and who asked, in two lines | the scope. That is the subtask's |
| the path: what was tried, what came back, what was thrown away | the outcome. That goes to the subtask's `## Result`, with a link here |
| reports, audits, benchmarks, research, one file each | prose that narrates an edit step by step |
| caveats the next agent needs | a restated subtask or plan. Link to it |
| new items the run found, as links to subtasks | its own to-do list of micro-steps |

A log never holds the only copy of a result. Each subtask it serves pulls its own conclusion back as one line and links here for the rest.

## When to open one, and when not

Most work needs no log. A user edit, a one-pass fix, a small feature: the result goes in the subtask's `02`. A log earns its place only when work must survive a handover.

| Open a log when | No log when |
|---|---|
| the run spans sessions, worktrees or several agents | one agent finishes in one session |
| the run serves several subtasks or a plan | one subtask, one pass |
| research, an audit or a benchmark produces files worth keeping | the answer fits in the subtask |
| the user asks for one | the user makes edits by hand |

Ask before you open a `lp`, `wf` or `it` log. Say what it will hold and wait for a yes. An `au` or `rf` log needs no ask: open it, and say so. Never open a second log for work that belongs to an open one; append a file there. A verify (typecheck, build, one curl) never earns a file.

Read the log's `00_index.md` and `agent-memory/memory.md` before you continue work on an issue. Do not repeat an approach that already failed.

## The shape

This is guidance, not a rule. Nothing checks the shape of a log. The folder name and an `00_index.md` entry file are the convention; everything else is free.

```
agent-log/010_lp_ship-search/          the plan run. Asked first
├── settings.json                      { "status": "in-progress" }
├── 00_index.md                        goal, Serves:, the files, the handover
├── 10_loader.md                       stage 10: result, caveats, link to its audit
├── 20_index-build.md                  stage 20
├── 30_query-api.md                    stage 30
├── 100_au_loader/                     the audit of stage 10, a child log. No ask
│   ├── settings.json
│   ├── 00_index.md                    what was audited, the verdict, the files
│   ├── 10_audit.md                    the round: the brief, the merged findings
│   ├── 11_correctness.md              agent A's report
│   ├── 12_performance.md              agent B's report
│   └── 20_fix.md                      what got fixed, which finding it closes
├── 110_au_index-build/                same shape
└── 120_au_query-api/
```

| Convention | Detail |
|---|---|
| work done inside a run nests inside it | an audit, a refactor or a workflow that serves the run is a child log: `1NN_<kind>_<name>/`, numbered from 100, gap-spaced by ten. Two levels is the shape to aim for; three is the most that stays readable |
| a child log is a log | its own `settings.json`, its own `00_index.md`, its own files. The parent's `00_index.md` lists it |
| `00_index.md` lists every file and child | one line each: link and what it holds. Keep it current by hand; `new-round` adds its own line |
| kind codes | `lp` loop, `au` audit, `rf` refactor, `it` iteration, `wf` workflow, plus custom codes from the issue's `settings.json` |
| diagram sources | an `assets/` folder beside the file |

Logs are gap-spaced from `010`. An older log may have `01_summary.md` or a `02_working/` folder. Read it as it is. Do not restructure it unless asked.

## `00_index.md`

The entry file. Point a delegated agent at it. Never write a separate brief. Skeleton: [log-index.md](../../agent-ks-cli/templates/log-index.md).

````markdown
---
title: "Sweep the flaky tests"
---

Why this run exists, in one or two lines. Who asked.
Serves: [zero flakes](../../subtasks/010_zero-flakes.md), [stage 20](../../plans/01_get-to-zero/20_sweep.md)
Out of scope: the integration suite.

## Files
- [10 log scan](./10_log-scan.md) — 14 flaky tests found, 3 already fixed upstream
- [21 timeout report](./21_timeout-report.md) — the measured timeouts, per test
- [performance](./performance.md) — before and after numbers

## Handover
Where the run stands. What the next agent must know. Caveats. Questions for the user.
````

`## Files` is the index of the folder. `## Handover` is the one live section; rewrite it as the run moves. Everything else is written once. Say what the run does not touch on the `Out of scope:` line, or delete the line.

## The other files

A file is a round, a report, a benchmark or a diagram. Name it for what it is. Write results, caveats and links. Long output goes in its own file; the round links to it.

| File | Keep under | Holds |
|---|---|---|
| `00_index.md` | 60 lines | goal, files, handover |
| any other file | 40 lines | one result, its caveats, its links |
| one finding | one line | file, line, scenario, verdict, plus a link |

These are hints. Nothing counts lines. A file that outgrows the hint is two files.

A loop writes one file per pass: `NN_<round>.md`, gap-spaced by ten, from [log-round.md](../../agent-ks-cli/templates/log-round.md). A report produced inside a round takes the next `N1`–`N9` name: `21_audit-bytes.md` beside `20_audit-round.md`. An agent that did a small piece of work gets no file; the round records it. File count follows what was produced, not how many agents ran. Two reviewers on one concern write two reports; merge their findings as a union, not a vote. An external tool's output is written by a named agent; `agent:` names the tool.

Each kind of work has a definition of done. Write it in the file's `## Result`, even when it looks obvious. It is what makes a half-finished file legible as half-finished.

| Work | Done means |
|---|---|
| planning | the ordered task list the later units execute against |
| execution | the change, and what it touched |
| audit or review | findings, each with file, line, scenario, and whether it was reproduced |
| decide | a verdict per finding: fix, reject, defer, not ready |
| fix | the fix, and which finding it closes |
| research | findings and one recommendation |
| benchmark | before and after numbers, with units |
| test or battery | survivors and kills, the exact command, the collected count |

## Run status

`settings.json` holds the log's status. A round's frontmatter may hold the round's status. Which five values a run may carry, and why: [runs use five statuses](02_lifecycle.md). The status says whether the agent finished, never what it found. A `dropped` file says what failed and what it cost in its `## Result`.

## Where output goes

| Output | Home |
|---|---|
| a result a subtask needs | the subtask's `## Result`, one line, with a link here |
| a caveat the next run of this work needs | `00_index.md` `## Handover` |
| analysis another issue will cite, or "why did we do it this way" | the issue's `notes/`, linked from the file that produced it |
| a durable fact about the issue | `agent-memory/` |
| an HTML report or dashboard | the issue's `notes/`, linked from here and from the subtask. `agent-log/` does not render `.html` |
| an actionable item | a subtask or a dump entry, linked from `00_index.md` |

Write it when it is produced, never at wrap-up. `agent-log/` renders `.md`, `.mmd`, `.mermaid`, `.dot`, `.gv`, `.excalidraw` and `.drawio`.

## Commands

```bash
agent-ks issue new-agent-log <id> --kind lp --name ship-search --for 010,020,030
agent-ks issue new-agent-log <id> --kind au --name loader --group 010_lp_ship-search --for 010
agent-ks issue new-round <id> --log 030_wf_ship-the-decoder --name audit-round
agent-ks issue new-round <id> --log 030_wf_ship-the-decoder --name audit-bytes --report
```

`new-agent-log` writes `settings.json` and `00_index.md`; `--for` links the subtasks it serves; `--group <log folder>` opens a child log inside a run. `new-round` writes the next round or report and adds its line to `## Files` when `00_index.md` exists. A file with a plain name is written by hand; add its line to `## Files` yourself. Every flag: [cli-toolkit.md](../../agent-ks-cli/references/cli-toolkit.md).
