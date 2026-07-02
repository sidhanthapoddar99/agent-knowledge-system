---
title: Unify the state/status field naming + migration script with validation
state: open
---

Today the same lifecycle vocabulary travels under **two field names**: issues carry
`status` in `settings.json`, subtasks carry `state` in their frontmatter. Same enum,
two spellings — confusing for humans writing files by hand and a permanent source of
"which one is it here?" friction in code, docs, and the skill. They should be **one
field name at both levels** (working assumption: `status` wins, since it's what the
root vocabulary in `settings.jsonc` already declares; confirm before coding).

This rides the same wave as subtasks 02/03: the enum expansion already forces a
migration pass over every subtask frontmatter, so the rename should land in the
**same migration**, not a second one later.

- [x] **Decide the canonical name** — **`status` wins** (decided 2026-07-02, recorded
      in `notes/01_lifecycle-vocabulary.md`); `state` becomes a recognized legacy
      alias that always warns/errors, never a silent synonym.
- [ ] **Value migration in the SAME script** (decided) — `closed` → `done` and
      `cancelled` → `dropped` on both issue `status` and subtask frontmatter,
      per the new 7-status vocabulary; `open`/`review` pass through unchanged. One
      idempotent pass does rename + value map together. NO status assignment from
      `wip` labels (statuses start honest); annotate the `wip` label as deprecated
      in root `settings.jsonc` comments while migrating that file's status section.
- [ ] **Update the code** — issues loader (`src/loaders/issues.ts`) and the
      `docs-guide` CLI (`issue subtasks`, `issue set-state`, `check issues`) read the
      canonical field on both issues and subtasks.
- [ ] **Error/warning on the legacy name** — when a file still uses the old field,
      the loader and `docs-guide check issues` surface an explicit warning (or error,
      decide severity) that names the file and says "run the migration script";
      no silent acceptance, no silent ignoring.
- [ ] **Migration script** — converts all existing subtask frontmatter to the
      canonical name across trackers (`data/todo/`, plus test/demo trackers).
      Precedent lives at
      `plugins/documentation-guide/skills/documentation-guide/migration/2026-06-22_done-to-state.py`
      — same shape, and its naming shows this is the *second* rename of this field,
      which is exactly why the alias-warning above must exist.
- [ ] **Migration check** — after the script runs, a validation pass
      (`docs-guide check issues`) proves zero legacy fields remain; wire this as the
      script's exit criterion so a half-migrated tracker can't look green.
- [ ] **Propagate the naming** — docs (`19_issues`), `guide.ts`, and the `doc-issues`
      skill references currently say "subtask `state` mirrors issue `status`";
      rewrite to the single-name story (folds into subtasks 04–06's passes).
