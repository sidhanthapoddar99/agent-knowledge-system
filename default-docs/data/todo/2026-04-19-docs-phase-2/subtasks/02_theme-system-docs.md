---
title: "Theme system — docs"
status: in-progress
---

> [!NOTE]
> **Moved — status `in-progress` as of 2026-07-08.** The user-guide half
> shipped under **`25_themes/`** (the section was never renumbered to
> `45_themes/`), consolidated rather than split per file: the whole token
> contract lives in `25_themes/04_tokens/01_overview.md`, the layout-author
> rules in `25_themes/10_rules-for-layout-authors.md`, and theme creation in
> `25_themes/06_creating-themes/` (see subtask 05). **Still to do: the entire
> dev-docs `theme-system` section** — it doesn't exist (current dev-docs
> numbering would place it as a new section, not `40_`). Verified in
> `agent-log/010_au_subtask-completion-audit/`.

Absorbed from `2026-04-10-theme-system-refactor/subtasks/02_documentation.md`. Covers the two-tier token contract for both audiences.

## User guide — ~~`45_themes/`~~ `25_themes/` ✅ shipped (consolidated)

- [x] `04_tokens/01_overview.md` — primitive vs semantic split
- [x] ~~`04_tokens/02_primitive-tokens.md`~~ — consolidated into `04_tokens/01_overview.md`
- [x] ~~`04_tokens/03_semantic-ui-tokens.md`~~ — consolidated into `04_tokens/01_overview.md`
- [x] ~~`04_tokens/04_semantic-content-tokens.md`~~ — consolidated into `04_tokens/01_overview.md`
- [x] ~~`04_tokens/05_display-tokens.md`~~ — consolidated into `04_tokens/01_overview.md`
- [x] ~~`07_rules.md`~~ `10_rules-for-layout-authors.md` — **consume semantic, never primitive** (no `--font-size-*` in layouts, no invented names, no hardcoded fallbacks)
- [x] ~~`03_creating-themes.md`~~ `06_creating-themes/` — satisfying `required_variables`, `extends: "@theme/default"` inheritance (author view; see subtask 05)

## Dev docs — `40_theme-system/` (new section)

- [ ] `01_overview.md` — why a contract exists
- [ ] `02_required-variables.md` — `theme.yaml` contract, declared `required_variables` list
- [ ] `03_two-tier-token-model.md` — primitive vs semantic (UI / content / display), when NOT to add a new tier
- [ ] `04_theme-resolution.md` — `resolveThemeName()`, `theme_paths`, load order, theme HMR cache invalidation (integration-vs-SSR module isolation gotcha)
- [ ] `05_standardization-rules.md` — no invented names, no hardcoded fallbacks, why

## Cross-link

- Typography pages → `src/styles/theme.yaml` (contract source of truth)
