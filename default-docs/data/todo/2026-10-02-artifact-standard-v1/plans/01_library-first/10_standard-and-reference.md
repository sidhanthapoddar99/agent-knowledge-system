---
title: "Agree the standard and reference component"
status: review
outcome: "A tested component, source catalog and time/state contract give parallel teams one reference."
notes: "Three contract prototypes and inventory/blueprints proceed independently; coordinator reconciles the public API before bulk migration."
subtasks:
  - "[Define artifact kinds and the shared component contract](../../subtasks/010_standard-and-contracts/010_artifact-element-contract.md)"
  - "[Build a reference TSX component and choose the authoring approach](../../subtasks/010_standard-and-contracts/020_tsx-reference-and-composition.md)"
  - "[Specify library dependencies and GitHub version resolution](../../subtasks/010_standard-and-contracts/030_dependencies-and-github-versions.md)"
  - "[Define state, timestamped actions and rendering lifecycles](../../subtasks/010_standard-and-contracts/040_state-time-and-rendering-contract.md)"
  - "[Inventory existing components and map their migration](../../subtasks/020_existing-library-migration/010_inventory-and-migration-map.md)"
  - "[Define additional collection and style blueprints](../../subtasks/030_additional-libraries/010_collection-blueprints.md)"
---

Contract drafts can proceed in parallel; a single validated public interface prevents incompatible migrations.

# 01 To Do

- [x] Draft component/render, pure runtime and source/dependency contracts in independent worktrees.
- [x] Validate one shared TSX reference in readable webpage markup and a narrated host.
- [x] Reconcile the reference, metadata and lifecycle tests at one integration checkpoint.

## Done when

A tested component, source catalog and time/state contract give parallel teams one reference.

# 02 Status and Result

The standard and checked implementation are integrated: six collections, 73 public TSX definitions, focused browser closures, independent developer preview, ordinary HTML reuse, narrated branching/selection/audio and portable author/use tooling. Full gates, independent plugin smoke, both-theme/mobile browser proof and reproducible cold/limited local loading measurements pass. [Library-first result](../../notes/02_library-first-result.md) records exact scope, pins and limits. All changes are merged into library main; all created worktrees are removed after preserving unique review captures.

# 03 References

- [Plan overview](./overview.md)
- [Owner scope](../../notes/01_scope-and-boundaries.md)

# 04 Decisions

The owner authorized autonomous isolated-worktree execution with as much real parallelism as dependencies permit. Shared entrypoints and configuration have one integrator.

# 05 Notes & Analysis

Three contract prototypes and inventory/blueprints proceed independently; coordinator reconciles the public API before bulk migration.
