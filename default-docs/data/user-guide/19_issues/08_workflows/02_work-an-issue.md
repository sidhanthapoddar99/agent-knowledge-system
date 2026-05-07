---
title: Work an Issue
description: Adding subtasks, transitioning state, commenting, writing agent-log entries
sidebar_position: 2
---

# Work an Issue

Everyday workflow for advancing an issue: picking it up, doing some work, updating state, writing audit trails. This page is written in a human/agent-agnostic voice — the mechanics are the same.

## Pick up an issue

Before touching anything, orient:

1. **Read `issue.md`** — the goal. Everything else is noise without context.
2. **Read any existing `agent-log/` entries** — don't repeat failed approaches. For long runs, read the last 3–5.
3. **Scan `comments/`** — check for recent discussion, pushback, pivots.
4. **Read the subtasks** — understand the breakdown.

For agents, the planned `/issues` skill (see [Using with AI](../using-with-ai)) automates this via helper scripts. Today, it's a few file reads.

## Advance a subtask

Typical flow for working one atomic unit:

1. Set the subtask `state: open` → your editor / tool of choice → implement the change
2. Write any evidence into an agent-log entry (if acting as an agent) or a comment (if human)
3. Flip the subtask to `state: review`

### How to flip state

Three ways:

- **UI** — click the state icon in the detail-page sidebar or subtask checklist. Cycles `open → review → closed → cancelled → open`.
- **Manual edit** — change `state:` in the subtask's frontmatter. Loader picks up the change on the next mtime invalidation.
- **Planned CLI** (once helper scripts ship) — `node scripts/issues/set-state.mjs subtasks/01_foo.md review`

### Key rule

Agents: never mark a subtask `closed` directly from `open` in autonomous mode. Always go through `review`. **`closed` is a human transition.** Exception: if the work is trivially safe (typo fix, comment update, etc.) and a human has pre-authorised direct closure in the issue prompt.

See [Lifecycle and Review](../lifecycle-and-review) for the full rule set.

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

Keep the body focused. Long deliberation belongs in a note, not a comment. See [Comments](../sub-docs/comments).

## Write an agent-log entry

For AI iterations specifically — don't use this for human edits (use comments instead).

Each iteration:

1. Pick the next sequence number in `agent-log/` (or in the subgroup folder if you're exploring variants)
2. Create `NNN_<slug>.md`
3. Write the 4-section structure — **Goal, Approach, Result, Next**

```markdown
---
iteration: 3
agent: claude-opus-4-6
status: success
date: 2026-04-21
---

# Iteration 3 — FilterBar state persistence

## Goal
Wire FilterBar state into URL query params. Survive refresh + back/forward nav.

## Approach
Listen to FilterBar change events → URLSearchParams → `history.replaceState`.
On page load, parse URL → apply to FilterBar initial state.

## Result
Working. Tested: reload preserves state, back/forward nav restores prior states.
Commit: df7a2e1.

## Next
Hand off for review — subtask 02 → `review`.
```

**Keep failed iterations.** They're more valuable than successes for the next iteration. See [Agent Log](../sub-docs/agent-log).

## Add a subtask mid-flight

Issues evolve. When work reveals a new atomic unit:

1. Pick the next numeric prefix (or insert between existing ones — renumbering is fine)
2. Create `subtasks/NN_<slug>.md` with `state: open`
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

1. All subtasks are `review` or `closed` (or `cancelled` with reasons)
2. Agent-log (or comment) captures what was shipped
3. Flip the **issue-level** status: `open → review`
4. Write a summary comment or agent-log entry: what landed, what evidence

The issue now shows up on the Review tab (with subtask-debt promotion if `status` still says `open` but subtasks are `review`-flagged). See [List View](../ui/list-view) and [Review and Close](./review-and-close).

## Cancelling work

Legitimate when:
- Scope changed and this is no longer relevant
- Duplicate of another issue
- Absorbed by a larger refactor
- Turned out to be a misunderstanding

To cancel:
1. Write a comment or agent-log entry explaining why
2. Set `status` (or subtask `state`) to `cancelled`
3. Leave the folder in place — the audit trail is useful

Don't delete cancelled issues. `git` + filesystem = audit trail.

## How `updated` is computed

The list view shows an Updated date for each issue, derived from git history — the most recent commit that touches any file under the issue folder. Nothing to maintain by hand. Issues never committed yet (or in a non-git checkout) fall back to the folder's `created` date.

## See also

- [Lifecycle and Review](../lifecycle-and-review) — the full 4-state model
- [Review and Close](./review-and-close) — the human side of the handoff
- [Using with AI](../using-with-ai) — agent-specific workflow
- [Sub-Documents](../sub-docs/issue-md) — per-file-type conventions
