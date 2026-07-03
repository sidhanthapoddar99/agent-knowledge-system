---
title: "First-class graphviz pages"
status: open
---

Extend the first-class foundation built in
`subtasks/20_first-class/10_mermaid.md` to Graphviz: `.dot` / `.gv` files as
docs pages, rendered through the existing `.diagram-graphviz` client path
(`@hpcc-js/wasm-graphviz`, lazy-loaded).

## Tasks

- [ ] **Register extensions** — `.dot` / `.gv` in the widened docs scan +
      diagram content handler.
- [ ] **Verify** sidecar metadata, slug/collision rules and sidebar placement
      behave identically to mermaid pages.
