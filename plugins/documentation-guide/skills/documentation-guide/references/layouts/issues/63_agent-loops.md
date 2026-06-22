# Example — an issue worked across many agent-log iterations

A long autonomous run (`/loop`, ultracode, a goal-driven session) where the *execution record itself* is substantial. This is the issue type that earns the **typed agent-log workspace** (see [24_agent-logs.md](24_agent-logs.md)).

## Layout

The weight is in `agent-log/`, organized as a typed execution workspace:

```
2026-05-10-flaky-test-sweep/
├── settings.json                  status: open, labels: ["wip"], assignees: ["claude"]
├── issue.md                       goal: drive the flaky-test rate to zero
├── subtasks/
│   └── 010_zero-flakes.md         the PLAN: the durable success criterion
└── agent-log/                     the EXECUTION RECORD
    ├── 000_agent-memory/
    │   └── 010_known-flakes.md    durable facts learned this issue (which tests, why)
    ├── 100_discussion/
    │   └── 2026-05-10_scope.md     working dialogue during the run
    └── 200_loops/
        ├── 010_first-sweep/
        │   ├── 001_loop-goal.md    "categorize every retry in CI logs"
        │   ├── 002_task-list.md    live checklist for THIS run
        │   ├── 003_summary.md      what landed, written when the sweep wrapped
        │   ├── 004_attention-needed.md  shared-fixture pointer to discuss before closing
        │   ├── 101_log-scan.md     iteration 1
        │   ├── 102_timeout-fixes.md  iteration 2 (kept even though it failed)
        │   └── 103_rerun.md        iteration 3
        └── 020_second-sweep/
            ├── 001_loop-goal.md
            ├── 002_task-list.md
            └── 101_…
```

## The loop, iteration by iteration

```
iterate → agent-log entry → (comment if a human decision is needed) → re-iterate
```

1. **Start a loop folder** under `200_loops/` with a `001_loop-goal.md` and a `002_task-list.md`.
2. **Each milestone** is one numbered file (`101_`, `102_`, …) — **written directly with the Write tool** as sectioned markdown (`## Goal / ## Approach / ## Result / ## Next`, bullets + a Mermaid/ASCII diagram where it helps). Log at **substantial chunks**, not every subtask: a dense run lands ~3–6 entries, not one-per-step (see "Log milestones, not steps" in [24_agent-logs.md](24_agent-logs.md)). Don't funnel the body through `docs-guide issue add-agent-log --body "…"` — it flattens multi-line text into a run-on paragraph.
3. **Failed iterations are kept** — `102_timeout-fixes.md` failing is the exact signal the next iteration (or the next agent) needs to not repeat it.
4. **Update `002_task-list.md` as you go** — it's the resumable live status; an agent picking up mid-stream reads the goal + task-list and continues.
5. **When the run wraps, write `003_summary.md`** (what landed, final state) and — if anything came up that a human needs to weigh in on (open pointers, issues found along the way) — `004_attention-needed.md`. Skip `004_` when there's nothing to raise.
6. **Durable facts** ("test X is flaky because of a shared fixture") go in `000_agent-memory/`, not buried in an iteration file — so they survive across loops.
7. **Sequence resets per leaf folder**: `020_second-sweep/` starts its iterations at `101_` again.

## The line to hold

`subtasks/010_zero-flakes.md` is the **plan** (the durable "what done means"). The loop folders are the **execution record** (how the agent actually chased it). Don't recreate the plan as loop task-lists, or promote a loop task-list into a subtask — that's the loop ≈ mini-issue tension called out in [24_agent-logs.md](24_agent-logs.md). Hold *plan vs execution* and the two complement each other.

## When this is overkill

A two-iteration bugfix doesn't need any of this — a flat `agent-log/101_fix.md` is correct. Reach for the typed workspace only when a run is dense enough that an undifferentiated pile of entries becomes hard to navigate.
