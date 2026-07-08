# Example — a standard implementation issue with several subtasks

The most common shape: a feature or fix decomposed into a handful of subtasks, worked one at a time, shipped to review.

## Layout

Gap-number the subtasks so you can slot work in later without renumbering (see [23_subtasks.md](../20_sections/23_subtasks.md)):

```
2026-04-19-docs-phase-2/
├── settings.json                  status: open, component: ["docs"], one subtask min
├── issue.md                       goal / context / done-when
├── subtasks/
│   ├── 010_loader-refactor.md     status: open
│   ├── 020_sidebar-tree.md        status: open
│   └── 030_link-rewriting.md      status: open
├── notes/
│   └── 010_design.md              the shape decisions, if any
└── agent-log/                     (empty until work starts)
```

## Workflow — picking up and working it

```
1. Agent gets a prompt: "work on issue 2026-04-19-docs-phase-2"

2. Read the issue end-to-end:
   - agent-ks issue show 2026-04-19-docs-phase-2        ← metadata + subtask statuses + log heads
   - Read issue.md                            ← goal / context
   - agent-ks issue subtasks 2026-04-19-docs-phase-2    ← the work items
   - agent-ks issue agent-logs 2026-04-19-docs-phase-2  ← prior iterations (read FIRST)

3. Read agent-log entries (cheap with a Haiku subagent if many — Pattern B/C):
   - What did past iterations try? What failed? Where did the last one leave off?

4. Pick the next subtask (status:open with the lowest prefix), or the one
   the user named. Read it.

5. Do the work. Set it in-progress when you start, review when it lands:
   agent-ks issue set-state 2026-04-19-docs-phase-2 in-progress --subtask 010
   agent-ks issue set-state 2026-04-19-docs-phase-2 review --subtask 010

6. After working: append an agent-log entry summarising
   Goal / Approach / Result / Next.

7. If ALL subtasks are now review or done:
   agent-ks issue set-state 2026-04-19-docs-phase-2 review     ← hand off to human

8. Human flips status: review → done.
   Next pickup writes a closing agent-log entry referencing the shipped state.
```

## Key points

- **Subtasks go to `review`, never `done`** — that's the human's call (AI rule #1, [00_overview.md](../00_anatomy/00_overview.md)).
- **Mark the issue `review` only when** all subtasks are `review`/`done`, there's a verifiable artefact (PR / diff / screenshot), and the agent-log captures what happened (AI rule #5).
- A flat `agent-log/` is fine here — this isn't a long autonomous run. For the structured-workspace case, see [63_agent-loops.md](63_agent-loops.md).
