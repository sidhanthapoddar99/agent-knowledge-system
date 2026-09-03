---
name: agent-ks-logs
description: Use for any agent log in an agent-knowledge-system issue tracker (an issue's agent-log/ folder). Covers when a run earns a log and when it does not, the six kinds (lp loop, rf refactor, au audit, re research, it iteration, wf workflow), the file shape of each, what a log never holds, and the commands that scaffold one. Trigger on agent log, loop, long-horizon run, audit folder, research folder, refactor log, iteration, workflow, handover, or any file under agent-log/. For subtasks, plans, notes and the rest of the tracker use agent-ks-issues.
---

# agent-ks-logs — the agent's working folders

## What a log is for

An agent log is written by an agent, for a human to review later. That sets its first rule: keep it simple. A reader opens `00_index.md` and knows in one screen what the run was for, what it produced, and where it stands.

Its second job is storage. An audit can return two hundred findings. A research pass can compare fifteen products. A checklist that long falls out of an agent's context in the next session, and it does not fit in a note. A log is the home for information that is too large to live anywhere else and must still be found again.

Those two jobs are the whole reason the folder exists. Everything below follows from them.

## What a log never holds

The tracker already has a home for most things. A log that repeats them is noise for the reviewer and a second copy to keep in sync.

| It goes | Not here |
|---|---|
| the result, the decisions, the caveats, the Q&A | the subtask's `02`, `04`, `05`. The subtask owns the job |
| the order of work, what blocks what | the plan |
| a conclusion another issue will cite | `notes/`. The log links to it |
| a durable fact about the issue | `agent-memory/` |
| an HTML report or dashboard | `notes/`. The log does not render `.html` |
| a narration of edits, step by step | nowhere. Git holds the edits |

The test before you write a line in a log: does this line have a home in the subtask, the plan or a note? Then write it there and link. A log holds the path and the bulk. The subtask holds the outcome. A log never holds the only copy of a result.

## When a run earns a log

Most work earns none. One agent, one session, one subtask: the result goes in the subtask, and the folder stays empty. A log earns its place only when one of the two jobs above applies.

| Open one when | Stay without one when |
|---|---|
| the work spans days, sessions, worktrees or several agents, and progress must be tracked | one agent finishes in one session |
| a run produces files worth keeping: reviewer reports, research segments, benchmarks | the answer fits in the subtask |
| the user asks for one | the user makes edits by hand |

Who decides:

- `lp` and `it`: only on the user's ask. Say what the folder will hold and wait for a yes. A loop is a commitment of days; the user sets that scope, not the agent.
- `au`, `rf`, `re`: the agent opens one when the files are worth keeping, and says so in the reply. These are stores; the user wants the reports kept even when nobody asked.
- `wf`: only inside a loop, or on the user's ask.

Never open a second log for work that belongs to an open one. Add a file or a child log there. A verify (typecheck, build, one curl) never earns a file.

## The shape, and why it is guided

Two things are the same in every log: the folder name `NNN_<kind>_<name>/` with `settings.json` holding the run status, and `00_index.md` as the entry file. The index lists every file and child in the folder, one line each, and ends with the handover. That is what the reviewer reads first, and what the next session reads first.

Each kind has a suggested set of files. The scaffolder writes the index with that set named in it. Nothing checks the shape afterwards. The suggested names exist because an agent with a blank folder writes too much; an agent with three named slots writes what fits them. Add a file when the kind's slots do not fit; do not add one to record what already lives in the subtask.

A child log nests inside the run it serves: an audit inside the loop that asked for it. Two levels is the shape to aim for. Three is the most that stays readable. A child log is numbered from `120` up because the engine reads a folder inside a log as a child run only from prefix `100`, and `100` and `110` stay free for a results or debrief folder.

Keep files short. An index under 60 lines, any other file under 40, one finding on one line with a link. These are hints, not checks. A file that outgrows the hint is two files.

## The six kinds

### `lp` — a loop

A long-horizon run: days of work, tied to a plan or several subtasks, progress tracked across sessions. The loop is the parent of everything done inside it. The stages themselves are not files here; their results live in the subtasks and the plan. What the loop keeps is what had no home: findings, guidelines, and the child logs.

```
agent-log/010_lp_ship-search/
├── settings.json
├── 00_index.md          goal, Serves:, every file and child below, handover
├── 05_guidelines.md     rules every agent in this loop follows
├── 10_findings.md       things found on the way that need a home later
├── 20_debrief.md        written once, at the end. May become 110_debrief/
├── 120_au_loader/       an audit done inside the loop
├── 130_re_search-backends/
└── 140_it_query-slice/  a slice that earned its own folder
```

Prefixes `100` and `110` stay free for a results or debrief folder when one file is not enough.

### `rf` — a refactor

One refactor with a stated goal, ad hoc or inside a loop. Small by design: the outcome goes to the subtask. What stays here is the map a later reader needs when names moved.

```
agent-log/020_rf_loader-split/
├── 00_index.md          goal, what moved where, links
└── 10_watch-out.md      optional: quirks the next reader must know
```

### `au` — an audit

Several reviewers on one target: adversarial reviews, independent reviews, models from different providers. One file per reviewer, so a hundred findings have a place and nothing is merged away by accident. The index carries the verdict after the merge: a union of the reviewers, not a vote.

```
agent-log/120_au_loader/
├── 00_index.md          what was audited, the verdict per finding, handover
├── 10_codex.md          one reviewer, all its findings
├── 11_opus.md
└── 20_fixes.md          optional: which finding each fix closed
```

An audit that comes before any work sits at the root of `agent-log/`. One done inside a loop nests in it.

### `re` — research

Many agents over many segments: products, approaches, standards. The bulk stays here so that it can be read again. The summary and the crucial parts go to `notes/` or `brainstorm/`; the index links to them. One level of folders inside is enough.

```
agent-log/130_re_search-backends/
├── 00_index.md          the question, the method, the short answer, links to the notes
├── 10_hosted/           one folder or one file per segment
│   ├── 00_index.md
│   └── meilisearch.md
├── 11_self-hosted/
└── 20_comparison.md     optional: the side-by-side
```

### `it` — an iteration

A miscellaneous folder. Two uses. The user asks for a back-and-forth to be written down as pointers, with a goal and the subtask it serves. Or, inside a loop, one slice of a stage turns out to deserve its own place: benchmarks, scratch files, a record too big for the subtask. No child logs.

```
agent-log/140_it_query-slice/
├── 00_index.md          goal, the subtask it serves, handover
├── 10_notes.md          the pointers from the back and forth
└── 20_benchmark.md      before and after numbers, with units
```

### `wf` — a workflow

Only for a very large run: many agents, several stages, each stage handing data to the next. The folder is where that data changes hands, so an agent late in the chain reads its input from a file and not from a prompt. Rare. A workflow that does research is a `re`. No child logs.

```
agent-log/150_wf_batch-migrate/
├── 00_index.md          the stages and what each hands to the next
├── 10_collect.md        what stage one produced for stage two
└── 20_merge.md
```

## Status

`settings.json` holds the run's status. Five values, from [lifecycle](../agent-ks-issues/references/02_lifecycle.md): `open`, `in-progress`, `input-needed`, `done`, `dropped`. The status says whether the agent finished, never what it found. An audit that found two hundred defects is `done`. A file may carry its own `status:`; nothing else in a log is checked.

## Commands

```bash
agent-ks issue new-agent-log <id> --kind lp --name ship-search --for 010,020,030
agent-ks issue new-agent-log <id> --kind au --name loader --group 010_lp_ship-search --for 010
agent-ks issue new-round <id> --log 010_lp_ship-search/120_au_loader --name codex
```

`new-agent-log` writes `settings.json` and the kind's `00_index.md`; `--for` links the subtasks it serves; `--group <log folder>` opens a child log inside a run, numbered from `120`. `new-round` adds the next numbered file and lists it in the index. A file with a plain name is written by hand; add its line to `## Files` yourself. Every flag: [cli-toolkit.md](../agent-ks-cli/references/cli-toolkit.md). Search the tracker with `agent-ks issue agent-logs <id>`, never with `Grep`.

## Before you continue an issue

Read the open log's `00_index.md` and `agent-memory/memory.md` first. Do not repeat an approach the handover says failed. Then keep the index current: every file you add gets its line, and the handover is rewritten when the run moves. An index that lags its folder is the one thing a reviewer cannot recover from.
