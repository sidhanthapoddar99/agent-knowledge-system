---
title: Agent Log
description: Audit trail for AI iterations — one file per iteration, kept forever, readable in review
sidebar_position: 5
---

# Agent Log

The `agent-log/` folder holds an audit trail of AI iterations on an issue. Each file is one iteration: what was attempted, what happened, what's next. Failed iterations are kept — they're as informative as successes. When a human reviews a `review`-flagged issue, the agent log is the first thing they read.

This is one of the two features that make the tracker AI-native. Without it, long-running autonomous work is opaque; with it, every iteration is inspectable.

## File naming

```
agent-log/
├── 001_initial-triage.md
├── 002_incremental-parse-spike.md
├── triage-followup.md                 ← NNN_ prefix is optional
└── exploration/                       ← up to 2 levels of subgroup allowed
    ├── 001_approach-a.md
    └── phase-1/
        ├── 001_spike.md
        └── 002_polish.md
```

- **`NNN`** — sequence number (1-indexed). **Optional**. Follows the same shared ordering-prefix grammar as the rest of the tracker — **2 to 5 digits**, sorted by numeric value. The CLI writes 3-digit `NNN_` by default (`001_`, `002_`, …); a 2-digit `NN_` works just as well, while a single digit is not treated as a prefix. Zero-padding recommended when present.
- **Separator** — `_` (canonical) or a legacy `-` (both work).
- **Slug** — kebab-case, human-readable, describes the iteration's focus.

When the `NNN_` prefix is present the loader parses it as the sequence number; when it's absent the loader assigns one based on sort order within the folder. Iteration counters are tracked separately in frontmatter, so prefix-less files still get correct iteration numbers if `iteration:` is set.

Sequence numbers are **per leaf folder** — inside `agent-log/` top-level they start at 001; inside a subgroup like `exploration/` they restart at 001; inside a sub-subgroup like `exploration/phase-1/` they restart again.

### Subgroups — up to 2 levels deep

An agent exploring multiple approaches can create subgroup folders. The loader accepts up to **two levels** of subfoldering, with the same shape rules as `notes/`:

```
agent-log/
├── 001_initial-triage.md              ← root-level
├── exploration/                       ← level-1 subgroup
│   ├── 001_approach-a.md
│   ├── 002_approach-b.md
│   └── phase-1/                       ← level-2 subgroup
│       ├── 001_kickoff.md
│       └── 002_decisions.md
└── implementation/
    ├── 001_spike.md
    └── 002_final.md
```

Mix files and folders freely at every level that allows folders — `agent-log/001.md` can sit beside `agent-log/exploration/`, and `agent-log/exploration/001.md` can sit beside `agent-log/exploration/phase-1/`. The deepest level (level 2) is files-only.

Anything nested deeper than `agent-log/<group>/<subgroup>/<file>.md` produces a warning and is ignored. If a level-2 subgroup itself outgrows flat, that's a sign to split the issue, not nest deeper.

Folder names are freeform — no naming convention is enforced. Pick names that describe the angle being explored (`exploration`, `implementation`, `benchmarks`, `failed-attempts`).

## Frontmatter

```markdown
---
iteration: 3
agent: claude-opus-4-6
status: success
date: 2026-04-21
---

# Iteration 3 — restructure comprehensive view

## Goal

Eliminate heading-ID collisions between subtasks when rendered together on the
Comprehensive tab.

## Approach

…

## Result

…

## Next

…
```

| Field | Type | Purpose |
|---|---|---|
| `iteration` | int | Sequential counter. Falls back to filename sequence if absent. |
| `agent` | string | Which agent / model wrote this (e.g. `claude-opus-4-6`, `gpt-4`, `human:sidhantha`) |
| `status` | string | Free-form: `in-progress`, `success`, `failed`, `abandoned`, `handed-off`, … |
| `date` | ISO date | When this iteration ran |
| `color` | CSS color | Tints only the sidebar icon (named, hex, or any browser-accepted color) |

All optional. The loader degrades gracefully when fields are missing.

### `color` — optional sidebar-icon tint

Any browser-accepted CSS color (`red`, `#e06c75`, `rgb(...)`). **Only the sidebar icon** picks up the tint — label, row background, borders stay default. User-defined semantics: maybe red marks an iteration that uncovered a problem, green a clean success, gray a routine status update. The framework doesn't assign meaning.

## Body structure — the 4-section convention

Not enforced by the loader, but **strongly recommended** for every entry. This shape is what makes the log useful under review:

```markdown
## Goal
What was being attempted in this iteration.

## Approach
The plan / strategy. What files were going to be touched, what hypotheses
were being tested.

## Result
What actually happened. Include evidence — file paths that changed, tests
that passed / failed, commits made. Enough that a reviewer can verify
without re-running everything.

## Next
What to try next (if failed / in-progress), or "done, handed off for review"
if success.
```

The point is to leave a trail future iterations (and human reviewers) can read **in order**, rapidly catching up on what's been tried.

## Rules of the road

### Keep failed iterations

Do not delete. A failed iteration with a clear `Result` + `Next` tells the next iteration what not to do. Deleting it forces the next agent to rediscover the failure.

### One file per iteration, not per minute

An iteration is "I attempted approach X; here's what happened." If you're writing three files a minute, they're not iterations — they're thoughts. Consolidate.

### New iteration = new file, not an edit

Don't rewrite `003_spike.md` to describe what happened in iteration 4. Add `004_refinement.md`. Git history then tells a clean story.

### Read the log before starting work

When picking up an issue with existing agent logs, **read them all first** (the planned helper script `scripts/issues/agent-logs.mjs --last 5` will make this cheap). Otherwise you'll repeat failed approaches.

### Close out on `closed`

When the human flips the issue from `review → closed`, the agent's next pickup should write a final entry summarising the shipped state — commit hash, PR number, what landed. Leaving dangling "in-progress" entries makes the log feel live when it isn't.

## Rendering

- **Detail page left sidebar** — each agent log file is linked, with status indicator next to the title.
- **Comprehensive tab** — agent logs render in a dedicated section below notes, in sequence order, grouped by subgroup where present. Each log's headings get ID-prefixed.

Separate per-log URLs are planned — tracked in `2026-04-10-issues-layout/subtasks/17_subdoc-separate-urls.md`.

## Example: a completed log

```
agent-log/
├── 001_initial-triage.md                          status: success
├── 002_incremental-parse-spike.md                 status: failed
├── 003_cache-invalidation-approach.md             status: success
└── 004_shipped-closing-summary.md                 status: success
```

Iteration 1 — scoped the problem. Iteration 2 — tried incremental parsing, didn't work (log captures why). Iteration 3 — alternative approach worked. Iteration 4 — human flipped to `closed`, final summary written. Full story, readable in 4 files.

## Structured workspace for dense runs (recommended)

A flat list of entries is fine for a quick fix. For a **dense autonomous run** (a `/loop`, an ultracode session, a goal-driven sweep), the log reads better as a **typed execution workspace** — categories of activity, each carrying a goal, a live task-list, and its iterations:

```
agent-log/
├── 000_agent-memory/      ← issue-scoped working memory the agent maintains
├── 100_discussion/        ← agent↔human working dialogue during the run (dated)
├── 200_loops/
│   └── 010_<name>/
│       ├── 001_loop-goal.md         ← what this run is trying to achieve
│       ├── 002_task-list.md         ← live checklist / status for this run
│       ├── 003_summary.md           ← post-execution summary (written when the run wraps)
│       ├── 004_attention-needed.md  ← (optional) pointers / mid-run issues to discuss before closing
│       └── 101_… / 102_…            ← iterations (failed ones kept as signal)
├── 300_audits/            ← same goal + task-list + summary + iterations shape
└── 400_refactors/         ← …extensible: 500_migrations/ drops in the same way
```

The meta block is just an ordering convention — `0xx` files (goal `001`, task-list `002`, summary `003`, attention-needed `004`) sort ahead of the `1xx` iterations purely by their leading-digit prefix, the same index grammar the rest of the tracker uses.

This is **very recommended, not enforced** — there's no parser change, files still sort by their leading number, and existing flat logs stay valid. Categories are created on demand; never scaffold empty ones. The boundaries to hold: a loop's `002_task-list.md` is the *working checklist for one run* (not the issue's durable `subtasks/` **plan**); `100_discussion/` is *in-run dialogue* (not the durable issue-level `comments/`); `000_agent-memory/` is *issue-scoped* memory (it complements, never replaces, global `~/.claude` memory). A loop is almost a mini-issue — the line that keeps the two from merging is **`subtasks/` = the plan, `agent-log/` = the execution record.**

Full agent-facing detail lives in the `documentation-guide` skill's `references/layouts/issues/24_agent-logs.md`.

## When NOT to write to the log

- **Human edits** — comments belong in `comments/`, not agent-log. The log is for programmatic writes during autonomous runs.
- **Micro-progress pings** — "I ran the test, it passed" isn't a worthwhile iteration. Batch into the next meaningful log.
- **Editing old entries** — don't rewrite history. Add a new entry.

## See also

- [Lifecycle and Review](../lifecycle-and-review) — how the log interacts with the review handoff
- [Using with AI](../using-with-ai) — agent discipline + planned `/issues` skill
- [Work an Issue](../workflows/work-an-issue) — when to add a log entry during a run
