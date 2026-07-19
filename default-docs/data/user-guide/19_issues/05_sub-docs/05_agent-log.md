---
title: 05 · Agent Log
description: The execution record — activity folders per loop/audit/refactor run, with kind symbols, pinned meta files, and status-tinted milestones
sidebar_position: 5
---

# Agent Log

The `agent-log/` folder is the **execution record** of an issue — how autonomous loops and workflows actually ran. It exists for **long-running work**: each activity gets its own folder, holding pinned meta files and one file per **milestone**. Failed milestones are kept — they're as informative as successes. When a human reviews a `review`-flagged issue, the agent log is the first thing they read.

This is the *how*; `subtasks/` is the *what* (the plan). That boundary is what keeps the two from merging.

![The demo issue on an agent-log milestone page — activity folders with kind symbols, pinned meta files, and status-tinted #N milestone badges in the sidebar](../assets/demo-agent-log.png)

## The ideal structure — activity folders

```
agent-log/
├── 010_lp_implement-limiter/    ← activity folder: NNN_<code>_<name>/
│   ├── 00_goal.md               ← pinned meta file — what this run is trying to achieve
│   ├── 01_summary.md            ← outcome TL;DR (written when the run wraps)
│   ├── 02_task_list.md          ← the run's live checklist
│   ├── 101_token-bucket.md      ← milestone: MNN_<name>, M ≥ 1 → shown "#<iteration>"
│   └── 102_redis-backing.md
├── 020_au_edge-cases/
│   └── 101_findings.md          ← meta files are omittable — milestones-only is valid
└── 030_rf_extract-helper/       ← every entry is an activity folder (the norm)
```

- **`NNN`** — ordering prefix, 2–5 digits, sorted by numeric value (same shared grammar as the rest of the tracker).
- **`<code>`** — a 2-letter **kind code** (below). Rendered as a symbol on the folder row and stripped from the label.
- **`<name>`** — kebab-case, describes the run.

A flat `NNN_<name>.md` at the `agent-log/` root still parses and renders (**backward compatibility**), but it is *not* the going-forward convention — agent-logs are for long-running work, so reach for the folder shape by default.

## Kinds

The code in the folder name says *what sort* of run it was. Five framework defaults:

| Code | Kind | Icon | Use for |
|---|---|---|---|
| `lp` | loop | `repeat` | Autonomous multi-iteration runs toward one goal. |
| `au` | audit | `search` | Systematic review / inspection sweeps. |
| `rf` | refactor | `wrench` | Structural rework with no behaviour change. |
| `it` | iteration | `refresh-cw` | Rapid ad-hoc change bursts. |
| `wf` | workflow | `git-branch` | Multi-stage orchestrated pipelines. |

### Custom kinds — `agentLogKinds` in the issue's `settings.json`

Declare only your *custom* codes; the defaults are always available (**merge** semantics — the dictionary adds / overrides). Per-issue only — there's no tracker-root layer.

```jsonc
{
  "title": "…", "status": "open",
  "agentLogKinds": {
    "ex": { "name": "experiment", "icon": "flask", "desc": "One-off exploratory spikes." },
    "hf": "hotfix"                    // shorthand string → generic tag icon
  }
}
```

- `icon` picks from the framework's curated symbol palette (`agent-log-icons.ts`, ~15–20 icons); unset/unknown → a generic tag icon.
- `desc` is optional — it fills the "use for" cell in the **Guide panel's generated kinds table**, which always shows the issue's *effective* set (defaults + additions).
- An unknown code in a folder name degrades gracefully: no symbol, the label keeps the code, the count still renders.

### Sidebar rendering

An activity folder renders as **`NN  <symbol>  <name>  …  <count>`** — numeric prefix, kind symbol up front (hover shows the kind name via the fast tooltip), the code-stripped name, and the file count on the right.

## Meta files and standard slots — pinned, badge-less

`0NN_`-prefixed entries (no `iteration` frontmatter) pin to the top of the folder, badge-less, above the milestones. The recommended shape is a **standard set of six slots** — a convention, not enforced by code, that keeps every activity uniform so a reader (or the next agent) knows exactly where to look:

| Slot | Holds |
|---|---|
| `00_goal` | What the run is trying to achieve (generic name — the kind is already on the folder). |
| `01_summary` | Outcome TL;DR, written when the run wraps. |
| `02_task_list` | The run's live checklist. *Working checklist for one run, **not** the issue's durable `subtasks/` plan.* |
| `03_working` | Raw byproducts the run worked on — research, sub-agent reports, scratch analyses, discussion records, intermediate dumps. |
| `04_benchmark` | Comparable measurements — perf / evals / A-B (uses the [benchmark template](#04_benchmark--comparable-measurements) below). |
| `05_notes` | Run **handover** — caveats, issues found to fix next iteration, things discovered that help future work. |

### File or folder — grow only when you need to

Every slot is a **file by default** (`03_working.md`) and becomes a **folder of the same name** (`03_working/`) only when its content needs splitting across multiple files (`03_working/research-01_shaders.md`, `research-02_batching.md`, …). Same numeric prefix either way; the file renders as a pinned meta row, the folder as a nested subsection. This applies to any slot but is the common case for `03`–`05`.

### Present even when blank

By convention the standard slots are kept **present even when empty** — a slot with nothing yet is a stub file carrying a short placeholder callout, so the structure stays uniform and there's no guesswork about where a thing belongs:

```markdown
---
title: "Working"
---

> [!NOTE]
> Blank — nothing recorded here yet. This slot holds the raw byproducts the
> run worked on (research, sub-agent reports, scratch, discussion). If it grows,
> convert this file into a `03_working/` folder and split across files.
```

A slot that's genuinely not applicable keeps the stub but says so (`> [!NOTE]\n> Not applicable — this run produced no benchmarks.`) — a reviewer then knows it was considered, not forgotten. `00`–`02` are near-always filled; `03`–`05` are the ones that most often sit blank-with-callout. The set stays **open** — add more `0NN_` slots (`06_references`, an `attention-needed` escalation file, …) as a run needs them.

## Milestones

`MNN_<name>.md` with `M ≥ 1` (`1NN`, `2NN`, …) — the leading digit ≥ 1 is what separates milestones from `0NN` meta files. A milestone is a **substantial completed chunk** (~3–6 per activity), not a step and not synced to subtask count.

```markdown
---
iteration: 1            # → shown as "#1"; independent of the 101_ filename prefix
agent: claude-opus-4-8
status: success         # not-started | in-progress | success | failed
date: 2026-06-30
---

# Token-bucket limiter

## Goal
…
## Approach
…
## Result
…  (evidence: commits, test counts, file paths)
## Next
…
```

| Field | Type | Purpose |
|---|---|---|
| `iteration` | int | Drives the **`#N` badge** and the iteration sort bucket — independent of the filename prefix. |
| `status` | string | Tints the `#N` badge: grey `not-started` · blue `in-progress` · green `success` · red `failed`. |
| `agent` | string | Which agent / model ran it (`claude-opus-4-8`, `human:sidhantha`, …). |
| `date` | ISO date | When it landed. |
| `color` | CSS color | Optional label tint — issue-defined meaning; document it in the issue's `glossary.md`. |

The Goal / Approach / Result / Next body shape isn't enforced, but it's what makes the log reviewable in order.

### Ordering

Within a level, entries sort by: **bucket** (non-iteration files first — meta files and folders) → **iteration number** → **numeric prefix value** (mixed widths sort by value, so `70_` before `200_`) → filename. So meta files pin up top and milestones follow as `#1, #2, …` regardless of prefix widths.

## What the `03`–`05` slots hold

### `03_working` — raw provenance, distinct from curated `notes/`

`03_working` is where the run keeps the **raw material it worked on** — research, sub-agent reports, scratch analyses, saved discussion. The distinction from the issue's top-level `notes/` is **raw vs curated**, and it's a pipeline, not a contradiction of the "graduate to `notes/`" rule:

- **`03_working`** = the raw material the run looked at (*what you examined*).
- **`notes/`** (issue-level) = the curated synthesis a future reader cites (*what you concluded*).
- A **milestone** links both — "researched X (see `03_working/research-01_x.md`), concluded Y (see `../../notes/02_decision.md`)".

As a folder, files are descriptively named — `research-01_<topic>.md`, `discuss-01_<topic>.md` — each with `title` frontmatter. When a raw report *is itself* the durable, citable artifact with no curation step, put it straight in the issue's `notes/`; `03_working` earns folder-hood only when there's a raw-then-curate separation.

### `04_benchmark` — comparable measurements, with a fixed shape

The slot is the easy part; the value is **comparability**. A per-stage benchmark is only useful if every run reports the same metrics, method, and hardware baseline, so a reviewer can scan a whole cycle and read the trend. Without a fixed shape you get nine incomparable files. Use this template (columns are *suggested*, not mandatory — keep the ones that fit):

```markdown
---
title: "Benchmark — <stage/activity name>"
---

# Benchmark — <what was measured>

## Method
- Baseline: <commit/branch before> vs <commit/branch after>
- Hardware: <cpu / gpu / RAM — the reference floor>
- Scenario: <exact repro: doc size, input pattern, iterations, tool>
- Instrument: <deterministic unit measure / Playwright + performance.memory / DevTools trace>

## Results
| Metric | Before | After | Delta | Notes |
|--------|--------|-------|-------|-------|
| <e.g. retained undo bytes / heap / frame time / redraw ms> | | | | |

## Claim vs measured
<the stage claimed X; measured Y; verdict: confirmed / partial / regression /
no-change — for a non-perf stage, "no regression" is the passing result>

## Artifacts
<links to heavy artifacts — traces, screenshots, CSVs>
```

Lightweight numbers live inline in `04_benchmark.md`. When a run produces heavy artifacts (traces, CSVs, before/after screenshots), promote the slot to a `04_benchmark/` folder — the template becomes `04_benchmark/00_report.md` and the artifacts sit beside it.

### `05_notes` — the run's handover

`05_notes` is written **from this run to the next** — the parting notes a fresh session needs: caveats and gotchas hit along the way, issues found but deferred ("fix in the next iteration"), and things discovered that will help future work. Keep it disambiguated from its two neighbours:

- Durable output / decisions a reader cites → issue-level **`notes/`** (not this slot).
- Facts that stay true across runs → **`agent-memory/`**.
- Notes *from this run to the next run* → **`05_notes`**.

### Depth ceiling

A slot promoted to a folder sits at the activity folder's second level (`agent-log/<activity>/03_working/<file>`), which is the loader's maximum supported depth. Keep files **directly inside** the slot folder — a further nested folder lands at level 3 and is warned + ignored.

### Worked example

```
agent-log/
└── 080_au_gpu-research/
    ├── 00_goal.md
    ├── 01_summary.md
    ├── 02_task_list.md
    ├── 03_working/                   ← promoted to a folder — several raw reports
    │   ├── research-01_shaders.md    ← raw sub-agent report (title frontmatter)
    │   ├── research-02_batching.md
    │   └── discuss-01_tradeoffs.md   ← saved discussion record
    ├── 04_benchmark.md               ← file — numbers inline, no heavy artifacts
    ├── 05_notes.md                   ← handover: caveats + what to try next iteration
    └── 101_research-fanout.md        ← milestone links 03_working + the curated note   #1
# curated conclusion lives in the issue's notes/02_gpu-approach.md, cited by 101_research-fanout.md
```

## Rules of the road

- **Keep failed milestones.** A failed run with a clear Result + Next tells the next agent what not to do — and the red `#N` badge makes it visible at a glance.
- **One file per milestone, not per minute.** Three files a minute are thoughts, not milestones — consolidate.
- **New milestone = new file, not an edit.** Git history then tells a clean story.
- **Read the log before starting work.** Pick up where the last run left off; don't repeat failed approaches.
- **Close out on `done`.** When the issue ships, write a final summary milestone (commit hash, what landed).
- **Fast bursts:** low-nuance mechanical changes can live as a running checklist in one **subtask** instead; changes that carry reasoning belong in an `it` (iteration) activity. When ambiguous, ask which mode is wanted.

## What does NOT belong here

- **Human discussion** — `comments/` (the flat evolution log).
- **Deliberation / options-weighing** — `brainstorm/`.
- **Durable facts the agent learns** — `agent-memory/` (see [Agent Memory](./agent-memory)); the log records *what happened*, memory holds *what's still true*.
- **Micro-progress pings** — batch into the next meaningful milestone.

## Rendering

- **Detail-page sidebar** — the Agent log section lists activity folders (`NN <symbol> <name> <count>`) with meta files and `#N` milestones inside; each file is a link to its own page.
- **Own URLs** — `/<tracker>/<issue>/agent-log/<folder>/<file>` (sub-doc pages with their own TOC rail).
- **Guide panel** — the generated kinds table documents this issue's effective kind set.

## See also

- [Agent Memory](./agent-memory) — the AI's mutable working state (what's still true)
- [Subtasks](./subtasks) — the plan the log executes against
- [Lifecycle and Review](../lifecycle-and-review) — how the log feeds the review handoff
- [Using with AI](../using-with-ai) — agent discipline
