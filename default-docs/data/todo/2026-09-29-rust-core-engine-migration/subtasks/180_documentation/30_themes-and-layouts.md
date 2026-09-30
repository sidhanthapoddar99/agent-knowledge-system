---
title: "Docs: themes and layouts"
status: review
---

How a user changes how their site looks. In 1.0 the layouts are a fixed, built-in set (custom layouts are gone), and CSS is the one branding tool: themes set the theme variables, and user CSS targets stable hooks on the layouts. This leaf writes that section. It also fixes a known defect of today's docs: the issues-styles page documents CSS classes that do not exist. Every hook the new pages name must exist in the rendered DOM.

# 01 To Do
- [x] **`45_themes-and-layouts/01_overview.md`** — the layout set per content type and style (docs default and compact, blog, issues, custom, artifact, diagram, video), how to pick a style in `site.yaml`.
- [x] **Themes** — what a theme is, `theme.yaml`, `extends`, `override_mode`, where user themes live, switching themes.
- [x] **The theme contract** — the required variables, the two-tier token model (primitive scale, semantic `--ui-text-*`, `--content-*`, `--display-*`), and why layouts read only the contract.
- [x] **Overriding CSS** — the stable hooks (`data-part` attributes or class names, whichever [100/10](../100_layouts/10_theme-contract-and-css.md) ships), `agentks theme css` to see the compiled CSS and the hooks of the installed version, `agentks theme tokens`, `agentks theme eject` if it ships.
- [ ] **Per-layout style pages** — one page per layout listing its hooks, generated or checked against the built DOM.
- [ ] **Verify every selector.** A script runs each documented selector against a rendered page of that layout and fails when one matches nothing. Put it in the docs check of the gate.

## Guardrails
- Group rules in [180/00 overview](./00_overview.md).
- Document only hooks that exist in the built DOM. No selector from memory.
- The variable list is generated from, or checked against, `theme.yaml`'s required variables, so the page cannot drift from the contract.

## Done when
- The section exists under `docs/data/user-guide/45_themes-and-layouts/` and renders.
- The selector check passes: every documented selector matches at least one element on its layout's page.
- Every required variable in the theme contract appears on the contract page, and no other.

# 02 Status and Result
**Still open on purpose, do not close yet:** To Do items 5 and 6 (per-layout style pages, verify every selector) wait for the blog, issues and custom layouts ([100/20](../100_layouts/20_blog-layouts.md), [100/25](../100_layouts/25_issues-layouts.md), [100/45](../100_layouts/45_custom-pages.md)), for `agentks theme css --hooks` ([070/80](../070_cli/80_theme-commands.md)), and for a served page to run the selectors against.

Review. The section is written in `user-guide-2/`: six pages that pass `agent-ks check section` and `agent-ks check link-form`; the per-layout hook pages and the selector check wait for the built layouts.

## Result
- [Themes and layouts](../../../../user-guide-2/45_themes-and-layouts/01_overview.md): the three levels (layouts, theme variables, CSS on hooks), the terms, the cascade layers as a diagram, and why there are no custom layouts.
- [Built-in layouts](../../../../user-guide-2/45_themes-and-layouts/05_layouts.md): every `@<group>/<style>` the config crate accepts, the diagram, artifact and video views, choosing a layout per section and for the navbar and footer, the unknown-layout error, and the artifact page for a one-off page.
- [Themes](../../../../user-guide-2/45_themes-and-layouts/10_themes.md): `theme` and `theme_paths`, a complete example theme in `config/themes/brand/`, every `theme.yaml` field, `extends` and the three `override_mode` values, `theme eject`, `theme css`, `theme tokens`, and the errors the compiler raises.
- [The theme contract](../../../../user-guide-2/45_themes-and-layouts/15_theme-contract.md): the membership rule, all 66 variables of `apps/agentks-engine/themes/default/theme.yaml` by full name and no other, and the two-tier text tokens.
- [Overriding CSS](../../../../user-guide-2/45_themes-and-layouts/20_overriding-css.md): variables first, `theme css --hooks`, what a hook is and its migration promise, where the rules go, why the `user` layer wins, and the `!important` exception.
- [Dark mode](../../../../user-guide-2/45_themes-and-layouts/25_dark-mode.md): how the mode is chosen (stored choice, else the system setting), dark values under `[data-theme="dark"]`, `supports_dark_mode`, what to redeclare, and widgets.
- **Left:** the per-layout hook pages and the selector check (To Do items 5 and 6). Today only `@docs/default`, `@docs/compact`, `@navbar/default` and `@footer/default` exist in `agentks-ui`, and no engine serves a page to run selectors against. The pages name three hooks from `hooks.json` as examples, all present in the layouts' source: `[data-part="sidebar"]`, `[data-part="navbar-brand"]` and `.sidebar__link--active`. Re-check them against the rendered DOM when the selector check exists.
- **Not run:** `agentks theme css`, `theme tokens` and `theme eject`. The CLI worktree's binary answers "not implemented yet: config discovery".

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `docs/data/user-guide/45_themes-and-layouts/`.
- **Read first:**
  - [Theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) — the layout set, the contract, `data-part` hooks.
  - [CSS and theming](../../brainstorm/01_initial-discussion/10_css-and-theming.md) and [layouts](../../brainstorm/01_initial-discussion/11_layouts.md).
  - Today's contract: [theme.yaml](../../../../../../agent-ks-engine/src/styles/theme.yaml); today's pages: [themes](../../../../user-guide/25_themes) and [layout system](../../../../user-guide/16_layout-system).
  - Absorbed: [docs-phase-2 subtask 02, theme system docs](../../../2026-04-19-docs-phase-2/subtasks/02_theme-system-docs.md) and [subtask 07, selector accuracy](../../../2026-04-19-docs-phase-2/subtasks/07_issues-styles-selector-accuracy.md).
- **Depends on:** [100/10 theme contract and CSS](../100_layouts/10_theme-contract-and-css.md), [070/80 theme commands](../070_cli/80_theme-commands.md), the layout leaves in [100](../100_layouts/00_overview.md).
- **Unblocks:** [200/20 switch-over](../200_launch/20_switch-over.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): drop user-authored custom layouts; CSS is the extension point ([theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md)).
- Decided (claude, 2026-09-30): the docs name only selectors that a check has found in the rendered DOM, because today's issues-styles page shows how invented selectors survive review.
- Decided (claude, 2026-10-01): the pages carry no copy of the hook list. They send the reader to `agentks theme css --hooks` and use three hooks from `apps/packages/agentks-ui/src/hooks.json` as examples, because a copied list drifts from the installed version and the DOM check cannot run yet.
- Decided (claude, 2026-10-01): the theme pages show user themes in `config/themes/<name>/` with `theme_paths: ["./themes"]` written out, because the compiler searches only `theme_paths` and `theme eject` writes to `config/themes/`. The explicit key works whatever default the config loader later picks.
- Decided (claude, 2026-10-01): the contract page names all 66 required variables in full and no variable outside the contract, so a script can compare the page with `theme.yaml`. It explains the missing bold weight in words instead of naming a non-contract variable.
- Decided (claude, 2026-10-01): dark mode has its own page, because readers look for it by name and it touches the theme, the toggle and library widgets.

# 05 Notes & Analysis

## Watch out
- The contract's rule is "a variable is on the contract if and only if a shipped layout reads it". Say this on the page so theme authors understand why a variable they expect is missing.
