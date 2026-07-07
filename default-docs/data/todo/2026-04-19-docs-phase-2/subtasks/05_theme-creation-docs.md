---
title: "Theme creation process — docs"
status: done
---

> [!NOTE]
> **Moved — status `done` as of 2026-07-08.** The content did not land as the
> planned single page `user-guide/45_themes/03_creating-themes.md`; it lives as
> the folder **`user-guide/25_themes/06_creating-themes/`** (`01_quick-start`,
> `02_extending-default` — the worked example —, `03_standalone-theme`), with
> "what NOT to override" covered in `25_themes/04_tokens/01_overview.md` and
> `10_rules-for-layout-authors.md`. Verified in
> `agent-log/010_au_subtask-completion-audit/`.

Absorbed from `2025-06-25-layouts-and-variations/subtasks/04_built-in-themes.md` — specifically the *"Document theme creation process"* checkbox. The rest of that subtask (adding Corporate / Playful / Terminal built-in themes) stays in its source issue.

Scope overlaps with subtask `02_theme-system-docs.md` but splits here because this one covers the **authoring workflow** (scaffolding, testing, file layout), not the token contract itself.

## Scope

- [x] ~~`user-guide/45_themes/03_creating-themes.md`~~ `user-guide/25_themes/06_creating-themes/` — end-to-end flow:
  - Scaffold `dynamic_data/themes/<name>/theme.yaml`
  - Pick `extends: "@theme/default"` as starting point
  - Override specific tokens (semantic first, primitives only with a reason)
  - Register the theme in `site.yaml` `theme:` + `theme_paths:`
- [x] Worked example — inherit-and-override one semantic token end-to-end (e.g. swap the accent colour)
- [x] How to test a theme in the dev toolbar (theme picker + HMR behaviour)
- [x] What NOT to override — primitive tokens are a last-resort surface; semantic tokens are the normal override layer

## Cross-link

- Subtask `02_theme-system-docs.md` for the underlying token contract (the *what* — this subtask is the *how*)
