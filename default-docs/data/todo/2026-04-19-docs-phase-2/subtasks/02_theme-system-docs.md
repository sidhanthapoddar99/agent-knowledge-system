---
title: "Theme system — docs"
status: open
---

Absorbed from `2026-04-10-theme-system-refactor/subtasks/02_documentation.md`. Covers the two-tier token contract for both audiences.

## User guide — `45_themes/` (renumbered from `20_themes/`)

- [ ] `04_tokens/01_overview.md` — primitive vs semantic split
- [ ] `04_tokens/02_primitive-tokens.md` — `--font-size-*` scale, raw palette
- [ ] `04_tokens/03_semantic-ui-tokens.md` — `--ui-text-*` 3 tiers (micro / body / title)
- [ ] `04_tokens/04_semantic-content-tokens.md` — 7 content tokens (`--content-body`, `--content-h1..h6`, `--content-code`)
- [ ] `04_tokens/05_display-tokens.md` — 3 display tiers (marketing surfaces only)
- [ ] `07_rules.md` — **consume semantic, never primitive** (no `--font-size-*` in layouts, no invented names, no hardcoded fallbacks)
- [ ] `03_creating-themes.md` — satisfying `required_variables`, `extends: "@theme/default"` inheritance (author view)

## Dev docs — `40_theme-system/` (new section)

- [ ] `01_overview.md` — why a contract exists
- [ ] `02_required-variables.md` — `theme.yaml` contract, declared `required_variables` list
- [ ] `03_two-tier-token-model.md` — primitive vs semantic (UI / content / display), when NOT to add a new tier
- [ ] `04_theme-resolution.md` — `resolveThemeName()`, `theme_paths`, load order, theme HMR cache invalidation (integration-vs-SSR module isolation gotcha)
- [ ] `05_standardization-rules.md` — no invented names, no hardcoded fallbacks, why

## Cross-link

- Typography pages → `src/styles/theme.yaml` (contract source of truth)
