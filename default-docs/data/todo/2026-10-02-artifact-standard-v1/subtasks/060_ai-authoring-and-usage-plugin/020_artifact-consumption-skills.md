---
title: "Teach agents to use libraries in webpage and narrated artifacts"
status: open
---

Using a library is different from building one, and the new artifact kinds need clear consumer instructions.

# 01 To Do
- [ ] **Teach discovery and imports.** Show how to locate components, read inputs/events/dependencies and choose a visual family.
- [ ] **Provide authoring paths.** Cover ordinary/embedded webpages and live narrated artifacts, with shared TSX elements, interactions and branching.
- [ ] **Integrate the existing artifact guidance.** Choose canonical ownership so the broader agentks plugin and library plugin do not issue competing instructions.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Provide a whole plugin with distinct library-building and artifact-usage guidance.
- Keep plugin instructions self-contained within their plugin boundary, following the engine's skill-link checks.

## Done when
- An agent can build a webpage artifact and narrated example using the same discovered component.
- Consumer instructions explain compiled browser output, embedding, audio/interaction and mobile behavior with working examples.

# 02 Status and Result
Scoped; implementation has not started.

## Result
No implementation result yet. Record the outcome and evidence here before moving to review.

## Agent log
none

# 03 References
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 09_library authoring plugin.md](../../brainstorm/09_library-authoring-plugin.md)
- [Related idea: 10_cli ai library discovery.md](../../brainstorm/10_cli-ai-library-discovery.md)
- [Existing library-authoring plugin](../../../../../../../../agent-knowledge-system/plugins/agentks-library/README.md)
- [Current library skill](../../../../../../../../agent-knowledge-system/plugins/agentks-library/skills/agentks-library/SKILL.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Avoid treating the new narrated experience as a rendered movie or making every consumer adopt the source framework.
