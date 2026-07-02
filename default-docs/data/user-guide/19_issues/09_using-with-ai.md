---
title: Using with AI
description: The agent operating manual — the /issues skill, helper scripts, the mental model agents need
sidebar_position: 9
---

# Using with AI

The tracker is designed to be AI-native — every file is plain markdown in a predictable folder, so an agent can traverse and update it without APIs or auth. But **raw traversal is wasteful**: reading every file into context to find one piece of state burns tokens and leads to errors. The solution is a dedicated skill that teaches the agent how to navigate the tracker efficiently and — most importantly — how to respect the review handoff.

## The `/issues` skill (planned)

> **⏸ Not implemented yet.** Tracked in `2026-04-10-issues-layout/subtasks/06_documentation-and-skills.md`. When it ships, this page will point to the live skill and the helper scripts. Until then, the content below is the *expected* workflow — use it to coach an agent manually or as an interim skill prompt.

**Always invoke `/issues` before working with the tracker.** The skill tells the agent:

1. **How to traverse** — list issues, filter by state / label / component, follow cross-references
2. **How to read** — orientation order (`issue.md` → recent `agent-log/` → relevant subtasks → comments)
3. **How to write** — where comments go, how to add subtasks, how to write agent-log entries
4. **The review handoff** — when to mark `review`, when never to mark `done` directly
5. **Agent-log discipline** — one file per iteration, keep failed attempts, 4-section body

The skill lives at `.claude/skills/issues/SKILL.md` (exact path set when the skill ships).

## Why a skill is worth the context cost

Without the skill, every agent interaction re-discovers:
- What the folder layout is
- Which file holds metadata vs body
- How state transitions work
- Whether to close directly or hand off to review

That's 500+ tokens of re-orientation *per conversation*. The skill loads once, correctly, every time.

## The mental model every agent needs

This is the compressed version — enough to brief an agent manually if the skill isn't loaded yet.

### 1. Folder layout

```
<tracker>/
├── settings.json                    vocabulary
└── YYYY-MM-DD-<slug>/              one issue
    ├── settings.json                metadata (read first for state/priority)
    ├── issue.md                     goal/context (read first for orientation)
    ├── comments/NNN_date_author.md  thread (read if recent activity)
    ├── subtasks/NN_<slug>.md        work units, each with own state
    ├── notes/<slug>.md              design docs
    └── agent-log/NNN_<slug>.md      iteration audit trail
```

### 2. Orientation order

When picking up an issue, read in this order. Stop as soon as you have enough:

1. **`issue.md`** — the goal. Skip nothing here.
2. **Last 3 `agent-log/` entries** — avoid repeating failed approaches.
3. **Subtask list + statuses** — know what's done, in review, in progress, open.
4. **Recent comments** — pivots, pushback, questions.
5. **Notes** — only when a subtask or comment points to one.

### 3. The rules that matter most

1. **Never mark work `done` or `dropped` in autonomous mode.** The agent ceiling is the
   **Review category** (`review` or `input-needed`). `done`/`dropped` are human-only;
   `dropped` also needs a comment. Always hand off through Review.
2. **Manage `in-progress` yourself.** Set a subtask/issue to `in-progress` when you start
   executing it — no ceremony, no waiting to be told.
3. **When you hit a wall, use `input-needed` — not `blocked`.** Set the status to
   `input-needed` and write the actual question **inline in the subtask (or issue) body**
   so a fresh session picks it up on read. When it's answered, delete the question or keep
   the Q&A logged inline, then continue. Reserve `blocked` for a *structural dependency*
   on another issue/subtask (name the dependency in a comment or the body).
4. **Write an agent-log entry every iteration.** Goal / Approach / Result / Next. Keep
   failed iterations.
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

### 5. Status transitions you are NEVER allowed autonomously

| From | To | Who does it |
|---|---|---|
| Any | `done` | Human only |
| Any | `dropped` | Human only (with a comment) |

The agent's terminal move is the Review category — a human makes the `→ done` / `→ dropped`
call after inspecting the artefact. Exception: if the human explicitly pre-authorises
direct closure in the issue prompt (typo fixes, comment-only edits), that's fine — but it
must be explicit.

## Helper scripts (planned)

The skill is paired with a set of Node CLI scripts under `scripts/issues/` that let agents filter and read without dumping every file into context:

| Script | Purpose |
|---|---|
| `list.mjs [--status open\|review\|...] [--label X] [--component Y]` | List issues matching filters as `id\tstatus\ttitle` |
| `show.mjs <issue-id> [--full]` | Print one issue's metadata + subtask status summary + agent-log heads |
| `subtasks.mjs <issue-id> [--status X]` | List subtasks for an issue with status + 1-line title |
| `agent-logs.mjs <issue-id> [--last N]` | Print the last N agent-log entries |
| `set-state.mjs <issue-or-subtask-path> <status>` | Update the `status` frontmatter safely (or a subtask's, via `--subtask`) |
| `add-comment.mjs <issue-id> --author X --body md` | Append `comments/NNN_date_author.md` with next sequence |
| `add-agent-log.mjs <issue-id> --status X --body md` | Append `agent-log/NNN_slug.md` with next sequence |
| `review-queue.mjs` | List everything awaiting human review (issues + subtask-debt promotions) |

> **⏸ Not implemented yet.** Shipped with the `/issues` skill.

These scripts read the filesystem directly — no HTTP, no auth. They're a thin layer over the same loader logic, optimised for CLI output.

## Worked example

Suppose an agent is given: *"work on issue `2026-04-21-editor-perf`"*.

With the skill + scripts:

```bash
# 1. Orient
node scripts/issues/show.mjs 2026-04-21-editor-perf
# → metadata + subtask state summary + log heads

node scripts/issues/agent-logs.mjs 2026-04-21-editor-perf --last 5
# → last 5 iterations, to avoid repeating failed approaches

# 2. Pick the next open subtask, do the work
# (standard coding loop — edit files, run tests)

# 3. Log the iteration
node scripts/issues/add-agent-log.mjs 2026-04-21-editor-perf \
  --status success \
  --body "$(cat next-iteration.md)"

# 4. Flip the subtask
node scripts/issues/set-state.mjs subtasks/02_presence-batching.md review

# 5. If all subtasks are now review/done, hand off the issue
node scripts/issues/set-state.mjs 2026-04-21-editor-perf review
```

Human reviews. Either flips `review → done` or comments asking for revision.

## Without the skill

If the skill isn't loaded (today, while the skill is being built), provide the agent with this page's content in the initial prompt — or at minimum, a compressed version of *the four rules that matter most* above. Enough to respect the review boundary.

The worst outcome is an agent that silently closes its own work. The skill + rules exist specifically to prevent that.

## For humans: how to delegate to an agent

When kicking off an autonomous run on an issue:

1. **Load the `/issues` skill** (or brief it manually).
2. **Point at the specific issue**: *"work on `2026-04-21-editor-perf` — pick up from wherever the agent-log left off."*
3. **Set explicit stop criteria**: *"stop when all open subtasks are in review OR when you've tried 3 approaches without progress — flip the issue to review and summarise."*
4. **Specify authorisation**: *"you may close trivial subtasks (typos, comment-only edits) directly. Everything else goes to review."*

A well-briefed agent, equipped with the skill and helper scripts, can run for hours autonomously and produce a reviewable batch at the end.

## See also

- [Lifecycle and Review](./lifecycle-and-review) — the seven-status / four-category model the skill enforces
- [Agent Log](./sub-docs/agent-log) — iteration-file conventions the skill writes
- [Review and Close](./workflows/review-and-close) — the human's counterpart to the agent's workflow
