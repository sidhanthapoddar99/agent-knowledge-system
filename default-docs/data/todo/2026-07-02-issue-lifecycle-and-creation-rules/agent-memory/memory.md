---
title: "Agent memory — lifecycle implementation loop"
---

Working state for the `010_lp_lifecycle-implementation` loop. Ground truth is
`notes/01_lifecycle-vocabulary.md`; this file is durable orientation for the next
iteration (context may reset between loop wake-ups).

## In progress (iter 2 — subtask 04, user-guide docs)

- **Core 19_issues pages rewritten by main agent (done):** 06_lifecycle-and-review
  (full rewrite), 02_design-philosophy (policy-reversal sections), 04_setup/
  02_vocabulary (fixed-vocabulary contract + single-constant note), 09_using-with-ai
  (agent rules + transition tables), 05_sub-docs/03_subtasks (shared status table).
  Plus unassigned: 07_ui/02_detail-view, 08_workflows/01_create-an-issue.
- **6 peripheral pages delegated to 2 subagents (verify on completion):**
  A → 01_overview, 08_workflows/02_work-an-issue, 08_workflows/03_review-and-close;
  B → 07_ui/01_list-view, 04_setup/01_per-issue, 04_setup/10_setup-new-tracker.
- **Remaining for iter 2:** reconcile subagent output, final `grep` sweep for
  `cancelled`/`4-state`/`state:`/assignee-in-progress across 19_issues, `./start
  build` green, mark subtask 04 → review, log milestone 102, tick task list.
- **Out-of-scope find for subtask 08 sweep:** `user-guide/25_themes/05_component-
  styles/07_issues-styles.md` still names `.issue-subtask__state--cancelled` /
  `closed` CSS classes (renamed to done/dropped in the ship). Also check dev-docs
  and `guide.ts` (subtask 05) / skill (subtask 06).

## Where things stand (after iter 1)

- **Phase 1 (code + migration, subtasks 03 + 07): DONE, green, marked review.**
  Data is migrated to the unified `status` vocabulary. Build + `docs-guide check
  issues` both green. Committed on branch `loop/lifecycle-implementation`.
- **Remaining: 04 (user-guide), 05 (guide.ts), 06 (skill plugin), 08 (consistency
  sweep — LAST of the descriptive ones), 09 (doc-issues skill restructure — LAST
  overall, renames reference files 06/08 touch).**

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
- Two product choices made unilaterally, flagged for the subtask-08 sweep / sidhantha:
  the **"Active" default meta-tab** (union of non-closed, preserves closed-hidden
  default) and the **click-cycle happy-path** (`open→in-progress→review→done`;
  blocked/input-needed/dropped set by editing, not cycling).
- `guide.ts` (subtask 05) can `import` the constant from the loader (same tree) —
  prefer that over restating values.
