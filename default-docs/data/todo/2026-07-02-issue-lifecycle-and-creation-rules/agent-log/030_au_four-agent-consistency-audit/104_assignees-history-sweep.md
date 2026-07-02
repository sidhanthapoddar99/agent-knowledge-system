---
title: "Iteration 4 — assignees-history narration sweep"
iteration: 4
status: success
---

## Goal

Sidhantha's specific request: the tracker used to derive "is being worked on"
from `assignees.length > 0`; that mechanism was retired in favour of the explicit
`in-progress` status (single source of truth). During that transition some prose
was rewritten as *"previously it was based on assignees, but now…"* — narrating
the history instead of documenting the present. Docs and skills should reflect
the **current state**; migration history belongs in tracker records. One Opus
agent swept user-guide, dev-docs, both skills, `guide.ts`, `CLAUDE.md`, README,
and loader/layout code comments. **Report-only** — no edits until sidhantha's
word (which came with the reopen: fix them).

## Result — 2 findings, both class A (history-narration); zero class B

1. **`user-guide/19_issues/02_design-philosophy.md:46`** — bullet narrating
   "The old in-progress signal was derived from `assignees.length > 0`, and that
   never matched practice…" inside the 2026-07-02 doctrine-revision passage.
   Direction: argue the rationale in present tense (a derived signal would lie;
   an explicit status is the single source of truth) without "the old way was".
2. **`doc-issues` skill, `00_anatomy/02_per-issue-settings.md:41`** — parenthetical
   "(An earlier convention derived in-progress from `assignees.length > 0`; that
   policy was reversed on 2026-07-02…)". The preceding line already states the
   current design; the parenthetical is pure migration narration. Direction:
   delete it.

Crucially, **no class B** (old behaviour described as if current) anywhere — the
retirement itself propagated fully. Cleared as legitimate present-tense material:
the `assignees[]` metadata docs in per-issue setup and list-view (both explicitly
say assignment ≠ progress, as current design), the live AI-handoff validator rule
in `check.mjs` (assignees naming an agent → wants a subtask — a current rule, not
the retired derivation), the assigned/unassigned filter machinery, and
`issue-status.ts:56`'s legacy-value tolerance comment (about the `state`→`status`
value renames — a different, code-internal concern). `CLAUDE.md`, README, and all
of dev-docs: zero assignee-derivation content. `data/todo/` excluded per
instructions (tracker records are the correct home for history).

## Next

Both findings fixed in the fix wave (milestone 105) per sidhantha's follow-up
instruction to fix and complete.
