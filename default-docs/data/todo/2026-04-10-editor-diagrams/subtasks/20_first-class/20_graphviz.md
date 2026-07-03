---
title: "First-class graphviz pages"
status: done
---

Extend the first-class foundation built in
`subtasks/20_first-class/10_mermaid.md` to Graphviz: `.dot` / `.gv` files as
docs pages, rendered through the existing `.diagram-graphviz` client path
(`@hpcc-js/wasm-graphviz`, lazy-loaded).

## Tasks

- [x] **Register extensions** — `.dot` / `.gv` registered in the diagram-page
      scan (`src/loaders/diagram-pages.ts`, shipped with the foundation).
- [x] **Verify** — build-verified 2026-07-03 with a temporary `.dot` page
      (correct `.diagram-graphviz` div with inlined source at the expected
      slug; client render shared with the already browser-verified graphviz
      embeds). Sidecar/slug/collision/sidebar logic is format-agnostic —
      exercised by the foundation subtask's live tests.
