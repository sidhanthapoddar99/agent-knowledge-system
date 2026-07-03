---
title: "Excalidraw embeds — reference-based read-only renderer"
status: open
---

The real coding lift of the embeds group: no excalidraw support exists at all
(no dependency, no tag, no renderer).

**Decided (sidhantha, 2026-07-03):** embeds are **reference-based from the
get-go** — the embed points at a `.excalidraw` file (typically in `assets/`),
the client fetches and renders it. No inline-JSON mode: the file must remain
independently openable, and the embed's click/expand affordance opens a
bigger scrollable view (and/or links to the file itself). See
`brainstorm/01_discuss_display-first-architecture.md`.

## How the embed looks — tag-based

Mermaid/graphviz use code fences because their embed *is* inline source.
Excalidraw is reference-only by decision, so a fence is the wrong shape — the
natural form is a **custom tag carrying a `src`**, built on the existing
custom-tags machinery (`src/custom-tags/` — same pattern as callout / tabs /
collapsible):

```
:::excalidraw{src="./assets/architecture.excalidraw"}
:::
```

Optional attributes kept minimal: `title` (caption / accessible name),
maybe `height` for a fixed viewport. Nothing else in v1.

What happens end-to-end:

1. **Build** — the tag expands to a placeholder
   `<div class="diagram diagram-excalidraw" data-src="…">`, with `src`
   resolved to a fetchable `/content-assets/…` URL by the same resolution
   rules image embeds use (file-relative `./`, issue-assets convention).
   Missing file at build time → the standard `asset-missing` error channel.
2. **Client** — `src/scripts/diagrams.ts` gains a `renderExcalidraw()`
   branch, same lazy pattern as the other two: only if `.diagram-excalidraw`
   divs exist, dynamically import the excalidraw-utils chunk, fetch the scene
   JSON from `data-src`, `exportToSvg()`, inject the SVG. Skeleton/placeholder
   while loading; `.diagram-error` on fetch/parse failure.
3. **Interactions** — click/expand opens the big scrollable view (lightbox —
   `src/scripts/lightbox.ts` already listens for `diagrams:rendered`), plus an
   "open file" affordance linking to the raw asset URL — and to the diagram's
   first-class page once `subtasks/20_first-class/30_excalidraw.md` lands.

Rejected alternative: an ` ```excalidraw ` fence + `[[./file]]` would inline
the scene JSON into the page — exactly the model the decision above rules out.

## Tasks

- [ ] **Spike `@excalidraw/utils`** — confirm `exportToSvg(scene)` runs
      client-side without mounting the React editor, check bundle weight and
      whether React comes along as a peer dependency. This gates the approach.
- [ ] **Custom tag** — implement `:::excalidraw{src="…"}` in
      `src/custom-tags/` emitting the `data-src` placeholder div; wire the
      src resolution + build-time existence check.
- [ ] **Renderer branch** — `renderExcalidraw()` in
      `src/scripts/diagrams.ts`: fetch → `exportToSvg` → inject, lazy-loaded.
- [ ] **Serve the file** — ensure `.excalidraw` files resolve to fetchable
      URLs through the existing asset-serving routes (`/content-assets/…`).
- [ ] **Expand affordance** — lightbox big-view + open-file link (first-class
      page link once it exists).
- [ ] **Shared `.diagram-error` styling** — visible, theme-compliant error
      state for all three formats (folded in from the closed mermaid/graphviz
      subtasks).
- [ ] **Dark mode** — pass theme to the SVG export or reuse the CSS invert
      filter; pick whichever matches the theme contract better.
