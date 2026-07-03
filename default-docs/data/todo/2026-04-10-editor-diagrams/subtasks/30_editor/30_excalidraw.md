---
title: "Editor: excalidraw canvas editing"
status: open
---

The bigger lift — Excalidraw needs a real inline editor surface (canvas,
persistent state, `.excalidraw` files). **Deferred** — display-only rendering
ships first (`subtasks/10_embeds/30_excalidraw.md`,
`subtasks/20_first-class/30_excalidraw.md`). The full editor plan (React
island, Yjs sync, export) lives in `notes/01_excalidraw.md`.

## Tasks

- [ ] `.excalidraw` file editing
- [ ] Inline diagram editor (mount Excalidraw component on `.excalidraw` files)
- [ ] Save back to file on change (debounced)
