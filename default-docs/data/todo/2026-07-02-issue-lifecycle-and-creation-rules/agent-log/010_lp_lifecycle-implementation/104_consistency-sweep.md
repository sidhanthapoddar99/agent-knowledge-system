---
title: "Milestone 4 — post-completion consistency sweep (subtask 08)"
iteration: 4
status: success
---

## Goal

Subtask 08: one final cross-surface pass verifying every place that *describes* the
lifecycle matches what the code actually *does*, now that 03–07 have all shipped.
Descriptions written mid-flight (04–06) can drift from the final behaviour; this is the
backstop.

## Approach

Established the shipped ground truth by re-reading `astro-doc-code/src/loaders/issue-status.ts`
(the 7 statuses, the 4 categories in UI order, the colour map, the verbatim
`unknownStatusMessage`). Then:

- **Broad mechanical sweep** across every describing surface (user-guide `19_issues/`,
  `guide.ts`, themes, dev-docs) for stale vocabulary.
- **Haiku subagent** for the exhaustive semantic pass over all 21 `19_issues/` pages —
  cross-checking colours, category membership, tab order, error-message quotes, AI-rule
  numbers, and `--include-*`/default-scope phrasing against the embedded ground truth.
- **Cross-checked the ambiguous items against shipped code** rather than guessing: the
  subtask-state CSS classes (real: `state-done`/`state-dropped`/`state-review`, not the
  themes doc's fictional BEM names), the tab set (`Active / In Progress / Review / Not
  Started / Closed / All`), and the URL query param (really `?state=` — kept, like
  `data-state` and the `set-state` verb).
- **Repo-wide completeness grep** for anything the targeted sweeps missed.

## Result — drifts found & fixed

- **User-guide (4 hard + 2 field-name drifts):** `05_sub-docs/03_subtasks.md` (two
  `closed`→`done` in the transition paths, heading "State"→"Status transitions", the leaf
  "`state`/`done` frontmatter"→"`status` frontmatter"), `05_sub-docs/05_agent-log.md`
  ("Close out on `closed`"→`done`), `05_sub-docs/04_notes.md` ("No `state` field"→`status`),
  `09_using-with-ai.md` (helper-script table: `--state`→`--status`, "subtask state
  summary"→"status", `set-state.mjs` "`status`/`state` frontmatter"→"`status`").
- **Themes doc `25_themes/…/07_issues-styles.md`:** the tab description
  ("Open/Review/Closed/Cancelled"→the six category tabs) and the status-colour example
  (`--closed`/`--cancelled`→the full 7-status set with correct semantics: done=success,
  dropped=error).
- **This issue's `issue.md`:** the problem-framing line "The current model **is** 4 flat
  states" → "The prior model **was**…" (the reversal has shipped; present tense was stale).

## Verified clean (no change needed)

- `guide.ts` — no hardcoded hex, no stale status words; legend correct.
- Skills (both) + `CLAUDE.md` — already reconciled in subtask 06 (milestone 3); re-swept, clean.
- `notes/01_lifecycle-vocabulary.md` — all 7 colours match the code exactly; `brainstorm/`
  carries a `**Resolved →** notes/01` marker.
- Dev-docs — no lifecycle vocabulary.
- **Repo-wide:** the remaining `cancelled` / `4-state` mentions are all *historical records
  in other issues' folders* (comments, completed subtasks, notes recording what was true at
  the time) — correctly preserved per the tracker's memory philosophy, NOT live describing
  surfaces. Nothing to change there.

Design diagrams that list "Not Started" first (`02_design-philosophy.md`,
`06_lifecycle-and-review.md`) are left-to-right lifecycle-flow illustrations, not tab-order
claims — left as-is (the actual tab-order examples correctly show In Progress first).

## Flags for sidhantha (product choices, not drifts)

Two behaviours shipped as unilateral choices, documented accurately but his to veto:
the **"Active" default list tab** (union of non-closed) and the **click-cycle happy-path**
(`open → in-progress → review → done → open`; blocked/input-needed/dropped are set by editing,
not cycling).

## Verification

- `bun run build` — exit 0, 640 pages, Complete!
- `docs-guide check issues` — exit 0 (only pre-existing unrelated warnings).

## Next

Subtask 08 → review. Then subtask 09 (doc-issues skill restructure — foldered references,
documentation-guide prerequisite note, scripts-home decision) — LAST, and it renames the
reference files milestone 3 just edited. Then wrap: all subtasks → review, `01_summary.md`,
leave the issue open for sign-off.
