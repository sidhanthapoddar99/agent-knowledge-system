# Publishing artifacts in this framework

This is the adaptation layer — how an artifact is *published, themed, and delivered*
in a documentation-template project. The loader/route/sidebar mechanics themselves
belong to the framework (the artifact component and the `/artifacts` route); this
file teaches the **authoring** side of that same model. Everywhere a habit from
claude.ai artifact design would apply, the framework's mechanism replaces it.

## Where an artifact lives

An artifact is an `.html` file in one of two homes:

- **A docs section** — an `NN_`-prefixed `.html` beside the markdown pages
  (`data/<section>/NN_name.html`). It is a *first-class page*, so it takes a numeric
  prefix like any page and appears in the sidebar in prefix order. This is unlike an
  embed-only asset in an `assets/` folder, which stays unprefixed and is never
  scanned into the sidebar — put working or embed-only `.html` there.
- **A tracker folder** — an `.html` inside an issue's `brainstorm/`, `notes/`, or a
  subtask context. A thinking-artifact that lives beside the deliberation that
  produced it, versioned with the issue.

**Prefix policy.** A docs-section artifact needs the `NN_` prefix to sort in the
sidebar; a *missing* prefix is a **warning, not a hard error** (stray `.html`
exports are common working files — the loader downgrades rather than failing the
build, unlike a prefix-less markdown page which is a hard error). Files under
`assets/` are ignored by the scan entirely. When the filename alone reads well, the
title derives from the prefix-stripped, title-cased name and no sidecar is needed.

**Update = edit the file + rebuild.** There is no version picker, no
redeploy-same-URL ceremony. You edit the `.html`, rebuild, and the change ships;
history lives in git, not in the artifact.

## A complete document, not a fragment

This is the highest-value correction to carry from any claude.ai artifact habit. A
claude.ai artifact is a `<body>` fragment the host wraps in a skeleton. **An
artifact here is the opposite: you author the complete document** —
`<!doctype html>`, `<html>`, `<head>` (with `<meta charset>`, viewport, `<title>`,
your `<style>`), and `<body>`. Nothing is injected around it. Write the whole file.

## The `/artifacts/<path>` route and the embed

The dedicated URL is the primitive, and the embed is built on top of it:

- **Full-page route.** Every artifact is served full-viewport at
  `/artifacts/<path-to-the-file>` — a real, bookmarkable, shareable URL. Link it,
  paste it into an issue, send it to a teammate; it survives outside any page that
  embeds it.
- **Embed.** In a docs section the artifact renders in an iframe whose `src` is that
  same route (with a `?v=<mtime>` cache-buster so a rebuild isn't frozen behind a
  long cache). The iframe fills the content column; the navigational sidebar stays,
  and the outline/TOC rail auto-hides (an artifact has no headings, so there is
  nothing to list — it hands that width to the artifact).
- **Affordances.** The embed's primary control is an **open-full-page** link to the
  route (a plain `<a href>` — trivial and complete). A lightweight in-place expand
  may exist as a secondary, optional affordance; the open-full-page link is the one
  that always ships.

**Design for the embed width first.** The primary viewport is a doc content column,
roughly **700–900px wide**, not a full browser window. Compose for that, and let it
scale up to the full-page view. Always test **both** sizes. Wide content
(`overflow-x: auto` on its own container) must never make the page body scroll
sideways.

**Embed height.** The default is a viewport-relative fill — the embed fills the
content area, matching the "replaces the central content area" experience. A short
report can override this via the sidecar's **top-level** `embed_height` field
(`"full"` default, an explicit pixel value, or an aspect ratio). The full-page
route always renders true full-viewport regardless.

## Consuming the host theme — the two modes

The sidecar's `artifact.theme` selects the mode, and the `/artifacts` route acts on
it. It never applies a blanket `invert()` filter (that would wreck images and brand
color).

- **`site` — the route injects the host theme.** When the sidecar declares
  `theme: "site"`, the route rewrites the served HTML to include the site's *resolved*
  theme CSS (the theme loader's merged output — the same stylesheet the docs chrome
  gets) at the top of `<head>`, for **both** the embed and the full-page view. So the
  `--color-*`, `--ui-text-*`, `--content-*`, `--spacing-*` … variables **do resolve
  inside the artifact** — reference them directly
  (`background: var(--color-bg-primary)`); no verification dance, no local palette. The
  route also stamps `data-theme` (full-page reads `localStorage` then
  `prefers-color-scheme`, exactly like the chrome; the embed mirrors the parent site's
  attribute on load and on every toggle), so light/dark flips with no reload. Query the
  live values with **`docs-guide theme tokens --json`** (variable→value for light and
  dark) when you need them — e.g. to validate a chart palette against the real surfaces.
- **`self` — served untouched.** Nothing is injected; you own the whole theme system
  inside the HTML. Design **both** light and dark (the pattern below), deriving values
  from the theme contract where you want kinship but committing to your own world where
  that is the point.

**The neutral fallback layer (site mode).** A `site`-mode artifact defines *no* palette
— but a reader may open the raw file outside the engine (`file://`, emailed), where no
CSS is injected. Guard that one case by writing each consumed token with a **minimal
neutral fallback**: `var(--color-bg-primary, #fff)`, `var(--color-text-primary, #111)`.
Inside the engine the injected value always wins; the fallback only renders with no
host. This is **not** the layouts no-fallback violation — that rule protects layouts,
where the var must always resolve; here injection overrides the fallback in situ.

**Local elemental colors (site mode) — the one exception to "no palette".** An
explanatory diagram or chart in `site` mode often needs colors the contract does
not carry: series hues, arrow strokes, node fills, connector lines. Those are the
diagram's *content*, not its chrome — define them directly in the HTML (local
custom properties or inline values). Everything **ambient stays injected**:
backgrounds, text, borders, and spacing keep consuming the tokens, so the
artifact still re-themes with the site. Two duties come with the exception: pick
elemental colors that hold on **both** injected surfaces (query the real values
with `docs-guide theme tokens --json`; a chart palette additionally passes the
dataviz validator against both surfaces), and declare them in the sidecar like
any other value.

**The self-mode dual-theme pattern.** Define tokens on `:root`, redefine under the
media query, and again under the attribute so the site toggle wins both ways.
Prefer the host contract's token *names* with your own values (SKILL §1's naming
preference — invented short names like `--bg` / `--ink` still work, but cost the
next agent legibility); add a name of your own **only when the role goes beyond
the contract's scope** and no existing token expresses it:

```html
<style>
  :root { /* light — own values, the contract's names */
    --color-bg-primary: #fafafa; --color-bg-secondary: #f5f5f5;
    --color-text-primary: #1a1a1a; --color-text-muted: #737373;
    --color-brand-primary: #2563eb; --color-success: #16a34a;
    --color-accent-soft: #dbeafe; /* beyond the contract's scope — only then add */ }
  @media (prefers-color-scheme: dark) {
    :root { --color-bg-primary: #0a0a0a; --color-bg-secondary: #171717;
      --color-text-primary: #fafafa; --color-text-muted: #737373;
      --color-brand-primary: #3b82f6; --color-success: #22c55e;
      --color-accent-soft: #1e3a5f; }
  }
  /* the site toggle wins in both directions */
  :root[data-theme="light"] { --color-bg-primary: #fafafa; --color-bg-secondary: #f5f5f5;
    --color-text-primary: #1a1a1a; --color-text-muted: #737373;
    --color-brand-primary: #2563eb; --color-success: #16a34a;
    --color-accent-soft: #dbeafe; }
  :root[data-theme="dark"]  { --color-bg-primary: #0a0a0a; --color-bg-secondary: #171717;
    --color-text-primary: #fafafa; --color-text-muted: #737373;
    --color-brand-primary: #3b82f6; --color-success: #22c55e;
    --color-accent-soft: #1e3a5f; }
  body { background: var(--color-bg-primary); color: var(--color-text-primary); }
  /* style everything through the tokens — never inside the media query directly */
</style>
```

**Validate every token you name.** The full contract is
`astro-doc-code/src/styles/theme.yaml → required_variables`, realised in `color.css`
and `font.css` (and enumerated inline in the skill's §1). A name that isn't in the
contract (e.g. `var(--color-accent, #7aa2f7)`) never resolves, freezes its fallback,
and silently kills dark/light. Never invent a variable name with an inline hex
fallback — the *only* sanctioned fallback is the neutral out-of-engine layer above.
The full token vocabulary is enumerated **once**, in the skill's §1 ("The inline
variable contract" in `SKILL.md`) — consult that canonical list rather than a
second copy here.

## Self-containment and the CDN stance

There is no platform CSP forcing self-containment here — an iframe served from the
docs site *can* technically reach a CDN. So self-containment is a **policy**, and
the policy is: **self-contained, with a repo-relative relaxation.**

- All CSS and JS **inline**.
- Images: repo assets (the framework already serves `/assets/`) or data URIs.
- Fonts: `.woff2` under repo assets, referenced relatively (see below).
- **No external scripts, ever.** An artifact runs *unsandboxed as first-party
  content* on the site's own origin (authored in the repo, reviewed in git, trusted
  like any page). An external script is an XSS / supply-chain surface inside your own
  docs origin; a dead external font or script silently takes an old artifact down on
  an offline mirror or intranet deploy. This is the ergonomic win over claude.ai's
  data-URI-everything requirement: the repo *is* the bundle, so repo-relative
  references are fine — but the network boundary is hard.

A team that consciously wants CDN fonts documents that as a discouraged opt-out; if
enforcement is ever needed, the path is a real CSP header on the `/artifacts` route
— noted as an option, not a requirement. **Trust note:** because an artifact runs
with site-origin privileges, never paste untrusted third-party HTML into a section.

## Fonts

Ship the face as `.woff2` under the repo assets and `@font-face` it with a relative
`url()`; do not link a webfont CDN. The failure mode to guard against: a missing or
CDN-blocked font falls back *silently* — the page still renders, so it looks fine at
a glance. Catch it by checking the **computed** font in devtools, not by eye (this is
the design-sync `[FONT_MISSING]` lesson). If a `.woff2` isn't available, prefer a
well-chosen system stack over a CDN link.

## The metadata sidecar contract

An artifact takes an optional same-name JSON sidecar — `<NN_name>.meta.json` (or
`.meta.jsonc`) — never frontmatter injected into the `.html` (that would corrupt a
standalone document). It mirrors the first-class *diagram* sidecar and adds an
AI-legibility block. Two layers:

**1. Rendering fields (typed, consumed by the loader):**

| Field | Role |
|---|---|
| `title` | Page + sidebar title (falls back to the prefix-stripped filename) |
| `description` | Meta description / listing subtitle |
| `sidebar_label` | Short sidebar label if the title is long |
| `sidebar_position` | Manual ordering override |
| `draft` | Exclude from the built sidebar |
| `embed_height` | Embed sizing: `"full"` (default) \| a pixel value \| an aspect ratio |

**2. The `artifact:` block (declared values — so an agent need not parse the HTML).**
The loader treats this block as opaque passthrough — with one exception: the
framework reads `artifact.theme` from inside it to select the theme mode.
Everything else passes through untouched; **this skill owns its conventions.**
The standard reserved keys — always write these, always read these:

| Key | Meaning |
|---|---|
| `purpose` | One sentence: what the artifact is for and who reads it |
| `type` | `report` \| `dashboard` \| `dataviz` \| `design-system` \| `showcase` \| `variation-set` |
| `theme` | `site` (route injects the host theme) \| `self` (served untouched — default; any unrecognized value reads as `self`) |
| `palette` | The hex actually used, `{ light: {…}, dark: {…} }` — the exact list you'd feed the palette validator |
| `data` | For dashboards/charts: the key figures, or the source the artifact visualizes, in structured form |
| `interactions` | Notable interactive behaviors (optional list) |
| `sources` | Where the declared values came from (issue docs, files, URLs) |

The block is **open for additional declared values** — a report may add `sections`,
`decisions`, `key_facts`; a specimen may add `typography`. Keep the standard keys
present and add extras freely.

**Variation-set keys** (when `type: "variation-set"` — the options-explorer
pattern in `design-systems.md`): `options` — the option names, in display order
(required); `recommendation` — the recommended option, when one is marked;
`decision` — the settled pick once the team decides (add it when the decision
lands, and mirror the decision itself into the issue's notes / comments).

**Optional but strongly encouraged** for ordinary artifacts; **mandatory for
design-system artifacts** (see `design-systems.md`), where "an agent reads the
declaration, not the HTML" is the entire point. **Validate-names rule:** every hex
in `palette` and every value you declare must actually appear in the artifact — a
declaration that lies is worse than none, and the verify gate checks it.

**The sidecar is design memory — read before, update after.** The declared block
exists so the *next* agent can extend an artifact, or build a companion meant to
match it, from ~40 lines of JSON instead of parsing the HTML: whenever you touch
an existing artifact, read its sidecar first, and reuse its declared palette /
typography for anything in the same family. The duty that keeps this working:
**every edit to the `.html` updates the sidecar in the same change.** On this
platform agents perform the edits — no human pass will catch a stale
declaration — so a drifted sidecar stays wrong until it actively misleads
someone. The verify gate (SKILL §3) treats a lying sidecar as worse than none.

A canonical sidecar, in full:

```jsonc
// 20_coverage-dashboard.meta.jsonc — sibling of 20_coverage-dashboard.html
{
  "title": "Coverage Dashboard",
  "description": "Test-coverage trends per package, updated each release",
  "sidebar_label": "Coverage",
  "embed_height": "full",            // top-level: "full" | "640px" | "16/9"
  "artifact": {
    "purpose": "Give maintainers a one-screen read of coverage per package.",
    "type": "dashboard",
    "theme": "site",                 // "site" | "self" (default; unrecognized → self)
    "data": { "packages": 12, "overall": "84%", "source": "coverage/summary.json" },
    "interactions": ["hover tooltips on bars", "per-package drill-down"],
    "sources": ["coverage/summary.json"]
  }
}
```

Two live examples ship in the framework's own docs (paired with real artifacts):
`default-docs/data/user-guide/15_writing-content/10_design-system-demo.meta.json`
(`self` mode, declared palette) and `11_site-theme-demo.meta.json` (`site` mode,
declared consumed tokens).

## The reserved `/artifacts` base URL

Because `/artifacts` is claimed by the full-page route, **no docs section may use
`artifacts` as its `base_url`.** This is rejected at config load time with a hard,
actionable error — it stops dev, build, and preview alike. The guard covers the full
reserved set: **`artifacts`, `assets`, `content-assets`, `api`, `editor`.** If you
are creating or renaming a section (e.g. a published design system), pick a base URL
outside that set.
