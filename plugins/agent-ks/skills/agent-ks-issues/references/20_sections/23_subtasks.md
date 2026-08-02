# Subtasks — `subtasks/[<group>/]NNN_<slug>.md` — scope

The atomic unit of work and the **AI-handoff anchor**. Each leaf `.md` is a first-class
subtask with its own status, URL, and count. Grouping folders are *labels only* — no
body file.

| Holds | Does not hold |
|---|---|
| The **actionable item** and the detail needed to execute it | **When it runs.** Order is the plan's |
| **Links to the notes** that scope it | The deliberation behind those notes — that is `brainstorm/` |
| The **final outcome** — what landed, with evidence | The specifics of *how* the outcome was reached — those are the agent log's |
| Acceptance criteria — how to tell it is done | A narration of the run that did it |

**A subtask is where the work is defined; the agent log is where it is carried out.**
That is the whole boundary, and every case above is an instance of it.

The one exception: when an agent log was opened for that single subtask, there is only
one place and no duplication to avoid.

## Subtasks are grouped by CATEGORY, never by order

> **A subtask's number is a stable id and a sort key within its category. It does not
> imply sequence.**

Counter-intuitive enough to be worth saying outright: everywhere else in this framework
a numeric prefix *is* an order. In `subtasks/` it is a label.

| | Means | Does not mean |
|---|---|---|
| The **group folder** | an **area** of work — a noun: `validator`, `migration`, `ui` | a phase, a stage, or a milestone |
| The **number** | a stable id, and where it sorts inside that area | when it runs, or what it depends on |

**Order lives in a plan** ([28_plans.md](28_plans.md)). A subtask may be scheduled by
several plans, or by none.

**The grouping test:** group by **area**, one level, and don't open a group for fewer
than about three leaves. If you cannot name the group as a noun without saying "phase"
or "step", it is a plan you are writing, not a group.

**The failure this prevents:** a group whose overview says *"reading order is execution
order"* and then lists a dependency chain. That chain is a plan. Written in the folder
tree it cannot be reordered, cannot be closed, and silently becomes wrong — which is how
paths like `09_rf_memory/022_wf_stage-6.10/113_slice3-build.md` happen, with *when* the
work ran encoded in a filename.

## Shape

```yaml
---
title: "Short imperative title"
status: open
---

Body — the five-section work order, below.
```

`status` uses the **canonical seven** — one shared field name, one shared set across the
whole tracker (see
[03_overall-issue-tracker-vocabulary.md](../00_anatomy/03_overall-issue-tracker-vocabulary.md)),
tracked independently per subtask.

A subtask may live at the root of `subtasks/`, or nested up to 5 levels deep. **The
folder is a label only** — no folder body file. **Keep to 3 levels or fewer.** Folders
use the same numbering as leaves and sort interleaved with them. In the sidebar a group
folder shows **done/total** (the Closed category — `done`/`dropped` — counts as done);
the section header carries the same count plus an amber review-dot when any subtask sits
in the Review category.

**Optional folder `settings.json`:** `{ "title": "..." }` overrides the slug-derived
sidebar label. Skip the file when the slug already reads cleanly.

### The series index — the `00_` leaf

A group with roughly 6+ leaves may open with an **index leaf**: any leaf carrying the
`00_` prefix, sorting first. Ordinary work orders start at `10_`.

It is a regular subtask **file**, not a folder body, and it belongs inside its group.
Scaffold one with `agent-ks issue new-subtask <id> --group <g> --index`.

Its four sections, distinct from the work-order template:

- **Overview / Goal** — what the series is and why it started.
- **References** — the `notes/`, brainstorm conclusions and rulings that govern every
  leaf.
- **Subtasks** — a per-subtask status table for the group.
- **Conclusions and Summary** — `PLACEHOLDER` until the series closes.

Its `status` is **derived from its siblings**: `open` while every sibling is `open`;
`in-progress` once any sibling is non-open and the group is not closed; `done` once every
sibling is Closed. Flipping it is mechanical bookkeeping, not a hand-off — you may do it.
`check issues` warns when it disagrees with the derived value, and the template lint
skips index leaves.

## Numbering — `NN_` or `NNN_`, gap-spaced

Subtasks use the shared ordering-prefix grammar (2–5 digits, ordered by *numeric value*,
so widths coexist — `01_` and `010_` sort as 1 and 10). This applies to leaf files
**and** grouping folders.

| Width | When |
|---|---|
| `NN_` | **Conventional** — the baseline for most subtask lists |
| `NNN_` | **Also conventional, used freely** — when a folder holds a complex flat-but-grouped set (the leading digit annotates a group: `110_`/`120_` = group 1, `210_` = group 2), or simply has many subtasks |
| `NNNN_`+ | **Very rare** — only when genuinely required |

**Gap-number** either width (step 10, or 5 for denser sets) so a new subtask slots
between two existing ones without renumbering.

**Separator:** `_` is canonical; the loader tolerates `-`. Prefer `_`.

## How to write a subtask — a self-sufficient work order

**The test: hand it to a competent person who has none of your session context. Could
they build the right thing?** If they would have to ask "but what exactly?", it is not
written yet.

Scaffold it with `agent-ks issue new-subtask <id> --name <slug>`:

```markdown
# Overview
What this subtask is, what triggered it, what "done" looks like.

# References
The material this work rests on: related notes/, the agent log executing it, the
brainstorm threads it resolved from. Full paths.

# Todo list
- [ ] The checklist (nested checkboxes welcome; check off as work lands)

# Outcomes and Next Steps
PLACEHOLDER until completion — then: what landed (with evidence — commits,
measurements, agent-log links), what was deferred, concrete next steps.

# Details
The spec, design reasoning and scope rulings — everything a cold reader needs.
```

- **References** — a subtask whose real spec lives in a conversation, a workflow prompt,
  or an agent's head is unscoped.
- **Todo list** — deliverables, concrete and enumerable: not "build user management" but
  *which* actions, *what* they return, *what* gets recorded. Fold "Done when" acceptance
  criteria in so `review` is verifiable.
- **Outcomes and Next Steps** — filled at hand-off, **before** the status flips to
  `review`. The template lint (`agent-ks check issues --subtask-template`) flags a
  Review/Closed subtask still carrying the placeholder.
- **Details** — **the spec lives here, inline.** For subtask-scoped specs this replaces
  a separate one-consumer note. `notes/` stays the home for material shared across
  subtasks or outliving the issue — link those, don't inline them.

Formatting:

- **Checkboxes with a bolded lead**, then the explanation:
  `- [ ] **Move the loader.** \`src/loaders/x.ts\` → …`.
- **`##` groups** when the list outgrows a flat sequence.
- **Spell out pointers** (`<issue>/notes/02_operating-rules.md`) instead of shorthand —
  shorthand rots when files move.
- **Decision markers** for anything settled mid-flight:
  `**Decided (author, YYYY-MM-DD):** …`.

## Create a subtask

1. **If your context on this area is thin, run the duplicate check** first (see
   [42_updating.md](../40_operations/42_updating.md)). If it returns an existing subtask
   covering the same work, tell the user instead of creating.
2. Decide which **area** it belongs to — not which phase.
3. Find the next prefix in that folder: `ls <target-folder>/` → the next gap-spaced
   value. Folders and leaves share the numbering at each level.
4. Write it with `title` and `status: open`, in the five-section shape.
5. If a related issue or subtask turned up in the duplicate check, link it.

## Update a subtask status

```bash
agent-ks issue set-state <issue>/subtasks/NN_<slug>.md review
agent-ks issue set-state <issue> review --subtask NN      # resolves the subtask file
```

> **AI rule:** set `in-progress` when you start, hand off at `review` (or
> `input-needed` with the question inline) — never `done`/`dropped`, which are
> human-only transitions.

## Rapid mechanical changes

For a burst of low-nuance changes, one subtask can serve as a running checklist —
create it once, append a line per change, tick them off. If each change carries
reasoning worth keeping, that is one agent log of kind `it`
([24_agent-logs.md](24_agent-logs.md)). When ambiguous, ask.
