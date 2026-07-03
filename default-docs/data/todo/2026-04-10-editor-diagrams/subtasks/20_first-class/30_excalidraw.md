---
title: "First-class excalidraw pages (read-only viewer)"
status: open
---

`.excalidraw` files as docs pages, rendered read-only. Depends on the client
renderer built in `subtasks/10_embeds/30_excalidraw.md` (fetch scene JSON →
`exportToSvg` → inject) and the loader foundation from
`subtasks/20_first-class/10_mermaid.md`.

This page is also the **"bigger view" target** for excalidraw embeds — the
independently openable, scrollable view the embed's expand affordance links to.

## Tasks

- [ ] **Register `.excalidraw`** in the widened docs scan + diagram content
      handler (page body carries a reference/URL to the scene, not inline
      JSON — consistent with the reference-based embed decision).
- [ ] **Full-size viewer UX** — the page view should let a large canvas
      breathe: scroll/pan, sensible max-width behaviour.
- [ ] **Verify** sidecar metadata, slug/collision rules and sidebar placement
      match the other formats.
