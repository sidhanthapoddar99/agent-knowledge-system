---
title: "Artifact standard v1 and shared library"
---

# Goal

Define a new standard for reusable HTML and interactive narrated artifacts, and build and publish a shared library around it. The requested direction is executable TypeScript/TSX components, multiple visual styles, richer charts and tables, vector motion and experiences that can branch according to the reader's choices.

## Context

This issue captures the discussion before formal scoping. The library, its developer preview and authoring/discovery tooling come first; engine integration comes later. “v1” is a working name for the standard, not an announced package version.

The [HTML artifact issue](../2026-07-07-artifact-component/issue.md) and [Video artifacts issue](../2026-09-29-narrated-video-pages/issue.md) keep their existing work. All three belong to the Artifact component; diagram work remains in Components.

The [brainstorm index](./brainstorm/01_authoring-and-runtime-options.md) links separate idea entries for TSX artifact elements, interactive artifact kinds, multipath narration, libraries/themes, charts/tables, SVG motion, Vite, the authoring plugin, CLI discovery and distribution. It retains the owner direction and scope boundaries. Basic to-dos are recorded in [the initial comment](./comments/001_2026-10-02_initial-direction-and-todos.md).

## Done when

For this capture: the issue, initial to-do comment and detailed brainstorm are present and linked. Implementation outcomes and acceptance criteria will be defined with the subtasks later.

## Scope decisions

- Record the ideas and basic to-dos now. Define formal subtasks and the work plan later.
- Build the library, shipped Vite developer preview and authoring/discovery tooling before engine integration.
- Support ordinary HTML artifacts alongside interactive narrated experiences. New reusable components should be available to both.
- Include a whole library-authoring plugin and convenient CLI/AI discovery, rather than treating this as only one authoring skill.
- No implementation, engine update or publication is part of this capture.
