---
title: Diagram Pages
description: Render .mmd / .dot / .excalidraw files as first-class docs pages — same sidebar, same routing as markdown.
sidebar_position: 6
---

# Diagram Pages

A diagram file that follows the `XX_` prefix convention renders as a
**first-class page** — it appears in the sidebar, gets a URL, and routes
exactly like a markdown page. For note-taking and knowledge-base use, a
diagram often *is* the page; no markdown wrapper needed.

In the sidebar, diagram pages carry a small trailing **type glyph** (hover
names it) so they're distinguishable from markdown pages at a glance —
markdown is the default and stays unmarked.

All three types rendering live (as embeds) are on the
[Diagram Showcase](./examples/diagram-showcase) page.

## Supported formats

| Extension | Renderer |
|---|---|
| `.mmd`, `.mermaid` | mermaid.js (lazy-loaded client-side) |
| `.dot`, `.gv` | Graphviz WASM (lazy-loaded client-side) |
| `.excalidraw` | Excalidraw SVG export (fetched by reference, read-only) |

## Naming and URLs

Same rules as markdown: the `XX_` position prefix is required and orders the
sidebar; the URL slug strips the prefix and the extension.

```
20_architecture/
├── 10_overview.md              → /docs/architecture/overview
├── 20_components.mmd           → /docs/architecture/components
└── 30_data-model.excalidraw    → /docs/architecture/data-model
```

Two files must never resolve to the same slug (`15_lightbox.md` +
`16_lightbox.mmd` both want `/lightbox`) — a collision renders an explicit
error at that URL and reports a build error. A diagram file **without** a
prefix is skipped with a warning (it's treated as a stray working file, not
a page). Files inside `assets/` directories are never scanned — that's the
home for embed-only diagrams.

## Titles — the name usually suffices

With no metadata, the page title derives from the filename:
`20_system-architecture.mmd` → **System Architecture**. Name your files well
and you're done.

When the name isn't enough, add a sidecar `XX_name.meta.json` next to the
file — the frontmatter equivalent for non-markdown pages:

```json
{
  "title": "System Architecture",
  "description": "High-level component diagram",
  "sidebar_label": "Architecture",
  "sidebar_position": 3,
  "draft": false
}
```

All fields are optional; `.jsonc` (comments, trailing commas) works too.

## Page behaviour

- The **outline column hides itself** (diagram pages have no headings), so
  the canvas gets the full content width.
- **Click opens** the rendered diagram in a full-screen viewer — wheel/pinch
  zoom, drag to pan, double-click to zoom, and a copy button (PNG by
  default) with a dropdown: copy as PNG light/dark, copy source, download
  PNG / SVG / source. Diagram text is selectable, and clicking a label
  copies it. Hovering the inline diagram shows the same toolbar plus expand.
- Excalidraw pages show a caption with an *open file ↗* link to the raw
  `.excalidraw` scene — the file stays independently openable and editable.
- **Dark mode** inverts diagrams automatically.

## Opting a section out

For classic documentation where diagrams should only ever be inline figures,
disable diagram pages per section in the section-root `settings.json`:

```json
{
  "allow_diagram_pages": false
}
```

Enabled by default everywhere else.

## Embed or page?

- **Embed** ([asset embedding](./asset-embedding)) when the diagram is a
  figure inside prose — it lives in `assets/`, referenced from markdown.
- **Page** when the diagram is the content itself — give it a prefix and a
  good filename, and it slots into the sidebar.
