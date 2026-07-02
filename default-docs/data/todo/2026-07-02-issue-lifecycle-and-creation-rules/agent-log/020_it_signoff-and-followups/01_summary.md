---
title: "Summary — post-loop sign-off + subtasks 10–13"
---

The wave after the lifecycle loop. Sidhantha reviewed the shipped 7-status/
4-category lifecycle, approved it, and asked to (1) sign off the loop, (2) fix
subtask 13, and (3) complete the follow-up subtasks 10–12. All done and verified;
**subtasks 01–09 are now `done`, 10–13 are `review`** for his sign-off.

## What shipped

- **Sign-off (01–09).** Internal checkboxes ticked to match the milestones;
  statuses moved `review → done`.
- **13 — CLI.** `docs-guide issue subtasks --status all` now expands `all` before
  the vocabulary filter (it was being dropped, silently narrowing to non-Closed);
  documented in `--help`.
- **12 — colours-only settings.** Status colours moved to a top-level
  `statusColors` map; `fields.status` and unknown colour keys are hard errors
  (loader + `check issues`). Merging onto `DEFAULT_STATUS_COLORS` fixed a latent
  bug where a partial override dropped the other six defaults.
- **11 — descriptions + Guide modal.** Component/label descriptions promoted from
  JSONC comments to a required parallel `descriptions` map (hard error if
  missing). New `GuideModal.astro` on the index renders the fixed lifecycle (from
  the `issue-status.ts` constants) and the editable vocabularies with their
  descriptions, with a fixed/editable split.
- **10 — review inheritance.** Index status badges show `review` for review-debt
  issues via a shared `needsReview`/`effectiveStatus` predicate (badge ↔ tab
  can't drift); stored status untouched, everything else shows stored.
- **Migration.** A single `2026-07-03_root-settings-schema.py` (two facets:
  status-colours-only + required descriptions) — detection+guidance only, no
  auto-write (JSONC comments are load-bearing); docstring spells out the exact
  hard build error each facet prevents. Negative-tested. (Started as two scripts;
  merged at sidhantha's call — one file, one root-settings transition. The
  already-applied per-file `2026-07-02_state-to-status.py` stays separate.)

## Cross-surface propagation

- `data/todo/settings.jsonc` migrated by hand to the new shape.
- User-guide: 7 pages (vocabulary, setup-new-tracker, list-view, lifecycle,
  using-with-ai, folder-structure, themes issues-styles).
- Skill: `03_overall-issue-tracker-vocabulary.md`, `SKILL.md` rule 4, and a stale
  "4 lifecycle states" line in `02_per-issue-settings.md`.
- Plugin bumped `0.6.0 → 0.7.0`; repo ↔ cache `diff -rq` identical.

## Verification (final)

`bun run build` green (651 pages) · `docs-guide check issues` exit 0 (only
pre-existing warnings) · `_selftest.mjs` PASS · `check-skill-links` green on both
skill roots · Guide modal + review badge confirmed in the live dev render.

## Open for sidhantha (flagged, not vetoed)

- 10–13 sit at `review` (agent ceiling) — flip to `done` on your word.
- Subtask 10 affordance = a plain `review` badge (no "inherited" marker) — veto if
  you'd prefer it marked.
- Two pre-existing stale spots the sweep found but left as out-of-scope:
  `09_using-with-ai.md` still frames the skill/CLI as "planned"; both are separate
  doc-hygiene tickets, not part of these changes.

## Note

The two anatomy reference files were renamed this session (by a parallel task):
`02_settings.md → 02_per-issue-settings.md`, `03_vocabulary.md →
03_overall-issue-tracker-vocabulary.md` — folded into this wave's version bump.
