---
title: "Theme CSS compiler — one contract-checked stylesheet per project"
status: open
---

Rust compiles and caches each project's theme CSS: the built-in theme, the chosen theme and its `extends` chain, and the project's overrides, merged into one stylesheet served at a hashed URL. Today's [theme.ts](../../../../../../agent-ks-engine/src/loaders/theme.ts) does this in TypeScript. This leaf ports it and makes the variable contract a hard check: a theme missing a required variable is an error, not a silent fallback.

# 01 To Do
- [ ] **Carry the built-in theme into the engine**: `theme.yaml` (with `required_variables`) and the CSS files from [agent-ks-engine/src/styles/](../../../../../../agent-ks-engine/src/styles/theme.yaml) are in `apps/agentks-engine/themes/default/` (theme files done, see Result); the compiler embeds that folder in the binary. The base CSS of navbar, footer, docs and blog chrome stays here; component CSS lives in the UI package ([03/04](../../notes/03_frontend/04_theming-and-layouts.md) section 05).
- [ ] **Resolve the theme**: `theme:` in `site.yaml` names a built-in theme or a folder found through `theme_paths` (default `config/themes/`). Follow `extends` (`@theme/<name>`) to the built-in default; a cycle or an unknown parent is a fatal error.
- [ ] **Merge**: parent then child; `override_mode: replace` drops the parent and keeps only what the child defines.
- [ ] **Check the contract**: every variable in `required_variables` is defined after the merge; otherwise a fatal error naming the variable and the theme. `supports_dark_mode` is read and sent in the manifest.
- [ ] **Order with cascade layers**: `@layer reset, theme, elements, components, user;` so a user rule wins over a component rule of the same strength without `!important`.
- [ ] **Cache and serve**: key = hash of every input file + engine version; the result is served at a URL carrying the hash (`/theme.<hash>.css`), cached by the browser for good; the manifest names the URL. The static build writes the same file ([150](../150_publishing/00_overview.md)).
- [ ] **One function for both callers**: `agentks theme css` prints exactly what the server serves ([070/80 theme commands](../070_cli/80_theme-commands.md)), so an agent always sees the CSS the installed version uses.
- [ ] **Live change**: a theme file change (the `theme` tag, [30](./30_config-loader-and-settings-schema.md)) recompiles and pushes a new CSS hash; no page hash changes.

## Guardrails
- No invented variables and no fallbacks in the built-in CSS; the contract rule "a variable is on the contract if and only if a shipped layout reads it" holds ([03/04](../../notes/03_frontend/04_theming-and-layouts.md) section 04).
- Any change to `required_variables` updates the artifacts skill's inline copy in the same change ([130](../130_ai-plugins/00_overview.md)).

## Done when
- The compiled CSS for today's `default` theme and each user theme in this repository's `default-docs/themes/` defines every variable the current compiled CSS defines, with the same values (compare the variable sets of both outputs).
- A theme fixture missing one required variable fails to load with the variable and theme named.
- `agentks theme css` output equals the served `/theme.<hash>.css` byte for byte.

# 02 Status and Result
Open. Not started.

## Result
- Theme files (done by the default-theme track, 2026-09-30): the built-in theme is in `apps/agentks-engine/themes/default/`, today's two user themes are in `apps/agentks-engine/themes/examples/` as test inputs, and `apps/agentks-engine/themes/README.md` lists what the compiler must do with them (resolve, extends, merge modes, contract check, `@layer` wrapping from the new `layers` map, cache and serve). `bun apps/agentks-engine/themes/check-contract.ts` checks the files. The compiler itself is not started.

## Agent log
none

# 03 References
- **Where:** crate `agentks-render` (`theme/` and the compiler module).
- **Read first:** [03/04 Theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) sections 04 and 05; [02/03](../../notes/02_engine/03_rust-engine.md) section 07; today's [theme.ts](../../../../../../agent-ks-engine/src/loaders/theme.ts), [theme.yaml](../../../../../../agent-ks-engine/src/styles/theme.yaml) and [check-theme-contract.mjs](../../../../../../scripts/checks/check-theme-contract.mjs); today's AGENTS.md "Theming" section.
- **Depends on:** [30](./30_config-loader-and-settings-schema.md).
- **Unblocks:** [100/10 theme contract and CSS](../100_layouts/10_theme-contract-and-css.md), [070/80](../070_cli/80_theme-commands.md).

# 04 Decisions
- Decided (claude, 2026-09-30): the theme files live in `apps/agentks-engine/themes/`, outside any crate, because they are data several parts read; the compiler embeds them from there. The built-in `theme.yaml` carries a `layers` map that the compiler uses to wrap each file in its cascade layer.
- Decided (sidhantha, 2026-09-29): Rust compiles and caches each project's theme CSS; branding is CSS only.
- Proposed (claude, 2026-09-30, [03/04](../../notes/03_frontend/04_theming-and-layouts.md)): user themes default to `config/themes/<name>/`; the cascade-layer order above.

# 05 Notes & Analysis
## Watch out
- `--font-size-xs` exists only in the default theme and is read with a fallback today; keep that exception exactly, or move it onto the contract in the same change as the CSS.
