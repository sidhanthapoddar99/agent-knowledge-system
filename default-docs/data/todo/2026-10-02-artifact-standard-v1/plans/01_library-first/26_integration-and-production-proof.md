---
title: "Integrate and verify independent library outputs"
status: review
outcome: "Merged libraries and standalone examples pass parity, mobile/accessibility and built-output validation."
notes: "Consumes checked lane commits; full interaction/audio/branch coordination follows subsystem integration."
subtasks:
  - "[Verify migration parity and update the library guidance](../../subtasks/020_existing-library-migration/040_migration-parity-and-validation.md)"
  - "[Register new libraries and ship representative examples](../../subtasks/030_additional-libraries/030_catalog-and-family-examples.md)"
  - "[Ship a branching narrated reference experience](../../subtasks/080_narrated-and-interactive-experiences/060_branching-reference-experience.md)"
  - "[Coordinate reader actions, timeline and branch transitions](../../subtasks/080_narrated-and-interactive-experiences/090_interaction-time-and-branch-coordination.md)"
  - "[Verify responsive layouts and accessible mobile interaction](../../subtasks/110_production-and-optimization/030_mobile-and-accessibility.md)"
  - "[Set load budgets and verify built library examples](../../subtasks/110_production-and-optimization/040_performance-budgets-and-production-proof.md)"
---

Integration proof requires real merged components and production assets; subsystem tests alone cannot establish full-host compatibility.

# 01 To Do

- [x] Merge checked worktree commits; reconcile canonical manifests/indexes and prove all legacy identities/assets remain available.
- [x] Verify ordinary HTML and live narrated hosts share components, selection, branching and optional narration.
- [x] Measure built output and test light/dark, narrow/touch/keyboard and reduced-motion behavior.
- [x] Remove only our merged, clean worktrees after inspecting unique/untracked/ignored work; record engine handoff limits.

## Done when

Merged libraries and standalone examples pass parity, mobile/accessibility and built-output validation.

# 02 Status and Result

The standard and checked implementation are integrated: six collections, 73 public TSX definitions, focused browser closures, independent developer preview, ordinary HTML reuse, narrated branching/selection/audio and portable author/use tooling. Full gates, independent plugin smoke, both-theme/mobile browser proof and reproducible cold/limited local loading measurements pass. [Library-first result](../../notes/02_library-first-result.md) records exact scope, pins and limits. All changes are merged into library main; all created worktrees are removed after preserving unique review captures.

# 03 References

- [Plan overview](./overview.md)
- [Owner scope](../../notes/01_scope-and-boundaries.md)

# 04 Decisions

The owner authorized autonomous isolated-worktree execution with as much real parallelism as dependencies permit. Shared entrypoints and configuration have one integrator.

# 05 Notes & Analysis

Consumes checked lane commits; full interaction/audio/branch coordination follows subsystem integration.
