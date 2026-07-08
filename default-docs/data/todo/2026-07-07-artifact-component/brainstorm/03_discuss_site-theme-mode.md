---
title: "Discuss — site-theme mode for artifacts (host-theme injection)"
---

**Resolved →** accepted in full by sidhantha (2026-07-07); implementation in
[../subtasks/90_site-theme-mode.md](../subtasks/90_site-theme-mode.md).

## The problem (sidhantha's framing)

When an artifact *represents data* — charts, dashboards, comparison visuals
about the docs' own subject — the embed should feel native to the hosting
page. A self-invented palette fights the host theme and reads as pasted-on.
But the host theme is not static: it varies with `site.yaml`, env config,
theme inheritance, and user themes — so baking theme values into the artifact
at authoring time goes stale the moment the site theme changes. And the AI
shouldn't re-derive or re-write the theme for every artifact when the engine
already carries a documented variable contract.

Counter-case, also from the framing: some artifacts *must* own their world —
a theme guide for a *different* website, a brand exploration, anything whose
point is a theme that deliberately diverges. Those need a way to say "leave
me alone."

## Deliberation

**Injection point — route, not embed JS.** Two options existed: (a) the
embed's client script patches the theme stylesheet into the iframe document
after load; (b) the `/artifacts` route conditionally rewrites the served HTML
to include the resolved theme CSS before `</head>`. Route-side wins: the
full-page view is served by the same route, so both surfaces inherit the
theme for free (embed-JS injection would leave the full-page view unthemed),
and the stylesheet arrives with the document — no flash of unthemed content.
The existing same-origin `data-theme` propagation already handles light/dark
switching; full-page honors `prefers-color-scheme` plus the propagated
attribute.

**Flag shape — enum on the existing key, not a new boolean.** The sidecar's
`artifact.theme` key already exists in the contract (the planning fixture
declares `"self-world"`). Rather than a `doc-engine-theme: false` boolean,
the key carries the mode: **`"site"`** (inject host theme; the artifact
consumes `var(--color-*)` / semantic tokens and defines nothing) vs
**`"self"`** (served untouched — the theme-guide / foreign-brand case).
**Default `self`**: safest for artifacts arriving from anywhere; existing
artifacts are unaffected; the authoring skill instructs data-representation
artifacts to declare `site`.

**Authoring side — names are a contract, values are a query.** The variable
*names* are already documented (`src/styles/theme.yaml → required_variables`,
the CLAUDE.md cheat sheet, the skill references) — a `site`-mode artifact
just consumes them. The *values* (needed e.g. to validate a chart palette
against the real surfaces in both modes) require resolving the active theme
(name → `theme_paths` scan → `extends` inheritance → CSS merge), which is
non-trivial — so a CLI verb, **`agent-ks theme tokens --json`**, outputs the
resolved variable→value map for light and dark. Feeds authoring and the
bundled palette validator; ends the "AI re-derives the theme every time"
problem.

**The standalone subtlety.** A `site`-mode artifact opened outside the engine
(raw `file://`, emailed) has no injected variables. The skill therefore
instructs site-mode artifacts to carry a minimal neutral fallback layer
(`var(--color-bg-primary, #fff)`-style). This does not violate the
no-fallback rule in CLAUDE.md — that rule protects *layouts*, where the
variable must always resolve; here injection overrides the fallback in situ
and the fallback only serves the out-of-engine case.

## Mode-choice doctrine (sidhantha, follow-up after live testing)

The two modes map to the two major ways artifacts get used, and the skill must
teach the mapping as doctrine, not preference:

- **Data representation** — charts, dashboards, visuals that *explain the
  documentation's subject* → **`site`**. The artifact is part of the page's
  information; it must feel native and re-theme with the site.
- **UI/UX deliberation** — designing or brainstorming a theme, design system,
  or interface for some application → **always `self`**, with the theme system
  written *inside the HTML*. This holds **even when the application's intended
  theme is similar or identical to the docs engine's current theme**: the
  moment the artifact's *subject* is UI/UX, its theme is the content under
  discussion — it must be self-owned, portable, and independent of the
  engine's theme system, or a future site-theme change silently rewrites the
  very design being deliberated.

## The skill carries the variable contract inline (independence requirement)

The skill must **enumerate the engine's theme variable vocabulary inside the
skill itself** (the common `--color-*` / `--font-*` / `--spacing-*` /
semantic-token names from `theme.yaml → required_variables`), not merely point
at the repo's CSS. Three reasons:

1. `site`-mode authoring needs the vocabulary at hand to consume it.
2. `self`-mode artifacts may need to deliberately **override injected CSS**
   (defense in depth if a site-mode default ever leaks) — overriding requires
   knowing the names.
3. **Future independence:** if the plugin is ever distributed standalone
   (not installed inside this repo as it is today), there is no theme CSS on
   disk to reference — the inline list is then the only source. The
   `agent-ks theme tokens` verb complements this with live *values* when the
   repo is present; the inline list carries the *names* always.

This creates a real coupling: the skill's inline variable list depends on the
theming system. **CLAUDE.md must record the dependency** — anyone changing
theme variables (adding/renaming in `theme.yaml`) must update the
agent-ks-artifacts skill's variable section in the same change.

## Decision

Accepted as a package: route-side conditional injection keyed on
`artifact.theme: "site" | "self"` (default `self`); `agent-ks theme tokens`
query verb; authoring-skill section teaching both modes + the mode-choice
doctrine above + the inline variable contract + the fallback-layer rule;
documentation updated on both audience sides; CLAUDE.md notes the
theme-system ↔ skill coupling.
