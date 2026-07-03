---
title: "Editor: mermaid diagram preview"
status: open
---

Editor-pane live preview for mermaid fences. **Deferred** — display view
(groups `10_embeds/` and `20_first-class/`) ships first. Note: the preview
pipeline may already cover this — the editor renderer emits `.diagram` divs
and the preview panel dispatches `diagrams:render`
(`src/dev-tools/editor/layout/preview-panel.ts:26`); verify before building.

## Tasks

- [ ] Live render in preview pane (verify existing pipeline first)
- [ ] Syntax highlighting in source
