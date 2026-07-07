---
title: "Unify the file-type icon vocabulary in the issues sub-doc tree"
status: open
---

The issues sub-doc tree (`src/layouts/issues/default/parts/detail/SubdocTree.astro`) already renders a trailing glyph — but only for HTML artifacts (`docType === 'artifact'`, styled by `.issue-sidebar__doctype` in `styles/detail.css`). First-class diagram files in `notes/` / `brainstorm/` currently get no marker. Bring the tree up to the same icon vocabulary as the docs sidebar (subtask `10_file-type-icons-docs.md`) so both surfaces read identically.

- [ ] **Add the diagram glyph.** Where `SubdocTree.astro` computes `isArtifact`, also detect first-class diagram sub-docs and render the shared diagram icon with `data-tip="Diagram"` + `data-tip-always` + matching `aria-label`.
- [ ] **Share the glyphs, don't fork them.** Use the same SVG markup as the docs sidebar — extract to a small shared module if duplication would otherwise creep (the agent-log glyph map `server/agent-log-icons.ts` shows the pattern).
- [ ] **Keep markdown unmarked.** No icon for `.md` sub-docs — the default type carries no marker; that rule is part of the UX standard.
