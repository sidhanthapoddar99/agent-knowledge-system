---
title: Using with AI
description: The agent operating manual — the agent-ks-issues skill, the agent-ks CLI, the mental model agents need
sidebar_position: 9
---

# Using with AI

The tracker is designed to be AI-native — every file is plain markdown in a predictable folder, so an agent can traverse and update it without APIs or auth. But **raw traversal is wasteful**: reading every file into context to find one piece of state burns tokens and leads to errors. The answer is a dedicated skill that teaches the agent how to navigate the tracker efficiently and — most importantly — how to respect the review handoff.

## The `agent-ks-issues` skill

The skill ships inside the **`agent-ks` Claude Code plugin** and **triggers on its own** — there is nothing to invoke. Naming an issue, a subtask, the backlog, a status, or any file under a tracker folder is enough, and so are the execution verbs: *audit this*, *refactor this*, *run a loop on this*, *let's discuss this point*. Install the plugin once per machine and every project picks it up — see [Claude Code Plugin](/user-guide/getting-started/claude-skills).

It teaches the agent:

1. **How to traverse** — list issues, filter by status / priority / label / component, search the structured layer, follow cross-references
2. **How to read** — the orientation order below, so context is spent on the files that carry state
3. **How to write** — which section owns which fact, and how to open a subtask, a plan stage, an agent log or a round file
4. **The review handoff** — when to mark `review`, and which `done`s are the human's and which are the agent's
5. **Agent-log discipline** — when a folder opens at all, one file per iteration, keep the failed rounds

You do not copy the skill into a project. It lives in the plugin, versioned with it, so a project that pins a stale copy would silently drift from the framework it documents. This page and its siblings under [Issues](./overview) are the canonical statement; the skill is the agent-facing companion to them.

## Why a skill is worth the context cost

Without the skill, every agent interaction re-discovers:
- What the folder layout is
- Which file holds metadata vs body
- How state transitions work
- Whether to close directly or hand off to review

That's 500+ tokens of re-orientation *per conversation*. The skill loads once, correctly, every time.

## The mental model every agent needs

This is the compressed version — enough to brief an agent that **cannot** load the skill: a different tool, a hosted model, a subagent handed a narrow prompt.

### 1. Folder layout

```
<tracker>/
├── settings.json                    vocabulary
└── YYYY-MM-DD-<slug>/              one issue
    ├── settings.json                metadata (read first for state/priority)
    ├── issue.md                     goal/context (read first for orientation)
    ├── comments/NNN_date_author.md  thread (read if recent activity)
    ├── subtasks/NN_<slug>.md        work units, each with own state
    ├── notes/<slug>.md              settled conclusions, cited by later work
    ├── plans/NN_<name>/             ORDER — stages that reference subtasks
    ├── agent-memory/                what is still true — knowledge/ + history/
    └── agent-log/NNN_<code>_<name>/ one folder per RUN, kind code in the name
        ├── 01_summary.md            the run's one conclusive file
        ├── 02_working/NNN_<slug>.md one file per round
        └── 03_debrief/              what leaves the run
```

Inside a run, the three slots are numbered so the reading order is stated in the
filename. A folder there prefixed `100` or above is a **child run**, not a slot.

**Order lives in `plans/` and nowhere else.** A subtask says what the work is; it never says when it runs. An agent log that lists its rounds as a schedule is re-deriving the plan.

### 2. Orientation order

When picking up an issue, read in this order. Stop as soon as you have enough:

1. **`issue.md`** — the goal. Skip nothing here.
2. **The active plan** — the highest-numbered plan folder that is not `done` or `dropped`. What is left, in what order, and what blocks what.
3. **The most recent agent log's `01_summary.md`** — its `# State` section says where the last run got to; its `# Outcome` says what it produced. This is what stops you repeating an approach that already failed.
4. **Subtask list + statuses** — know what's done, in review, in progress, open.
5. **`agent-memory/memory.md`** — the index that routes to what is binding (`knowledge/`) and how it got here (`history/`).
6. **Recent comments** — pivots, pushback, questions.
7. **Notes** — only when a subtask, plan stage or comment points to one.

### 3. The rules that matter most

1. **Never mark an issue or a subtask `done` or `dropped` in autonomous mode.** There your ceiling is the
   **Review category** (`review` or `input-needed`); `done`/`dropped` are the human's, and
   `dropped` also needs a comment written first. Always hand off through Review. (Agent logs and
   plans are the other way round — see [Closing](#5-closing-and-the-one-place-done-is-yours).)
2. **Manage `in-progress` yourself.** Set a subtask/issue to `in-progress` when you start
   executing it — no ceremony, no waiting to be told.
3. **When you hit a wall, use `input-needed` — not `blocked`.** Set the status to
   `input-needed` and write the actual question **inline in the subtask (or issue) body**
   so a fresh session picks it up on read. When it's answered, delete the question or keep
   the Q&A logged inline, then continue. Reserve `blocked` for a *structural dependency*
   on another issue/subtask (name the dependency in a comment or the body).
4. **Open an agent log only when the work was delegated, or ran over multiple rounds.**
   Nothing else opens one — a change you make inline gets a line in the plan and no folder.
   Inside one, `01_summary.md` is the conclusive file, and each round is a file in
   `02_working/` headed **`# Goal` · `# Inputs` · `# Expected Outcome` · `# Outcome`**. The
   orchestrator writes the first three *before* the round starts; the agent writes
   `# Outcome` when it returns. Keep the failed rounds: `status: dropped` plus a callout
   saying what it cost is exactly the signal the next round needs.
5. **Stay inside the existing schema.** The tracker is intentionally narrow — `priority`
   + `status` order the index, `labels` carry orthogonal signal, `updated` is derived from
   git. The status vocabulary itself is fixed in framework code; don't invent statuses or
   scheduling/release-bucket fields.
6. **Read before writing.** Don't overwrite; append / edit precisely.
7. **Review-debt surfaces automatically — don't hand off the parent for it.** When you set a
   *subtask* to `review` (or `input-needed`), its active, non-closed parent issue is pulled
   onto the **Review** tab and **displays a `review` badge** on the index, even though the
   issue's own stored status is unchanged. It's display-only and reverts when the subtask
   moves on — so you don't (and shouldn't) rewrite the parent's stored status just to make it
   show up for review. `blocked` subtasks never promote.

### 4. Status transitions you ARE allowed

Transitions are unenforced guidance — any jump is technically legal — but the conventions
for an autonomous agent are:

| From | To | When |
|---|---|---|
| `open` | `in-progress` | You've started executing (set it automatically) |
| any active | `review` | Work done, evidence in place, ready for human sign-off |
| any active | `input-needed` | Stuck on a question; write it inline in the body |
| any active | `blocked` | Depends on another specific issue/subtask (named in prose) |
| `review` | `in-progress` | Got pushback in a comment; resuming work |

### 5. Closing — and the one place `done` is yours

`done` and `dropped` are one vocabulary with two authorities, and which one applies depends on **what the status is attached to** — a thing that carries the *work*, or a thing that carries a *record of* or a *schedule for* it.

| The status sits on | Who closes it | Why |
|---|---|---|
| An **issue** or a **subtask** | **The human, only.** Your terminal move is `review`, or `input-needed` with the question inline | Closing signs off the work. The human inspects the artefact — diff, screenshot, test output — and flips it |
| An **agent log**, a child agent log, or an **iteration file** | **You.** You close your own run | It records what *you* did; nobody else is positioned to say whether the run finished |
| A **plan** or a **plan stage** | **You.** Closing ends a *schedule*, not a piece of work | A plan stores no status of the work — the subtasks it references render their own — so closing one certifies nothing about them |

**Never self-certify a subtask by closing the agent log that worked on it.** Same word, same vocabulary, opposite authority — and the log's `done` is not evidence for the subtask's.

**An agent log's `done` means the agent finished its assignment, never that the news was good.** An audit that ran to completion and found five defects is `done`; the five defects are prose in its `# Outcome`. `dropped` means the run did not deliver — it crashed, was refused, or was superseded.

The one exception on the first row: if the human explicitly pre-authorises direct closure in the issue prompt (typo fixes, comment-only edits), that's fine — but it must be explicit.

## The `agent-ks` CLI

The plugin puts a single command, **`agent-ks`**, on `$PATH`. It lets agents filter and read the tracker without dumping every file into context — a drop-in replacement for `grep` and `find` over the tracker, and the only supported way to write to it.

> [!IMPORTANT]
> These are **commands, not scripts you invoke by path.** There is no `node scripts/…` form: the implementations live inside the installed plugin and resolve their dependencies through its own runtime. Run `agent-ks <group> <verb>`, or nothing will resolve.

| Command | Purpose |
|---|---|
| `agent-ks issue list [--status X] [--priority X] [--label X] [--component X] [--search <regex>]` | List issues matching filters as `id · status · title`. Defaults to everything not Closed |
| `agent-ks issue show <id> [--full]` | One issue's metadata + subtask status summary + comment and agent-log heads |
| `agent-ks issue subtasks <id> [--status X]` | Subtasks for an issue with status + title (`--all` goes cross-issue) |
| `agent-ks issue agent-logs <id> [--last N]` | Print the last N agent-log entries |
| `agent-ks issue review-queue` | Everything awaiting human review — issues plus subtask-debt promotions |
| `agent-ks issue set-state <id> <status> [--subtask <num\|slug>]` | Update an issue's status, or a subtask's, safely |
| `agent-ks issue add-comment <id> --author X --body <md>` | Append `comments/NNN_date_author.md` with the next sequence |
| `agent-ks issue new-subtask <id> --name <slug>` | Scaffold a subtask on the five-section template |
| `agent-ks issue new-plan <id> --name <slug>` | Open a plan — `plans/NN_<name>/` with its overview |
| `agent-ks issue new-stage <id> --plan <plan> --name <slug>` | Add a stage to that plan (`--after NN` inserts) |
| `agent-ks issue new-agent-log <id> --kind <code> --name <slug>` | Scaffold a run — `settings.json` + `01_summary.md` |
| `agent-ks issue new-iteration <id> --log <log> --name <slug> [--producer]` | Open the next round file in `02_working/`, head pre-filled |
| `agent-ks check issues` | Validate the tracker — schema, vocabulary, subtask states, agent-log grammar |

**Every one of these takes the issue id positionally — never as `--issue`.** The scaffolders derive their own numbers, so you never pick a prefix by hand.

Three conventions hold across the whole toolkit: `--help` works on every command, `--json` works wherever a command returns data, and exit codes are `0` ok / `1` clean no-result or handled error / `2` usage error. Discover the rest with **`agent-ks help`** rather than memorising it.

These commands read the filesystem directly — no HTTP, no auth. They're a thin layer over the same loader logic the site uses, optimised for CLI output.

## Worked example

Suppose an agent is given: *"work on issue `2026-04-21-editor-perf`"*.

```bash
# 1. Orient
agent-ks issue show 2026-04-21-editor-perf
# → metadata + subtask state summary + comment and agent-log heads

agent-ks issue agent-logs 2026-04-21-editor-perf --last 5
# → the last 5 entries, so you don't repeat an approach that already failed

# 2. Claim it
agent-ks issue set-state 2026-04-21-editor-perf in-progress

# 3. Open a run — ONLY because this one was delegated / spans rounds.
#    Inline work opens no folder.
agent-ks issue new-agent-log 2026-04-21-editor-perf \
  --kind lp --name presence-batching --goal "Cut presence chatter"
# → agent-log/010_lp_presence-batching/ with settings.json + 01_summary.md

# 4. Open the round's file BEFORE doing the work — the head is the work order
agent-ks issue new-iteration 2026-04-21-editor-perf \
  --log 010_lp_presence-batching --name profile-the-hot-path \
  --unit execution --goal "Find where the frames go"
# → 02_working/010_profile-the-hot-path.md, Goal/Inputs/Expected Outcome filled.
#   Do the work (standard coding loop — edit files, run tests), then write # Outcome.

# 5. Hand the subtask off
agent-ks issue set-state 2026-04-21-editor-perf review --subtask 02

# 6. If every subtask is now review/done, hand off the issue
agent-ks issue set-state 2026-04-21-editor-perf review
```

Human reviews. Either flips `review → done` or comments asking for revision.

When a round produced something substantial of its own — an audit report, a research survey, a measured comparison — that agent gets its own file beside the round's, and `--producer` derives the number:

```bash
agent-ks issue new-iteration 2026-04-21-editor-perf \
  --log 010_lp_presence-batching --name audit-batching --producer --agent sol
# → 02_working/011_audit-batching.md — iteration 01, producer file 1
```

**A file exists because something was produced, not because an agent ran.** Two executors writing code produce one round file between them.

## Without the skill

If the skill isn't available — a different tool, a model without plugin access, a subagent given a narrow prompt — provide that agent with this page's content up front, or at minimum a compressed version of *the rules that matter most* above. Enough to respect the review boundary.

The worst outcome is an agent that silently closes its own work. The skill + rules exist specifically to prevent that.

## For humans: how to delegate to an agent

When kicking off an autonomous run on an issue:

1. **Point at the specific issue**: *"work on `2026-04-21-editor-perf` — pick up from wherever the agent-log left off."* The skill loads itself from there; only brief it manually if the agent isn't running the plugin.
2. **Set explicit stop criteria**: *"stop when all open subtasks are in review OR when you've tried 3 approaches without progress — flip the issue to review and summarise."*
3. **Specify authorisation**: *"you may close trivial subtasks (typos, comment-only edits) directly. Everything else goes to review."* Without that line the agent's ceiling on a subtask is `review`, which is the safe default.
4. **Give it the run's brief by pointing, not pasting.** Once a log is open, its `01_summary.md` — Goal, Todo, Out of Scope — *is* the brief; a delegated agent gets that path and a sentence of delta.

A well-briefed agent, equipped with the skill and the CLI, can run for hours autonomously and produce a reviewable batch at the end.

## See also

- [Claude Code Plugin](/user-guide/getting-started/claude-skills) — installing the skills and the CLI
- [Lifecycle and Review](./setup/lifecycle-and-review) — the seven-status / four-category model the skill enforces
- [Agent Log](./sub-docs/agent-log) — the run shape, the round-file head, the worked examples
- [Plans](./sub-docs/plans) — where order lives, and what a stage may reference
- [Review and Close](./workflows/review-and-close) — the human's counterpart to the agent's workflow
