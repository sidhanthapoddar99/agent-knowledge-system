# Example — an issue worked across many rounds of agent work

A long autonomous run (`/loop`, ultracode, a goal-driven session) where the *execution
record itself* is substantial. This is the issue type that earns several agent logs (see
[24_agent-logs.md](../20_sections/24_agent-logs.md)).

## Layout

```
2026-05-10-flaky-test-sweep/
├── settings.json                    status: in-progress, assignees: ["claude"]
├── issue.md                         goal: drive the flaky-test rate to zero
├── subtasks/
│   └── 010_zero-flakes.md           SCOPE: what "done" means, and how to verify it
├── plans/
│   └── 01_get-to-zero/              ORDER: which sweep runs when, and what blocks what
│       ├── overview.md
│       ├── 10_categorize.md
│       └── 20_fix-the-top-five.md
├── agent-memory/
│   ├── memory.md                    the index — read first
│   └── known-flakes.md              durable facts: which tests, and why
└── agent-log/                       EXECUTION
    ├── 010_lp_first-sweep/
    │   ├── settings.json            {"status": "done"}
    │   ├── summary.md               State · Goal · Todo · Out of Scope · Outcome
    │   ├── working/
    │   │   ├── 010_log-scan.md      iteration 01
    │   │   ├── 020_timeout-fixes.md iteration 02 — kept even though it failed
    │   │   └── 030_rerun.md         iteration 03
    │   └── debrief/
    │       └── 01_handover.md       the shared-fixture problem the next sweep inherits
    └── 020_lp_second-sweep/
        ├── settings.json            {"status": "in-progress"}
        ├── summary.md
        └── working/
            └── 010_shared-fixture.md
```

## The loop, round by round

```
iterate → iteration file → (comment if a human decision is needed) → re-iterate
```

1. **Open the agent log** —
   `agent-ks issue new-agent-log --issue <id> --kind lp --name third-sweep`. Fill in
   `summary.md`'s Goal, Todo and Out of Scope before starting; that
   file **is** the brief you point delegated agents at.
2. **Each round is one iteration file** —
   `agent-ks issue new-iteration --issue <id> --log 030_lp_third-sweep --name log-scan`.
   Write Goal, Inputs and Expected Outcome *before* the work; fill in Outcome when it
   lands.
3. **An agent that produced something substantial gets its own file** beside the
   iteration file — `011_`, `012_`. An agent that just did a small piece of work
   returns, and you record the outcome in the iteration file. **File count follows what
   was produced, not how many agents ran.**
4. **Failed rounds are kept.** `020_timeout-fixes.md` with `status: dropped` and the
   reason in `# Outcome` is exactly the signal the next round needs.
5. **Keep `# State` in `summary.md` current.** It is the only live text in the log, and
   it is what an agent picking up mid-stream reads first.
6. **What leaves the run goes in `debrief/`**, written when it is noticed rather than at
   the end. Anything actionable becomes a subtask; the debrief keeps the pointer.
7. **Durable facts** ("test X is flaky because of a shared fixture") go to
   `agent-memory/` — a first-class section, not inside the log — so they survive across
   runs ([26_agent-memory.md](../20_sections/26_agent-memory.md)).
8. **Numbering restarts per agent log**: `020_lp_second-sweep/working/` starts at `010_`
   again.

## The three lines to hold

| | Owns |
|---|---|
| `subtasks/010_zero-flakes.md` | **Scope** — what done means, and how to verify it |
| `plans/01_get-to-zero/` | **Order** — which sweep runs when, and what blocks what |
| `agent-log/0N0_lp_*/` | **Execution** — how the agent actually chased it, and how it came out |

Don't recreate the plan as a run's task list, don't promote a task list into a subtask,
and don't let an agent log list its rounds as a schedule — that is the plan.

## When this is overkill

A two-round bugfix does not need any of this. **An agent log opens when work is
delegated or runs over multiple rounds** — otherwise the change gets a line in the plan
and no folder at all.
