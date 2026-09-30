---
title: "Theme commands — `theme tokens`, `theme css`, `theme eject`"
status: open
---

Custom layouts are gone; CSS is the only way to brand a site. So an agent or a person writing CSS overrides needs to see exactly what they are overriding, for the installed version. `agentks theme tokens` prints theme variable values (as today), `agentks theme css` prints the compiled CSS with the list of stable hooks (class names and `data-part` attributes) and variables, and `agentks theme eject` copies it into the project as a starting point.

# 01 To Do
- [ ] **`agentks theme tokens [--theme NAME] [--json]`**: port today's command: the resolved variable → value map for light and dark.
- [ ] **`agentks theme css [--theme NAME] [--hooks] [--json]`**: the project's compiled CSS from the engine's compiler ([030/85](../030_rust-engine/85_theme-css-compiler.md)) — the same bytes the server serves. `--hooks` prints only the hook list (hook, layout, element, description) from the shared UI package's hook manifest ([100/10](../100_layouts/10_theme-contract-and-css.md)). `--json` returns `{ css, hooks[], variables[] }`.
- [ ] **`agentks theme eject [NAME]`**: create `config/themes/<name>/` with a `theme.yaml` that extends the current theme and a commented CSS file listing every hook and variable; refuse if the folder exists; set `theme: <name>` in `site.yaml` only with `--use`.
- [ ] **Contract check:** `theme css` fails (exit `1`) when the active theme misses a required variable, with the variable names, the same error the server reports.

## Guardrails
- One compiler: the CLI never builds CSS on its own.
- The hook list is generated from the UI package, never hand-written in the CLI.

## Done when
- `theme css` output is byte-identical to the CSS the server serves for the same project (test).
- `theme eject brand --use` creates the folder, switches the theme, and the site still renders.
- `theme tokens --json` matches today's `agent-ks theme tokens --json` on the fixture themes.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/cli/`.

**Read first:**
- [Theming and layouts, sections 04–06](../../notes/03_frontend/04_theming-and-layouts.md) — the contract, where CSS comes from, hooks as a public contract.
- [CSS and theming (brainstorm)](../../brainstorm/01_initial-discussion/10_css-and-theming.md) — the working name `list-css`, replaced by `theme css`.
- Today's command: [theme.rs](../../../../../../agent-ks-cli/src/theme.rs).

**Depends on:** [030/85](../030_rust-engine/85_theme-css-compiler.md), [100/10](../100_layouts/10_theme-contract-and-css.md), [070/20](./20_content-commands-port.md).
**Unblocks:** the CSS-override skill text ([130/10](../130_ai-plugins/10_agentks-plugin-port.md)).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the CLI prints the compiled CSS of the installed version, so an agent can see and override it.
- Proposed (claude, 2026-09-30), adopted here: the name `agentks theme css` (not `list-css`) and `agentks theme eject`.

# 05 Notes & Analysis

## Watch out
- User themes live in `config/themes/<name>/` in the notes, replacing today's `theme_paths`; confirm with [020/20](../020_content-contract/20_config-folder.md) before eject writes there.
