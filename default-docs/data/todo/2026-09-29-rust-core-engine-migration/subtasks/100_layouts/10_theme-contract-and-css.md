---
title: "Theme contract, built-in theme CSS and public hooks"
status: in-progress
---

With custom layouts gone, CSS is the only way to brand a site, so the theme contract and the markup hooks become a public API. This leaf carries today's contract (`theme.yaml → required_variables`) into the new engine unchanged in spirit, moves the built-in theme's CSS into the engine for Rust to compile, fixes the cascade order with `@layer`, defines and documents the hooks every layout exposes, and ports the contract check so the contract and the layouts can never drift.

# 01 To Do
- [x] **Carry the contract.** Copy [theme.yaml](../../../../../../agent-ks-engine/src/styles/theme.yaml) and the built-in theme's CSS ([the styles folder](../../../../../../agent-ks-engine/src/styles)) into the engine as its built-in theme, versioned with it. The membership rule stays: a variable is on the contract if and only if a shipped layout reads it.
- [ ] **Split ownership** ([theming](../../notes/03_frontend/04_theming-and-layouts.md) section 05):
    - [ ] Engine (compiled by Rust, [030/85](../030_rust-engine/85_theme-css-compiler.md)): colours, fonts, elements, reset, markdown, breakpoints, and the base CSS of navbar, footer, docs and blog.
    - [ ] `agentks-ui`: component CSS beside each component.
    - [ ] The user's theme: in the project, compiled with the built-in theme through `extends` and `override_mode` as today. Where user themes live by default is settled with [020/20 config folder](../020_content-contract/20_config-folder.md).
- [ ] **Cascade order** with `@layer` (the built-in theme's `layers` map is written; the compiler applies it): `reset, theme, elements, components, user`. The user's rules win over a component's rule of the same strength without `!important`.
- [ ] **Hooks.** For every layout, list the class names or `data-part` attributes a user may restyle (sidebar, sidebar item, outline, body, pagination, issue table, status badge, navbar brand, footer columns, and so on) in `agentks-ui/src/hooks.json`, with the layout and a one-line meaning. `agentks theme css` prints them ([070/80](../070_cli/80_theme-commands.md)).
- [ ] **Hook stability.** Renaming or removing a hook needs a migration, like a renamed frontmatter field ([140/30](../140_versioning-and-migrations/30_docs-migration-0x-to-1.md) for the 0.x to 1.0 changes). Add a test that fails when `hooks.json` loses an entry without a migration note.
- [ ] **Contract check.** Port [the contract check](../../../../../../scripts/checks/check-theme-contract.mjs) as a test of `agentks-ui` that reads component CSS and the engine's built-in CSS in both directions: every variable read is declared; every declared variable is read.
    - [ ] Decide the four `#fff` literals in `apps/agentks-engine/themes/default/markdown.css` (diagram backgrounds and lightbox text, carried from today's CSS): allow them in the test, or replace them with theme variables.
- [ ] **Artifacts skill copy.** Any change to the contract updates the inline variable list in the artifacts skill in the same change ([130_ai-plugins](../130_ai-plugins/00_overview.md)).
- [ ] **Dark mode.** `data-theme` on the root; each theme declares `supports_dark_mode`; code highlighting uses Rust's CSS classes so light and dark code colours come from the theme.
    - [ ] Replace the Shiki rules in `apps/agentks-engine/themes/default/markdown.css` (`.shiki`, `--shiki-dark`) with rules for the classes the Rust highlighter emits ([030/50](../030_rust-engine/50_markdown-pipeline.md)), then drop `--shiki-` from `EXTERNAL` in `apps/agentks-engine/themes/check-contract.ts`.

## Guardrails
- No hex codes, raw `rem` or `px` sizes, invented variable names, or inline fallbacks that freeze a value. Semantic tokens only in layouts (`--ui-text-*`, `--content-*`, `--display-*` on marketing surfaces only).
- Three chrome text tiers. Emphasis from weight, colour and position, never a fourth size.
- Do not complete a scale for symmetry.

## Done when
- The contract test passes in both directions on `agentks-ui` and the engine's built-in CSS.
- A user theme with `override_mode: replace` that defines only the contract renders every layout correctly in light and dark mode.
- `agentks theme css` lists the hooks of the installed version.

# 02 Status and Result
In progress. The contract and the built-in theme's files are in the engine; component CSS, hooks, the two-way contract test and dark-mode code colours wait for the UI package and the compiler.

## Result
- `apps/agentks-engine/themes/default/` on the main repository's `main` branch: `theme.yaml` (66 required variables, the file list, a new `layers` map) and the ten CSS files, ported from today's styles folder. The bundler-only `index.css` and `globals.css` were not carried.
- Changes from today's CSS, none of them visible: seven inline fallbacks on contract variables removed (in `reset.css` and `markdown.css`); comments that named old TypeScript files now describe them in words; the status comment in `color.css` says eight statuses, not seven.
- `apps/agentks-engine/themes/examples/full-width/` and `examples/minimal/`: today's two user themes, copied unchanged, as compiler test inputs.
- `apps/agentks-engine/themes/README.md`: the contract rules (membership, no invented names or fallbacks, the `--font-size-xs` exception, the two text-token tiers) and what the compiler must do with these files.
- `apps/agentks-engine/themes/check-contract.ts`: run `bun apps/agentks-engine/themes/check-contract.ts`. It checks listed files exist, the default theme declares all 66 required variables, every variable it reads is declared, every file sits in exactly one layer, and the examples extend `@theme/default`. Runs on bun in about 20 ms. `ctl test`, the gate's test rung, runs it.
- `./ctl gate` green (lint, typecheck, test, check; 1 s).

**Left:** component CSS and `hooks.json` in `agentks-ui`; hook stability test; the two-way contract test on `agentks-ui` plus the engine CSS; the artifacts-skill copy check; replacing the Shiki rules in `markdown.css` with the Rust highlighter's classes; the done-when render checks.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `apps/agentks-engine` (built-in theme), `apps/packages/agentks-ui` (component CSS, hooks, contract test).
- **Read first:** [theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) (sections 04 to 06), [CSS and theming](../../brainstorm/01_initial-discussion/10_css-and-theming.md), the "Theming" section of this repository's AGENTS.md (the token cheat sheet and typography rules).
- **Today's code:** [theme.yaml](../../../../../../agent-ks-engine/src/styles/theme.yaml), [the styles folder](../../../../../../agent-ks-engine/src/styles), [the theme CSS route](../../../../../../agent-ks-engine/src/pages/theme.css.ts), [the contract check](../../../../../../scripts/checks/check-theme-contract.mjs), the theme loader in [the loaders folder](../../../../../../agent-ks-engine/src/loaders).
- **Depends on:** [080/20](../080_ui-and-client/20_shared-ui-package.md), [030/85 theme CSS compiler](../030_rust-engine/85_theme-css-compiler.md).
- **Unblocks:** every other leaf in this group.

# 04 Decisions
- Decided (sidhantha, 2026-09-29): branding is done with CSS; Rust compiles and caches each project's theme CSS.
- Decided (sidhantha, 2026-09-29): the CLI lists the compiled CSS so a user's agent can see and override it.
- Decided (claude, 2026-09-30): the built-in theme lives in `apps/agentks-engine/themes/default/`, not inside a crate, because it is data that the compiler embeds and the CLI and future docs read, and a crate folder would tie it to one crate's layout.
- Decided (claude, 2026-09-30): the built-in `theme.yaml` gets a `layers` map (layer name to files), checked against `files`, because the layer of each file is data about the theme and belongs beside the file list, not hard-coded in Rust. User themes do not use it; all their files go in the `user` layer.
- Decided (claude, 2026-09-30): layers are `reset` (reset.css), `theme` (color, font, element, breakpoints), `elements` (markdown, navbar, footer, docs, blogs), because that matches the design's order and no variable is declared in reset.css, so moving reset below the variables changes nothing.
- Decided (claude, 2026-09-30): removed the inline fallbacks on contract variables from the built-in CSS, because the compiler makes a missing contract variable fatal, so the fallbacks can never apply and only break the "no fallbacks" rule.
- Decided (claude, 2026-09-30): dropped `index.css` and `globals.css`, because they only chained `@import`s for Astro's bundler and the compiler reads `files` alone.
- Proposed (claude, 2026-09-30): hooks are a documented contract, renamed only with a migration ([theming](../../notes/03_frontend/04_theming-and-layouts.md) section 06).

# 05 Notes & Analysis
## 01 The contract groups (map of theme.yaml)

| Group | Variables |
|---|---|
| Colours | `--color-bg-primary/secondary/tertiary`, `--color-text-primary/secondary/muted`, `--color-border-default/light`, `--color-brand-primary/secondary`, `--color-success/warning/error/info` |
| Issue status | `--status-open`, `--status-blocked`, `--status-in-progress`, `--status-input-needed`, `--status-review`, `--status-done`, `--status-dropped`, `--status-superseded` |
| Fonts | `--font-family-base/mono`, the required primitive sizes, `--line-height-base`, `--font-weight-normal` |
| Semantic text | `--ui-text-micro/body/title`, `--content-body`, `--content-h1` … `--content-h6`, `--content-code`, `--display-sm/md` |
| Elements | `--spacing-xs` … `--spacing-3xl`, `--border-radius-sm/md/lg/full`, `--shadow-sm` … `--shadow-xl`, `--transition-fast/normal` |
| Layout sizes | `--sidebar-width`, `--navbar-height`, `--outline-width`, `--max-width-primary/secondary` |

`theme.yaml` is authoritative; this table is only a map.

## Watch out
- Status colours are used for status only; nothing else is coloured for meaning.
