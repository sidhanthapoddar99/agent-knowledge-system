---
title: "Graphviz embeds — verify + bless the reference pattern"
status: done
---

Same situation as mermaid (see `subtasks/10_embeds/10_mermaid.md`): ` ```dot `
and ` ```graphviz ` fences already render through `@hpcc-js/wasm-graphviz`
via the shared `.diagram-graphviz` pipeline.

**Closed (sidhantha, 2026-07-03):** capability confirmed working — verified by
build with the live demo artifact `notes/02_embed-verification.md` (inline
fence + `[[./path.dot]]` reference form both emit populated
`.diagram-graphviz` divs).

## Tasks

- [x] **Verify end-to-end** — both forms verified via
      `notes/02_embed-verification.md`; same file-relative (`./` or `../`)
      rule as mermaid for in-fence references.
- [x] **Align reference syntax** — fence + `[[./path.dot]]` /
      `[[../assets/path.dot]]`, identical to the mermaid blessing.
- [x] **Error presentation** — folded into
      `subtasks/10_embeds/30_excalidraw.md` (shared `.diagram-error` styling).
