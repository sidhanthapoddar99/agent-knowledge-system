---
title: "Build a reference TSX component and choose the authoring approach"
status: open
---

A concrete reference prevents teams from migrating components against incompatible framework or composition assumptions.

# 01 To Do
- [ ] **Evaluate the stack.** Compare the proposed authoring approach with current Preact and the framework-free player, including SSR, bundle cost and plain HTML consumption.
- [ ] **Build one reference.** Demonstrate a typed chart/table or SVG component in a webpage embed and narrated host using the same implementation.
- [ ] **Define extension rules.** Document shared primitives, composition/variants, any useful inheritance and lifecycle behavior; record the selected approach before parallel migration.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Keep ordinary HTML artifacts supported alongside live narrated artifacts.
- Make pre-rendering and mobile/touch behavior part of the contract before migration depends on it.

## Done when
- One reference component works in both hosts and can be rendered initially without browser-only globals.
- The framework/composition recommendation has recorded tradeoffs and an agreed extension example.

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
Mentioning React or TSX does not authorize silently replacing the current engine stack; the selected contract must account for its existing boundaries.
