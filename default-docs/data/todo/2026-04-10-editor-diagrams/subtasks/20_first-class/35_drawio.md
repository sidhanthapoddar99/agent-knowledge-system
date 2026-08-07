---
title: "First-class draw.io pages"
status: review
---

# Overview

A prefixed `.drawio` file outside `assets/` renders as a docs page — sidebar
entry, URL, optional `.meta.json` sidecar — exactly like `.mmd`, `.dot` and
`.excalidraw`.

Small by design: the loader was already format-agnostic, so this is a map
entry plus one generalisation. The interesting part is the sibling subtask,
[10_embeds/35 draw.io embeds](../10_embeds/35_drawio.md), which brought the
renderer.

Done when a prefixed `.drawio` gets a sidebar entry and a URL, renders in
both themes, and takes part in the shared slug-collision pool.

# References

- [notes/05 the renderer decision](../../notes/05_drawio-renderer.md) — the
  vendored viewer and the native dark-mode carve-out.
- [subtasks/10_embeds/35 draw.io embeds](../10_embeds/35_drawio.md) — the
  renderer half, landed in the same pass.
- [subtasks/20_first-class/30 excalidraw pages](./30_excalidraw.md) — the
  reference-based page pattern this follows.

# Todo list

- [x] **Register the extension** — `.drawio → 'drawio'` in `DIAGRAM_KINDS`,
      plus the page glob and the slug-stripping regex.
- [x] **Generalise the container builder** — replace the hardcoded
      `kind === 'excalidraw'` branch with a `REFERENCED_KINDS` set, so the
      `data-src` shape is shared rather than copied.
- [x] **Live fixture** — `08_drawio-full-page.drawio` with a `.meta.json`
      sidecar in the user-guide examples folder.
- [x] **Confirm the free inheritance** — `DIAGRAM_EXTENSIONS` is derived, so
      issue sub-docs, `internal-links` and the sidebar type glyph picked
      `.drawio` up with no further change. Verified in the built output.

# Outcomes and Next Steps

**Landed.** `08_drawio-full-page.drawio` builds to
`/user-guide/writing-content/examples/drawio-full-page` with the sidecar
title applied, and the container carries the expected `data-src` and
`data-title`.

Headless run on that page: 74 real SVG nodes, `filter: none` in both themes,
`geDarkMode` applied after a theme flip with no duplicate SVG, zero
third-party requests, zero 4xx/5xx.

**Nothing deferred on this half.** The stencil and MathJax gaps belong to the
embeds subtask; they are properties of the renderer, not of page routing.

**Next:** none.

# Details

## Why the loader needed almost nothing

`loadDiagramPages()` was already driven by a `DIAGRAM_KINDS` map, and every
downstream consumer reads `DIAGRAM_EXTENSIONS`, which is derived from that
map's keys. So registering the extension carried `.drawio` into issue
sub-docs (`loaders/issues.ts`), non-page link handling
(`postprocessors/internal-links.ts`) and the sidebar type glyph without a
single further edit.

The one real change was structural rather than additive. The container
builder had a hardcoded `if (kind === 'excalidraw')` branch for the
fetch-by-reference shape. draw.io needs the same shape, so the condition
became a set:

```ts
const REFERENCED_KINDS = new Set<DiagramKind>(['excalidraw', 'drawio']);
```

Two kinds now share one implementation instead of two copies, and the split
it encodes is meaningful: a text DSL (mermaid, graphviz) is small and
readable inlined into the page, whereas an opaque document with embedded
fonts and images is fetched by reference so the file stays the single source
of truth.

## What a page author sees

Same rules as every other diagram page, documented once in
`15_writing-content/06_diagram-pages.md`: `XX_` prefix required, `assets/`
never scanned, slug collisions render an explicit error, title from the
filename unless a `.meta.json` sidecar overrides it, and the outline column
hides itself because the page has no headings.
