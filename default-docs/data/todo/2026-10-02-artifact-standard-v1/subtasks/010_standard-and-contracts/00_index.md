---
title: "Standard and contracts — group scope"
status: in-progress
---

Define the shared artifact kinds, TSX component API, dependency/versioning rules and state/timeline/rendering contract before component teams rely on them.

# 01 To Do
Deliver the following scoped work orders. Their live state is also shown by the tracker.

| Work order | Current state |
|---|---|
| [Define artifact kinds and the shared component contract](./010_artifact-element-contract.md) | review |
| [Build a reference TSX component and choose the authoring approach](./020_tsx-reference-and-composition.md) | review |
| [Specify library dependencies and GitHub version resolution](./030_dependencies-and-github-versions.md) | review |
| [Define state, timestamped actions and rendering lifecycles](./040_state-time-and-rendering-contract.md) | review |

## Guardrails
- Follow the [owner scope and boundaries](../../notes/01_scope-and-boundaries.md).
- Library and independent examples precede engine integration; the plan owns execution order.

## Done when
- Each child work order meets its checks and records its result/evidence.

# 02 Status and Result
4 work orders are ready for owner review; 0 retain outstanding acceptance evidence. No child is closed by the agent.

## Result
The child records map the implemented library-first capabilities to source/contracts and focused tests at `7b2c057`. The 170-test unit/DOM batch and 63-test native suite pass; plugin structure/forward captures have their own evidence. Retained native assets and deferred engine/publication behavior are stated explicitly.

The index remains in-progress while its children are not Closed, matching the toolkit aggregation. Final aggregate/prebuilt/browser evidence is recorded separately in the [library-first result](../../notes/02_library-first-result.md).

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Brainstorm index](../../brainstorm/01_authoring-and-runtime-options.md)

# 04 Decisions
## 01 Area of work
This group is an area, not a phase. The owner requested an index explaining the area and combined narration, branching and interaction into one experience group.

# 05 Notes & Analysis
## Dependency and index maintenance
Follow the plan and each child's actual state. Update this scope table and the index state when child results change.
