---
title: Work an Issue
description: Adding subtasks, transitioning status, commenting, writing agent-log entries
sidebar_position: 2
---

# Work an Issue

Everyday workflow for advancing an issue: picking it up, doing some work, updating status, writing audit trails. This page is written in a human/agent-agnostic voice — the mechanics are the same.

## Pick up an issue

Before touching anything, orient:

1. **Read `issue.md`** — the goal. Everything else is noise without context.
2. **Read any existing `agent-log/` entries** — don't repeat failed approaches. For long runs, read the last 3–5.
3. **Scan `comments/`** — check for recent discussion, pushback, pivots.
4. **Read the subtasks** — understand the breakdown.

For agents, the planned `/issues` skill (see [Using with AI](../09_using-with-ai.md)) automates this via helper scripts. Today, it's a few file reads.

## Advance a subtask

Typical flow for working one atomic unit:

1. Set the subtask `status: in-progress` → your editor / tool of choice → implement the change
2. Write any evidence into an agent-log entry (if acting as an agent) or a comment (if human)
3. Flip the subtask to `status: review`

### How to flip status

Three ways:

- **UI** — click the status icon in the detail-page sidebar or subtask checklist. Cycles `open → in-progress → review → done` (the off-path statuses `blocked`, `input-needed`, and `dropped` are set by editing the file).
- **Manual edit** — change `status:` in the subtask's frontmatter. Loader picks up the change on the next mtime invalidation.
- **CLI** — `agent-ks issue set-state <issue-id> review --subtask 01` (or pass an explicit `…/subtasks/01_foo.md` path). Writes the `status` field; `--subtask` targets the subtask (never the issue).

### Key rule

Agents: never mark a subtask `done` directly in autonomous mode — the agent ceiling is the **Review** category. Always go through `review`. **`done` is a human transition** (as is `dropped`, which also requires an explaining comment). Exception: if the work is trivially safe (typo fix, comment update, etc.) and a human has pre-authorised direct closure in the issue prompt.

See [Lifecycle and Review](../04_setup/06_lifecycle-and-review.md) for the full rule set.

## Write a comment

When you want to surface discussion, ask a question, or note a decision that isn't captured elsewhere:

1. List existing comments: find the highest `NNN_` prefix
2. Create `comments/NNN_YYYY-MM-DD_<you>.md` with the next sequence number and today's date
3. Write the body as plain markdown

```
comments/
├── 001_2026-04-19_sidhantha.md
├── 002_2026-04-20_claude.md
└── 003_2026-04-21_sidhantha.md     ← new
```

Keep the body focused. Long deliberation belongs in a note, not a comment. See [Comments](../05_sub-docs/02_comments.md).

## Write an agent-log round file

For AI iterations specifically — don't use this for human edits (use comments instead).

Each round:

1. **Find the run's folder** — `agent-log/NNN_<code>_<name>/`, or open one if this is new
   work. Whether it earns one is
   [decided here](../05_sub-docs/05_agent-log.md#when-an-agent-log-opens-at-all), not from
   this page.
2. **Write the round file into that folder's `02_working/`**, named `NNN_<slug>.md` — the
   first two digits are the iteration and the last is which file within it (`0` for the
   round's own file, `1`–`9` for an agent that produced something substantial of its own).
3. **Open with the four `#` sections** — Goal, Inputs, Expected Outcome, Outcome.
   Everything after them is free-form.

```markdown
---
title: "FilterBar state persistence"
agent: claude-opus-4-6
status: done          # the canonical seven — did the agent FINISH, not what it found
date: 2026-04-21
---

# Goal
Wire FilterBar state into URL query params. Survive refresh + back/forward nav.

# Inputs
`notes/03_url-state-decision.md`. `none` when there are none.

# Expected Outcome
The change, and what it touched.

# Outcome
Working. Tested: reload preserves state, back/forward nav restores prior states.
Commit: df7a2e1. Handing off for review — subtask 02 → `review`.
```

**The iteration number is the filename and is never repeated in frontmatter.** The
`030_` prefix owns it; a copy in frontmatter is a second place to keep right.

**Keep failed rounds.** They're more valuable than successes for the next round — set
`status: dropped` and say what failed in `# Outcome`. The run's conclusive file is
`01_summary.md` beside `02_working/`. See [Agent Log](../05_sub-docs/05_agent-log.md).

## Add a subtask mid-flight

Issues evolve. When work reveals a new atomic unit:

1. Pick the next numeric prefix (or insert between existing ones — renumbering is fine)
2. Create `subtasks/NN_<slug>.md` with `status: open`
3. Add a quick comment or agent-log mentioning the new subtask so it's traceable

```
subtasks/
├── 01_profile-baseline.md
├── 02_decorations-incremental-refresh.md
├── 03_presence-batching.md
└── 04_yjs-update-coalescing.md     ← added after profiling revealed this
```

## Handing off to a human

When you (or an agent) thinks all meaningful work is done:

1. All subtasks are `review` or `done` (or `dropped` with reasons)
2. Agent-log (or comment) captures what was shipped
3. Flip the **issue-level** status: `open → review`
4. Write a summary comment or agent-log entry: what landed, what evidence

The issue now shows up on the Review tab (with subtask-debt promotion if `status` still says `open` but subtasks are `review`-flagged). See [List View](../07_ui/01_list-view.md) and [Review and Close](./03_review-and-close.md).

## Dropping work

Legitimate when:
- Scope changed and this is no longer relevant
- Duplicate of another issue
- Absorbed by a larger refactor
- Turned out to be a misunderstanding

To drop (a human-only transition):
1. Write a comment or agent-log entry explaining why — `dropped` requires an explaining comment
2. Set the issue (or subtask) `status` to `dropped`
3. Leave the folder in place — the audit trail is useful

Don't delete dropped issues. `git` + filesystem = audit trail.

## How `updated` is computed

The list view shows an Updated date for each issue, derived from git history — the most recent commit that touches any file under the issue folder. Nothing to maintain by hand. Issues never committed yet (or in a non-git checkout) fall back to the folder's `created` date.

## See also

- [Lifecycle and Review](../04_setup/06_lifecycle-and-review.md) — the full seven-status / four-category model
- [Review and Close](./03_review-and-close.md) — the human side of the handoff
- [Using with AI](../09_using-with-ai.md) — agent-specific workflow
- [Sub-Documents](../05_sub-docs/01_issue-md.md) — per-file-type conventions
