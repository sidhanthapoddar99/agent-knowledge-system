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
- **Remaining: 08 (consistency sweep — LAST of the descriptive ones), 09 (doc-issues
  skill restructure — LAST overall, renames reference files 06/08 touch).** Then wrap:
  all subtasks → review, `01_summary.md`, leave issue open for sidhantha's sign-off.
- **Out-of-scope finds queued for subtask 08:** `user-guide/25_themes/05_component-
  styles/07_issues-styles.md` still names `.issue-subtask__state--cancelled`/`closed`
  CSS classes; sweep dev-docs; re-check the user-guide's own `AI rule #N` cross-refs
  against the 6-rule list in `00_overview.md`.

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
