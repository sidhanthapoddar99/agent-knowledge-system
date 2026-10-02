---
title: "Existing library migration — group scope"
status: open
---

Inventory and migrate the current library to the accepted TSX structure, with explicit component-family ownership, stable identities, asset provenance and parity checks.

# 01 To Do
Deliver the following scoped work orders. Their live state is also shown by the tracker.

| Work order |
|---|
| [Inventory existing components and map their migration](./010_inventory-and-migration-map.md) |
| [Establish the TSX source layout and component index](./020_source-layout-and-catalog.md) |
| [Migrate existing component families with parallel ownership](./030_component-family-conversion.md) |
| [Verify migration parity and update the library guidance](./040_migration-parity-and-validation.md) |
| [Migrate Default charts in an independent worktree](./050_default-chart-migration.md) |
| [Migrate Default tables and widgets in an independent worktree](./060_default-table-widget-migration.md) |
| [Migrate Default vector objects and assets in an independent worktree](./070_default-vector-asset-migration.md) |
| [Migrate Default motion and presentation families in an independent worktree](./080_default-motion-style-migration.md) |
| [Migrate Editorial with its own collection worktree](./090_editorial-collection-migration.md) |
| [Migrate Storybook with its own collection worktree](./100_storybook-collection-migration.md) |

## Guardrails
- Follow the [owner scope and boundaries](../../notes/01_scope-and-boundaries.md).
- Library and independent examples precede engine integration; the plan owns execution order.

## Done when
- Each child work order meets its checks and records its result/evidence.

# 02 Status and Result
Ownership lanes are initialized; live work state belongs to each child.

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
