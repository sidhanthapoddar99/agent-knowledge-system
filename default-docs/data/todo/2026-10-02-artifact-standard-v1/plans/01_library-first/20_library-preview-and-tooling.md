---
title: "Establish the shared library and preview foundation"
status: review
outcome: "Source index, lazy rendering, scene fixtures and a shipped Vite skeleton provide stable lane inputs."
notes: "Depends on the tested standard/reference checkpoint; developer preview has no Rust engine dependency."
subtasks:
  - "[Establish the TSX source layout and component index](../../subtasks/020_existing-library-migration/020_source-layout-and-catalog.md)"
  - "[Ship the Vite developer package and workflow](../../subtasks/050_developer-preview/010_vite-package-and-workflow.md)"
  - "[Implement live scenes and timestamped component actions](../../subtasks/080_narrated-and-interactive-experiences/010_scenes-and-timestamped-actions.md)"
  - "[Define and validate the choice/scene graph](../../subtasks/080_narrated-and-interactive-experiences/040_choice-graph-and-validation.md)"
  - "[Pre-render readable HTML/SVG and attach interaction](../../subtasks/110_production-and-optimization/010_initial-render-and-interactive-attachment.md)"
---

The gallery can use typed reference fixtures before migrated collections are ready.

# 01 To Do

- [x] Wire catalog generation, shared renderer and timeline/choice fixtures against the accepted contract.
- [x] Prepare the Vite gallery skeleton and readable initial-render example.
- [x] Freeze shared type/export/config/lockfile ownership and lane integration checks.

## Done when

Source index, lazy rendering, scene fixtures and a shipped Vite skeleton provide stable lane inputs.

# 02 Status and Result

The standard and checked implementation are integrated: six collections, 73 public TSX definitions, focused browser closures, independent developer preview, ordinary HTML reuse, narrated branching/selection/audio and portable author/use tooling. Full gates, independent plugin smoke, both-theme/mobile browser proof and reproducible cold/limited local loading measurements pass. [Library-first result](../../notes/02_library-first-result.md) records exact scope, pins and limits. All changes are merged into library main; all created worktrees are removed after preserving unique review captures.

# 03 References

- [Plan overview](./overview.md)
- [Owner scope](../../notes/01_scope-and-boundaries.md)

# 04 Decisions

The owner authorized autonomous isolated-worktree execution with as much real parallelism as dependencies permit. Shared entrypoints and configuration have one integrator.

# 05 Notes & Analysis

Depends on the tested standard/reference checkpoint; developer preview has no Rust engine dependency.
