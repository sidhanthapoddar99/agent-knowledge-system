---
title: "Documentation for the refactored theme system"
status: done
---

> **⏸ Under review — absorbed by `2026-04-19-docs-phase-2`**
> This subtask has been consolidated into the phase-2 docs-update issue. See `2026-04-19-docs-phase-2/subtasks/02_theme-system-docs.md`. No action needed here — all work items below are tracked in that subtask.

`CLAUDE.md` now covers the refactor for AI collaborators. Human-facing docs are still missing.

## User guide (`dynamic_data/data/user-guide/`)

- [ ] "Typography contract" page under `20_themes/` — explain the 3 UI tiers, 7 content tokens, 3 display tokens
- [ ] State the rule: **consume semantic, never primitive** (no `--font-size-*` in layouts)
- [ ] Show how to declare a custom theme that satisfies `required_variables`
- [ ] Explain `extends: "@theme/default"` inheritance

## Dev docs (`dynamic_data/data/dev-docs/`)

- [ ] "Token layers" page — primitive / semantic split, why it exists, what each layer is for
- [ ] How to add a new semantic tier (and when *not* to — adding a 4th UI text tier is almost always a sign you're encoding importance with size when weight / colour / position would do better)
- [ ] How `resolveThemeName()` + `theme_paths` work
- [ ] Theme HMR cache invalidation lessons (the integration-vs-SSR module isolation gotcha)

## Cross-link

- [ ] Typography page links to `src/styles/theme.yaml` (the contract source of truth)
