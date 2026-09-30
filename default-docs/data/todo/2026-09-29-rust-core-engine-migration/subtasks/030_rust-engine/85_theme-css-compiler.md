---
title: "Theme CSS compiler — one contract-checked stylesheet per project"
status: review
---

Rust compiles and caches each project's theme CSS: the built-in theme, the chosen theme and its `extends` chain, and the project's overrides, merged into one stylesheet served at a hashed URL. Today's [theme.ts](../../../../../../agent-ks-engine/src/loaders/theme.ts) does this in TypeScript. This leaf ports it and makes the variable contract a hard check: a theme missing a required variable is an error, not a silent fallback.

# 01 To Do
- [ ] **Carry the built-in theme into the engine**: `theme.yaml` (with `required_variables`) and the CSS files from [agent-ks-engine/src/styles/](../../../../../../agent-ks-engine/src/styles/theme.yaml) are in `apps/agentks-engine/themes/default/` (theme files done, see Result); the compiler embeds that folder in the binary. The base CSS of navbar, footer, docs and blog chrome stays here; component CSS lives in the UI package ([03/04](../../notes/03_frontend/04_theming-and-layouts.md) section 05).
- [ ] **Follow the theme folder's README.** Read the files in `apps/agentks-engine/themes/default/` and do what `apps/agentks-engine/themes/README.md` lists under "What the compiler must do with these files". Use the two themes in `apps/agentks-engine/themes/examples/` (`full-width`, `minimal`) as the compiler's test inputs.
- [ ] **Resolve the theme**: `theme:` in `site.yaml` names a built-in theme or a folder found through `theme_paths` (default `config/themes/`). Follow `extends` (`@theme/<name>`) to the built-in default; a cycle or an unknown parent is a fatal error.
- [ ] **Read only the listed files**, in `files` order, and never follow `@import`. The built-in theme has no `index.css` or `globals.css`; the `files` list is its only source of files. `examples/minimal/index.css` starts with a stray `@import`: leave it alone or warn, never follow it.
- [ ] **Merge** by `override_mode`, which has three values: `merge` (the default) takes the parent's files, then the child's; `override` takes the parent's files except any whose name the child also lists, then the child's; `replace` takes the child's files only.
- [ ] **Check the contract**: every variable in `required_variables` is defined after the merge; otherwise a fatal error naming the variable and the theme. `supports_dark_mode` is read and sent in the manifest.
- [ ] **Order with cascade layers**: start with `@layer reset, theme, elements, components, user;`, wrap each built-in file in the layer the built-in `theme.yaml`'s `layers` map gives it, and put every user-theme file in `user`. A user rule then wins over a built-in or component rule of the same strength without `!important`. `!important` works in reverse across layers, so the seven `!important` declarations in the built-in CSS (six in `markdown.css`, one in `navbar.css`) beat a user's `!important`.
- [ ] **Cache and serve**: key = hash of every input file + engine version; the result is served at a URL carrying the hash (`/theme.<hash>.css`), cached by the browser for good; the manifest names the URL. The static build writes the same file ([150](../150_publishing/00_overview.md)).
- [ ] **One function for both callers**: `agentks theme css` prints exactly what the server serves ([070/80 theme commands](../070_cli/80_theme-commands.md)), so an agent always sees the CSS the installed version uses.
- [ ] **Live change**: a theme file change (the `theme` tag, [30](./30_config-loader-and-settings-schema.md)) recompiles and pushes a new CSS hash; no page hash changes.

## Guardrails
- No invented variables and no fallbacks in the built-in CSS; the contract rule "a variable is on the contract if and only if a shipped layout reads it" holds ([03/04](../../notes/03_frontend/04_theming-and-layouts.md) section 04).
- Any change to `required_variables` updates the artifacts skill's inline copy in the same change ([130](../130_ai-plugins/00_overview.md)).

## Done when
- The compiled CSS for the `default` theme and each theme in `apps/agentks-engine/themes/examples/` (copies of this repository's `default-docs/themes/`) defines every variable today's compiled CSS defines, with the same values (compare the variable sets of both outputs).
- A theme fixture missing one required variable fails to load with the variable and theme named.
- `agentks theme css` output equals the served `/theme.<hash>.css` byte for byte.

# 02 Status and Result
Review. The compiler is built in crate `agentks-render`. Serving at `/theme.<hash>.css`, the `agentks theme css` command and the live recompile belong to the server and CLI tracks. They call `compile_theme` and so get the same bytes.

## Result
- Theme files (done by the default-theme track, 2026-09-30): the built-in theme is in `apps/agentks-engine/themes/default/`, today's two user themes are in `apps/agentks-engine/themes/examples/` as test inputs, and `apps/agentks-engine/themes/README.md` lists what the compiler must do with them.
- The compiler is `compile_theme(config, files)` and `compile_theme_named(name, theme_paths, files)` in `crates/render/src/theme/`. It embeds `themes/default/` with `include_dir`. It resolves `default` or a folder under `theme_paths`, and a user folder named `default` is an error. It follows `@theme/<name>` in `extends`: a cycle gives `theme-extends-cycle`, an unknown theme or parent gives `theme-not-found`, and a bad `theme.yaml` or a missing listed file gives `theme-invalid`. It reads only the listed files and never follows `@import`. It merges by `merge`, `override` or `replace` (an `override` skip list applies all the way up the chain, as in the old loader). It checks every `required_variables` name after stripping comments, and each missing one gives a `theme-variable-missing` record naming the variable and the theme.
- The output starts with `@layer reset, theme, elements, components, user;`. Each built-in file is wrapped in its layer from the `layers` map, every user file goes in `user`, and the engine's code-highlighting colours go last in `elements`. `CompiledTheme.hash` is BLAKE3 of the CSS. `inputs` lists the hash of each `theme.yaml` (root first), then each CSS file in merge order. `supports_dark_mode` is the nearest value up the chain.
- A one-off check compared the custom-property declarations (name and value) of the compiled CSS with today's concatenated CSS. For `default` (132), `minimal` (132) and `full-width` (134) the sets are identical.
- Tests: 5 compiler tests, covering layers, merge with the examples, override and replace, broken themes, and determinism. They are part of the crate's 28 tests.

## Agent log
none

# 03 References
- **Where:** compiler module in crate `agentks-render`; theme files in `apps/agentks-engine/themes/` (embedded).
- **Read first:** `apps/agentks-engine/themes/README.md` in the main repository; [03/04 Theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) sections 04 and 05; [02/03](../../notes/02_engine/03_rust-engine.md) section 07; today's [theme.ts](../../../../../../agent-ks-engine/src/loaders/theme.ts), [theme.yaml](../../../../../../agent-ks-engine/src/styles/theme.yaml) and [check-theme-contract.mjs](../../../../../../scripts/checks/check-theme-contract.mjs); today's AGENTS.md "Theming" section.
- **Depends on:** [30](./30_config-loader-and-settings-schema.md).
- **Unblocks:** [100/10 theme contract and CSS](../100_layouts/10_theme-contract-and-css.md), [070/80](../070_cli/80_theme-commands.md).

# 04 Decisions
- Decided (claude, 2026-09-30): the theme files live in `apps/agentks-engine/themes/`, outside any crate, because they are data several parts read; the compiler embeds them from there. The built-in `theme.yaml` carries a `layers` map that the compiler uses to wrap each file in its cascade layer.
- Decided (sidhantha, 2026-09-29): Rust compiles and caches each project's theme CSS; branding is CSS only.
- Proposed (claude, 2026-09-30, [03/04](../../notes/03_frontend/04_theming-and-layouts.md)): user themes default to `config/themes/<name>/`.
- Decided (claude, 2026-10-01): `theme.yaml` is parsed with `serde-saphyr`, the YAML crate the library track added, so the workspace keeps one serde YAML crate.
- Decided (claude, 2026-10-01): the compiled stylesheet ends with a generated code-highlighting block in the `elements` layer. This is the one part that no `theme.yaml` lists. It is not in `inputs`, because it changes only with the engine version, which the cache key already holds.
- Decided (claude, 2026-10-01): `theme:` in `site.yaml` may be `name` or `@theme/name`, while `extends` must use `@theme/name`. `theme_paths` is used as the config gives it; its default belongs to the config loader.
- Decided (claude, 2026-10-01): a user theme with no `extends` stands alone (its own files only), as in the old loader. It must still define the whole contract.

# 05 Notes & Analysis
## Watch out
- `--font-size-xs` exists only in the default theme and is read with a fallback today; keep that exception exactly, or move it onto the contract in the same change as the CSS.
- The theme files sit outside the crate, so `agentks-render` embeds them through a workspace-relative path (for example `include_dir!` on `$CARGO_MANIFEST_DIR/../../themes`). That builds inside the workspace, but `cargo package` breaks, so the crate cannot be published on its own. If it ever must be, a `build.rs` copies the files into `OUT_DIR` first.
