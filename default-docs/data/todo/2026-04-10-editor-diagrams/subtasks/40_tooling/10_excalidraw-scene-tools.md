---
title: "Excalidraw scene tools — edit/extract without reading the whole file"
status: open
---

`.excalidraw` scenes are large JSON blobs — a real diagram easily runs to
thousands of lines, and reading the whole file into context to make one edit
(or just to understand what the diagram shows) is wasteful and error-prone.
Build tooling so agents (and humans) can work with scenes surgically:

## Tasks

- [ ] **Extract / summarize** — a `docs-guide`-style command (or skill recipe)
      that reports a scene's structure without the raw JSON: element count,
      element types, text labels, groups/frames, bounding box. Enough for an
      agent to "read" the diagram cheaply.
- [ ] **Targeted edit** — edit a scene by element id / text match (rename a
      label, recolor, delete an element) without rewriting the file wholesale.
- [ ] **Delegation pattern** — where full-file reads are unavoidable, define
      the recipe: hand the file to a Haiku / low-effort subagent that returns
      the extract, keeping the big JSON out of the main context.
- [ ] **Skill note** — record the workflow in the skills once the tool shape
      settles (depends on `20_diagram-tooling-research.md` findings — an
      existing tool/MCP may cover part of this).
