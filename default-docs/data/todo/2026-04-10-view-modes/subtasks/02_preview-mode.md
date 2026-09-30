---
title: "Preview mode (rendered HTML)"
status: superseded
---

→ superseded by the two-mode decision in [the engine migration's editing mode](../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/02_editing-mode.md): with editing off, the page is the rendered reading view, so no separate preview mode is needed.

The pure render mode — no editor surface, just the rendered HTML output of the document.

## Tasks

- [ ] Mount the same renderer used in production docs
- [ ] No editing affordances (cursors hidden, no toolbar)
- [ ] Scroll position restored when switching back to Source / Live Preview
- [ ] Honour the same theme (light / dark) as the editor pane
