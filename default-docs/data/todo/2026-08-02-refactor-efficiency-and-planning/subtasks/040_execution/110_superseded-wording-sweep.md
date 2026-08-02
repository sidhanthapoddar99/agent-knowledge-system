---
title: "Sweep — delete superseded wording, and make the rule explicit"
status: review
---

# Overview

Two halves, and the sweep is the bigger one:

1. **Write the rule** — *correct in place, keep nothing.* No struck-through text,
   no *"this previously said…"*, no annotated-stale sections. Where history
   genuinely matters it goes in the tracker, never in the shipped rule.
2. **Remove the wording that is already there**, and delete the three existing
   rules that mandate keeping it.

**Done when** `grep -riE "superseded|previously (said|read)|deprecated but kept"`
over the skill, the scaffolders and the user-guide returns only the new rule
itself, and no scaffolder emits a keep-the-old-wording instruction.

# References

- The ruling: [What each section is for](../../notes/60_section-responsibilities.md)
  → *Superseded wording is deleted, never kept*
- Provenance: [thread 07](../../brainstorm/07_discuss_section-responsibilities.md) → Q4
- Why it matters at this size: [the recording-overhead audit](../../notes/10_efficiency-audit-2026-08-02.md)
  names *"corrected in place with the superseded wording kept"* as the reason
  files only ever grow

# Todo list

- [x] Write the rule into the skill, once, where an agent will hit it
- [x] Delete the rule's opposite in `references/20_sections/26_agent-memory.md`
      — *"answered questions move to an `Answered` section, never deleted"*
- [x] Delete the same instruction from the **plan scaffolder**,
      `agent-ks-docs/scripts/issues/new-memory-plan.mjs` — it emits the rule into
      every plan file it creates, so this is the one that keeps reproducing
- [x] Delete it from the user-guide,
      `19_issues/05_sub-docs/07_agent-memory.md`
- [x] Sweep the skill and user-guide for wording preserved *because it was
      superseded*, and delete it
- [x] Decide the deprecated-vocabulary entries (`wip`, `blocked` as labels) —
      kept "for back-compat" in `19_issues/04_setup/02_vocabulary.md`. Under the
      greenfield rule these are candidates for deletion, not preservation
- [x] `./start build` clean afterwards

# Outcomes and Next Steps

## The rule, written once

> **Superseded wording is deleted, never kept.** Correct in place and keep
> nothing — no struck-through text, no *"this previously said…"*, no
> annotated-stale section. Where the history matters it belongs to the tracker —
> the issue that made the change — never to the file being corrected.
> **This applies to what is already there, not only to what you write next.**

Placed in `SKILL.md` (where an agent hits it before editing anything) and in
`guide.ts`'s closing block. Once each. A rule about not duplicating text that was
itself duplicated across five files would have been its own counter-example.

Its companion also ships: **content that does not contribute is deleted** —
nothing has to be kept merely because it exists.

## What was deleted

| Where | What |
|---|---|
| `26_agent-memory.md` | *"Answered questions move to an `Answered` section, never deleted"* — the file said **both** this and *"a superseded section gets DELETED"*. The contradiction is gone; it now says it once |
| `new-memory-plan.mjs` | `git rm`-ed. It emitted the never-delete instruction into **every plan file it created**, which is why the rule kept reproducing |
| `19_issues/05_sub-docs/07_agent-memory.md` | the same instruction, plus ~150 lines of plan-file documentation |
| `04_setup/02_vocabulary.md`, `06_lifecycle-and-review.md`, `10_setup-new-tracker.md`, `01_per-issue.md`, `02_design-philosophy.md` | the `wip`/`blocked` **deprecated labels** and the policy-reversal narration around them |
| `040_execution/00_overview.md` | the note narrating its own former wording |

## The deprecated-vocabulary decision, and why it needed a migration

**Deleted, not preserved.** But `wip` was live in the bundled tracker: the root
`settings.jsonc` declared it and **14 issues carried it**, so removing the value
from the vocabulary would have made those issues invalid.

So it went into the migration script rather than a doc edit —
[`100`](./100_migration-script.md) now removes the two labels from the vocabulary
and from every issue carrying them, in the same pass as the status remap. 20
label change points across 17 files.

**A deprecated value left in a vocabulary is a permanent invitation to use it**,
and "kept so historical issues still validate" is a reason that expires the
moment something is willing to migrate them.

## Verified

`grep -riE "superseded|previously (said|read)|deprecated but kept|DEPRECATED"`
over the skill, the scaffolders and the user guide returns **only the new rule
itself** plus two ordinary uses of the word *superseded* meaning "replaced" (an
agent log's `dropped` status, and a plan's closing pointer) — which is the word
doing its job, not preserved stale text.

`./start build` clean at 933 pages; `agent-ks check issues` exit 0.

## Not in this sweep, and one correction

- **The consumer's `CLAUDE.md` and source comments** — [`060`](../060_sidequest-neurasutra.md), runs last.
- **`~/.claude/CLAUDE.md`** — [`020`](./020_update-global-claude-md.md) holds the
  proposed diff.
  **Correction: this subtask recorded a never-delete rule at
  `~/.claude/CLAUDE.md:115`. There is no such rule in that file.** Line 115 is
  `Never below \`high\`.` in the Codex table, and a grep for the rule's wording
  over all 332 lines returns nothing related. Nothing is owed there; the rule the
  sweep was chasing lived in the skill, where it has now been deleted.

# Details

## The skill already contradicts itself here

`references/20_sections/26_agent-memory.md` says both:

| Line | Says |
|---|---|
| 57 | *"A superseded section gets DELETED, not annotated as stale."* |
| 77 | *"Answered questions move to an `Answered` section, never deleted."* |

Sid's ruling settles it in the first direction, everywhere. That also means the
argument line 77 rests on — *a decision whose reasoning is lost gets
re-litigated* — has to be met a different way: **the reasoning lives in the
tracker issue that made the decision.** That is not a loss, it is the routing
rule this whole issue is built on.

## Where it is worst

**Skills and `memory/` files, because they load into every session.** A preserved
old sentence there is a permanent tax on every run, paid whether or not anyone
ever needed the history. That is why Sid named those two specifically.

## Not in this sweep

- **`~/.claude/CLAUDE.md:115`** carries the same never-delete rule. It is Sid's
  personal global file — propose the diff, get sign-off. Covered by
  [`020`](./020_update-global-claude-md.md).
- **The consumer's `CLAUDE.md`, and its source-code comments** — both covered by
  [`060`](../060_sidequest-neurasutra.md), which runs last.
