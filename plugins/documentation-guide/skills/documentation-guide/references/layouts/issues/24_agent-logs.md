# Agent-log — `agent-log/…` — **read these first when picking up work**

The running record of how an agent (Claude or otherwise) worked an issue — for observability, resumability, and not repeating failed approaches. **Always read before starting work** — past iterations may have tried something you'd otherwise repeat.

> Agent-log exists for **observability into dense agent execution**. There's a lightweight path (a flat entry or two) and a structured path (the typed workspace below). Reach for structure only when a run is dense enough to need it.

## Entry shape

```yaml
---
iteration: 3
agent: claude-opus-4-7
status: success      # in-progress | success | failed
date: 2026-04-24
color: "#7aa2f7"     # optional — tints only the sidebar icon, user-defined; preserve when editing
---
```

Body structure:
- **Goal** — what was being attempted
- **Approach** — the plan
- **Result** — what actually happened, with evidence
- **Next** — what to try next (if any)

**Failed iterations are kept**, not deleted — they're signal. One file per *iteration*, not per minute. When closing an issue, the final agent-log entry should reference the shipped commit / PR.

## Numbering

A numeric prefix is **optional** here, but `NNN_` is the good (and CLI-written) convention: files that start with a number have it parsed as the **iteration sequence**; otherwise the loader assigns one by sort order within the leaf folder. Sequence numbers **reset per leaf folder**. `NN_` and `NNN_` are both valid (same shared grammar — 2–5 digits, ordered by value, `_` canonical / legacy `-` tolerated).

---

## The standardized structure — a typed execution workspace

> **Very recommended, NOT enforced.** This is the strong default shape for dense agent work — it is *not* validated or required. A simple issue (a quick bugfix) needs none of it: drop a flat `001_iter.md` in `agent-log/` root and move on. Categories are created **on demand** — never scaffold empty ones. This is **Part A only**: a convention over the folder layout, **no loader/parser change**. Ordering is purely by the **leading numeric prefix on the file/folder name** (the same index grammar as docs — 2–5 digits sorted by value), exactly as today; the `00x` numbers *are* the sort key, so `001_goal` → `002_task-list` → `003_summary` → `004_attention-needed` → `101_…` iterations fall in that order with no role-aware frontmatter needed.

When a run *is* dense, organize `agent-log/` into a typed workspace that mirrors how modern agent loops actually run (Claude `/loop`, ultracode, goal-driven runs): categories of activity, each activity carrying a goal + a live task-list + iterations.

```
agent-log/
├── 000_agent-memory/
│   └── NNN_<memory-name>.md           ← issue-scoped working memory the agent maintains
│
├── 100_discussion/
│   ├── <date>_<topic>.md              ← agent↔human working dialogue (dated)
│   └── <optional-subfolder>/…         ← optional deeper threads (dates inside)
│
├── 200_loops/
│   └── NNN_<opt-date>_<opt-name>/      ← one folder per loop run (numbered, gap-spaced)
│       ├── 001_loop-goal.md           ← the goal of this loop
│       ├── 002_task-list.md           ← live checklist / status for this run
│       ├── 003_summary.md             ← post-execution summary (written when the run wraps)
│       ├── 004_attention-needed.md    ← (optional) pointers / mid-run issues to discuss before closing
│       ├── 101_<iter-1-name>.md       ← iteration 1
│       └── 102_<iter-2-name>.md       ← iteration 2 …
│
├── 300_audits/
│   └── NNN_<opt-date>_<opt-name>/
│       ├── 001_audit-goal.md
│       ├── 002_task-list.md
│       ├── 003_summary.md
│       ├── 004_attention-needed.md     ← (optional)
│       └── 101_… / 102_…              ← iterations
│
└── 400_refactors/
    └── NNN_<opt-date>_<opt-name>/
        ├── 001_refactor-goal.md
        ├── 002_task-list.md
        ├── 003_summary.md
        ├── 004_attention-needed.md     ← (optional)
        └── 101_… / 102_…              ← iterations
```

This is the **leading-digit grouping convention applied recursively** (see `references/layouts/docs-layout.md`): categories grouped by hundreds, and inside an activity, `0xx` = meta, `1xx` = iterations.

### The reusable "activity" shape

`loops`, `audits`, and `refactors` are three instances of **one shape** — an activity with a `0xx` meta block, then `1xx` iterations:

- `001_<activity>-goal.md` — what this run is trying to achieve.
- `002_task-list.md` — the working checklist + status, updated as the run progresses.
- `003_summary.md` — the post-execution summary: what landed and how it ended, written when the run wraps.
- `004_attention-needed.md` — **(optional)** things surfaced *during* execution that need discussion before the issue closes: open pointers, issues found mid-run, decisions to escalate. Skip the file when there's nothing to raise.
- `101_`, `102_`, … — the iterations.

Because it's just a shape, the category set is **standard but extensible**: a future `500_migrations/` (or similar) drops in the same way. Numbering inside an activity folder uses nested leading-digit grouping — `0xx` = meta (goal `001`, task-list `002`, summary `003`, attention-needed `004`), `1xx` = iterations, `2xx+` reserved for later.

### What this nails / standardizes

- **Observability** — at a glance: what each activity was for (goal), where it stands (task-list), every iteration that ran, how it ended (summary), and what still needs a human (attention-needed).
- **Resumability** — goal + task-list let an agent or human pick a run back up mid-stream.
- **Categorization** — memory / discussion / loop / audit / refactor are genuinely different kinds of agent activity; they stop being an undifferentiated pile.
- **Issue-scoped agent memory** — a place for durable facts learned while working *this* issue.
- **Maps onto real agent workflows** — loops / goals / task-lists are exactly the primitives modern agent loops expose.

### Fits the existing rules

- **2-level subfolder cap** — `agent-log/` → `200_loops/` (L1) → `<instance>/` (L2) → files. No depth-cap change needed.
- **Backward compatible** — existing flat `NNN_<slug>.md` agent-logs stay valid (the framework's own tracker has many). The structure is the recommended forward pattern, **not a migration**.

For a worked example of a long autonomous run that uses this structure, see [63_agent-loops.md](63_agent-loops.md).

---

## Boundaries vs. existing concepts

Three pieces of this workspace resemble things the tracker already has. Hold these lines or the model collapses:

- **Loop `002_task-list.md` vs issue `subtasks/`** — `subtasks/` is the issue's durable *plan / decomposition* (first-class, stateful, counted). A loop's task-list is the agent's *working checklist for one run* (ephemeral, scoped to that loop). **Plan vs execution.**
- **`100_discussion/` vs `comments/`** — `comments/` is the durable issue-level thread (decisions, hand-offs). `discussion/` is working dialogue *during* execution. (See [21_comments.md](21_comments.md).) **Save discussion only when the user explicitly asks** — it's case-specific and noisy by default, so never persist it on your own initiative. When a discussion turns dense, information-rich, or decision-bearing, you *may* **offer** to save it (or its key points) to the issue, then wait for the yes.
- **`000_agent-memory/` vs the global `~/.claude` memory** — issue-scoped working memory that *complements* global memory, never replaces it.

### The genuine tension

A "loop" (goal + task-list + iterations) is **almost a mini-issue**. The line that keeps this from collapsing into the subtask/issue model: **`subtasks/` = the plan (what to do); `agent-log/` activities = the execution record (how the agent actually ran it).** Hold that line and the two complement rather than compete — so don't recreate subtasks inside agent-log (or vice-versa). If loops ever need to carry *state* (open/done) like subtasks, that's the signal to merge this with the subtask model instead — not now.

---

## Add an agent-log entry

Prefer the helper:

```bash
# Top-level entry
docs-guide issue add-agent-log <issue-id> \
  --status success --body "Goal: …  Approach: …  Result: …  Next: —"

# Nested under a 1-level subgroup (e.g. a loop folder)
docs-guide issue add-agent-log <issue-id> --group 200_loops/010_refresh-sweep \
  --status success --body "..."
```

`--group` accepts up to 2 slash-separated segments. The script auto-creates the folder, auto-increments iteration / sequence within the leaf folder, and writes valid frontmatter.

Direct file write (when the helper isn't available):

1. Pick the target folder — `<issue>/agent-log/` for a top-level entry, or up to two levels deep (`<issue>/agent-log/<group>/[<subgroup>/]`).
2. Find the next prefix in that folder: `ls <target-folder>/`. The `NNN_` prefix is **optional** but recommended for sortability and so the iteration counter survives.
3. Write `<target-folder>/NNN_<slug>.md`.
4. Frontmatter: `iteration` (next int), `agent` (model id), `status` (in-progress | success | failed), `date`.
5. Body: Goal → Approach → Result → Next.

## When NOT to edit

- Don't rewrite history — append, don't edit prior entries.
- Don't scaffold empty category folders — create them on demand.
