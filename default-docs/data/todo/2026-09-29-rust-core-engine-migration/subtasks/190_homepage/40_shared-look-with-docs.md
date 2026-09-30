---
title: "Homepage: one look across / and /docs"
status: in-progress
---

A visitor moves from the homepage at `/` to the docs at `/docs` and should feel they are on one site. The two are built by different tools (Next.js and `agentks build`), so the shared look has to be designed in: the same colour and type tokens, the same logo and favicon, the same theme toggle that remembers the choice across both, and navigation that links each to the other. This leaf makes that true without copying CSS between the two.

# 01 To Do
- [ ] **One token source.** The homepage reads the brand's colours, fonts and spacing from the same CSS variables the docs theme uses: the theme contract's required variables ([100/10](../100_layouts/10_theme-contract-and-css.md)).
    - [ ] Choose how the homepage gets them: import the built theme CSS from `apps/packages/agentks-ui` (or the engine's compiled theme) at build time, or generate a small `tokens.css` from `theme.yaml`. One source; no hand-copied hex values.
    - [ ] Map the tokens into the homepage's styling by variable name. The homepage uses CSS modules, and `apps/agentks-homepage/src/styles/tokens.css` already declares the contract's names (`--color-bg-primary`, `--color-brand-primary`, `--font-family-base`, …) with the palette from [10](./10_content-and-design.md). What is left is to replace its hand-written values with the one source.
- [ ] **The agentks theme for the docs.** The docs project (`docs/config/site.yaml`) uses a theme whose tokens match the homepage's design plan from [10](./10_content-and-design.md). If the plan needs a new theme, add it to `docs/` as a user theme, which also proves user themes work.
- [ ] **Shared assets.** One logo, one favicon set, one social image style, stored once (for example `docs/assets/brand/`) and copied into both builds.
- [ ] **Theme toggle across both.** Both parts sit on one origin, so they share `localStorage`. Use the same storage key and values for light/dark/system in the homepage and the docs client, and read it before first paint to avoid a flash. The homepage side is built: `apps/agentks-homepage/src/lib/theme.ts` stores `light` or `dark` under the unnamespaced `theme` key, follows the OS while nothing is stored, and sets `data-theme` on `<html>` from a blocking inline script, as today's docs engine does.
- [ ] **Cross navigation.** The homepage header links to `/docs`; the docs navbar (`docs/config/navbar.yaml`) links back to `/` and to GitHub.
- [ ] **Fonts.** Self-hosted font files (no third-party font CDN), served from one path both parts use, with `font-display: swap`.

## Guardrails
- No hardcoded colours, fonts or spacing in homepage components ([AGENTS.md](../../../../../../AGENTS.md), theming rules, apply here too).
- The docs theme stays an ordinary agentks theme. No homepage-specific code in the engine or the UI package.

## Done when
- Changing one colour token in the source changes both the homepage and the docs after a rebuild.
- Switching to dark mode on `/`, then opening `/docs`, shows the docs in dark mode with no flash, and back again.
- A grep of `apps/agentks-homepage/src` finds no hex colour literals outside the token mapping.

# 02 Status and Result
In progress: the homepage side is built and the gate is green; the docs side waits for `docs/` and the client. On 2026-10-01 Geist, Geist Mono and the new mark moved into `apps/agentks-homepage/brand/`; the theme link to `apps/agentks-engine/themes/default/` is unchanged.

## Result
- **One token source.** `apps/agentks-homepage/src/styles/theme.css` imports the built-in theme's `theme`-layer files from `apps/agentks-engine/themes/default/` (`color.css`, `font.css`, `element.css`, `breakpoints.css`), then the brand theme's files, the same files the docs are built from. `next.config.ts` sets `turbopack.root` to `apps/` so the bundler may read them.
- **The agentks theme.** `apps/agentks-homepage/brand/theme/` is an ordinary user theme (`extends: "@theme/default"`, files `color.css` and `font.css`) holding the palette from [10](./10_content-and-design.md): paper, ink, link blue, light and dark. It sets only names the built-in theme declares.
- **Homepage-only tokens** are in `src/styles/tokens.css` and all start with `--home-` (15 names: three colours, type sizes built on the theme's primitive scale, two line heights, two widths, the section space). No component reads a primitive `--font-size-*` any more. The hero figure's mini docs page now reads the docs' own `--content-body`, `--content-h1` and `--content-h2`.
- **One logo.** `brand/logo.svg` (currentColor) is the only copy. The header renders it, and `/favicon.svg` (ink per OS mode), `/apple-icon.png` and `/social-card.png` are drawn from it at build time. `public/icon.svg` is deleted.
- **Fonts.** `brand/theme/font.css` declares the Latin subsets of Source Serif 4 (variable) and IBM Plex Mono 400/500 at `/fonts/…`, `font-display: swap`. `scripts/copy-fonts.ts` copies exactly those files from the `@fontsource` packages into `public/fonts/` (git-ignored) before `next dev` and `next build`, so the export serves them at `/fonts/` for both parts.
- **Theme toggle.** Key `theme`, unnamespaced, values `light`/`dark`, no entry follows the OS. `src/lib/theme.ts` gained `resolveTheme` (tested against the boot script string over all ten cases) and now follows a change made in another tab (the `storage` event, so a switch on `/docs` updates an open `/`) and an OS change while nothing is stored.
- **Cross navigation.** The homepage header already links to `/docs/`. The docs navbar is for the docs side.
- **Checks.** `src/styles/theme.test.ts`: the import list equals the two `theme.yaml` files, every `tokens.css` name starts with `--home-`, every `var()` in `src/` resolves to a declared name, no hex literal in `src/` outside `tokens.css`, every font file is in a package. `src/lib/brand/brand.test.ts`: colour resolution through the chain, the logo. `ctl gate` green (12 s; homepage tests 35 in 0.03 s). Light and dark screenshots of the export checked by eye.
- **Left for the docs side** (needs `docs/`, the UI package and the client): move `brand/` to `docs/themes/agentks/` and `docs/assets/brand/` and repoint `theme.css`, `src/lib/brand/` and `copy-fonts.ts`; `docs/config/site.yaml` names the `agentks` theme; `docs/config/navbar.yaml` links to `/` and GitHub; the docs client's toggle uses the same key and boot script (recorded in [090/10](../090_frontend-performance/10_ui-state-persistence.md)); check the "no flash from / to /docs" done-when once both exist.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folders `apps/agentks-homepage/`, `docs/config/`, `docs/assets/`.
- **Read first:**
  - [Theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) — the theme contract and how Rust compiles theme CSS.
  - [Client application](../../notes/03_frontend/02_client-application.md) — where the docs client stores UI state, including the theme mode.
  - Today's contract: [theme.yaml](../../../../../../agent-ks-engine/src/styles/theme.yaml).
- **Depends on:** [190/10 content and design](./10_content-and-design.md), [190/20 app scaffold](./20_app-scaffold.md), [100/10 theme contract and CSS](../100_layouts/10_theme-contract-and-css.md), [090/10 UI state persistence](../090_frontend-performance/10_ui-state-persistence.md) (the storage key).
- **Unblocks:** [190/30 sections](./30_sections.md), [195/30 docs at /docs](../195_hosting/30_docs-at-slash-docs.md).

# 04 Decisions
- Decided (claude, 2026-09-30): the homepage takes its tokens from the docs theme contract rather than defining its own, so the brand has one source and cannot drift between two copies.
- Decided (claude, 2026-10-01): the homepage imports the theme's CSS source files directly (`@import` in `src/styles/theme.css`) rather than a generated `tokens.css` or the compiled theme, because a generated copy needs a sync step and the compiled theme also carries the docs' element and layout rules, which would restyle the homepage. A test compares the import list with both `theme.yaml` files, so the list cannot drift from the compiler's.
- Decided (claude, 2026-10-01): the brand is an ordinary agentks user theme named `agentks`, extending the built-in theme and setting only colours and font families, because the docs must use it through the normal theme mechanism, with no homepage code in the engine.
- Decided (claude, 2026-10-01): the brand sits in `apps/agentks-homepage/brand/` until `docs/` exists, then moves to `docs/themes/agentks/`, because this wave's scope is the homepage folder and `docs/` is not created yet. Recorded as a deferral in AGENTS.md.
- Decided (claude, 2026-10-01): the homepage never redefines a theme name; its own tokens are `--home-*`, because a shared name must mean the same value on `/` and `/docs`. The homepage's larger reading sizes (18 px body, 30 px section headings) are `--home-text-*` tokens built on the shared primitive scale.
- Decided (claude, 2026-10-01): the theme-mode key stays `theme`, unnamespaced, with `light`/`dark` and no entry for "follow the OS", as an explicit exception to 090/10's project-key rule, because the mode must cross from `/` to `/docs` and the homepage has no project key; sharing it between projects on one port is harmless, since it is a person's preference, not project state. Recorded in 090/10 too.
- Decided (claude, 2026-10-01): the fonts are served at `/fonts/` from the homepage export and declared once in the brand theme's `font.css` with root-relative URLs, because both parts share the origin, so the browser downloads each file once. The cost: a docs project served on its own shows the fallback families. Only Latin and Latin Extended subsets ship.
- Decided (claude, 2026-10-01): build-time code that needs a colour outside CSS (theme-color, manifest, favicon, card) reads it from the theme files through `src/lib/brand/theme-colors.ts`, which resolves the brand-then-default chain as the cascade does and throws on a missing name or a `var()` value, so no hex is copied into TypeScript.

# 05 Notes & Analysis

## Watch out
- The docs client namespaces its storage keys by project key ([client application](../../notes/03_frontend/02_client-application.md)), but the homepage already uses the unnamespaced `theme` key. So [090/10](../090_frontend-performance/10_ui-state-persistence.md)'s storage-key decision should keep the theme-mode key unnamespaced; otherwise this leaf changes `apps/agentks-homepage/src/lib/theme.ts` to read the namespaced key. Record the answer in both leaves.
