---
title: Diagram Showcase
description: All three diagram types rendering live on one page — Mermaid, Graphviz, and Excalidraw.
sidebar_position: 7
---

# Diagram Showcase

Every diagram type the framework renders, live on one page. The source for
each example is shown right below it. See
[Markdown Basics](../markdown-basics) for fence syntax,
[Asset Embedding](../asset-embedding) for by-reference embeds, and
[Diagram Pages](../diagram-pages) for diagrams as standalone pages.

## Mermaid

```mermaid
flowchart LR
  author[markdown fence] --> build[diagram container]
  build --> browser[lazy mermaid.js render]
  browser --> svg[SVG on the page]
```

Source:

~~~markdown
```mermaid
flowchart LR
  author[markdown fence] --> build[diagram container]
  ...
```
~~~

## Graphviz

```dot
digraph G {
  rankdir=LR;
  node [shape=box];
  "dot fence" -> "graphviz WASM" -> "SVG on the page";
}
```

Source:

~~~markdown
```dot
digraph G {
  rankdir=LR;
  "dot fence" -> "graphviz WASM" -> "SVG on the page";
}
```
~~~

## Excalidraw

![Diagram showcase scene](../assets/diagram-showcase.excalidraw)

Source — image syntax embeds the scene read-only (click to open the viewer;
the caption links to the raw file):

```markdown
![Diagram showcase scene](../assets/diagram-showcase.excalidraw)
```

A plain link deliberately stays a link instead of embedding:
[the same scene as a link](../assets/diagram-showcase.excalidraw).

## Keeping diagram source in its own file

Mermaid and Graphviz source can live in `assets/` too — embed it by
reference inside the fence, and the file stays the single source of truth:

~~~markdown
```mermaid
[[./assets/flow.mmd]]
```
~~~

## Interacting with diagrams

Every rendered diagram (and every image) on this page is interactive:

- **Click** a diagram or image to open it in a full-screen viewer — mouse
  wheel or pinch to zoom, drag to pan, double-click to zoom in, `+`/`-`/`0`
  for keyboard zoom, `Escape` to close.
- **Hover** a diagram to reveal its toolbar: expand, plus a copy button —
  click copies the diagram as a PNG, and its ▾ menu offers copy as PNG
  (light or dark), copy source, and download as PNG / SVG / source file.
- **Diagram text is real text** — select and copy it inline or in the
  viewer; in the viewer, clicking a label copies it to the clipboard.
- The viewer toolbar carries the same **copy menu** and can open the
  original file.

Dark mode inverts all of the above automatically. Diagrams that fail to
render show an error box in place; a missing referenced file fails the
build with an `asset-missing` error.
