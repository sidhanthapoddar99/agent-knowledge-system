---
title: "Synchronize charts, tables and inspectors through shared state"
status: open
---

Linked visual views should respond to one selected item without maintaining inconsistent copies of the dataset or state.

# 01 To Do
- [ ] **Implement the state boundary.** Separate local transient details from shared selections, filters and answers.
- [ ] **Connect reusable views.** Synchronize chart, table and inspector events by stable data identity.
- [ ] **Handle transitions.** Preserve or reset state across filtering, scene changes and artifact hosts according to the accepted contract.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Implement this capability in independent library examples before engine integration.
- Unify narrated timing, branching and element interaction in one group while keeping each capability's work order distinct.

## Done when
- Selecting a chart point highlights its table row and inspector; table/inspector actions update the chart consistently.
- Filtering/sorting and scene navigation follow documented retention rules without stale selections.

# 02 Status and Result
Scoped; implementation has not started.

## Result
No implementation result yet. Record the outcome and evidence here before moving to review.

## Agent log
none

# 03 References
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 03_interactive artifact kinds.md](../../brainstorm/03_interactive-artifact-kinds.md)
- [Related idea: 04_multipath narrated experiences.md](../../brainstorm/04_multipath-narrated-experiences.md)
- [Related idea: 02_shared tsx artifact elements.md](../../brainstorm/02_shared-tsx-artifact-elements.md)
- [Existing player contract](../../../../../../../../agent-knowledge-system/apps/packages/agentks-video/README.md)
- [Library examples](../../../../../../../../agent-knowledge-system-library/README.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Do not couple views through DOM selectors or duplicate data simply because they are mounted in different host wrappers.
