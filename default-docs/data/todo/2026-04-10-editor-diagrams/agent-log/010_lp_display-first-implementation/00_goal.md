---
title: "Goal — display-first diagram implementation loop"
agent: claude
date: 2026-07-03
---

## Goal

Self-paced implementation loop (started by sidhantha, 2026-07-03) covering the
display-first scope of this issue: **group `10_embeds/` then group
`20_first-class/`**. Group `30_editor/` stays out of scope.

Concretely, in order:

1. **Excalidraw spike** — `exportToSvg` from `@excalidraw/excalidraw` (the
   `@excalidraw/utils` package is a stale test release) working client-side
   without mounting the editor; measure the lazy chunk.
2. **Excalidraw embed** (`subtasks/10_embeds/30_excalidraw.md`) — image-syntax
   embed (`![Name](./assets/x.excalidraw)`), postprocessor branch, client
   renderer, plain-link `<a href>` rewrite, lightbox expand, dark mode,
   shared `.diagram-error` styling.
3. **Embeds skills + docs** (`40_skills.md`, `50_documentation.md`).
4. **First-class pages** (`20_first-class/`) — loader foundation on the
   mermaid pathfinder (glob widening + explicit `assets/` exclusion, optional
   `XX_name.meta.json` sidecar with filename fallback, slug collision =
   error), then graphviz, then excalidraw viewer pages, then that group's
   skills + docs.

## Constraints / decisions in force

All dated decisions live in
`brainstorm/01_discuss_display-first-architecture.md`. Verified pipeline
facts: `agent-memory/pipeline-facts.md`. Outline-panel behaviour is the one
open point — default to **hide on diagram pages** if still unanswered when
group 20 starts, and flag it for review.

## Definition of done

Each subtask lands verified (build + browser where relevant), status moved to
`review` (AI ceiling — human closes), milestones logged here per iteration.
