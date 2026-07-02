---
title: "Summary — lifecycle implementation loop (all subtasks → review)"
---

The `/loop` run that implemented the expanded issue lifecycle end to end. Ground truth
was `notes/01_lifecycle-vocabulary.md`; every subtask built against it. **All nine
subtasks are now `review`** — the issue stays `open` for sidhantha's sign-off (he owns the
`done`/`dropped` transition).

## What shipped

A **7-status / 4-category** lifecycle, both **fixed in framework code** (a tracker can
override only colours), replacing the old 4-flat-state model:

| Category | Statuses |
|---|---|
| Not Started | `open` · `blocked` |
| In Progress | `in-progress` |
| Review | `input-needed` · `review` |
| Closed | `done` · `dropped` |

Issues and subtasks now share **one field (`status`) and one vocabulary**. Agents auto-set
`in-progress`, hand off at the Review category, and never mark `done`/`dropped` (human-only;
`dropped` needs a comment). The old "in-progress derived from `assignees.length > 0`" rule
is gone; the `wip` label is deprecated in place. Unknown status = a hard startup error with
a copy-pasteable message. UI filters by category.

## Milestones (one per iteration)

1. **`101` — code + migration (subtasks 03 + 07).** The single-source constant
   `src/loaders/issue-status.ts` (+ CLI mirror in `_lib.mjs`), shared hard validation,
   read-time legacy normalisation (so code shipped green before data migrated), the
   `2026-07-02_state-to-status.py` migration (ran on `data/todo/`, 248 files), the frontend
   category tabs/badges, and the `set-state --subtask` bug fix.
2. **`102` — user-guide (subtask 04).** 11 `19_issues/` pages rewritten.
3. **`103` — skill plugin (subtask 06).** Both skills + `CLAUDE.md`; version 0.4.0→0.5.0;
   cache mirrored. Also finished the subtask-07 tail — unified the CLI's subtask `.state`→
   `.status` (issue vs subtask `--json` had disagreed) and fixed stale tip text.
4. **`104` — consistency sweep (subtask 08).** Diffed every describing surface against the
   shipped code; fixed user-guide + themes-doc + this issue's `issue.md` tense drifts;
   confirmed the rest clean (remaining stale mentions are historical records in other issues).
5. **`105` — skill restructure (subtask 09).** Foldered `doc-issues/references/` into five
   band dirs (83 links rewritten, validated), the documentation-guide prerequisite note, and
   the CONTRACT.md §8 scripts-home rule; version 0.5.0→0.6.0; cache mirrored.

## Verification (final state)

- `bun run build` — green (640 pages).
- `docs-guide check issues` — exit 0 (only pre-existing unrelated warnings).
- CLI `_selftest.mjs` — PASS; `check-skill-links` — green on both skill roots.
- Repo plugin ↔ installed cache — `diff -rq` identical; `docs-guide` (cache) exercised.
- Committed across five commits on branch `loop/lifecycle-implementation`.

## Open decisions for sign-off (flagged, not vetoed)

Two product choices were made unilaterally and documented as shipped — sidhantha's to keep
or change:
- the **"Active" default list tab** (union of the non-closed categories), and
- the **click-cycle happy-path** `open → in-progress → review → done → open` (the other
  statuses — `blocked`, `input-needed`, `dropped` — are set by editing, not cycling).

One out-of-scope note for a future issue: `25_themes/…/07_issues-styles.md` documents a
fictional `.issue-subtask__state--*` BEM taxonomy; the real classes are `.state-*`. This
loop fixed only the lifecycle vocabulary there — the selector-accuracy gap is a separate
themes-doc concern.
