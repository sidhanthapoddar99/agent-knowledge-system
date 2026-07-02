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
  (he owns `done`). `01_summary.md` written. Do not resume the loop.
- **Post-loop sign-off + follow-ups (2026-07-02/03): DONE — activity folder
  `020_it_signoff-and-followups/`.** sidhantha approved the "Active" default tab, then
  asked to sign off the loop, fix 13, and complete 10–12. Result: **01–09 → `done`**
  (checkboxes ticked, statuses flipped); **10–13 implemented + verified → `review`**
  (agent ceiling; his to flip to `done`). What shipped:
  - **13** `subtasks.mjs` expands `all` before the vocab filter (mirrors `list.mjs:118`).
  - **12** status colours → top-level `statusColors` map; `fields.status` + unknown colour
    key = hard error (loader `resolveVocabulary` + `check.mjs`). Loader merges onto
    `DEFAULT_STATUS_COLORS` (fixed a latent partial-override bug), exposes
    `LoadedIssues.statusColors`, synthesises in-memory `fields.status` so badge layouts
    are untouched.
  - **11** component/label descriptions = required parallel `descriptions` map (hard error);
    `GuideModal.astro` on the index renders fixed lifecycle (from `issue-status.ts`
    constants incl. new `STATUS_DESCRIPTIONS`/`CATEGORY_DESCRIPTIONS`) + editable vocab.
  - **10** index badges show `review` for review-debt via shared `needsReview`/
    `effectiveStatus` in `server/helpers.ts` (badge↔tab one predicate); stored status
    untouched; detail/CLI keep stored.
  - One detection-only migration **`2026-07-03_root-settings-schema.py`** (two
    facets: status-colours-only + required descriptions; merged from two scripts at
    sidhantha's call — same file, same transition). Per-file `2026-07-02_state-to-
    status.py` stays separate (already applied, auto-writes frontmatter).
    `data/todo/settings.jsonc` migrated by hand.
  - Docs: 7 user-guide pages + skill (`03_overall-issue-tracker-vocabulary.md`, SKILL.md
    rule 4, `02_per-issue-settings.md` "4 states"→"7 statuses/4 categories").
  - Plugin **0.6.0 → 0.7.0**, repo↔cache `diff -rq` IDENTICAL. Build 651pp green, check
    exit 0, self-test PASS, skill-links green both roots.
  - **Anatomy refs renamed this session** (parallel task): `02_settings.md`→
    `02_per-issue-settings.md`, `03_vocabulary.md`→`03_overall-issue-tracker-vocabulary.md`.
- **REOPENED → AUDITED → FIXED → `review` (2026-07-03, activity folder
  `030_au_four-agent-consistency-audit/`).** After closing, sidhantha ran four
  parallel Opus audit agents (skills coherence · code↔user-guide ·
  error↔migration↔guide.ts · assignees-history sweep), then reopened the issue to
  record them (4 milestones + fix wave + summary) and fix everything actionable.
  Implementation itself: zero code bugs. 14 describing-layer defects fixed: dead
  `status` preset examples (docs + our own settings.jsonc "Blocked" view — presets
  filter priority/component/labels/assignees, never status), ≥10-issues view-default
  and URL-param claims, orphan-descriptions claim, full migration paths in all error
  messages (incl. unknownStatusColorMessage which cited nothing), per-issue fileHint
  via resolveSettingsPath, migration `guide` typo'd-statusColors gap, guide.ts `state
  frontmatter` label + **lifecycle line now GENERATED from CATEGORIES/STATUSES
  imports** (last hand-copy gone), review-queue one-liner, `wip` example label, two
  assignees-history narrations rewritten to present tense. Deferred (separate
  tickets): themes-doc fictional selectors, using-with-ai "planned" framing. All
  verified green. **Sidhantha reviewed and signed off same day: issue `done`**
  (comment `004_final-signoff.md`). This issue is finished for good — do not
  resume work under it; the two deferred concerns get their own issues.
- **ISSUE PREVIOUSLY CLOSED (2026-07-03).** Sidhantha signed off the whole issue after a final
  overview verification (build 652pp, check exit 0, self-test PASS, skill-links green,
  cache identical, migration verify clean, live surfaces confirmed, user-guide
  independently audited by a fork agent — its one defect, two dangling pre-merge
  migration names in `02_vocabulary.md`, fixed). Subtasks 10–13 `review → done`,
  issue `open → done`, all internal checkboxes ticked. Comment `002_issue-closed.md`.
  This issue is finished — do not resume work under it; new concerns get new homes.
- **Click-cycle happy-path**: implicitly accepted with the full sign-off (shipped,
  verified, closed without veto). **Out-of-scope doc-hygiene the sweep flagged:**
  `09_using-with-ai.md` still frames the skill/CLI as "planned".
- The related issue `2026-07-01-issue-anatomy-restructure` is fully `done` (all 7 subtasks
  signed off, incl. 04_update-skill-and-adhoc-command + 07_set-rules).
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
