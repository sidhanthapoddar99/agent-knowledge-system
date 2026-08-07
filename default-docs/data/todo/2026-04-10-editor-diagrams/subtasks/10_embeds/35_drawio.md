---
title: "draw.io embeds — vendored GraphViewer, native dark mode"
status: done
---

# Overview

Add `.drawio` as the fourth embeddable diagram format, on the same
image-syntax grammar as excalidraw: `![Topology](./assets/x.drawio)` embeds,
`[Topology](./assets/x.drawio)` stays a link.

Unlike the other three this needed a **vendored renderer** — draw.io
publishes no npm package — and its own **dark-mode mechanism**, because the
CSS invert filter the other formats use destroys the raster icons draw.io
files routinely carry. Both are decisions with real cost; the reasoning is in
the note below, not here.

Done when a `.drawio` embeds and renders in both themes, the build stays
green, and no page makes a third-party request to render one.

# References

- [notes/05 the renderer decision](../../notes/05_drawio-renderer.md) — why
  vendored, what was rejected, why dark mode is native, and the verification
  run. **Read this before changing anything in `drawio.ts`.**
- [subtasks/20_first-class/35 draw.io pages](../20_first-class/35_drawio.md)
  — the other half, landed in the same pass.
- [subtasks/10_embeds/30 excalidraw embeds](./30_excalidraw.md) — the
  reference-based embed pattern this follows.
- `astro-doc-code/src/vendor/drawio/README.md` — provenance, SHA-256 and the
  upgrade procedure for the vendored bundle.

# Todo list

- [x] **Generalise the embed postprocessor** — `excalidraw-embed.ts` →
      `diagram-embed.ts`, driven by an `EMBEDDABLE` extension map so a
      format is one map entry rather than a second copy of the matcher.
      Re-registered in all three content types.
- [x] **Vendor the renderer** — `src/vendor/drawio/viewer-static.min.js`
      (Apache-2.0, v31.1.5) with `LICENSE` and a provenance `README.md`.
- [x] **Client renderer** — `src/scripts/drawio.ts`, dynamically imported by
      `diagrams.ts` only when a `.diagram-drawio` container exists.
- [x] **Suppress every remote call** — override all six resource-path
      globals plus `DRAWIO_LOG_URL`, and claim `onDrawioViewerLoad` so the
      bundle does not run its own global element scan.
- [x] **Kill the eager MathJax 404** — `public/vendor/drawio/math/startup.js`
      as a deliberate no-op.
- [x] **Native dark mode** — `graphConfig['dark-mode']` + the `Editor.darkMode`
      global, rebuilt on a `data-theme` flip, with `:not(.diagram-drawio)`
      carve-outs on every invert rule and a `lightbox-svg-themed` marker on
      the lightbox clone.
- [x] **Lightbox + MIME + editor icon** — `diagram.drawio` source name,
      `data-src` copy-source branch, `application/xml`, file-tree icon.
- [x] **Verify headlessly** — see the note's Verification section.

# Outcomes and Next Steps

**Landed.** `.drawio` embeds render in both themes. Build green (1219 pages);
typecheck clean in every touched file (the 27 remaining errors are
pre-existing and in files this work never opened).

Headless run over the showcase embed: container reaches `.diagram-rendered`
with 41 real SVG nodes, computed `filter` is `none` in both themes, the
theme flip applies `geDarkMode` without duplicating the SVG or losing the
caption, and **zero requests reach `diagrams.net`** with zero 4xx/5xx.

**Deferred, with reasons:**

- **Stencil icon sets** (AWS / Azure / GCP / Cisco) — ~21 MB of XML, not
  vendored. A diagram using one renders the fallback shape. `STENCIL_PATH`
  points at `/assets/drawio/stencils` so a project can opt in.
- **MathJax** — not bundled. `math="1"` diagrams queue and never typeset.
- **PNG export** — checked, and it *is* broken: `toBlob` throws
  `SecurityError` because draw.io's `<foreignObject>` labels taint the
  canvas. The PNG entries are now withheld rather than offered and failed.
  Restoring them means an offscreen `NO_FO` re-render at export time — see
  the note; not built.

**Next:** nothing blocking.

## Follow-up round — the expanded view was light in dark mode

Sid reported it after the first pass. Root cause and fix are in
[notes/05 the renderer decision](../../notes/05_drawio-renderer.md): the
viewer set `color-scheme` on its container, not on the SVG, so any consumer
that detached the SVG (the lightbox clone, the SVG download) rendered the
light branch of every `light-dark()`. `stampColorScheme()` now writes the
scheme into the SVG as a `<style>` child, class-scoped so it cannot leak to
other diagrams on the page.

Verified: expanded fill is now identical to inline in both themes, across
both the embed and the page, with controls proving mermaid is untouched.

# Details

## The embed grammar is unchanged

No new syntax. The matcher in `diagram-embed.ts` builds its pattern from the
keys of one map:

```ts
const EMBEDDABLE = {
  '.excalidraw': { kind: 'excalidraw', label: 'Excalidraw' },
  '.drawio':     { kind: 'drawio',     label: 'draw.io' },
};
```

Everything downstream — the `?v=<mtimeMs>` cache-bust, the build-time
existence check feeding `asset-missing`, the `data-title` caption fallback,
the must-run-before-`asset-src` ordering — is shared, not duplicated. Adding
a fifth format is one entry here plus a render branch.

## Why `drawio.ts` is a separate module

`diagrams.ts` imports it dynamically. Two things are worth keeping off pages
that have no draw.io on them: the 3 MiB viewer, and the `MutationObserver`
that watches `data-theme` for the rebuild. A static import would install the
observer everywhere.

## Authoring guidance that follows from the dark-mode choice

Author-set colours are re-resolved for a dark canvas rather than inverted, so
they shift (light green → dark green) but keep their identity. Pick colours
whose *meaning* survives both canvases. Uncoloured shapes need no thought.

Prefer saving uncompressed (*File → Properties → Compressed: off*) so the
file diffs, greps and reviews like the rest of the content — the same reason
every other artefact here is text on disk.
