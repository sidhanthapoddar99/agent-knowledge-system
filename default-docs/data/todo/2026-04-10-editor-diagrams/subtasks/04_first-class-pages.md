---
title: "First-class diagram pages (mermaid / graphviz / excalidraw)"
status: open
---

Treat `.mmd` / `.dot` / `.excalidraw` files under a docs tree as **first-class pages** — same `XX_` prefix convention as markdown, same sidebar, same routing. Enabled by default; any section can opt out at the `settings.json` level if desired (docs vs notes use case).

## Why

For note-taking / knowledge-base use, a diagram is often the page itself — not an embed. Forcing every diagram through a markdown wrapper is friction. The naming convention (`XX_name.<ext>`) already gives us everything we need to slot them in as pages.

For classic documentation, asset-embedding inside markdown is still the right pattern — so the behaviour must be opt-outable per section.

## Scope

Handlers for three formats, registered as first-class page renderers:

- **Mermaid** — `.mmd` / `.mermaid` → render via mermaid.js in client viewer
- **Graphviz** — `.dot` / `.gv` → render via viz.js / graphviz-wasm
- **Excalidraw** — `.excalidraw` → render via `@excalidraw/excalidraw` in read-only viewer mode

## Sidebar metadata

Since there's no markdown frontmatter, allow a sibling `XX_name.meta.json` (or inline inside the folder's `settings.json`) for the per-file overrides that frontmatter would normally carry:

```json
{
  "title": "System Architecture",
  "description": "High-level component diagram",
  "sidebar_label": "Architecture",
  "sidebar_position": 3,
  "draft": false
}
```

If no meta sidecar exists, derive `title` from the filename (strip prefix, title-case) — same fallback logic as markdown without frontmatter.

## Tasks

- [ ] Register `.mmd` / `.dot` / `.excalidraw` in the docs content-type handler (parser/content-types/docs.ts)
- [ ] Add renderer registry entry per format — each produces an HTML page body
- [ ] Sidecar `<file>.meta.json` loader (or settings.json inline entry) for sidebar metadata
- [ ] Section-level opt-out flag in `settings.json` (e.g. `allow_diagram_pages: false`) for docs sections that prefer embed-only
- [ ] Sidebar tree builder: treat diagram files as leaves alongside markdown
- [ ] Filename → title fallback when no meta sidecar is provided
- [ ] Client viewer bundles: lazy-load mermaid / viz.js / excalidraw only on pages that need them
- [ ] URL slug: same rules as markdown pages (strip extension + `XX_` prefix)

## Follow-ups (separate work)

- Editor-side: subtasks 01–03 already cover live preview + inline editing in the editor pane. This subtask is only about the rendered-site side.
- Knowledge-graph: when phase-3 wiki-links land, diagram pages should participate as first-class nodes.
