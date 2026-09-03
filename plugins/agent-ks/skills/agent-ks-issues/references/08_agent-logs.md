# Agent logs — execution

An agent log records one run: what was tried, what came back, what was thrown away, what changed. A log exists so a finding can be withdrawn. A finding nobody wrote down cannot be retracted.

| Holds | Does not hold |
|---|---|
| the goal, and who asked for the run | the scope. That is the subtask's |
| each round: what it did, what it found | a restated subtask or plan. Link to it |
| what is solved and what is not | the order of rounds as a schedule. That is the plan's |
| what broke, and what problems exist | how the code was edited, step by step |
| new items the run generated, as links to subtasks | its own list of micro-steps |

Read the agent log and `agent-memory/memory.md` before you start work on an issue. Do not repeat an approach that already failed.

## The shape

```
agent-log/NNN_<kind>_<name>/
├── settings.json          { "status": "in-progress" }
├── 01_summary.md          the template, all five sections
├── 10_<round>.md          a round, the template, gap-spaced by ten
├── 20_<round>.md
└── 21_<report>.md         a report produced inside round 20; last digit 1–9
```

| Rule | Detail |
|---|---|
| flat | no `02_working/` folder, no `00_index.md`, no `03_debrief/`, no child logs |
| the summary's `03 References` lists every round | one line per round: what it found |
| handover and lessons go in the summary's `02` and `05` | actionable items become subtasks. The summary keeps the link |
| a workflow inside a loop gets its own sibling log | the loop's `03` links to it |
| kind codes | `lp` loop, `au` audit, `rf` refactor, `it` iteration, `wf` workflow, plus custom codes from the issue's `settings.json` |

Logs under `agent-log/` are gap-spaced from `010`. `agent-ks check issues` warns on the old shape with the text "old agent-log shape; migrate".

## When to open a log

Open one by work type. Never by file count. Never by time spent.

| Work | Record |
|---|---|
| Plan execution | one log per one to three stages. One round per stage or pass |
| Audit or review | one log. Findings in `05`, one line each: file, line, scenario, reproduced, verdict |
| Research, one or many agents | one log. One report file per agent report. Recommendation in `04` |
| Loop or workflow | one log for the loop. One sibling log per workflow with its own goal |
| Large refactor | one log. Rounds: audit, fix, verify |
| Small change, one subtask, one pass | no log. Result in the subtask's `02` |

Each kind of work has a definition of done. Write it in the round's `02 Status and Result`, even when it looks obvious. It is what makes a half-finished round legible as half-finished.

| Work unit | Done means |
|---|---|
| planning | the ordered task list the later units execute against |
| execution | the change, and what it touched |
| audit or review | findings, each with file, line, scenario, and whether it was reproduced |
| decide | a verdict per finding: fix, reject, defer, not ready |
| fix | the fix, and which finding it closes |
| research | findings and one recommendation |
| benchmark | before and after numbers, with units |
| test or battery | survivors and kills, the exact command, the collected count |

Open the log before the first stage of a plan, not after the last. A log built from commits cannot hold what was tried and abandoned. Record more, not less, for anything that changes a rule, an instruction or a skill. The only way to withdraw such a change is to find the reasoning that produced it. A log opened for work the table gives no log is deleted before it is committed. A verify (typecheck, build, one curl) is not a round. An audit is a round: its answer redirects the work.

## Size limits

| File | Limit |
|---|---|
| summary | 60 lines |
| round | 40 lines |
| one finding | one line plus a link |

## Run status

`settings.json` holds the log's status. A round's frontmatter holds the round's status. Neither repeats what the folder name says. The kind code draws the symbol; the status colours it. A log without `settings.json` renders grey.

| Value | Meaning |
|---|---|
| `open` | created and assigned, not started |
| `in-progress` | running |
| `input-needed` | the agent stopped to ask. The question is in the body |
| `done` | the agent finished its assignment |
| `dropped` | the agent did not finish: crashed, refused, superseded |

The status says whether the agent finished, never what it found. An audit that found two defects is `done`. A `dropped` round carries two signals. The first is `status: dropped`. The second is a `> [!WARNING]` callout in its `02` that says what failed and what it cost. `agent-ks check issues` warns on `dropped` with no callout. Who may set `done`: [closing authority](02_lifecycle.md).

## The summary

`01_summary.md` is the brief. Point a delegated agent at it. Never write a separate brief file. Skeleton: [log-summary.md](../../agent-ks-cli/templates/log-summary.md). Say what the run does not touch. Put that in the problem statement at the top of the summary, as one line that starts with "Out of scope:". Omit the line when there is nothing to exclude.

| Section | Holds | Changes |
|---|---|---|
| opening | the goal, and the trigger: who asked, when, in what words | written once |
| `01 To Do` | the run's checklist, headed by links to the stage and subtasks it executes | ticked as work lands. `[~]` marks an item that shipped and reopened |
| `02 Status and Result` | where the run is, what it produced, what it cost, which gates passed, the handover | rewritten every time the run moves |
| `03 References` | every round, one line each with what it found; the plan, the subtasks, the notes | appended per round |
| `04 Decisions` | rulings the run took | appended |
| `05 Notes & Analysis` | findings, lessons, caveats, questions for the user | appended |

The checklist is run-local and disposable. An item that outlives the run becomes a subtask. Every checklist item is a link with one line of what it did. The summary's `03` is an index of the rounds. Check it against the folder with [agent-ks-index-check](../../agent-ks-index-check/SKILL.md).

## Rounds and reports

A round is one pass of work: one file, `NN_<round>.md`, gap-spaced by ten. Frontmatter: `title`, `status`, `agent`. Skeleton: [log-round.md](../../agent-ks-cli/templates/log-round.md). The orchestrator writes the opening and `01` before the work starts. The agent writes `02` when it returns. `03` names what to read first. It is what stops a review reading half a pair.

A report is one agent's substantial output inside a round: an audit report, a research survey, a measured comparison. It takes the next `N1`–`N9` name inside the round: `21_audit-bytes.md` beside `20_audit-round.md`. An agent that did a small piece of work gets no file. The orchestrator records the result in the round. File count follows what was produced, not how many agents ran.

| Case | Rule |
|---|---|
| a pair of reviewers on one concern | two reports, `21_` and `22_`. Merge findings as a union, not a vote |
| an external tool | a named agent owns the file and writes it from the returned result. `agent:` names the tool |
| a benchmark | the numbers go in the round. Drivers, traces and raw dumps go to the code repo, gitignored |
| a diagram for one round | `NN_<name>.mmd` beside the round |

## Where output goes

| Output | Home |
|---|---|
| analysis the next run of this work needs | the summary's `05` |
| analysis another run will cite, or that answers "why did we do it this way" | the issue's `notes/`, with a one-line link from the round |
| something still in flux | the issue's `brainstorm/` |
| a durable fact about the issue | `agent-memory/` |
| an HTML dashboard or report | the issue's `notes/`. The log does not render `.html` |
| an actionable item | a subtask or a dump entry. The summary keeps the link |

Write it when it is produced, never at wrap-up. `agent-log/` renders `.md`, `.mmd`, `.mermaid`, `.dot`, `.gv`, `.excalidraw` and `.drawio`.

## Commands

```bash
agent-ks issue new-agent-log <id> --kind wf --name ship-the-decoder
agent-ks issue new-round <id> --log 030_wf_ship-the-decoder --name audit-round
agent-ks issue new-round <id> --log 030_wf_ship-the-decoder --name audit-bytes --report
agent-ks issue add-agent-log <id> --body "one line"
```

`new-agent-log` writes `settings.json` and the summary. `new-round` writes the next round; `--report` writes the next report inside the current round. `add-agent-log` appends one line and flattens a multi-line body; write anything longer to the file. Every flag: [cli-toolkit.md](../../agent-ks-cli/references/cli-toolkit.md).

## Boundaries

- A log is append-only. New work opens the next round. A closed round is not re-narrated. The summary's `02` is the one live section.
- `agent-memory/` is not part of the log. The log records what happened; memory holds what is still true.
- The run's checklist is not the subtask list. Subtasks are durable and counted.
