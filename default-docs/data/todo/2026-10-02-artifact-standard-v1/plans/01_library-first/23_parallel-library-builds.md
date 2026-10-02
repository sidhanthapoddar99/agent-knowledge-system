---
title: "Build collections, experiences and tooling in parallel"
status: blocked
outcome: "Independent collection and runtime lanes deliver compatible components, examples and authoring guidance."
notes: "Starts from the shared foundation; each lane owns bounded files and can merge as soon as its focused checks pass."
subtasks:
  - "[Migrate existing component families with parallel ownership](../../subtasks/020_existing-library-migration/030_component-family-conversion.md)"
  - "[Migrate Default charts in an independent worktree](../../subtasks/020_existing-library-migration/050_default-chart-migration.md)"
  - "[Migrate Default tables and widgets in an independent worktree](../../subtasks/020_existing-library-migration/060_default-table-widget-migration.md)"
  - "[Migrate Default vector objects and assets in an independent worktree](../../subtasks/020_existing-library-migration/070_default-vector-asset-migration.md)"
  - "[Migrate Default motion and presentation families in an independent worktree](../../subtasks/020_existing-library-migration/080_default-motion-style-migration.md)"
  - "[Migrate Editorial with its own collection worktree](../../subtasks/020_existing-library-migration/090_editorial-collection-migration.md)"
  - "[Migrate Storybook with its own collection worktree](../../subtasks/020_existing-library-migration/100_storybook-collection-migration.md)"
  - "[Implement themes and reusable component variants](../../subtasks/030_additional-libraries/020_family-themes-and-variants.md)"
  - "[Build a Motion Explainers library in its own worktree](../../subtasks/030_additional-libraries/040_motion-explainers-library.md)"
  - "[Build a Data Stories library in its own worktree](../../subtasks/030_additional-libraries/050_data-stories-library.md)"
  - "[Build a Story Scenes library in its own worktree](../../subtasks/030_additional-libraries/060_story-scenes-library.md)"
  - "[Build line, scatter, combined and quadrant charts](../../subtasks/040_innovative-components/010_line-scatter-and-quadrant-charts.md)"
  - "[Build comparative, structured and account-style tables](../../subtasks/040_innovative-components/020_table-and-account-views.md)"
  - "[Build vector actors and reusable concept motion](../../subtasks/040_innovative-components/030_vector-actors-and-explanatory-motion.md)"
  - "[Explore optional 3D charts and innovative element types](../../subtasks/040_innovative-components/040_optional-3d-and-experimental-elements.md)"
  - "[Build the gallery and component inspector](../../subtasks/050_developer-preview/020_component-browser-and-inspector.md)"
  - "[Ship examples, fixtures and sample narration audio](../../subtasks/050_developer-preview/030_examples-fixtures-and-sample-audio.md)"
  - "[Provide the library-building workflow and skills](../../subtasks/060_ai-authoring-and-usage-plugin/010_library-authoring-workflow.md)"
  - "[Teach agents to use libraries in webpage and narrated artifacts](../../subtasks/060_ai-authoring-and-usage-plugin/020_artifact-consumption-skills.md)"
  - "[Wire plugin capabilities and distribution metadata](../../subtasks/060_ai-authoring-and-usage-plugin/030_plugin-manifests-tools-and-distribution.md)"
  - "[Provide deterministic playback, seeking and review controls](../../subtasks/080_narrated-and-interactive-experiences/020_playback-seeking-and-review.md)"
  - "[Synchronize optional sample narration with live components](../../subtasks/080_narrated-and-interactive-experiences/030_optional-audio-and-synchronization.md)"
  - "[Implement branch choices, history and replay behavior](../../subtasks/080_narrated-and-interactive-experiences/050_branch-navigation-and-history.md)"
  - "[Implement element actions for pointer, keyboard and touch](../../subtasks/080_narrated-and-interactive-experiences/070_element-actions-and-inputs.md)"
  - "[Synchronize charts, tables and inspectors through shared state](../../subtasks/080_narrated-and-interactive-experiences/080_shared-selection-and-linked-views.md)"
  - "[Load only required code and optimize artifact assets](../../subtasks/110_production-and-optimization/020_chunks-assets-and-load-strategy.md)"
---

Collection ownership and module ownership create independent commits. Runtime/browser workers use the same validated fixtures rather than waiting for every migration.

# 01 To Do

- [ ] Run six existing-library lanes: Default charts, tables/widgets, vectors/assets, motion/styles, Editorial and Storybook.
- [ ] Run up to three video-focused collection lanes: Motion Explainers, Data Stories and Story Scenes.
- [ ] Build gallery/inspector, examples/audio, playback/narration, branches, element events/shared selection, production assets and plugin guidance concurrently where dependencies allow.
- [ ] Queue lanes when the agent capacity is full; do not force artificial parallelism or duplicate shared behavior.

## Done when

Independent collection and runtime lanes deliver compatible components, examples and authoring guidance.

# 02 Status and Result

Scheduled behind the dependency named above. No complete stage outcome is claimed.

# 03 References

- [Plan overview](./overview.md)
- [Owner scope](../../notes/01_scope-and-boundaries.md)

# 04 Decisions

The owner authorized autonomous isolated-worktree execution with as much real parallelism as dependencies permit. Shared entrypoints and configuration have one integrator.

# 05 Notes & Analysis

Starts from the shared foundation; each lane owns bounded files and can merge as soon as its focused checks pass.
