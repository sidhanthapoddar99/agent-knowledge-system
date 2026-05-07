---
title: "Drop `due` from the tracker (clean removal — no trace)"
state: open
done: false
---

- [ ] **Relax validator first.** `docs-check-section` no longer requires / warns on `due`.
- [ ] **Strip `due` from every existing issue's `settings.json`.** Mass mechanical edit. Empirical baseline (audit on 2026-05-07): only 10 of 37 issues had `due` set, and 9 of those 10 were past their date with the issue still open — a 90% rot rate. Removing the field across all of them is small.
- [ ] **Remove from the schema** (type definitions, any JSON schema).
- [ ] **Remove from views / sort options** in `default-docs/data/todo/settings.json` — if `views:` referenced `due` (e.g. an "overdue" view), drop it.
- [ ] **Remove from plugin code.** `docs-list --due <x>` arg, `docs-show`'s "Due:" line, anywhere else.
- [ ] **Remove from layouts.** Any due-date column / chip / filter in `IssuesTable.astro`, `IssuesCards.astro`, `DetailLayout.astro`. Gone.
- [ ] **Remove from CLI templates.** No more `due:` field in newly-templated `settings.json`.
- [ ] **Remove from docs.** User-guide and plugin skill references.
- [ ] **No reference means no reference.** No deprecation notes, no shim, no comment trail.
- [ ] **Test**: validator green; layouts render; `docs-show` has no Due line; `docs-list` accepts no `--due` argument.

## Why this is justified

A structured `due` field earns its keep when overdue issues bubble to the top of an index, when a UI badge nags about overdue, when CI / cron alerts on overdue, or when there's a real external hard deadline. None of (1)–(3) exist in this tracker. (4) — rare external deadlines — can live as prose in the issue body ("Blocks external launch on 2026-06-15"); structured-date fields rot and trained readers learn to mistrust them.

## Files likely touched

Same surface as subtask 01 (drop milestone), substituting `due` for `milestone` everywhere. Most of the same files.
