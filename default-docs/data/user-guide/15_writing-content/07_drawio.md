---
title: draw.io Diagrams
description: Author .drawio files in draw.io or VS Code and embed them, or let them be pages — plus what dark mode does differently here.
sidebar_position: 7
---

# draw.io Diagrams

`.drawio` files are first-class alongside Mermaid, Graphviz and Excalidraw.
Draw the diagram in [app.diagrams.net](https://app.diagrams.net), the desktop
app, or the VS Code extension; save the `.drawio` next to the page that uses
it; reference it. Nothing is converted, exported or checked in twice — the
file you edit is the file the site renders.

See it live on the [Diagram Showcase](./20_examples/01_diagram-showcase.md),
and as a standalone page at
[draw.io as a Full Page](./20_examples/08_drawio-full-page.drawio).

## Embedding one in a page

Image syntax embeds it; link syntax leaves it a link. Same rule as every
other by-reference diagram:

```markdown
![Service architecture](./assets/architecture.drawio)
```

The rendered diagram gets a caption with an *open file ↗* link to the raw
file, so a reader can pull it into draw.io and keep editing.

A plain link is deliberately **not** an embed:

```markdown
[the architecture file](./assets/architecture.drawio)
```

## Making one a page

Give it an `XX_` prefix outside an `assets/` folder and it becomes a page in
the sidebar, with a URL, exactly like a markdown file:

```
20_architecture/
├── 10_overview.md          → /docs/architecture/overview
└── 20_topology.drawio      → /docs/architecture/topology
```

Title, description and sidebar label come from the filename, or from a
sidecar `20_topology.meta.json`. The full rules are in
[Diagram Pages](./06_diagram-pages.md) — they are the same for every diagram
format.

## Multi-page files

A `.drawio` file can hold several pages. When it does, the rendered diagram
gets a page selector so a reader can move between them; a single-page file
gets no extra chrome.

## Dark mode works differently here — on purpose

Mermaid, Graphviz and Excalidraw are **colour-inverted** in dark mode: the
whole rendered image is flipped, which is a good trade for line diagrams
where every colour is a stroke or a fill.

draw.io is **not** inverted. Its viewer resolves a genuine dark palette
instead — dark canvas, light default strokes. Two reasons:

- draw.io diagrams routinely carry **raster icons, logos and screenshots**.
  A filter hits those too, turning them into photographic negatives. The
  palette approach never touches them.
- The dark version is **really in the SVG**, not a light image with a filter
  over it. So what you download, copy as an image, or print is the dark
  diagram, and the caption and toolbar need no counter-filter to stay
  readable.

Colours you set are re-resolved for a dark canvas rather than left untouched
— the showcase's light green becomes a darker green, still recognisably
green. The practical consequence when authoring: **pick colours whose meaning
survives on both canvases**. The default (uncoloured) shapes take care of
themselves.

The theme travels with the diagram: open it full-screen or download the SVG
and you get the theme you were reading in, not a light copy.

## What you can export

Click a diagram to open the full-screen viewer; the ▾ menu offers
**Download SVG**, **copy source** and **download source**.

**PNG export is not offered for draw.io.** Its labels are rendered as
embedded HTML, which the browser refuses to rasterize — so rather than show a
button that always fails, the PNG entries are left out. Download the SVG
instead; it is vector, it carries the current theme, and any image editor
will convert it.

## Writing for offline

The viewer is bundled with the site — no request leaves the reader's browser
to render a diagram. One gap comes with that: draw.io's **extended shape
libraries** (the AWS, Azure, GCP, Cisco and Kubernetes icon sets) are ~21 MB
of separate assets and are *not* bundled. A diagram that uses one renders the
fallback shape — correct geometry and labels, generic box instead of the
icon.

Two ways out, in order of preference:

1. **Use the built-in shapes** — the default palette, flowchart, UML, ER,
   containers and arrows are all compiled in and render exactly.
2. **Install the stencils** — drop draw.io's `stencils/` tree into
   `assets/drawio/stencils/` in your project. The viewer already looks there.

## Keeping the file readable on disk

draw.io can save a `.drawio` either as plain XML or as a compressed blob.
Both render. Prefer **uncompressed** (*File → Properties → Compressed: off*,
or untick "Compressed" in the VS Code extension): the file then diffs, greps
and reviews like the rest of your content, which is the whole point of
keeping documentation in files.
