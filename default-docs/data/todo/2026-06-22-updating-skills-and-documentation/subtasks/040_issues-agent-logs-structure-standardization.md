---
title: Issues agent-logs structure standardization
status: done
---

Agent-log was created for **observability into dense agent execution** — the running
record of how an agent (Claude or otherwise) worked an issue, for discussion and tracking.
But with no standard structure it's hard to navigate. This subtask standardizes
agent-log into a **typed execution workspace** that mirrors how modern agent loops actually
run (Claude `/loop`, ultracode, goal-driven runs): categories of activity, each activity
carrying a goal + a live task-list + iterations.

It's the **leading-digit grouping convention applied recursively** (see
`references/layouts/docs-layout.md`): categories grouped by hundreds, and inside an
activity, `0xx` = meta, `1xx` = iterations.

## Structure

```
agent-log/
├── 000_agent-memory/
│   └── XXX_<memory-name>.md           ← issue-scoped working memory the agent maintains
│
├── 100_discussion/
│   ├── <date>_<topic>.md              ← agent↔human working dialogue (dated)
│   └── <optional-subfolder>/…         ← optional deeper threads (dates inside)
│
├── 200_loops/
│   └── XXX_<opt-date>_<opt-name>/      ← one folder per loop run (numbered, gap-spaced)
│       ├── 000_loop-goal.md           ← the goal of this loop
│       ├── 001_task-list.md           ← live checklist / status for this run
│       ├── 101_<iter-1-name>.md       ← iteration 1
│       └── 102_<iter-2-name>.md       ← iteration 2 …
│
├── 300_audits/
│   └── XXX_<opt-date>_<opt-name>/
│       ├── 000_audit-goal.md
│       ├── 001_task-list.md
│       └── 101_… / 102_…              ← iterations
│
└── 400_refactors/
    └── XXX_<opt-date>_<opt-name>/
        ├── 000_refactor-goal.md
        ├── 001_task-list.md
        └── 101_… / 102_…              ← iterations
```

## The reusable "activity" shape

`loops`, `audits`, and `refactors` are three instances of **one shape** — an activity with:

- `000_<activity>-goal.md` — what this run is trying to achieve.
- `001_task-list.md` — the working checklist + status, updated as the run progresses.
- `101_`, `102_`, … — the iterations.

Because it's just a shape, the category set is **extensible**: a future `500_migrations/`
(or similar) drops in the same way. Numbering inside an activity folder uses nested
leading-digit grouping — `0xx` = meta (goal `000`, task-list `001`, room for more),
`1xx` = iterations, `2xx+` reserved (e.g. results/artifacts) for later.

## What this nails / standardizes

- **Observability** — at a glance: what each activity was for (goal), where it stands
  (task-list), and every iteration that ran.
- **Resumability** — goal + task-list let an agent or human pick a run back up mid-stream.
- **Categorization** — memory / discussion / loop / audit / refactor are genuinely
  different kinds of agent activity; they stop being an undifferentiated pile.
- **Issue-scoped agent memory** — a place for durable facts learned while working *this*
  issue.
- **Maps onto real agent workflows** — loops/goals/task-lists are exactly the primitives
  modern agent loops expose.

## Caveats & scope

- **Part A only — organizational, not rule-aware.** This is a *convention* over the folder
  layout; **no loader/parser change**. Files keep sorting by their leading number and
  rendering in the sidebar tree as today. No `kind: goal|task-list|iteration` frontmatter,
  no role-aware rendering. (A future Part B — role-aware frontmatter + observability
  tooling — is possible but explicitly out of scope here.)
- **Very recommended, NOT enforced.** This is the strong default shape for dense agent
  work; it is not validated/required.
- **Lightweight path preserved.** A simple issue (a quick bugfix) needs none of this — an
  agent can still drop a flat `001_iter.md` in `agent-log/` root. Categories are created
  **on demand**; never scaffold empty ones.
- **Fits the existing 2-level subfolder cap** — `agent-log/` → `200_loops/` (L1) →
  `<instance>/` (L2) → files. No depth-cap change needed.
- **Backward compatible** — existing flat `NNN_<slug>.md` agent-logs stay valid (the
  framework's own tracker has many). The new structure is the recommended forward pattern,
  **not a migration**.

## Boundaries vs. existing concepts (must be stated in the skill)

These three additions resemble things the tracker already has; the skill must draw the line:

- **Loop `001_task-list.md` vs issue `subtasks/`** — `subtasks/` is the issue's durable
  *plan / decomposition* (first-class, stateful, counted). A loop's task-list is the
  agent's *working checklist for one run* (ephemeral, scoped to that loop). **Plan vs
  execution.**
- **`100_discussion/` vs `comments/`** — `comments/` is the durable issue-level thread
  (decisions, hand-offs). `discussion/` is working dialogue *during* execution.
- **`000_agent-memory/` vs the global `~/.claude` memory** — issue-scoped working memory
  that *complements* global memory, never replaces it.

## The genuine tension (call this out in the skill)

A "loop" (goal + task-list + iterations) is **almost a mini-issue**. The line that keeps
this from collapsing into the subtask/issue model: **`subtasks/` = the plan (what to do);
`agent-log/` activities = the execution record (how the agent actually ran it).** Hold that
line and the two complement rather than compete. If loops ever need to carry *state*
(open/done) like subtasks, that's the signal to merge this with the subtask model instead —
not now. The skill should state this explicitly so agents don't recreate subtasks inside
agent-log (or vice-versa).

## Where this gets documented (on implementation)

- Primary home: the agent-log reference — after subtask `030` lands, that's
  `references/layouts/issues/24_agent-logs.md`.
- A short pointer + the boundary/tension note in `00_overview.md` and the user-guide
  `19_issues/05_sub-docs/05_agent-log.md`.
- No code change (Part A). Build stays green; flat legacy logs still parse.

## Resolved decisions

1. **Part A only** (organizational/convention) — not rule-aware; loader unchanged.
2. **Very recommended, not enforced**; lightweight flat path stays available.
3. Boundaries accepted as above (plan vs execution, comments vs discussion, issue-scoped vs
   global memory); the **loop ≈ mini-issue tension is explicitly documented in the skill**.
4. Categories are a **standard but extensible** set, created on demand.
