---
title: "Excalidraw embeds — reference-based read-only renderer"
status: done
---

The real coding lift of the embeds group: no excalidraw support exists at all
(no dependency, no renderer).

**Decided (sidhantha, 2026-07-03):** embeds are **reference-based from the
get-go** — the embed points at a `.excalidraw` file (typically in `assets/`),
the client fetches and renders it. No inline-JSON mode: the file must remain
independently openable, and the embed's click/expand affordance opens a
bigger scrollable view (and/or links to the file itself). See
`brainstorm/01_discuss_display-first-architecture.md`.

## How the embed looks — native markdown image syntax

**Decided (sidhantha, 2026-07-03):** markdown's own embed-vs-link split
carries the feature with zero new syntax:

```markdown
![Architecture](./assets/arch.excalidraw)   ← embeds, alt text = caption
[Architecture](./assets/arch.excalidraw)    ← plain link, opens the raw file
```

`![…]` means "render this resource here"; a bare link stays a link, which
preserves the open-as-independent-file affordance in its purest form.
Paths are file-relative, same rules as image assets.

What happens end-to-end:

1. **Build** — `marked` renders the image syntax to `<img>`; the shipped
   `asset-src` postprocessor (deliberately not keyed to image extensions)
   already rewrites the relative src to a served `/content-assets/…` URL,
   and `src/pages/content-assets/[...path].ts` already serves + statically
   builds any colocated file. A new branch in
   `src/parsers/postprocessors/diagrams.ts` converts `<img>` with an
   `.excalidraw` src into
   `<div class="diagram diagram-excalidraw" data-src="…" data-title="<alt>">`,
   with a build-time existence check feeding the standard error channel.
2. **Client** — `src/scripts/diagrams.ts` gains `renderExcalidraw()`, same
   lazy pattern as mermaid/graphviz: only when such divs exist, dynamically
   import the excalidraw-utils chunk, `fetch(data-src)`, `exportToSvg()`,
   inject. Alt text renders as caption; `.diagram-error` on fetch/parse
   failure.
3. **Interactions** — click/expand opens the lightbox big-view
   (`src/scripts/lightbox.ts` already listens for `diagrams:rendered`), plus
   an "open file ↗" link to the raw `/content-assets/…` URL — later pointing
   at the diagram's first-class page once
   `subtasks/20_first-class/30_excalidraw.md` lands.

Possible follow-up (not scope): `![Flow](./assets/flow.mmd)` as sugar for
mermaid/dot too — one uniform image-embed grammar for all three formats,
alongside the blessed fence + `[[./…]]` form.

## Tasks

- [ ] **Spike `@excalidraw/utils`** — confirm `exportToSvg(scene)` runs
      client-side without mounting the React editor, check bundle weight and
      whether React comes along as a peer dependency. This gates the approach.
- [ ] **Postprocessor branch** — `<img src="*.excalidraw">` →
      `.diagram-excalidraw` placeholder div in
      `src/parsers/postprocessors/diagrams.ts`, incl. build-time existence
      check + mime entry for `.excalidraw` if the fallback isn't enough.
- [ ] **Renderer branch** — `renderExcalidraw()` in
      `src/scripts/diagrams.ts`: fetch → `exportToSvg` → inject, lazy-loaded.
- [ ] **Plain-link rewrite** — extend the `asset-src` postprocessor to also
      rewrite relative `<a href>` targets that resolve to a colocated
      non-markdown file → `/content-assets/…` (today only `<img src>` is
      rewritten, so `[Name](./assets/arch.excalidraw)` would 404). Generic
      win: also fixes links to PDFs / code files.
- [ ] **Expand affordance** — lightbox big-view + open-file link (first-class
      page link once it exists).
- [ ] **Shared `.diagram-error` styling** — visible, theme-compliant error
      state for all three formats (folded in from the closed mermaid/graphviz
      subtasks).
- [ ] **Dark mode** — pass theme to the SVG export or reuse the CSS invert
      filter; pick whichever matches the theme contract better.
