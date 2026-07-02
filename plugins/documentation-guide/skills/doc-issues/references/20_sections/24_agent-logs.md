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

## Add an entry — write the file directly

1. Pick or create the activity folder: `ls <issue>/agent-log/` → next `NNN_` value →
   `NNN_<code>_<name>/`. Write `00_goal.md` (and `02_task_list.md` for a live run).
2. Find the next milestone prefix inside it (`101_`, `102_`, …).
3. Write the milestone with the Write tool using the shape above — real headings,
   bullets, evidence.
4. When the run wraps, write `01_summary.md`.

### Optional one-liner convenience

`docs-guide issue add-agent-log <issue-id> [--group <activity-folder>] --status …
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
