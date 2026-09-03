# Worked examples

Four issue shapes. Each shows the tree and the moves that matter.

## An implementation issue

A feature or fix, split into a few subtasks, worked one at a time.

```
2026-04-19-docs-phase-2/
├── settings.json                    status: open, component: ["docs"]
├── issue.md                         goal, context, done when
├── subtasks/                        ids and sort keys, not an order
│   ├── 010_loader-refactor.md
│   ├── 020_sidebar-tree.md
│   └── 030_link-rewriting.md
├── notes/010_design.md              the shape decisions
└── agent-log/                       empty until a run earns a log
```

No `plans/`: three subtasks worked one at a time have no schedule. A plan opens when order becomes a question.

| Step | Command or action |
|---|---|
| 1. read the issue | `agent-ks issue show <id>`, then `issue.md`, then `agent-ks issue agent-logs <id>` |
| 2. pick a subtask | the one the user named, or any `open` one. Not the lowest prefix |
| 3. start | `agent-ks issue set-state <id> in-progress --subtask 010` |
| 4. work and record | a one-pass change: result in the subtask's `02`. Otherwise open a log per the [work-type table](08_agent-logs.md) |
| 5. hand off | `agent-ks issue set-state <id> review --subtask 010` |
| 6. every subtask in review or done | `agent-ks issue set-state <id> review`. The user sets `done` |

## A research issue

The deliverable is a decision or a design, not a diff. The weight sits in `notes/`, numbered because reading order matters.

```
2026-05-02-search-backend-eval/
├── settings.json                    labels: ["research"]
├── issue.md                         the question, and what a good answer looks like
├── brainstorm/01_discuss_constraints.md   the exchange that converges
├── notes/
│   ├── 010_problem-statement.md
│   ├── 020_options/010_meilisearch.md     one option per file
│   ├── 030_benchmarks.md            numbers and method
│   └── 040_recommendation.md        the conclusion and why
├── subtasks/010_write-up-decision.md   one: land the recommendation
└── agent-log/010_au_backend-survey/
    ├── settings.json                { "status": "done" }
    ├── 01_summary.md                recommendation in 04
    ├── 10_survey.md                 the round
    └── 11_meilisearch-report.md     one report per agent
```

`issue.md` poses the question. The brainstorm graduates into `notes/` when the recommendation cites it. A comment records that the decision landed. `review` means the recommendation is written and defensible. The user accepts (`done`) or pushes back in a comment.

## A loop issue

A long autonomous run, worked across many rounds. The execution record is the value.

```
2026-05-10-flaky-test-sweep/
├── subtasks/010_zero-flakes.md      scope: what done means, how to verify
├── plans/01_get-to-zero/            order: which sweep runs when
├── agent-memory/known-flakes.md     which tests, and why; memory.md indexes it
└── agent-log/
    ├── 010_lp_first-sweep/
    │   ├── settings.json            { "status": "done" }
    │   ├── 01_summary.md            03 lists the rounds; 05 holds the handover
    │   ├── 10_log-scan.md
    │   ├── 20_timeout-fixes.md      status: dropped, with the callout
    │   └── 30_rerun.md
    ├── 020_wf_shared-fixture/       a workflow with its own goal: a sibling log
    └── 030_lp_second-sweep/
```

| Move | Rule |
|---|---|
| open the log first | `agent-ks issue new-agent-log <id> --kind lp --name first-sweep`. Fill the summary before the work |
| one round per pass | `agent-ks issue new-round <id> --log 010_lp_first-sweep --name log-scan` |
| a failed round stays | `status: dropped` plus the callout is the signal the next round needs |
| durable facts leave the log | `agent-memory/` |
| a workflow gets a sibling log | the loop's `03` links to it |

The subtask owns scope. The plan owns order. The log owns execution. Never let the log list its rounds as a schedule.

## A phase issue

An issue that represents a whole phase. Its subtasks are thin pointers. Each is promoted to its own issue when work begins.

```
2026-04-29-phase-one/
├── issue.md                         the roadmap
├── notes/later-phases.md            ideas parked for later
├── plans/01_phase-one/              the intended sequence
│   ├── overview.md
│   ├── 10_foundations.md
│   └── 20_admin-and-workspaces.md
└── subtasks/                        pointers with stable ids
    ├── 010_ideation.md              review
    ├── 020_foundation.md            "Promoted to 2026-04-30-foundations", review
    └── 030_teamspaces.md            open: still a pointer
```

| Rule | Detail |
|---|---|
| the issue is the index | `issue.md` holds the phase goal and framing |
| a subtask is a pointer | a title and a sentence of intent. Context arrives on promotion |
| promotion is the lifecycle | create the new issue, move travelling notes with `agent-ks move`, leave the pointer at `review` |
| the issue stays `open` | it closes when every step is promoted and resolved |
| order lives in the plan | the subtask number is a sort key. Subtask `020` may promote to an issue slugged `-01-`; neither number is a schedule |
