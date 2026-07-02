---
title: Operating rules — creation thresholds, section boundaries, the dump
---

The decided operating rules for the restructured anatomy — the output of subtask
`02_decide-rules` (discussed sidhantha ↔ claude, 2026-07-02). Companion decisions on
lifecycle states live in `2026-07-02-issue-lifecycle-and-creation-rules`.

## Meta-rule — convention, never code

**None of these rules are enforced by code.** They live in the documentation
(user-guide `19_issues`), the bundled `guide.ts` panel, and the skills — as
standardized convention the AI follows and a human can override. No loader
validation, no CLI gates, no schema fields. If a rule ever needs teeth, that is a
separate, deliberate decision.

## Rule 1 — when a thought becomes an issue

**Litmus test: can you name its component and its first subtask in one breath?**

- Both nameable → it may be a full issue.
- Can't name a first subtask → it is not an issue yet. It is one of:
  - a **subtask** on the existing issue whose center of gravity it belongs to
    (one-prompt fixes always land here — never a new folder);
  - a **brainstorm entry** inside the issue it is trying to inform (deliberation
    about *what to do* never opens its own issue);
  - a **dump entry** (Rule 5) if it has no home yet.
- Center of gravity wins over novelty: work that would merely deepen an existing
  issue's scope extends that issue.

Supersession corollary (distilled from the migration-cluster refactor, subtask 05):
an issue that **shipped work stays an issue** — close it with a supersession comment
mapping its open questions to their fates. An issue that is **pure deliberation
converging elsewhere folds into the winner's `brainstorm/`** (with a
`**Resolved →**` overview + source-slug provenance) **and is deleted** — git history
keeps the original.

## Rule 2 — routing between the four sections

Two questions, four boxes:

| | In motion | Settled |
|---|---|---|
| **Thinking** | `brainstorm/` | `notes/` |
| **Doing** | `subtasks/` (the plan) | `agent-log/` (how it actually went) |

Comments deliberately fit no box — they are the changelog *of the issue itself*
(state flips, scope changes, hand-offs), not of the work.

## Rule 3 — brainstorm → notes graduation

Graduate **at the moment something downstream needs to cite the conclusion as
ground truth** — a subtask about to be written against it, code about to implement
it. "The discussion feels finished" is not the trigger; being *built upon* is.

Guardrails:

- A brainstorm that resolves to **"do nothing" doesn't graduate** — its
  `**Resolved →**` marker points at the closing comment (or says "dropped") instead
  of at a note.
- **A note that keeps changing is a brainstorm wearing the wrong hat** — demote it
  back (or split the still-moving part out).
- Graduation never deletes the brainstorm — the trail stays, marker on top
  (within-issue rule; distinct from the issue-level fold-in in Rule 1).

## Rule 4 — comments stay lean

A comment records *that* something happened — state flip, scope change, hand-off,
supersession, cancellation reason — in a couple of lines plus a pointer.

**Tripwire: the moment you're writing a second paragraph, you're in the wrong
section.** Debating → `brainstorm/`. Specifying → `notes/`. Link from the comment
instead of inlining. (Cautionary example: `update-date-time-optimization` comments
001–002 are notes-grade spec walkthroughs — flagged in subtask 05 for relocation.)

## Rule 5 — the issue dump

A lightweight capture surface for **unhomed, half-formed thoughts** — ideas that
fail the Rule-1 litmus test but shouldn't be lost.

**Shape — a dedicated `issue-dump` category holding a few dump issues:**

- Add **`issue-dump`** to the `component` vocabulary. It is the one deliberate
  exception to the layer-of-the-stack axis: it marks *pre-issues*, not a layer.
  Convention only — no code knows about it (meta-rule).
- The category holds **a small number of dump issues, one per kind of dump** —
  e.g. one for backlogs, one for future features/ideas — three or four at most.
  The existing `2025-06-25-future-feature-ideas` ("Backlog: unscheduled feature
  proposals") is the organic prototype; bless it into the category rather than
  rebuilding it.
- **Each dump entry is a subtask** of its dump issue — first-class state, URL, and
  count for free; no new loader shapes, no `inbox/` folder, no capture command
  required.

**Graduation — promote and delete:**

- A dump entry becomes a real issue **exactly when it passes the Rule-1 litmus
  test** (component + first subtask nameable in one breath).
- On graduation the entry is **deleted from the dump — not ticked off**. A dump's
  value is its *current* contents; completed entries are noise there. Git history
  keeps provenance, and the new issue links back if the dump entry carried real
  context.

**Boundary:** the dump is only for the *unhomed*. A one-liner that obviously
belongs to an existing issue goes straight to that issue's `subtasks/` — never
through the dump.

## Where these rules get written (propagation)

Decided: user-guide `19_issues` pages + bundled `guide.ts` + the
`documentation-guide`/`doc-agent` skills. Tracked as:

- this issue's `subtasks/07_set-rules` — the dedicated propagation subtask (skill,
  user-guide, guide.ts, `issue-dump` vocabulary, blessing the prototype dump);
- `2026-07-02-issue-lifecycle-and-creation-rules/subtasks/04–06` — carries the
  lifecycle-state side of the same propagation.

Deciding (`02_decide-rules`) is closed; setting (`07_set-rules`) tracks the rest.
