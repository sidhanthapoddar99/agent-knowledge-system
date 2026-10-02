---
title: "Define artifact kinds and the shared component contract"
status: in-progress
---

Authors need one usable element contract across normal webpages, embedded artifacts and live narrated scenes.

# 01 To Do
- [ ] **Define artifact kinds.** Specify webpage and narrated hosts, component identity, typed inputs/events, assets, themes, initial state and supported host lifecycle.
- [ ] **Define imports and metadata.** Specify how a named library element maps to TSX source, compiled browser entrypoints, documentation and serializable input descriptions.
- [ ] **Document compatibility.** Cover existing HTML/SVG/widgets/JSON, unknown fields and invalid inputs; prepare the public contract for review.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Keep ordinary HTML artifacts supported alongside live narrated artifacts.
- Make pre-rendering and mobile/touch behavior part of the contract before migration depends on it.

## Done when
- A contract matrix covers all three hosting contexts and distinguishes source TSX from browser output.
- Example inputs and failures have precise meanings; existing HTML adoption and migration paths are documented.

# 02 Status and Result
Scoped; implementation has not started.

## Result
No implementation result yet. Record the outcome and evidence here before moving to review.

## Agent log
none

# 03 References
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 02_shared tsx artifact elements.md](../../brainstorm/02_shared-tsx-artifact-elements.md)
- [Related idea: 03_interactive artifact kinds.md](../../brainstorm/03_interactive-artifact-kinds.md)
- [Related idea: 11_distribution and engine integration.md](../../brainstorm/11_distribution-and-engine-integration.md)
- [Library catalog contract](../../../../../../../../agent-knowledge-system-library/AGENTS.md)
- [Engine package and rendering boundaries](../../../../../../../../agent-knowledge-system/AGENTS.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
The tracker component, artifact kind and library element category are different concepts; do not overload one field to mean all three.
