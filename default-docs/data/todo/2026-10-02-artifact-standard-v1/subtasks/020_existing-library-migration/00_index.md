---
title: "Existing library migration — group scope"
status: in-progress
---

Inventory and migrate the current library to the accepted TSX structure, with explicit component-family ownership, stable identities, asset provenance and parity checks.

# 01 To Do
Deliver the following scoped work orders. Their live state is also shown by the tracker.

| Work order | Current state |
|---|---|
| [Inventory existing components and map their migration](./010_inventory-and-migration-map.md) | review |
| [Establish the TSX source layout and component index](./020_source-layout-and-catalog.md) | review |
| [Migrate existing component families with parallel ownership](./030_component-family-conversion.md) | review |
| [Verify migration parity and update the library guidance](./040_migration-parity-and-validation.md) | in-progress |
| [Migrate Default charts in an independent worktree](./050_default-chart-migration.md) | review |
| [Migrate Default tables and widgets in an independent worktree](./060_default-table-widget-migration.md) | review |
| [Migrate Default vector objects and assets in an independent worktree](./070_default-vector-asset-migration.md) | review |
| [Migrate Default motion and presentation families in an independent worktree](./080_default-motion-style-migration.md) | review |
| [Migrate Editorial with its own collection worktree](./090_editorial-collection-migration.md) | review |
| [Migrate Storybook with its own collection worktree](./100_storybook-collection-migration.md) | review |

## Guardrails
- Follow the [owner scope and boundaries](../../notes/01_scope-and-boundaries.md).
- Library and independent examples precede engine integration; the plan owns execution order.

## Done when
- Each child work order meets its checks and records its result/evidence.

# 02 Status and Result
9 work orders are ready for owner review; 1 retain outstanding acceptance evidence. No child is closed by the agent.

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
