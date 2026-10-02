---
title: "Define additional collection and style blueprints"
status: review
---

New libraries should have clear visual purposes and reusable boundaries instead of becoming copies of Agent KS Default.

# 01 To Do
- [x] **Describe the families.** Propose additional collection purposes and styles, distinguishing expansion of existing Editorial/Storybook families from genuinely new collections.
- [x] **Define conventions.** Specify typography, geometry, SVG treatment, motion language, target examples and shared versus local primitives.
- [x] **Review the blueprint.** Agree the families and coverage before bulk artwork/component creation.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Use the same public component contract across collections.
- Treat styles/themes as visual choices that can reuse behavior; do not fork interaction logic simply to change appearance.

## Done when
- Each selected collection has a named purpose, visual conventions and concrete webpage/narrated examples.
- Shared dependencies and collection-specific differences are explicit.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Motion Explainers, Data Stories and Story Scenes have distinct technical-flow, narrated-data and analogy/choice purposes. Their descriptors, family variables and examples make shared/local boundaries explicit.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `libraries/agentks-motion-explainers/artifact-library.json`; `libraries/agentks-data-stories/artifact-library.json`; `libraries/agentks-story-scenes/artifact-library.json`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Motion/Data Stories/Story Scenes defaults and both-family/host cases. The native compatibility suite also passed 63 tests.

The collection names/styles are implemented local choices under the approved contract, not outward release announcements. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Story Scenes contract](../../../../../../../../agent-knowledge-system-library/contracts/story-scenes.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 05_libraries styles themes dependencies.md](../../brainstorm/05_libraries-styles-themes-dependencies.md)
- [Current named collections](../../../../../../../../agent-knowledge-system-library/README.md)
- [Editorial collection](../../../../../../../../agent-knowledge-system-library/libraries/agentks-editorial/README.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Freeze meaningful collection purposes; keep Story Scenes narrative composition distinct from the existing Storybook artwork collection.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
A new name is not a new implementation requirement; reuse behavior and avoid creating duplicate registries.
