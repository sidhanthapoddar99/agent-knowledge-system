---
title: "Homepage: one look across / and /docs"
status: open
---

A visitor moves from the homepage at `/` to the docs at `/docs` and should feel they are on one site. The two are built by different tools (Next.js and `agentks build`), so the shared look has to be designed in: the same colour and type tokens, the same logo and favicon, the same theme toggle that remembers the choice across both, and navigation that links each to the other. This leaf makes that true without copying CSS between the two.

# 01 To Do
- [ ] **One token source.** The homepage reads the brand's colours, fonts and spacing from the same CSS variables the docs theme uses: the theme contract's required variables ([100/10](../100_layouts/10_theme-contract-and-css.md)).
    - [ ] Choose how the homepage gets them: import the built theme CSS from `apps/packages/agentks-ui` (or the engine's compiled theme) at build time, or generate a small `tokens.css` from `theme.yaml`. One source; no hand-copied hex values.
    - [ ] Map the tokens into the homepage's styling (Tailwind theme keys or CSS modules) by variable name.
- [ ] **The agentks theme for the docs.** The docs project (`docs/config/site.yaml`) uses a theme whose tokens match the homepage's design plan from [10](./10_content-and-design.md). If the plan needs a new theme, add it to `docs/` as a user theme, which also proves user themes work.
- [ ] **Shared assets.** One logo, one favicon set, one social image style, stored once (for example `docs/assets/brand/`) and copied into both builds.
- [ ] **Theme toggle across both.** Both parts sit on one origin, so they share `localStorage`. Use the same storage key and values for light/dark/system in the homepage and the docs client, and read it before first paint to avoid a flash.
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
Open. Not started.

## Result
None yet.

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

# 05 Notes & Analysis

## Watch out
- The docs client namespaces its storage keys by project key ([client application](../../notes/03_frontend/02_client-application.md)). The theme-mode key must be the exception the homepage can read, or the homepage must read the namespaced key; decide with [090/10](../090_frontend-performance/10_ui-state-persistence.md) and record it.
