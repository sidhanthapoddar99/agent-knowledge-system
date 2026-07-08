# Agent-log — `agent-log/NNN_<code>_<name>/` — **read these first when picking up work**

The execution record: how an agent (Claude or otherwise) actually ran the work — for
observability, resumability, and not repeating failed approaches. **Always read before
starting work** — past activities may have tried something you'd otherwise repeat.

Agent-logs are for **long-running work**; the first level is **activity folders**, one
per loop / audit / refactor / etc. That's the ideal structure to reach for by default.
A flat `NNN_<name>.md` at the root still parses (backward compatibility, quick one-off
fixes) but is not the going-forward convention.

## The activity folder — `NNN_<code>_<name>/`

```
agent-log/
├── 010_lp_implement-limiter/    ← activity folder: NNN_<code>_<name>/
│   ├── 00_goal.md               ← pinned meta — generic names, kind is on the folder
│   ├── 01_summary.md            ← outcome TL;DR (written when the run wraps)
│   ├── 02_task_list.md          ← live checklist / status (update as you go)
│   ├── 101_token-bucket.md      ← milestone: MNN_<name>, M ≥ 1 → shown "#<iteration> token bucket"
│   └── 102_redis-backing.md
├── 020_au_edge-cases/
└── 030_rf_extract-helper/
```

- **`NNN`** orders (2–5 digit prefix, by value, gap-spaced); **`<code>`** is the kind;
  **`<name>`** describes the run.
- **Pinned meta files** (`0NN`, no `iteration` frontmatter): `00_goal.md`,
  `01_summary.md`, `02_task_list.md` are the standard trio — not a fixed set. Add more
  `0NN` meta as needed (e.g. `03_references.md`, an `attention-needed` file for mid-run
  escalations) and omit any an activity doesn't need — a folder with only milestones is
  valid. Meta files render badge-less.
- **Milestones** are `MNN_<name>.md` with `M ≥ 1` (`101_`, `102_`, … `201_`…): the
  leading non-zero digit is what separates them from `0NN` meta. Displayed as
  `#<iteration> <name>` — `iteration` is a frontmatter field independent of the file
  prefix (prefix orders on disk; `iteration` drives the badge).
- **Don't scaffold empty folders** — create activities on demand.

## Kinds — the code in the folder name

| Code | Kind | Use for |
|---|---|---|
| `lp` | loop | Autonomous multi-iteration runs toward one goal. |
| `au` | audit | Systematic review / inspection sweeps. |
| `rf` | refactor | Structural rework with no behaviour change. |
| `it` | iteration | Rapid ad-hoc change bursts. |
| `wf` | workflow | Multi-stage orchestrated pipelines. |

The 5 defaults come free. **Custom kinds** are declared per-issue in `settings.json`
under `agentLogKinds` — `{ "ex": { "name": "experiment", "icon": "flask" } }`, or
shorthand `"hf": "hotfix"` for a generic icon. The dictionary only adds/overrides; the
issue's **Guide panel** lists the effective set (symbol · code · name · use-for).
Kinds render as a **symbol on the folder row** (name on hover). An unknown two-letter
code degrades gracefully: no symbol, name keeps the code.

## Milestone shape

**The frontmatter below is required on every milestone, written at creation time —
not optional metadata.** `iteration` is what renders the `#N` badge; a milestone
without it is malformed (the validator warns). `status` uses the **milestone**
vocabulary — `not-started | in-progress | success | failed` — never the subtask
vocabulary (`done` on a milestone is wrong).

```markdown
---
iteration: 1            # → shown as "#1"; independent of the 101_ filename prefix
agent: claude-opus-4-8
status: success         # not-started | in-progress | success | failed — tints the #N badge
date: 2026-06-30
color: "#7aa2f7"        # optional, user-defined — preserve when editing
---

# <short milestone title>

## Goal
What this chunk set out to do.

## Approach
- Key decisions / steps — bullets, not prose.

## Result
- What landed, **with evidence**: commits, test counts, file paths.
- A **Mermaid or ASCII diagram** when it aids visibility (architecture, flow, before/after).

## Next
What's next — or `—` if this chunk is closed.
```

The `#N` badge tints by `status`: grey `not-started` · blue `in-progress` · green
`success` · red `failed`. **Failed milestones are kept — they're signal.** When closing
an issue, the final entry should reference the shipped commit / PR.

> **Readability is the point.** These logs exist for a human to skim later. Use real
> `##` headings on their own lines — crammed run-on prose defeats the purpose. The most
> common way logs get flattened is funnelling them through a `--body "…"` CLI string;
> **write the file directly instead** (below).

## Every file is structured prose, never a dump

This applies to **all** activity files — `00_goal.md`, `01_summary.md`,
`02_task_list.md`, and every milestone — not just milestones:

- **Set context first.** Each file opens with a sentence or two a cold reader needs:
  what this run is, why it exists, what decision or subtask it serves (with the
  pointer spelled out). The reader six weeks from now has none of your session
  context.
- **A goal is not a one-liner.** `00_goal.md` states the objective *and* the framing —
  what triggered it, what "done" looks like, links to the notes/subtask it executes.
- **A summary is not a bullet dump.** `01_summary.md` opens with what the run was,
  then what landed (with evidence and pointers) and where things stand.
- **Even a genuinely small entry gets a little explanation** — a single-line thought
  becomes two or three sentences with its context, not a bare fragment pasted in.

## Log milestones, not steps

One entry per **substantial, noticeable chunk** of completed work — a feature landing,
a phase finishing, a hard bug fixed. A typical activity produces **~3–6 milestones
total, regardless of subtask count** — logs are not synced to subtasks. One entry per
tiny step buries the signal; each milestone should stand alone as a summary a human
can skim months later.

### The mapping unit — what one milestone corresponds to, per kind

The two failure modes are symmetric: logging every step buries the signal, but
squashing a whole multi-phase run into a single milestone loses the iteration
points entirely. What "one milestone" means depends on the kind:

| Kind | One milestone = | Notes |
|---|---|---|
| `wf` workflow | one top-level phase | build / verify / fix each get their own milestone; a trailing audit-and-fix phase is its own; a phase with 5 sub-agents is still **one** milestone — agent counts and per-stream detail go as bullets under Approach/Result |
| `lp` loop (large iterations) | one loop iteration | 1:1 mapping |
| `lp` loop (small/rapid) | several iterations rolled up | consolidation threshold is case-by-case; a rolled-up milestone still gets one `iteration:` number |
| `au` audit | one stage: sweep → findings → fixes | fixes milestone omitted when the audit is read-only |
| `rf` refactor | one structural move | each Result proves behaviour preserved (tests/build green) |
| `it` iteration burst | one coherent chunk of the burst | mechanical bursts belong in a subtask checklist instead |

`iteration:` counts sequentially within the activity (1, 2, 3…), independent of
the `101_` file prefix — the prefix orders on disk, the frontmatter drives the badge.

### Reference tree — the default shape per kind

**A default, not a straitjacket.** Match this shape unless the run has a reason
not to; what's non-negotiable is only the invariants (milestone frontmatter, one
milestone per mapping unit, summary at wrap). Meta files beyond `00_goal.md` are
add-as-needed; names and counts flex with the run.

```
agent-log/
├── 010_wf_feature-build/               ← workflow: 1 milestone per top-level phase
│   ├── 00_goal.md   01_summary.md   02_task_list.md
│   ├── 101_research.md                  phase 1 — sub-agents as bullets inside     #1
│   ├── 102_build.md                     phase 2                                    #2
│   ├── 103_verify.md                    phase 3 — findings listed                  #3
│   └── 104_fix.md                       phase 4 — fixes against #3                 #4
├── 020_lp_harden-loader/               ← loop, large iterations: 1:1
│   ├── 00_goal.md   01_summary.md   02_task_list.md
│   ├── 101_baseline.md                                                              #1
│   └── 102_edge-cases.md                exit condition met                          #2
├── 030_lp_lint-sweep/                  ← loop, rapid rounds: rolled up
│   ├── 00_goal.md   01_summary.md
│   ├── 101_bulk-cleanup.md              round → outcome table inside                #1
│   └── 102_convergence.md                                                           #2
├── 040_au_consistency-audit/           ← audit: sweep → findings → fixes
│   ├── 00_goal.md   01_summary.md
│   ├── 101_sweep.md                                                                #1
│   ├── 102_findings.md                  verdicts with evidence                     #2
│   └── 103_fixes.md                     omit when read-only                        #3
├── 050_rf_extract-shared-loader/       ← refactor: 1 milestone per structural move
│   ├── 00_goal.md   01_summary.md   02_task_list.md
│   ├── 101_extract-core.md              + behaviour-preserved evidence             #1
│   └── 102_migrate-callers.md                                                      #2
└── 060_it_polish-burst/                ← iteration burst: 1 per coherent chunk
    ├── 00_goal.md   01_summary.md
    ├── 101_theme-desync-fix.md                                                     #1
    └── 102_full-width-view.md                                                      #2
```

(`#N` = that file carries `iteration: N` frontmatter.)

**Name milestones by what the chunk did, never by its number** — no
`iteration-1-…` / `rounds-3-7-…` filenames. The `1NN_` prefix orders on disk and
`iteration:` renders the `#N` badge; a number in the name is triple redundancy.
Which rounds a rolled-up milestone covers belongs inside the file, not in its name.

## The run rhythm — scaffold, stub, update, wrap

The default lifecycle for a live run. It's a rhythm, not a ritual — collapse
steps when the run is small (a burst logged after the fact is fine); what must
survive any adaptation is the invariants: full milestone frontmatter, one
milestone per mapping unit, summary at wrap.

1. **Scaffold before starting.** `ls <issue>/agent-log/` → next `NNN_` value →
   create `NNN_<code>_<name>/` with `00_goal.md` (what triggered the run, what
   "done" looks like) — and `02_task_list.md` when there's live state to track.
2. **Stub the milestone when its unit begins** — a phase kicks off, a loop
   iteration starts: write the `1NN_` file with full frontmatter,
   `status: in-progress`, and a couple of lines on what it's attempting. Now the
   badge shows live state, and a dead session still leaves a trace on disk.
3. **Update it when the unit completes** — flip `status` to `success`/`failed`,
   fill in Approach / Result (with evidence) / Next. Never one file for the
   whole run at the end.
4. **Wrap with `01_summary.md`** — every run, no exceptions; an activity that
   ends without a summary is unfinished bookkeeping.

### Rich outputs graduate to `notes/` — link, don't inline

A milestone records *how it went*; it is not the home for the deliverable
itself. When a run produces something dense and durable — an architecture
write-up, a settled design, a diagram, an HTML artifact (dashboard, visual
explainer — built with the **agent-ks-artifacts** sibling skill) — put it in
`notes/` (or `brainstorm/` if still in flux) and have the milestone link to it.
Rule of thumb: if a section outgrows its bullets, it's a note wearing a
milestone's hat.

### Optional one-liner convenience

`agent-ks issue add-agent-log <issue-id> [--group <activity-folder>] --status …
--body "…"` exists for a **single-line** entry only (e.g. "rebased onto main, harness
green") — it auto-increments and writes valid frontmatter but **flattens any multi-line
body into one paragraph**. Never use it for a real milestone.

## Fast bursts — subtask running-log vs an `it` activity

For rapid ad-hoc changes landed in a burst, pick the logging home by how much
**nuance** each change carries:

- **Low-nuance / mechanical** → one **subtask** used as a running checklist — create
  once, append a line per change, check them off.
- **Carries reasoning / decisions** → an agent-log activity of kind **`it`** — the
  milestone shape preserves what a checklist line would lose.
- **When ambiguous, ask the user which mode they want** — don't default silently.

## Boundaries

- **`02_task_list.md` vs `subtasks/`** — subtasks are the issue's durable *plan*
  (first-class, stateful, counted); an activity's task-list is the working checklist
  for one run. **Plan vs execution** — never recreate one inside the other.
- **Working dialogue vs `comments/` vs `brainstorm/`** — durable decisions and
  hand-offs go to `comments/`; deliberation goes to `brainstorm/` (kind `discuss`).
  In-run dialogue is saved **only when the user explicitly asks** — offer when it turns
  dense or decision-bearing, never persist on your own initiative.
- **`agent-memory/` is not part of agent-log** — it's a first-class sibling section
  (see [26_agent-memory.md](26_agent-memory.md)): the log records *what happened*,
  memory holds *what's still true*.

## When NOT to edit

- Don't rewrite history — append; prior milestones stay as written.
- Don't scaffold empty activity folders or meta files nothing needs.

For a worked example of a long autonomous run, see [63_agent-loops.md](../60_examples/63_agent-loops.md).
