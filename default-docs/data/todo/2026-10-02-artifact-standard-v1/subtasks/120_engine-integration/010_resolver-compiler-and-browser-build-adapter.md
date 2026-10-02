---
title: "Integrate library resolution, compilation and browser outputs"
status: blocked
---

The engine should consume a proven artifact contract and produce complete validated output rather than interpreting an unsettled library format.

# 01 To Do
- [ ] **Accept the build checkpoint.** Record the other engine agent's ready interfaces and the selected library revision before implementation.
- [ ] **Integrate the contract.** Connect collection/dependency metadata, component references, source/build outputs and schema/diagnostics through the appropriate crate layers.
- [ ] **Produce browser assets.** Connect the selected TSX build/pre-render pipeline, dependency closure and caching without violating app/package boundaries.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Blocked on the other agent's usable engine build and the independently proven library standard.
- Use ctl for engine checks and coordinate with the existing HTML/video issues instead of duplicating their work.

## Done when
- The engine resolves a pinned library and produces the standard's validated artifact/browser data and assets.
- Invalid references/contracts return actionable errors; generated API/schema fixtures and relevant ctl checks agree.

# 02 Status and Result
Scoped; implementation has not started.

## Result
No implementation result yet. Record the outcome and evidence here before moving to review.

## Agent log
none

# 03 References
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 11_distribution and engine integration.md](../../brainstorm/11_distribution-and-engine-integration.md)
- [Related idea: 02_shared tsx artifact elements.md](../../brainstorm/02_shared-tsx-artifact-elements.md)
- [Related idea: 04_multipath narrated experiences.md](../../brainstorm/04_multipath-narrated-experiences.md)
- [Engine build and package contract](../../../../../../../../agent-knowledge-system/AGENTS.md)
- [Library crate](../../../../../../../../agent-knowledge-system/apps/agentks-engine/crates/library/README.md)
- [Render crate](../../../../../../../../agent-knowledge-system/apps/agentks-engine/crates/render/README.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Keep frontend rendering/build responsibilities explicit; Rust does not natively execute TSX and missing interfaces must not be filled with plausible placeholders.
