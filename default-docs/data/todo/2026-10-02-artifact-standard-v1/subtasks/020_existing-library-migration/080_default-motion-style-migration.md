---
title: "Migrate Default motion and presentation families in an independent worktree"
status: review
---

Motion/style/layout families have distinct files and can progress alongside vector, table and chart conversion.

# 01 To Do
- [x] **Own presentation sources.** Migrate Default motion, styles, layouts/slides, backgrounds and related font bindings.
- [x] **Use actor fixtures.** Implement bounded poses/gestures/transitions against fixed part/pivot and clock contracts.
- [x] **Submit family outputs.** Provide local metadata, both theme modes and reduced-motion/replay examples.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Branch from the merged contract/foundation checkpoint and follow its interfaces.
- Own only the assigned source/assets/examples and a local metadata fragment; the integrator owns catalogs, manifests, shared configuration and locks.

## Done when
- Presentation families preserve documented behavior through the standard's inputs and lifecycle.
- Fixtures demonstrate timing/pose reset without touching actor artwork, root themes or global build files.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Typed actor motion and three identity-preserving presets use bounded absolute-time sampling, explicit parts/pivots, held poses and reduced-motion policy. Native background/font/theme/style/layout/slide/presentation data remains reusable and mapped.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `libraries/agentks-default/components/tsx/motion/actors/model.ts`; `libraries/agentks-default/components/tsx/motion/actors/variants.tsx`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Default bounded motion, held-pose, backward-seek and native byte-parity cases. The native compatibility suite also passed 63 tests.

No TSX lifecycle implementation for every one of the 116 native presentation-lane entries is claimed. Those presets retain their existing compiler behavior. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Default Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/default-migration.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 02_shared tsx artifact elements.md](../../brainstorm/02_shared-tsx-artifact-elements.md)
- [Related idea: 05_libraries styles themes dependencies.md](../../brainstorm/05_libraries-styles-themes-dependencies.md)
- [Current library catalog](../../../../../../../../agent-knowledge-system-library/README.md)
- [Default manifest](../../../../../../../../agent-knowledge-system-library/libraries/agentks-default/manifest.json)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Confirmed native-retention/composition disposition replaces the draft implication of universal TSX rewriting. Passive backgrounds/fonts and native theme/presentation presets remain native for HTML/legacy compatibility; typed components compose migrated adapters and semantic styling.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Collection-local theme/source files may be owned here; shared theme adapters and contract roles remain integrator-owned.
