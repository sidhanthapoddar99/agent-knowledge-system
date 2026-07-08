# Example — an issue worked across many agent-log iterations

A long autonomous run (`/loop`, ultracode, a goal-driven session) where the
*execution record itself* is substantial. This is the issue type that earns multiple
**activity folders** (see [24_agent-logs.md](../20_sections/24_agent-logs.md)).

## Layout

The weight is in `agent-log/`, one activity folder per run:

```
2026-05-10-flaky-test-sweep/
├── settings.json                  status: in-progress, assignees: ["claude"]
├── issue.md                       goal: drive the flaky-test rate to zero
├── subtasks/
│   └── 010_zero-flakes.md         the PLAN: the durable success criterion
├── agent-memory/
│   ├── memory.md                  the index — read first
│   └── known-flakes.md            durable facts learned this issue (which tests, why)
└── agent-log/                     the EXECUTION RECORD
    ├── 010_lp_first-sweep/        activity folder: NNN_<code>_<name>/ (lp = loop)
    │   ├── 00_goal.md             "categorize every retry in CI logs"
    │   ├── 01_summary.md          what landed, written when the sweep wrapped
    │   ├── 02_task_list.md        live checklist for THIS run
    │   ├── 03_attention-needed.md shared-fixture pointer to discuss before closing
    │   ├── 101_log-scan.md        milestone #1
    │   ├── 102_timeout-fixes.md   milestone #2 (kept even though it failed)
    │   └── 103_rerun.md           milestone #3
    └── 020_lp_second-sweep/
        ├── 00_goal.md
        ├── 02_task_list.md
        └── 101_…
```

## The loop, milestone by milestone

```
iterate → milestone entry → (comment if a human decision is needed) → re-iterate
```

1. **Start an activity folder** — next prefix, kind code, name (`030_lp_<name>/`) —
   with a `00_goal.md` and a `02_task_list.md`.
2. **Each milestone** is one `MNN_` file (`101_`, `102_`, …) — **written directly
   with the Write tool** as sectioned markdown (`## Goal / ## Approach / ## Result /
   ## Next`, bullets + a Mermaid/ASCII diagram where it helps). Log at **substantial
   chunks**: a dense run lands ~3–6 milestones, not one-per-step. Don't funnel the
   body through `agent-ks issue add-agent-log --body "…"` — it flattens multi-line
   text into a run-on paragraph.
3. **Failed milestones are kept** — `102_timeout-fixes.md` failing is the exact
   signal the next iteration (or the next agent) needs to not repeat it.
4. **Update `02_task_list.md` as you go** — it's the resumable live status; an agent
   picking up mid-stream reads the goal + task-list and continues.
5. **When the run wraps, write `01_summary.md`** (what landed, final state); add an
   extra `0NN` meta file (e.g. `03_attention-needed.md`) only if something needs a
   human before closing.
6. **Durable facts** ("test X is flaky because of a shared fixture") go in
   `agent-memory/` (a first-class section, not inside agent-log), so they survive
   across runs — see [26_agent-memory.md](../20_sections/26_agent-memory.md).
7. **Milestone numbering restarts per activity**: `020_lp_second-sweep/` starts at
   `101_` again; the `#N` badge comes from the `iteration` frontmatter.

## The line to hold

`subtasks/010_zero-flakes.md` is the **plan** (the durable "what done means"). The
activity folders are the **execution record** (how the agent actually chased it).
Don't recreate the plan as activity task-lists, or promote a task-list into a
subtask — hold *plan vs execution* and the two complement each other.

## When this is overkill

A two-iteration bugfix doesn't need any of this — a flat `agent-log/101_fix.md` is
tolerated (backward compatibility). But activity folders are the norm: even small
dense runs get one; reach for the flat file only for genuine one-off notes.
