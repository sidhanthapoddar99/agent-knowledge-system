---
title: "Migration — todo/ → issues/"
state: closed
---

Migrating the legacy `dynamic_data/data/docs/todo/` hierarchy into the new folder-per-item issues format. This `todo-migration/` tracker is the result.

## Done

- [x] Created `dynamic_data/data/todo/` with root `settings.json` (vocabulary)
- [x] Registered `todo-migration` page in `site.yaml` (`type: issues`)
- [x] Added "Todo Migration" entry to `navbar.yaml`
- [x] Migrated `todo/01_sprints/01_phase-1.md` → 5 issues (sizing, code blocks, outline, blog, themes)
- [x] Migrated phase-2 → components, layouts-and-variations, claude-skills, dev-only-content, multiple-data-paths, codebase-refactoring
- [x] Migrated phase-3 → deployment, configuration-enhancements, dev-toolbar-enhancements, sizing-and-responsive (merged with phase-1 sizing), built-in-themes (subtask of layouts-and-variations)
- [x] Migrated phase-4 → plugin-system (4 subtasks; interactive features dropped)
- [x] Migrated `02_backlog/01_bugs.md` → resolved-historical-bugs subtask under outline-toc-polish
- [x] Migrated `02_backlog/02_feature-ideas.md` → future-feature-ideas issue (7 category subtasks)
- [x] Migrated `03_issues/01_overview.md` Editor V2 sections → editor-core, editor-advanced, editor-navigation-and-layout, editor-diagrams, view-modes, sync-and-presence
- [x] Moved each design / status doc to the relevant issue's `notes/` directory
- [x] Replaced legacy phase docs with migration notes; removed `01_sprints/` and `02_backlog/` folders

## Open (cleanup, not migration)

- [ ] Eventually delete `dynamic_data/data/docs/todo/` entirely once nothing references it
- [ ] Eventually rename `todo-migration/` → `issues/` and update `site.yaml` + `navbar.yaml`
