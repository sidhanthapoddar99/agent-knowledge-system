---
title: Artifact Pages
description: Drop a self-contained .html file into a docs section and it becomes a first-class page — embedded in the content area, openable full-page at its own /artifacts/ URL.
sidebar_position: 8
---

# Artifact Pages

An **artifact** is a self-contained HTML page — a report, a dashboard, an
interactive chart, a design-system showcase — that you author (or generate)
as a single `.html` file. Drop an `NN_`-prefixed artifact into a docs section
and it becomes a **first-class page**, exactly like a diagram file: it appears
in the sidebar, gets a URL, and routes like a markdown page. The whole document
is the content — no markdown wrapper needed.

See one live on the [Artifact Showcase](./examples/artifact-showcase) page.

## Drop in a file

Give the file an `NN_` position prefix and place it anywhere in a docs section
(not under `assets/`):

```
15_writing-content/
├── 08_artifact-pages.md              → this page
└── 20_examples/
    ├── 02_artifact-showcase.md       → /user-guide/writing-content/examples/artifact-showcase
    └── 03_design-system-demo.html    → /user-guide/writing-content/examples/design-system-demo
```

The slug strips the prefix and the `.html` extension, same as markdown. That is
all it takes — the file is now in the sidebar, where it carries a small
trailing **type glyph** (hover names it) marking it as an artifact — markdown
is the default and stays unmarked.

## What happens when you open it

Selecting the artifact in the sidebar renders it **embedded in the content
area** — the page body becomes the artifact, shown in a frame that fills the
column. The navigational **sidebar stays** so you can move around; the outline
(right-hand "on this page" rail) has nothing to list — an artifact has no
markdown headings — so it collapses and hands its width to the artifact.

Hovering the embed reveals two controls:

- **Open full page ↗** (primary) — opens the artifact at its own reserved URL,
  `/artifacts/<path>`, in a new tab. There the artifact *is* the page: full
  viewport, its own `<head>`, bookmarkable and shareable. This URL is the real
  primitive — the embed is just that same page shown inside the docs frame — so
  you can link it from another page, paste it into an issue, or send it to a
  teammate. (`<path>` is the file's location relative to its content root, so the
  `NN_` prefixes and `.html` are kept — e.g.
  `/artifacts/user-guide/15_writing-content/20_examples/03_design-system-demo.html` — not the
  clean docs slug.)
- **Expand** (secondary) — grows the embed to fill the viewport in place,
  without navigating, so you keep your scroll position in the docs page. Press
  `Escape` or **Close** to collapse it.

## Titles — the name usually suffices

With no metadata, the page title derives from the filename:
`03_design-system-demo.html` → **Design System Demo**. Name the file well and
you are done.

## The metadata sidecar

When the filename is not enough — or when you want an artifact to be legible to
an AI agent without it parsing the markup — add a **same-name sidecar** next to
the file: `NN_name.meta.json` (or `.meta.jsonc` for comments and trailing
commas). It is the frontmatter equivalent for a non-markdown page. Nothing is
injected into the `.html` file itself, so the artifact stays a pristine,
independently-openable document.

> [!NOTE]
> The `.meta.` infix matters: a bare `03_design-system-demo.json` would collide
> with a data file the artifact itself might fetch. Always use the `.meta.json`
> / `.meta.jsonc` form.

### Rendering fields

These control how the page appears — all optional:

```jsonc
// 03_design-system-demo.meta.json — sibling of 03_design-system-demo.html
{
  "title": "Design System Demo",
  "description": "A miniature design system — tokens, type scale, components.",
  "sidebar_label": "Design System",
  "sidebar_position": 10,
  "draft": false,
  "embed_height": "full"
}
```

`embed_height` sizes the embed (the full-page route is always true
full-viewport regardless):

| Value | Effect |
|---|---|
| `"full"` *(default, or omit)* | Fill the content column (viewport height minus the navbar). |
| a number or CSS length — `640`, `"640px"`, `"80vh"` | Fixed height. Good for a short one-number report. |
| an aspect ratio — `"16/9"` | Width-driven height via `aspect-ratio`. Good for a known-shape poster. |

### The `artifact:` declared-values block

Beyond rendering, the sidecar carries an **`artifact:` block** — an explicit,
machine-readable description of what the artifact *is* and *shows*, so an agent
(or a reviewer skimming the tracker) can understand it without reading a
several-hundred-line HTML file. The framework treats this block as opaque
passthrough — with one exception: it reads `artifact.theme` from inside it to
select the theme mode. Everything else is stored untouched, never parsed. Its
keys are an authoring convention:

```jsonc
{
  "title": "Design System Demo",
  "artifact": {
    "purpose": "Show the framework's artifact type honoring the host theme, with a compact design-system layout.",
    "type": "design-system",
    "theme": "self",
    "palette": {
      "light": { "bg": "#f6f7f9", "ink": "#1a2230", "accent": "#2f6f6a" },
      "dark":  { "bg": "#10151b", "ink": "#e7edf3", "accent": "#5bb6ad" }
    },
    "data": "Tokens, type scale, and three components — no external data.",
    "interactions": "Honors data-theme propagated by the host; falls back to prefers-color-scheme full-page.",
    "sources": ["default-docs/data/user-guide/15_writing-content/08_artifact-pages.md"]
  }
}
```

Common keys are `purpose`, `type`, `theme`, `palette`, `data`, `interactions`,
and `sources` — write the ones that apply and add your own. For
the full authoring conventions (and how to build an artifact that reads as
designed rather than generic), see the **`agent-ks-artifacts` skill**, which
owns this contract.

## Write it self-contained

An artifact must be a **single, self-contained file**: inline your CSS and JS,
and embed images as `data:` URIs. It is served from the site's own origin and,
so it should be, runs **unsandboxed as first-party content** — same trust as any
layout or page in your repo. That is what lets it match your theme and fetch a
colocated data file. The flip side is a rule: **never paste untrusted
third-party HTML into a section as an artifact** — it would run with your site's
privileges.

## Theme: inherit the site, or own your look

An artifact picks one of two theme modes with the `artifact.theme` sidecar field:

- **`"site"` — inherit the site theme.** The framework injects the site's live
  theme CSS into your artifact — in **both** the embed and the full-page view — and
  keeps its light/dark state in sync. Your artifact just **consumes the theme's
  variables** (`var(--color-bg-primary)`, `--color-text-primary`, `--ui-text-body`,
  `--spacing-md`, …) and defines no colors of its own, so it always matches the
  surrounding docs and re-themes for free when you change the site theme. Use this
  for **data**: charts, dashboards, metrics reports, explainers.
- **`"self"` — own your theme (the default).** The file is served exactly as
  written; nothing is injected. Your artifact carries its **own** complete light+dark
  theme in its HTML. Use this when the artifact's *subject is a look* — a
  design-system demo, a brand exploration, a poster — or any UI you're designing: its
  theme is the thing under discussion, so it stays self-contained and portable, even
  if it happens to resemble the current site theme.

Set it in the `artifact:` block — `"theme": "site"` or `"theme": "self"`. Omit it —
or write any unrecognized value — and you get `self`.

**Site mode** — consume the tokens, with a plain neutral fallback so the file still
reads if someone opens it outside the site (where nothing is injected):

```css
body {
  background: var(--color-bg-primary, #fff);
  color: var(--color-text-primary, #111);
}
.card { background: var(--color-bg-secondary, #f5f5f5); }
```

Live values for every token, in light and dark, come from `agent-ks theme tokens
--json` — handy when a chart palette has to sit on the real surfaces.

**Self mode** — the site's light/dark state is a `data-theme` attribute; style for
`prefers-color-scheme`, then let an explicit `data-theme` win in *both* directions:

```css
:root { /* light tokens */ }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* dark tokens */ }
}

:root[data-theme="dark"]  { /* dark tokens */ }
:root[data-theme="light"] { /* light tokens */ }
```

The framework **never** applies the diagram dark-mode invert filter to an artifact —
inverting arbitrary HTML would wreck its images and brand colors — so honoring the
theme is the artifact's own job. For the full authoring doctrine — including why any
UI/UX design is always `self` — see the **`agent-ks-artifacts` skill**. Both modes
run live on the [Artifact Showcase](./examples/artifact-showcase): a `self` design system and a
`site` dashboard.

## In the issue tracker

Artifacts are not only for docs sections. Drop a `.html` file into an issue's
`notes/` or `brainstorm/` folder and it renders the **same first-class embed** in
the issue detail view — an iframe with the **Open full page ↗** link and
**Expand**, the site theme propagated in — sitting in the sub-document navigation
right beside the markdown notes that discuss it, with a small **type marker** so
it stands apart. The same-name `.meta.json` / `.meta.jsonc` sidecar sets its
title, exactly as above.

The tracker's own conventions apply: **no `NN_` prefix is required** (numbering is
optional for tracker sub-docs), and it is **`notes/` and `brainstorm/` only** — an
issue's `assets/` folder stays embed-only, never a page. That is deliberate: the
tracker is where design thinking lives, so a design-system draft or a dashboard
can sit *in place*, next to the reasoning about it.

## Reserved URL

Because full-page artifacts are served at `/artifacts/<path>`, **`artifacts` is
a reserved base URL** — no docs section may claim it (nor `assets`,
`content-assets`, `api`, or `editor`). Doing so is a hard config-load error. See
[Reserved base URLs](../configuration/site/page#reserved-base-urls).

## Opting a section out

To keep a section markdown-only, disable artifact pages in its section-root
`settings.json`:

```json
{
  "allow_artifact_pages": false
}
```

Enabled by default everywhere else.

## Artifact or asset?

- **Artifact page** — the HTML document *is* the content: give it an `NN_`
  prefix and it slots into the sidebar with its own `/artifacts/` URL.
- **Asset** — an `.html` file that is only a working file or a fetch target for
  another artifact lives under `assets/` (never scanned, never a page). A
  prefix-less `.html` outside `assets/` is skipped with a warning, on the
  assumption it is a stray export.
