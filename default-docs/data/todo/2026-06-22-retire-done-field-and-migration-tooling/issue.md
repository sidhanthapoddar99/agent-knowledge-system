---
title: Retire the `done:` subtask field + add migration tooling
---

## Goal

Eliminate the legacy `done:` subtask frontmatter field across the whole project, and
introduce a small, reusable **migration-script convention** so future format changes have a
home. `done:`→`state:` is the first migration that exercises it.

## Why

`state:` is the canonical subtask field (`open → review → closed | cancelled`). `done:` is a
pre-4-state holdover:

- The loader (`astro-doc-code/src/loaders/issues.ts`) reads `state:` first and only falls
  back to `done` when `state` is missing/invalid; the completion boolean it exposes is then
  **re-derived from `state`**, so the frontmatter `done:` value is never trusted when `state`
  is present.
- The editor save path (`dev-tools/server/middleware.ts:408`) already deletes `done` and
  canonicalizes to `state`.
- The skill is internally inconsistent — `23_subtasks.md` prescribes `done:` as "standard
  frontmatter" while `41_searching.md` calls it "legacy". 

So `done:` is dead weight that still costs reader/agent context. Remove it cleanly rather
than documenting it as legacy.

## Done when

- No reference to the `done:` field remains in the `documentation-guide` / `doc-agent`
  skills — removed outright, not relabeled (keeps skill context lean).
- A `migration/` folder convention exists, documented by `references/doc-migration.md`, with
  a one-line pointer from `SKILL.md` (used only on migration errors / legacy checks / when
  the user asks for migration).
- A tested `migration/2026-06-22_done-to-state.py` ships: detect + locate + migrate.
- The framework code no longer reads, writes, or validates the `done` frontmatter field;
  build stays green.
- Plugin version bumped to `0.2.1`.

## Subtasks

See `subtasks/` — ordered: scrub skill (`010`), migration convention + reference (`020`),
the `done`→`state` script (`030`), framework-code removal (`040`), version bump (`050`).
`030` lands (and migrates existing content) before `040` removes the loader fallback.
