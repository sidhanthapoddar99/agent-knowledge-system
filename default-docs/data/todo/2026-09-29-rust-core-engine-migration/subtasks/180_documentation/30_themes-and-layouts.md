---
title: "Docs: themes and layouts"
status: open
---

How a user changes how their site looks. In 1.0 the layouts are a fixed, built-in set (custom layouts are gone), and CSS is the one branding tool: themes set the theme variables, and user CSS targets stable hooks on the layouts. This leaf writes that section. It also fixes a known defect of today's docs: the issues-styles page documents CSS classes that do not exist. Every hook the new pages name must exist in the rendered DOM.

# 01 To Do
- [ ] **`45_themes-and-layouts/01_overview.md`** — the layout set per content type and style (docs default and compact, blog, issues, custom, artifact, diagram, video), how to pick a style in `site.yaml`.
- [ ] **Themes** — what a theme is, `theme.yaml`, `extends`, `override_mode`, where user themes live, switching themes.
- [ ] **The theme contract** — the required variables, the two-tier token model (primitive scale, semantic `--ui-text-*`, `--content-*`, `--display-*`), and why layouts read only the contract.
- [ ] **Overriding CSS** — the stable hooks (`data-part` attributes or class names, whichever [100/10](../100_layouts/10_theme-contract-and-css.md) ships), `agentks theme css` to see the compiled CSS and the hooks of the installed version, `agentks theme tokens`, `agentks theme eject` if it ships.
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
Open. Not started.

## Result
None yet.

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

# 05 Notes & Analysis

## Watch out
- The contract's rule is "a variable is on the contract if and only if a shipped layout reads it". Say this on the page so theme authors understand why a variable they expect is missing.
