---
title: "Migrate Default tables and widgets in an independent worktree"
status: open
---

Table/widget behavior can be converted and expanded while the chart lane implements its own modules.

# 01 To Do
- [ ] **Own the table/widget lane.** Migrate Default table, account and device/widget behavior with clear element/source mapping.
- [ ] **Reuse events.** Implement richer table formats against the frozen selection/filter interfaces and chart fixtures.
- [ ] **Submit outputs.** Supply source/examples, local metadata and compatibility evidence; coordinate complete linked-view proof at convergence.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Branch from the merged contract/foundation checkpoint and follow its interfaces.
- Own only the assigned source/assets/examples and a local metadata fragment; the integrator owns catalogs, manifests, shared configuration and locks.

## Done when
- Existing table/widget consumers have a supported migration or compatibility path.
- Table examples work against typed chart/event fixtures before the real chart branch lands.

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
- [Related idea: 05_libraries styles themes dependencies.md](../../brainstorm/05_libraries-styles-themes-dependencies.md)
- [Current library catalog](../../../../../../../../agent-knowledge-system-library/README.md)
- [Default manifest](../../../../../../../../agent-knowledge-system-library/libraries/agentks-default/manifest.json)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Do not rewrite chart modules or shared event types to make linking work; that integration belongs to the common contract/coordinator.
