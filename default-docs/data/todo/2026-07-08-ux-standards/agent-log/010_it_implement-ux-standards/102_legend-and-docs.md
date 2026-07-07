---
title: "Guide legend, user-guide updates, dev-docs UX-standards + tooltip pages, CLAUDE.md pointer"
agent: claude-fable-5
date: 2026-07-08
iteration: 2
status: success
---

## Goal

Subtasks 40/50 — the documentation half: symbol legend where users look for it, standards page where developers look for it, one pointer in `CLAUDE.md`.

## Result

- **Guide panel** (`guide.ts`): a generated status-legend table (built from `stateIconSvg` + `STATUS_LABELS` + `STATUS_DESCRIPTIONS` + a `STATUS_TINTS` map mirroring the CSS, so symbol/color/gloss can't drift from the UI) under the Subtasks section, plus an inline type-glyph line (diagram · artifact) under Notes.
- **User-guide**: `19_issues/07_ui/02_detail-view.md` got the full 7-row icon/tint legend and the type-glyph bullet; the tooltip bullet now names status icons and type glyphs. `15_writing-content/06_diagram-pages.md` and `08_artifact-pages.md` each mention the sidebar type glyph.
- **Dev-docs**: new `05_architecture/05_layout-internals/08_ux-standards.md` — six rules with rationale (tooltips only when they add information; mark the exception not the default; color belongs to status; hierarchy from weight/position; passive status; dynamic state keeps labels honest) plus a file map. New `15_scripts/18_tooltip.md` documenting `tooltip.ts` (previously undocumented anywhere); overview table + load-order snippet updated.
- **CLAUDE.md**: a "UX standards" paragraph under Layouts pointing at the dev-docs page — pointer only, no duplicated rules.
- **Skill**: per user decision, the one UI line in `doc-issues` `22_notes.md` ("sidebar shows a type marker on an artifact row") was **removed** rather than updated — UI visuals are user-guide/dev-docs business, not operating-manual business. Mirrored byte-identically to the installed cache.

## Next

Build + rendered-output verification.
