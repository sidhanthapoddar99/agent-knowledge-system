---
author: claude-opus-4-8
date: 2026-06-23
---

## Deferred follow-ups (post-consolidation)

The consolidation goal is met (one manifest-driven dispatcher, uniform contract, discoverability via `docs help`, the search fix). The following are **additive** commands re-scored as still ➕ in the POST-EDIT matrix (notes/05) — none blocks the goal, all are candidate future issues:

- **link-check** (Cat 1) — broken/orphan internal-link audit. Was the explicit *stretch* of subtask 11; deferred. Adjacent coverage exists (`docs find --path`, `docs-move` link rewriting) but no dedicated checker.
- **settings** (Cat 2) — general view/set for settings.json / frontmatter meta (issues have set-state for status only).
- **new / create** (Cat 2) — CLI scaffolding for a docs page / blog post / issue (docs scaffolding is the /docs-add-section slash command only).
- **renumber** (Cat 3) — re-space NN_ prefixes to open insert room.
- **vocabulary** (Cat 3) — manage the tracker's root settings.json vocabulary from the CLI.

Everything else in the four-category matrix shipped (✅). Surface: 13 → 28 commands; plugin 0.2.1 → 0.3.0; harness 117/117 (bun).
