---
title: "First-class excalidraw pages (read-only viewer)"
status: review
---

`.excalidraw` files as docs pages, rendered read-only. Depends on the client
renderer built in `subtasks/10_embeds/30_excalidraw.md` (fetch scene JSON →
`exportToSvg` → inject) and the loader foundation from
`subtasks/20_first-class/10_mermaid.md`.

This page is also the **"bigger view" target** for excalidraw embeds — the
independently openable, scrollable view the embed's expand affordance links to.

## Tasks

- [x] **Register `.excalidraw`** — registered in the diagram-page scan; the
      page body carries `data-src` (served `/content-assets/…` URL), fetched
      and rendered client-side — no inline JSON, consistent with the
      reference-based embed decision.
- [x] **Full-size viewer UX** — the outline column auto-hides (no headings)
      so the canvas gets the content width; `.diagram` has `overflow-x:
      auto` + `svg { max-width: 100% }`, and the lightbox click-to-zoom
      provides the full-screen scrollable view. Browser-verified on the live
      demo page.
- [x] **Verify** — browser-verified 2026-07-03 with a live `.excalidraw`
      page: filename-derived title in the sidebar, SVG rendered with caption
      + open-file link. The scene now lives on the user-guide Diagram
      Showcase (`user-guide/15_writing-content/07_diagram-showcase.md`) as
      an embed demo.
