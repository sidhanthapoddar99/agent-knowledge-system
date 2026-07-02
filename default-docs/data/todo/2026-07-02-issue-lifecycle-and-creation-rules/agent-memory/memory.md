---
title: "Agent memory — lifecycle implementation loop"
---

Working state for the `010_lp_lifecycle-implementation` loop. Ground truth is
`notes/01_lifecycle-vocabulary.md`; this file is durable orientation for the next
iteration (context may reset between loop wake-ups).

## Where things stand (after iter 3 — subtask 06 done)

- **Phase 1 (code + migration, subtasks 03 + 07): DONE, review, committed.** Data
  migrated to the unified `status` vocabulary; build + `docs-guide check issues` green.
- **Subtask 04 (user-guide, iter 2): DONE → review.** 11 `19_issues/` pages rewritten;
  milestone 102.
- **Subtask 05 (guide.ts, iter 2): DONE → review.** Panel legend = 7 statuses/4 cats.
- **Subtask 06 (skill plugin, iter 3): DONE → review.** Both skills + `CLAUDE.md`
  updated, version 0.4.0→0.5.0, cache mirrored + `diff -rq` identical; milestone 103.
  While here, finished the subtask-07 tail: the JS CLI mirror still exposed subtask
  `.state` while the TS side used `.status` — unified it (fixes issue-vs-subtask `--json`
  disagreement); also fixed a stale user-facing `list` tip and AI-rule cross-ref numbers.
- **Subtask 08 (consistency sweep, iter 4): DONE → review.** All describing surfaces
  diffed against `issue-status.ts`; fixed user-guide (4 hard + field-name drifts),
  themes doc, this issue's `issue.md` tense. guide.ts/skills/CLAUDE.md/notes/brainstorm
  clean. Repo-wide leftover `cancelled`/`4-state` = historical records in *other* issues
  (preserved, not drift). Build 640pp green, check exit 0. Milestone 104.
- **Subtask 09 (skill restructure, iter 5): DONE → review.** References foldered into 5
  band dirs (83 links rewritten, `check-skill-links` green both roots), prerequisite note,
  CONTRACT.md §8 scripts rule; version 0.5.0→0.6.0; cache `rsync --delete` + identical.
  Milestone 105.
- **LOOP COMPLETE — all 9 subtasks `review`, issue still `open` for sidhantha's sign-off**
  (he owns `done`). `01_summary.md` written. Nothing left to execute; do not resume the
  loop. If reopened, the only pending items are sidhantha's two flagged product choices
  (Active default tab, click-cycle happy-path) and the out-of-scope themes-doc selector gap.
- **Two product choices flagged for sidhantha (documented, not vetoed):** the "Active"
  default list tab + the click-cycle happy-path (`open→in-progress→review→done→open`).
- **Themes-doc note (beyond lifecycle scope):** `07_issues-styles.md` documents a
  fictional `.issue-subtask__state--*` BEM taxonomy; the *real* classes are `.state-done`
  etc. I fixed only the lifecycle vocabulary there — the selector-accuracy gap is a
  separate themes-doc concern, not this issue's.

## Key file map (for the prose subtasks)

- Framework constant (cite as the code source of truth):
  `astro-doc-code/src/loaders/issue-status.ts` — 7 statuses, 4 categories, colors.
- CLI vocabulary mirror: `plugins/documentation-guide/skills/documentation-guide/
  scripts/issues/_lib.mjs` (STATUSES/CATEGORIES). **Every CLI edit must be mirrored
  to the installed cache** `~/.claude/plugins/cache/sids-plugin-marketplace/
  documentation-guide/0.4.0/…` and `diff -rq`-verified (parity rule).
- Migration: `plugins/…/migration/2026-07-02_state-to-status.py` (+ mirrored to
  cache). Precedent it follows: `2026-06-22_done-to-state.py`.

## Decisions that constrain the prose (don't re-derive)

- 4 categories (Not Started / In Progress / Review / Closed), 7 statuses
  (open, blocked, in-progress, input-needed, review, done, dropped). Both FIXED IN
  CODE — users get colors only. Agent auto-sets `in-progress`; hits-a-wall →
  `input-needed` with the question inline in the subtask; ceiling = Review
  category (`done`/`dropped` human-only, `dropped` needs a comment). Transitions
  unenforced. UI filters by category. `wip` label deprecated-in-place.
- Colors: open #888888 · blocked #d1854f · in-progress #61afef · input-needed
  #e8a54b · review #f0c674 · done #7ec699 · dropped #c678dd.

## Gotchas learned

- The loader normalizes legacy at read-time, so code could ship before data
  migrated — that's why iter 1 stayed green throughout. Docs should describe the
  SHIPPED end-state (no `state:`, no closed/cancelled), not the migration mechanics.
- DOM attribute `data-state` was deliberately KEPT (internal rendering detail);
  only the loader data field is `.status`. Don't "fix" `data-state` in docs as if
  it were the field name.
- **CLI internal property is now `.status`** (iter 3) — the JS mirror `_lib.mjs`
  `makeSubtask()` returns `{ status, category, … }` and `subtasks --json` emits
  `status`, matching the TS loader and the issue-level output. The frontmatter reader
  still accepts legacy `state:` (`fm.status ?? fm.state`) and the `set-state` verb /
  `--state` flag alias stay. So: field name = `status` everywhere; only the CLI verb
  `set-state` and the DOM `data-state` keep the word "state".
- Two product choices made unilaterally, flagged for the subtask-08 sweep / sidhantha:
  the **"Active" default meta-tab** (union of non-closed, preserves closed-hidden
  default) and the **click-cycle happy-path** (`open→in-progress→review→done`;
  blocked/input-needed/dropped set by editing, not cycling).
- `guide.ts` (subtask 05) can `import` the constant from the loader (same tree) —
  prefer that over restating values.
