---
title: "First-class diagram docs extended to the tracker"
date: 2026-07-04
author: claude
---

Per sidhantha's request, diagram files are now first-class *inside issues*
too — consistent with docs sections: the issues loader accepts
`.mmd`/`.dot`/`.excalidraw` files in `notes/`, `brainstorm/`,
`agent-memory/`, and `agent-log/` (shared `diagramContainerHtml()` helper
from the docs diagram-pages loader). Subtasks and comments deliberately
stay markdown-only (status-bearing / dated log entries) — diagrams embed
there from `assets/`. Live demo on this issue:
`notes/04_first-class-demo.excalidraw` — browser-verified. Skill +
dev-docs updated.
