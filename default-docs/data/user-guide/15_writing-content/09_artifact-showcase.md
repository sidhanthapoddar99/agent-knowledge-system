---
title: Artifact Showcase
description: Two live demo artifacts — a self-themed design system and a site-themed dashboard — showing the two theme modes side by side.
sidebar_position: 9
---

# Artifact Showcase

Two real artifacts live in this section, one for each **theme mode**. Open them from
the sidebar and you are looking at the artifact type running in production docs. See
[Artifact Pages](./artifact-pages) for the authoring rules and [Diagram
Showcase](./diagram-showcase) for the diagram equivalent.

## Two modes, side by side

- **[Design System Demo](./design-system-demo) — `theme: "self"`.** A miniature design
  system that owns its palette. It carries its own light and dark theme inside the
  HTML; the framework serves it untouched. Its *subject is a look*, so it must own it.
- **[Site-Theme Demo](./site-theme-demo) — `theme: "site"`.** A content-coverage
  dashboard that inherits the host theme. It defines no colors — the framework injects
  the site's theme CSS — so it re-colors with the docs the instant you switch themes.

## What to look for

- **Both fill the content area.** The frame takes the full content column; the outline
  rail is gone (an artifact has no headings to list). The navigational sidebar stays.
- **Toggle light/dark in the navbar.** *Both* flip with the site — but for different
  reasons. The self demo swaps between two palettes it designed; the site demo simply
  inherits the chrome's tokens. The framework never inverts an artifact.
- **Open full page ↗.** Hover a frame and open it at its own URL under `/artifacts/…`
  — full viewport, bookmarkable, shareable. (The route serves the file at its real
  content-relative path, so the `NN_` prefixes and `.html` stay in the URL, unlike the
  clean docs slug.) The self demo falls back to your OS `prefers-color-scheme` with no
  host; the site demo has the theme injected at the route, so it stays themed
  full-page too.
- **Expand.** The secondary control grows the frame to fill the viewport in place;
  `Escape` closes it.

## The sidecar that describes it

Each demo carries a `.meta.json` sidecar. The rendering fields set its title and
sidebar label; the `artifact:` block declares — in plain, machine-readable terms —
what it is, which theme mode it uses, and what it shows, so an agent needn't parse the
HTML. The self demo's:

```jsonc
[[./10_design-system-demo.meta.json]]
```

For the field-by-field contract, see [Artifact Pages](./artifact-pages#the-metadata-sidecar).
