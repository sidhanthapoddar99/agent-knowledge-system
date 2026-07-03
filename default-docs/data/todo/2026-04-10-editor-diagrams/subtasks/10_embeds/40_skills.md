---
title: "Skills updates for diagram embeds"
status: done
---

Once the three embed subtasks in this group settle the syntax, the plugin
skills must teach it — embeds are the everyday path (diagrams that don't need
to be first-class live in `assets/` and are referenced).

## Tasks

- [x] **`documentation-guide` skill** — `references/writing.md` now teaches
      all three formats: mermaid/graphviz fences + `[[./…]]` reference form,
      excalidraw image-syntax embed vs plain-link split, error behaviour,
      and the `<a href>` colocated-file rewrite.
- [x] **`doc-issues` skill** — `references/10_writing/10_writing.md`
      Diagrams + Assets sections updated with the same guidance,
      tracker-flavoured (issue `assets/` as diagram home, live demo pointer
      to `notes/02_embed-verification.md`).
- [x] **Mirror to plugin cache** — both files copied to the installed cache
      and diff-verified in sync (2026-07-03).
