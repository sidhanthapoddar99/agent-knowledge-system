---
title: "Performance improvements"
state: open
---

> See [notes/02_editor-performance.md](../notes/02_editor-performance.md) for the full review (file paths, problem, fix, recommended order).

## High-impact

- [ ] Viewport-restrict live-preview decorations
- [ ] Debounce `onContentChange` in Yjs sync (~50–100ms)
- [ ] Cache combined preview CSS (`/__editor/styles`)
- [ ] Cache file-tree + per-file frontmatter

## Medium-impact

- [ ] Skip the decoration sort when push-order is preserved
- [ ] Cache cursor line numbers in `buildLivePreviewDecorations`
- [ ] Replace `treeReadyPlugin` polling with tree-update events
- [ ] Use `state.sliceDoc(0, 2048)` instead of materializing full doc for frontmatter parse

## Low-impact (tracked, defer)

- [ ] Diff presence broadcasts instead of sending full user list
- [ ] Piggy-back stale-user cleanup on SSE keepalive
- [ ] Expose Yjs room eviction interval in `PresenceConfig`
