---
title: "Narrated and interactive experiences — group scope"
status: open
---

Live scenes/components, timestamped actions, optional narration, branching paths and element interaction are one experience area, with separate capability work orders.

# 01 To Do
Deliver the following scoped work orders. Their live state is also shown by the tracker.

| Work order | Initial state |
|---|---|
| [Implement live scenes and timestamped component actions](./010_scenes-and-timestamped-actions.md) | open |
| [Provide deterministic playback, seeking and review controls](./020_playback-seeking-and-review.md) | open |
| [Synchronize optional sample narration with live components](./030_optional-audio-and-synchronization.md) | open |
| [Define and validate the choice/scene graph](./040_choice-graph-and-validation.md) | open |
| [Implement branch choices, history and replay behavior](./050_branch-navigation-and-history.md) | open |
| [Ship a branching narrated reference experience](./060_branching-reference-experience.md) | open |
| [Implement element actions for pointer, keyboard and touch](./070_element-actions-and-inputs.md) | open |
| [Synchronize charts, tables and inspectors through shared state](./080_shared-selection-and-linked-views.md) | open |
| [Coordinate reader actions, timeline and branch transitions](./090_interaction-time-and-branch-coordination.md) | open |

## Guardrails
- Follow the [owner scope and boundaries](../../notes/01_scope-and-boundaries.md).
- Library and independent examples precede engine integration; the plan owns execution order.

## Done when
- Each child work order meets its checks and records its result/evidence.

# 02 Status and Result
Scoped and initialized; implementation has not started.

## Agent log
none

# 03 References
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Brainstorm index](../../brainstorm/01_authoring-and-runtime-options.md)

# 04 Decisions
## 01 Area of work
This group is an area, not a phase. The owner requested an index explaining the area and combined narration, branching and interaction into one experience group.

# 05 Notes & Analysis
## Dependency and index maintenance
Follow the plan and each child's actual state. Update this scope table and the index state when child results change.
