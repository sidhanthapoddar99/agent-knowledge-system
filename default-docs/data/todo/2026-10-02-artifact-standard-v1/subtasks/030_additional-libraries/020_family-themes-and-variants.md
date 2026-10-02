---
title: "Implement themes and reusable component variants"
status: review
---

A collection can support several visual styles while preserving the same data and interaction semantics.

# 01 To Do
- [x] **Implement theme bundles.** Supply light/dark roles, typography and assets using the agreed theme contract.
- [x] **Build visual variants.** Apply family-specific geometry/artwork/motion to shared component primitives.
- [x] **Prove interchangeability.** Run the same dataset/scene through multiple selected styles.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Use the same public component contract across collections.
- Treat styles/themes as visual choices that can reuse behavior; do not fork interaction logic simply to change appearance.

## Done when
- A shared component demonstrates multiple visual-family variants with the same typed inputs and events.
- Both modes and reduced motion remain legible, with required fonts/assets resolved.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Scoped visual families apply different framing, palettes, type and motion treatment while reusing the same typed behavior: soft/blueprint, briefing/cinema, storyboard/cut-paper, paper/precise and rounded/cut-paper.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `libraries/agentks-motion-explainers/themes`; `libraries/agentks-data-stories/themes`; `libraries/agentks-story-scenes/themes`; `libraries/agentks-editorial/components/tsx/families`; `libraries/agentks-storybook/components/tsx/families`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Collection family/host/palette/reduced-motion and same-input cases. The native compatibility suite also passed 63 tests.

These scoped artifact variables are not automatically an engine project theme bundle. Final visual/device review is a production obligation. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Story Scenes contract](../../../../../../../../agent-knowledge-system-library/contracts/story-scenes.md)
- [Editorial Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/editorial-migration.md)
- [Storybook Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/storybook-migration.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 05_libraries styles themes dependencies.md](../../brainstorm/05_libraries-styles-themes-dependencies.md)
- [Current named collections](../../../../../../../../agent-knowledge-system-library/README.md)
- [Editorial collection](../../../../../../../../agent-knowledge-system-library/libraries/agentks-editorial/README.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Use shared semantic light/dark roles and two UI type sizes and weights 400/600; preserve family artwork/font choices without forking interaction state.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Do not hardcode colors or duplicate component state to achieve a style; reconcile theme-variable changes with the public contract.
