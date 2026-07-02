---
title: "Iteration 5 — fix wave: all actionable findings closed"
iteration: 5
status: success
---

## Goal

Close every actionable finding from milestones 101–104 in one wave, leaving only
the two pre-agreed separate tickets (themes-doc selectors, `09_using-with-ai.md`
"planned" framing) untouched.

## What changed

**Framework code** (`astro-doc-code/src/`):
- All three v0.7.0 hard-error messages now cite the migration script by its
  full findable path (`plugins/documentation-guide/skills/documentation-guide/
  migration/2026-07-03_root-settings-schema.py`) — and
  `unknownStatusColorMessage` (which cited nothing) now points there too, in
  both the loader and CLI `check.mjs`.
- Per-issue status-error fileHint now uses `resolveSettingsPath(folderPath)`
  (`.jsonc` wins) instead of hardcoding `settings.json` — matching the root
  hint's behaviour.
- `guide.ts`: the ASCII diagram's stale `state frontmatter` → `status
  frontmatter`; and the 7-statuses/4-categories line is now **generated from the
  imported `CATEGORIES`/`STATUSES` constants** (new `lifecycleLine()` helper) —
  the docstring's "guide.ts consumes this module" claim is finally true, and
  the panel can no longer drift from `issue-status.ts`.

**Migration script** (`2026-07-03_root-settings-schema.py`):
- `guide` no longer gives a clean bill to a new-shape tracker carrying a typo'd
  `statusColors` key (which hard-fails the build): facet A now checks the
  top-level map when no legacy `fields.status` block exists. Negative-tested:
  `guide` flags `revieww`, `verify` exits 1; clean tracker still says
  "nothing to do".

**User-guide** (`19_issues/`):
- Dead preset examples fixed: `filters: { "status": [...] }` → `labels` in
  `02_vocabulary.md` and `01_list-view.md` (presets can't filter status — the
  category tabs own it; the filterable-fields list is now stated in the
  per-view schema table, which also gained the previously-undocumented
  `search` field).
- `01_list-view.md`: "table default for ≥10 issues" → "the default"
  (no count logic exists); "persists via URL param" → `localStorage`,
  explicitly not shareable via URL.
- `02_vocabulary.md`: "extra description is flagged too" → "silently ignored"
  (neither validator flags orphans).
- `02_design-philosophy.md`: the assignees-history bullet rewritten in present
  tense — "in-progress must be an explicit signal, not a derived one" — no more
  narration of the retired derivation.

**Skills** (mirrored to cache, `diff -rq` IDENTICAL):
- `cli-toolkit.md`: `review-queue` one-liner corrected to Review-category
  semantics (`review`/`input-needed` + active issues with a review subtask).
- `02_per-issue-settings.md`: example label `wip` → `docs` (deprecated label out
  of the canonical example); assignees-history parenthetical deleted.

**Our tracker** (`data/todo/settings.jsonc`):
- The "Blocked" view's dead `status` filter → `labels: ["blocked",
  "blocked-external"]` (both in the vocabulary), with a comment stating the
  filterable-fields rule.

## Verification

Build green (657 pages — includes this activity folder) · `docs-guide check
issues` exit 0 (same 4 pre-existing warnings in other issues) · `_selftest.mjs`
PASS · `check-skill-links` green on both skill roots · repo↔cache `diff -rq`
IDENTICAL · migration negative-tests pass both directions · built guide panel
renders the generated lifecycle (all 4 categories, code order) and `status
frontmatter`.

## Next

Summary + reopen/review bookkeeping in `01_summary.md`; issue back to `review`
for sidhantha (agent ceiling).
