# Example — a standard implementation issue with several subtasks

The most common shape: a feature or fix decomposed into a handful of subtasks, worked one at a time, shipped to review.

## Layout

Gap-number the subtasks so you can slot work in later without renumbering (see [23_subtasks.md](../20_sections/23_subtasks.md)):

```
2026-04-19-docs-phase-2/
├── settings.json                  status: open, component: ["docs"], one subtask min
├── issue.md                       goal / context / done-when
├── subtasks/                      ids and sort keys — NOT a running order
│   ├── 010_loader-refactor.md     status: open
│   ├── 020_sidebar-tree.md        status: open
│   └── 030_link-rewriting.md      status: open
├── notes/
│   └── 010_design.md              the shape decisions, if any
└── agent-log/                     stays EMPTY unless a run earns a folder — see step 6
```

**No `plans/` here, and that is correct.** Three subtasks worked one at a time have no
schedule worth writing down. A plan opens when order becomes a real question — something
blocks something else, or a round needs a defined scope ([28_plans.md](../20_sections/28_plans.md)).
Until then the numbers are labels, and step 4 below says so.

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

4. Pick the next subtask: the one the user named, or any `open` one whose
   prerequisites are met. NOT "the lowest prefix" — the number is a stable
   id, not a queue position. If this issue had an intended order it would
   live in plans/, and there would be a plan to read here.

5. Do the work. Set it in-progress when you start, review when it lands:
   agent-ks issue set-state 2026-04-19-docs-phase-2 in-progress --subtask 010
   agent-ks issue set-state 2026-04-19-docs-phase-2 review --subtask 010

6. Record it where it belongs. Work you did INLINE gets no agent-log folder:
   its outcome goes in the subtask, plus a line in the plan if a plan
   scheduled it. A folder opens ONLY when the work was DELEGATED, or ran
   over multiple rounds:
     agent-ks issue new-agent-log 2026-04-19-docs-phase-2 --kind it \
       --name loader-refactor --goal "…"
     agent-ks issue new-iteration 2026-04-19-docs-phase-2 \
       --log 010_it_loader-refactor --name round-one --unit execution

7. If ALL subtasks are now review or done:
   agent-ks issue set-state 2026-04-19-docs-phase-2 review     ← hand off to human

8. Human flips status: review → done.
```

## Key points

- **Subtasks go to `review`, never `done`** — that's the user's call ([Closing authority](../00_anatomy/00_overview.md#closing-authority), the one place that rule is stated).
- **Mark the issue `review` only when** all subtasks are `review`/`done`, there's a verifiable artefact (PR / diff / screenshot), and the record captures what happened (AI rule #5).
- **Most subtasks on an issue like this earn no agent-log folder at all.** One is opened when work is delegated or runs over multiple rounds, and nothing else opens one ([24_agent-logs.md](../20_sections/24_agent-logs.md)) — otherwise three files become the floor for a one-line change. When one *is* opened it is an activity folder, `NNN_<kind>_<name>/` with `01_summary.md` · `02_working/` · `03_debrief/`; there is no flat form. The long autonomous case is [63_agent-loops.md](63_agent-loops.md).
- **An iteration file's head is `Goal` · `Inputs` · `Expected Outcome` · `Outcome`** — the scaffolder seeds all four. `Goal / Approach / Result / Next` was the old milestone shape and no longer exists.
