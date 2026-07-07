---
title: "Agent-log activity structure — ideal file tree per kind"
description: Settled milestone granularity for all five activity kinds (wf / lp / au / rf / it) — one reference tree with the iteration-frontmatter convention, feeding the subtask-09 skill review.
---

Settled during the 2026-07-08 session that opened subtask
`09_agent-log-milestone-structure-skill-review.md`: agents were producing the
activity-folder shell but not the milestone structure inside it — whole
multi-phase workflows squashed into one `101_` file, no `iteration:`
frontmatter (so no `#N` badge), statuses borrowed from the wrong vocabulary,
missing `01_summary.md`. This note is the target shape the skill review should
encode. The missing piece in the skill today is the **mapping unit** — what one
milestone corresponds to, per kind.

## Conventions

- Every milestone (`1NN_`+ file) carries `iteration:` (drives the `#N` badge,
  counts 1, 2, 3… within the activity, independent of the file prefix), plus
  `agent:`, `date:`, and a `status:` from the **milestone** vocabulary —
  `not-started | in-progress | success | failed` (never the subtask vocabulary).
- `0NN_` meta files never carry `iteration`. `01_summary.md` is non-negotiable
  at wrap; `02_task_list.md` only for runs long enough to have live state.
- Sub-steps never get their own files — a workflow phase with 5 sub-agents is
  one milestone; agent counts and per-stream detail go as bullets under
  `## Approach` / `## Result`.
- Name milestones by **what the chunk did**, never by its number — no
  `iteration-1-…` / `rounds-3-7-…` filenames. The `1NN_` prefix orders on disk
  and `iteration:` renders the `#N` badge; a number in the name is triple
  redundancy. Which rounds a rolled-up milestone covers goes inside the file.

## The reference tree

`#N` at the end of a line = that file carries `iteration: N` frontmatter.

```
agent-log/
│
├── 010_wf_artifact-planning/            ← WORKFLOW: 1 milestone per top-level phase()
│   ├── 00_goal.md                          what triggered the run, what "done" looks like
│   ├── 01_summary.md                       written at wrap — outcome TL;DR, always present
│   ├── 02_task_list.md                     live checklist, updated as phases complete
│   ├── 101_research.md                     phase 1: scouts/readers — agents & coverage as bullets   #1
│   ├── 102_parallel-writing.md             phase 2: the build/write fan-out                         #2
│   ├── 103_verify.md                       phase 3: adversarial verification — findings listed      #3
│   └── 104_fix.md                          phase 4: fixes applied against #3's findings             #4
│
├── 020_lp_harden-loader/                ← LOOP (large iterations): 1 loop iteration = 1 milestone
│   ├── 00_goal.md
│   ├── 01_summary.md
│   ├── 02_task_list.md
│   ├── 101_baseline.md                     first pass, failures kept as signal                      #1
│   ├── 102_edge-cases.md                                                                            #2
│   └── 103_hardening-green.md              exit condition met                                       #3
│
├── 030_lp_lint-sweep/                   ← LOOP (small/rapid iterations): consolidated, N per milestone
│   ├── 00_goal.md
│   ├── 01_summary.md
│   ├── 101_bulk-cleanup.md                 6 quick rounds rolled up — table of round → outcome      #1
│   └── 102_convergence.md                  remaining rounds + convergence evidence                  #2
│
├── 040_au_subtask-completion-audit/     ← AUDIT: sweep → findings → fixes as boundaries
│   ├── 00_goal.md                          scope + "done looks like" (evidence-based verdicts)
│   ├── 01_summary.md
│   ├── 101_sweep.md                        what was inspected, how (agents, coverage)               #1
│   ├── 102_findings.md                     verdict table with file-path evidence                    #2
│   └── 103_fixes.md                        only if the audit also fixes — else omitted              #3
│
├── 050_rf_extract-shared-loader/        ← REFACTOR: 1 milestone per structural move, proof it's
│   ├── 00_goal.md                          behaviour-preserving in each Result
│   ├── 01_summary.md
│   ├── 02_task_list.md
│   ├── 101_extract-first-class-page.md     the extraction itself + tests-still-green evidence       #1
│   ├── 102_migrate-diagram-loader.md       callers moved onto the new shape                         #2
│   └── 103_delete-dead-paths.md            old code removed, build + tests green                    #3
│
└── 060_it_polish-burst/                 ← ITERATION: ad-hoc change burst that carries reasoning
    ├── 00_goal.md                          why a burst and not a subtask checklist (nuance)
    ├── 01_summary.md
    ├── 101_theme-desync-fix.md             each milestone = one coherent chunk of the burst         #1
    └── 102_full-width-artifact-view.md                                                              #2
```

## The mapping unit, per kind

| Kind | One milestone = | Notes |
|---|---|---|
| `wf` workflow | one top-level `phase()` group | build / verify / fix each get their own; a trailing audit-and-fix phase is its own milestone |
| `lp` loop (large) | one loop iteration | 1:1 mapping |
| `lp` loop (small/rapid) | several iterations rolled up | consolidation threshold is case-by-case; a rolled-up milestone still gets one `iteration:` number |
| `au` audit | one stage: sweep → findings → fixes | fixes milestone omitted when the audit is read-only |
| `rf` refactor | one structural move | each Result proves behaviour preserved (tests/build green) |
| `it` iteration burst | one coherent chunk of the burst | the kind for bursts that carry reasoning; mechanical bursts stay a subtask checklist |

## Where this goes next

Subtask 09 executes against this note: strengthen the skill text
(`24_agent-logs.md` + SKILL.md's executing-work section, repo source **and**
installed cache, plus `guide.ts` if wording contributed) so the frontmatter
block and this mapping-unit table are unmissable at write time.
