---
title: "Wire plugin capabilities and distribution metadata"
status: open
---

A whole plugin must install coherently and expose its workflows/tools through the supported agent surfaces.

# 01 To Do
- [ ] **Wire entrypoints.** Update applicable plugin manifests, capability descriptions and references for authoring and consumption.
- [ ] **Connect discovery tools.** Define how plugin workflows use the Rust CLI or other public interfaces without inventing unavailable commands.
- [ ] **Prepare distribution.** Document installation/update and marketplace/repository references; validate the complete plugin before any publication.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Provide a whole plugin with distinct library-building and artifact-usage guidance.
- Keep plugin instructions self-contained within their plugin boundary, following the engine's skill-link checks.

## Done when
- The supported plugin surfaces expose the intended workflows and resolve every bundled reference.
- Install/update documentation and tool requirements match actual capabilities; relevant ctl/plugin checks pass.

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
External marketplace registration or publication is a later release action. This work should prepare concrete metadata without claiming the plugin has already shipped.
