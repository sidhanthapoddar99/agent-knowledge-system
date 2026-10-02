---
title: "Provide the library-building workflow and skills"
status: open
---

Agents need coherent instructions for creating TSX components, assets, themes and examples against the new standard.

# 01 To Do
- [ ] **Extend the existing plugin.** Map capabilities to authoring, validation and release preparation rather than simply renaming its single skill.
- [ ] **Teach the workflow.** Cover collection scaffolding, component APIs, dependency reuse, SVG/motion, examples and the Vite developer methodology.
- [ ] **Validate instructions.** Link implemented commands/contracts, provide runnable examples and check plugin-local references.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Provide a whole plugin with distinct library-building and artifact-usage guidance.
- Keep plugin instructions self-contained within their plugin boundary, following the engine's skill-link checks.

## Done when
- A fresh agent following the plugin can create and validate a small library component/example without unstated project knowledge.
- Instruction/command references match the implemented standard and plugin-link checks pass.

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
Load the instruction-writing and plugin-development guidance when implementing instruction files; do not duplicate outdated format rules.
