---
name: agent-ks-artifacts
description: Use this skill to BUILD a self-contained HTML artifact as a content file in an agent-knowledge-system project — a report page, dashboard, data visualization, design-system swatch / type-specimen / component gallery, a variation set comparing N design options of one UI element, or a brand-guideline showcase — published as an `NN_`-prefixed `.html` page in a docs section (the `/artifacts` content type) or inside a tracker `brainstorm/` / `notes/` folder, with an optional `.meta.json` sidecar. Covers treatment calibration, honoring the host theme contract, dual-theme + self-containment discipline, the chart/dataviz procedure and the palette validator, design-system authoring flows, the variation-set / options-explorer pattern, and the pre-publish verify gate. Trigger eagerly whenever the user asks to build / design / generate an artifact, an HTML report, a dashboard, a chart, a data viz, a design system, a set of design options / variations to compare or pick from, or a brand guideline for THIS project. This is NOT about claude.ai Artifacts (the built-in `Artifact` tool / gallery); it is about HTML files served at `/artifacts` in an agent-knowledge-system repo. For writing markdown docs pages use the agent-ks-docs skill; for issue-tracker structure use agent-ks-issues.
license: Complete terms in the documentation-guide plugin LICENSE file.
---

# agent-ks-artifacts — building HTML artifacts in this framework

Operating manual for building **artifacts**: self-contained HTML pages — reports,
dashboards, interactive data visualizations, design-system showcases — that ship
as content files in an agent-knowledge-system project and render inline in the docs
chrome plus full-page at their own URL.

> **Scope fence — read this before anything else.** An *artifact* here is an
> `.html` file in this repo, served by the framework at `/artifacts/<path>`. It is
> **not** a claude.ai Artifact (the built-in `Artifact` tool, its gallery, its CSP,
> its `<body>`-fragment wrapping). Everything about how one is published, themed,
> and delivered is *this framework's* mechanism, not claude.ai's. If a habit from
> claude.ai artifact design conflicts with what this skill says, this skill wins.

## What an artifact is *here*

- **A first-class content file.** An `NN_`-prefixed `.html` in a docs section shows
  in the sidebar like any page; an `.html` inside a tracker `brainstorm/` / `notes/`
  / subtask folder is a thinking-artifact beside the deliberation that produced it.
- **A complete document, not a fragment.** You own the whole
  `<!doctype html>` — `<head>`, `<style>`, `<script>`, `<body>`. There is no host
  wrapper injecting a skeleton around your `<body>`. (This is the single most common
  carryover mistake from claude.ai material — see `references/publishing.md`.)
- **Embedded with chrome intact, and full-page at its own URL.** In a docs section
  the artifact renders in an iframe that fills the content column (sidebar stays;
  the TOC rail auto-hides because an artifact has no headings). The embed carries an
  **open-full-page** link to `/artifacts/<path>` — a real, bookmarkable, shareable
  URL. That route is the primitive: the iframe's `src` *is* the route.
- **AI-legible through a sidecar.** An optional same-name `.meta.json` / `.meta.jsonc`
  carries the rendering fields (title, description, sidebar label/position, draft)
  **plus** an `artifact:` block of *declared values* — purpose, palette, key data —
  so an agent understands the artifact without parsing its HTML. **Use it in both
  directions: read the sidecar before touching an existing artifact (or building a
  companion meant to match it), and update it in the same change as any HTML edit** —
  it is design memory for the next agent, and it only works while it stays true.
  Contract in `references/publishing.md` ("The sidecar is design memory").

## Triage — which reference to read

Read only the one(s) the task needs; they are independent.

| Task | Read |
|---|---|
| Craft: fundamentals, the anti-generic rules, typography, the process, the UI-vs-document router | [`references/design-fundamentals.md`](references/design-fundamentals.md) |
| Where the `.html` lives, the sidecar contract, the `/artifacts` route + embed, the two theme modes (`site` / `self`) + the injection mechanism, self-containment / CDN policy, font delivery, embed-width sizing, the host theme-token vocabulary | [`references/publishing.md`](references/publishing.md) |
| It's a chart / dashboard / any data visualization — the form → color → validate procedure, mark specs, interaction, anti-patterns, the palette instance | [`references/dataviz/00_overview.md`](references/dataviz/00_overview.md) |
| Authoring a whole design system / brand guideline (in an issue `brainstorm/` or as a published docs section), the conventions-authoring doctrine, and the Styled / Complete / Plausible verify rubric | [`references/design-systems.md`](references/design-systems.md) |
| Comparing N design variations of one element / screen to pick one — an options explorer (one artifact, working options, shared fixture) | [`references/design-systems.md`](references/design-systems.md) → "Variation-set / options-explorer artifacts" |
| Where the converged source skills came from (upstream sync) | [`references/PROVENANCE.md`](references/PROVENANCE.md) |

The four sections below are **not optional reading** — they govern what every
artifact becomes and gate what ships. The references carry the depth.

## §0 · Calibrate the treatment first

Read the request before deciding anything visual. The question is never *whether*
to design — a plan deserves the same craft as a landing page — but which
**treatment** that craft is delivered in. Most artifacts in a docs repo are
**utilitarian**, and that is the common case here, not a lesser one.

- **Utilitarian (the default for this repo).** An embedded explainer, a status
  dashboard, a metrics report, a decision memo. Make it genuinely polished — real
  typographic hierarchy, considered spacing, a chosen palette — but **do not
  over-design**. Most pages need no giant hero; keep flourishes tasteful and few. A
  well-composed page is never the wrong answer.
- **Editorial (the exception — a standalone showcase).** A brand-guideline landing
  surface, a poster-like specimen, an interactive toy meant to be kept or shared.
  Here the client has already turned down the templated options and wants a
  designer with a stance — commit to strong choices, and let one genuine aesthetic
  gamble land where the work can carry it. Before writing code, ask the
  frontend-design questions: **Purpose** (what job, whose eyes), **Tone** (pick a
  concrete direction — see the tone menu in `design-fundamentals.md`),
  **Differentiation** (the one thing a reader will remember).
- **Decision tooling (a variation set / options explorer).** N design options of
  one element, built to pick one — this calibrates as *editorial per option*: the
  don't-over-design governor does **not** apply to the options themselves, each of
  which must read as a shippable design; only the chrome around them (switcher,
  comparison table) stays utilitarian. See `design-systems.md` → "Variation-set /
  options-explorer artifacts".

When unsure, lean utilitarian: an over-composed page is occasionally wrong, a
clean one never is. The editorial process (the review-for-genericness step, the
tone menu, texture ideas) runs **only** when this read says editorial — it is
gated behind this governor, not applied by default.

## §1 · Honor the host design system — and pick a theme mode

Precedence is fixed: **the user's own words → the host theme contract → your own
choices.** Each later tier only fills gaps the earlier one left; it never overrides.

This framework has a *real, mandatory* theme contract — stronger than a loose "look
for a tokens file." The single source of truth is
`astro-doc-code/src/styles/theme.yaml` (`required_variables`), realised in
`color.css` and `font.css`. Every artifact declares, in its sidecar's
`artifact.theme`, **which of two modes** it lives in — and that choice is doctrine,
not taste.

### The two theme modes

- **`site` — inherit the host theme.** The `/artifacts` route injects the site's
  *resolved* theme CSS into the served document (embed **and** full-page) and stamps
  `data-theme`. The artifact **consumes the token vocabulary** (`var(--color-*)`,
  `--ui-text-*`, `--content-*`, `--spacing-*`, …) and **defines no palette of its
  own**. It re-themes live when the site theme changes — nothing bakes in, nothing
  goes stale. This is the default for anything that is *part of the page's
  information*.
- **`self` — own your world (served untouched).** The route serves the file
  byte-for-byte; nothing is injected. The artifact **carries its own complete theme
  system inside the HTML** — both light and dark (see §2). This is for artifacts
  whose *subject is a look*: a theme guide for another site, a brand exploration, a
  poster.

Set it explicitly in the sidecar — `"artifact": { "theme": "site" }` or
`"theme": "self"`. **Default is `self`** (safest for an artifact that could arrive
from anywhere; any unrecognized value reads as `self`). Declaring `site` is
the opt-in to inheritance.

### Mode-choice doctrine — decided by the artifact's *subject*

- **Data representation → `site`.** A chart, dashboard, metrics report, or explainer
  whose job is to *present the documentation's own subject*. It must feel native to
  the page and re-theme with the site, so it inherits the host theme and spends its
  originality on how information is arranged — never on a parallel palette.
- **UI/UX deliberation → *always* `self`.** The moment the artifact's *subject* is
  UI/UX — designing or brainstorming a theme, a design system, or an interface for
  some application — its theme **is the content under discussion**, so it must be
  self-owned, portable, and independent of the engine. **This holds even when the
  target application's intended theme is similar or identical to the docs engine's
  current theme.** Inheriting there would let a future site-theme change silently
  rewrite the very design being deliberated. Write the theme inside the HTML;
  declare `self`. (A variation set — N options of one element, `design-systems.md`
  — is the canonical case.)

When the artifact *shows data*, lean `site`; when it *is a design*, it is always
`self`.

### The inline variable contract (consume these names; never invent)

These are the engine's `required_variables` — the vocabulary a `site`-mode artifact
consumes and a `self`-mode artifact may deliberately override. **They are enumerated
here in the skill on purpose:** (1) `site`-mode authoring needs the names at hand;
(2) `self`-mode artifacts sometimes override injected CSS, and overriding needs the
names; (3) **independence** — if this plugin is ever distributed standalone, with no
theme CSS on disk to read, this list is the only source of the names. The *values*
are a query, not a constant: run **`agent-ks theme tokens --json`** (the
`agent-ks` CLI ships with the sibling `agent-ks-docs` skill — see its
`references/cli-toolkit.md`) for the live variable→value map (light + dark) of the
active theme — feed it the surfaces to validate a chart palette against. The names:

- **Backgrounds** `--color-bg-primary` / `-secondary` / `-tertiary`
- **Text** `--color-text-primary` / `-secondary` / `-muted`
- **Borders** `--color-border-default` / `-light`
- **Brand** `--color-brand-primary` / `-secondary`
- **Status** `--color-success` / `-warning` / `-error` / `-info`
- **Type — semantic UI** `--ui-text-micro` / `-body` / `-title`; **content**
  `--content-body` / `-h1`…`-h6` / `-code`. Consume these, not the primitive
  `--font-size-*` scale. **Display** `--display-sm` / `-md` / `-lg` (marketing
  surfaces only) are default-theme extras, not part of the required contract.
- **Font family / rhythm** `--font-family-base` / `-mono`; `--line-height-base`
- **Spacing** `--spacing-xs` / `-sm` / `-md` / `-lg` / `-xl`
- **Radius** `--border-radius-sm` / `-md` / `-lg` (`--border-radius-full` for pills
  is a default-theme extra, not part of the required contract)
- **Shadow / motion** `--shadow-sm` / `-md` / `-lg`; `--transition-fast` / `-normal`

> **Coupling:** this list mirrors `theme.yaml → required_variables`. If those change
> (add / rename / remove), this section must change in the same edit — repo source
> **and** installed cache. (Recorded in the repo CLAUDE.md theming section.)

**Self-mode naming preference.** A `self`-mode artifact owns its *values* but
should reuse this contract's *names* for every role the contract already covers
(`--color-bg-primary`, `--color-text-primary`, `--color-border-default`, …)
rather than inventing parallel ones (`--bg`, `--ink`). Extra names are allowed
**only when the role genuinely goes beyond the contract's scope** — no existing
token covers it (`--color-accent-soft`, `--color-pro`, `--color-con`); check
the list above first, and never mint a new name for a role a contract token
already expresses. Nothing is injected in `self` mode, so there is no
collision — and shared names keep every artifact's CSS and sidecar legible to
the next agent at zero cost.

**Validate every token you name** against the contract (or the CLI verb). A name that
isn't in it — e.g. `var(--color-accent, #7aa2f7)` — never resolves, freezes its
fallback, and silently kills dark/light: the design-sync validate-names rule applied
to your own work.

## §2 · The non-negotiables — theme by mode, self-contained

Two rules an artifact must never miss. Full mechanism (who injects, who stamps the
theme, the CDN policy, font delivery) is in `references/publishing.md`; the rules:

- **Theme correctly for your mode; dark is *selected*, not inverted.**
  - **`site` mode:** consume the injected tokens and **define no ambient palette**.
    Carry only a *minimal neutral fallback layer* for the out-of-engine case — write
    each consumed token as `var(--color-bg-primary, #fff)` so a raw `file://` open (no
    injection) still renders neutrally. This does **not** violate the layouts
    no-fallback rule: that rule protects *layouts*, where a var must always resolve;
    here the route's injected CSS overrides the fallback in situ and the fallback
    only serves the no-host case. Don't redefine `--color-*` yourself — let the
    injected CSS win. One exception: **local elemental colors** for diagram/chart
    *content* (series hues, strokes, node fills) the contract doesn't carry may be
    defined in the HTML — backgrounds/text/borders stay injected, and the elemental
    values must hold on both surfaces (`publishing.md` → "Local elemental colors").
  - **`self` mode:** design **both** themes and give the second the same care as the
    first. Define the palette on `:root`, redefine the tokens under
    `@media (prefers-color-scheme: dark)`, and again under `:root[data-theme="dark"]`
    / `:root[data-theme="light"]` so the site toggle wins in both directions. Style
    components *through* the tokens, never inside the media query.
  - Both modes: the framework never applies an `invert()` filter. The route stamps
    `data-theme` — full-page reads `localStorage` then `prefers-color-scheme` exactly
    like the docs chrome; the embed mirrors the parent site's attribute on load and
    on every toggle — so a correctly-themed artifact flips with no reload. A
    single-theme artifact is legal **only** as a deliberate `self` commitment.
- **Self-contained: everything inline or repo-relative; no external scripts, ever.**
  All CSS and JS inline; images as repo assets (served at `/assets/`) or data URIs;
  fonts as `.woff2` under repo assets, referenced relatively. **Never** load a
  script, stylesheet, or font from an external CDN — an artifact runs unsandboxed as
  first-party content on the site's own origin (an external script is an
  XSS/supply-chain surface *inside your docs*), and docs get deployed to intranets,
  offline mirrors, and long-lived archives where a dead CDN silently takes the
  artifact down. CDN fonts are a documented, discouraged opt-out only. Anything wider
  than the column — a table, a code block, a diagram — scrolls inside its own
  `overflow-x: auto` wrapper; the page body itself never scrolls sideways.

## §3 · Verify before publishing — the gate

Not optional reading; run this before you call an artifact done. Full rubric in
`references/design-systems.md`; the checklist:

1. **Run the site.** `./start dev`, open the artifact **full-page** at
   `/artifacts/<path>` **and** an embedding docs page. Check **both themes** (toggle
   the site) and **both viewports** (the embed column ~700–900px, and full page). For
   a `site` artifact, confirm it *re-themes* with the toggle in **both** surfaces (the
   injection reaches embed and full-page). Playwright MCP tools are available for
   scripted screenshots if wanted.
2. **Styled.** Every theme token visibly resolves. In `site` mode the failure to
   catch is a token *not* resolving to the injected value (a frozen neutral fallback,
   dead dark mode) — inspect the computed value, don't trust the vibe. In `self` mode
   both palettes must be present and dark must be *designed*, not inverted. Check the
   *computed* font too: a silently fallen-back webfont looks "fine" at a glance.
3. **Complete.** Nothing collapsed or overflowing; no horizontal body scroll; focus
   states visible; `prefers-reduced-motion` honored; charts pass their dataviz
   checks.
4. **Plausible.** Real content throughout — never `foo` / `test` / lorem. Curate
   real values before inventing; a design system shows a canonical example plus a
   variant sweep and its static states.
5. **Operable.** For anything interactive — above all a variation set — exercise
   every option's interactions in the rendered page: tap, drag, toggle each one.
   A static mock passes Styled / Complete / Plausible and still fails the
   pattern; interactivity is verified by *doing*, not by reading the JS.
6. **Sidecar honesty.** Every hex, token, or consumed variable the `.meta.json`
   `artifact:` block *declares* actually appears in the HTML, and the declared
   `theme` (`site` / `self`) matches how the artifact is really built. A declared
   value that lies is worse than none — the whole point is that an agent trusts it
   without reading the HTML. This holds after every later edit too: updating the
   artifact means updating the sidecar in the same change.

## Provenance

This skill converges four upstream design skills, rewritten and adapted to this
framework's publish mechanism (never pasted — they are Anthropic-authored and this
repo is public). The bundled `scripts/validate_palette.js` is the one deliberate
verbatim exception (it is a tool, carried with a provenance header). The source map
and the upstream-fold-in protocol live in
[`references/PROVENANCE.md`](references/PROVENANCE.md).
