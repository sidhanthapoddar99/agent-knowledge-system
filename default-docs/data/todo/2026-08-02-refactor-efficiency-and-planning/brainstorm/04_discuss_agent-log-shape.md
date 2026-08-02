---
title: "04 — The agent-log's shape: three slots, settings.json, and nesting"
---

# The agent-log's shape

> **Resolved →** [`notes/20_agent-log-structure.md`](../notes/20_agent-log-structure.md)
> — decided 2026-08-02. The spec lives there; this thread is kept for the
> reasoning and the seams that were argued out.

Thread question: **what does an activity folder hold, and what must leave it?**

Converged shape (Sid, 2026-08-02), replacing the standard six slots with three
plus machine-readable metadata.

## The shape

| Slot | Form | Holds |
|---|---|---|
| **`summary.md`** | always a **file** | Goal, trigger, references (subtask + plan links), the run's task list, status, and links to the final outcome |
| **`working/`** | mostly a **folder** | The iterations — each iteration's agent outputs, its mid-flight decisions, its results and benchmarks |
| **`notes/`** | mostly a **folder** | Handover: caveats, open questions, dead ends, out-of-scope discoveries |
| **`settings.json`** | file, per log **and per sub-log** | Status (drives the symbol colour), iteration type, metadata |

Mapping from the six: `00_goal` + `02_task_list` → **summary**; `03_working` +
`01_summary` + `04_benchmark` → **working/** as iterations; `05_notes` →
**notes/**. Status leaves prose entirely and becomes data.

## "Iterations", not "results" — the name is load-bearing

`results` is a noun that includes everything, and per
[01](./01_discuss_why-logs-outweigh-code.md) a noun-named slot attracts the whole
story. **"Iteration 3" is scoped by construction** — it can only contain what
happened in iteration 3.

This also dissolves the earlier RESULTS-vs-NOTES seam: an iteration *is* its own
result, including a failed one. There is no separate place for "what came out of
it" to be written a second time.

## Status as data, not prose — and derived, not stored

`settings.json` carrying status is the right call twice over: the UI can render
it, and **prose stops being the carrier of state.**

Push it one step further, on the same principle as
[plans-as-references](./03_options_plans-as-references.md): **a parent activity's
status should be derived from its children's, not stored.** A run whose three
iterations are `success / success / failed` is not separately "in-progress"; it
is whatever its children say. Stored parent status is a second copy of a fact and
will drift.

Vocabulary: an activity is **not** a work item, so it should not borrow the
seven-status issue vocabulary — `review` and `blocked` mean nothing for a run.
Propose `not-started / in-progress / success / failed`, and say explicitly that
`done` is not an activity status, or people will reach for it.

## Five seams that will leak unless cut now

**A. `summary.md` holds a "result conclusion" and `working/` holds results.**
This is the duplication the whole model exists to kill, reappearing at the top.
**Cut: summary carries a one-sentence verdict and a link — never a paragraph.**
One line is orientation; a paragraph is a copy. State the threshold explicitly,
because "summarise the outcome" without a limit reliably produces the whole story
again.

**B. `summary.md` holds "some brief notes" and `notes/` exists.**
**Cut: summary has no notes section at all.** If it is worth writing, it is worth
writing in `notes/`.

**C. Mid-flight decisions — "in the iteration, or in notes".**
Split by lifetime, not by convenience:
- A decision that only affects **this iteration** → the iteration. Fine.
- A decision that **outlives the run** → must LEAVE the log entirely, to the
  issue's `notes/`, with the iteration linking to it.

Durable decisions scattered across dozens of iteration folders are unfindable —
that is precisely how findings got lost in the audited project. Depends on the
unresolved decision-home question in
[02](./02_discuss_section-model-and-leaks.md).

**D. The run's task list vs the plan.**
Distinct and legitimate: the activity's list is finer-grained and disposable, the
plan's is durable ordering. **Cut: the activity task list is run-local and dies
with the run. If an item outlives it, it becomes a subtask.** Otherwise it
becomes a second copy of the plan's stages.

**E. Where do subagent outputs land now?**
`working/`, inside the relevant iteration. This was explicit when the slot was
called WORKSPACE and must not be lost in the rename — it is the highest-value
rule in the model. Protocol in
[05 — the subagent protocol](./05_discuss_subagent-protocol.md).

## Two things that must LEAVE the log

1. **Anything actionable → a subtask or a dump entry.** A bug recorded only as
   log prose dies in the log. The log keeps a pointer.
2. **Anything durable → a note.** A finding that would still be true if the run
   had never happened is not run state.

## Nesting — mirror the plan, never invent

A plan with ten stages gives each stage its own agent-log (Sid's analogy). Right,
and for a precise reason: the nesting **mirrors a structure that already exists**
rather than inventing one. That is the difference from today's
`09_rf_…/022_wf_…/113_…`, an ad-hoc hierarchy nobody can reconstruct.

**Constraint: log depth mirrors the goal decomposition, and never exceeds it.**
Generalised 2026-08-02 — the parent need not be a plan. A long-running loop, a
programme, or any larger goal that decomposes into named sub-goals nests the same
way. A child with no goal of its own is an iteration file wearing a folder.

**Consequence: milestone files disappear.** Their job was narrating one phase of
a long run; that is now the stage's own activity. One fewer file class.

**Naming: iterations and sub-logs get names, not bare numbers.**
`02_copy-completeness/` beats `02_iteration/` for the same reason an anonymous
`001_plan.md` defeats the purpose.

## When an activity is opened at all

Without a rule, three slots become a three-file floor for a one-line change — the
same disease with a smaller number. Sid: *"we don't create logs for quick one-off
tasks anyway."* Make it explicit:

**An activity opens when work is delegated, or when it runs over multiple
rounds.** Anything the main agent does inline gets a line in the plan and no
folder.

## Still open

- The decision home (seam C) — blocked on
  [02](./02_discuss_section-model-and-leaks.md).
- Does `settings.json` metadata want a fixed schema, or free-form? Fixed enough
  to render, open enough not to need a framework change per field.
- Merging **contradictory** subagent findings is orchestrator work, not a
  finding. It belongs to the iteration that commissioned them — confirm.
