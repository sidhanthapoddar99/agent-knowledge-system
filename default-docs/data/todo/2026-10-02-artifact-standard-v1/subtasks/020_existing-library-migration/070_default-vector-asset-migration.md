---
title: "Migrate Default vector objects and assets in an independent worktree"
status: review
---

Native assets and actor wrappers can be migrated without waiting for analytical components or narrative playback.

# 01 To Do
- [x] **Own the vector lane.** Cover Default icons, illustrations, frames and annotations, plus the new explanatory actor work.
- [x] **Preserve assets.** Keep native SVG/font bytes where appropriate, expose typed wrappers/parts and retain provenance.
- [x] **Provide fixtures.** Ship deterministic object/part examples and local metadata for the motion/runtime lanes.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Branch from the merged contract/foundation checkpoint and follow its interfaces.
- Own only the assigned source/assets/examples and a local metadata fragment; the integrator owns catalogs, manifests, shared configuration and locks.

## Done when
- Mapped vectors retain identities/provenance and render in both artifact hosts.
- Actor-part fixtures satisfy the frozen API without requiring the complete narrated runtime.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Native vector/font/icon/frame/annotation assets remain catalogued with provenance. Typed wrappers bundle a small explicit actor set, preserve SVG bytes/parts/pivots, scope instance IDs and validate finite named-part poses.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `libraries/agentks-default/components/tsx/vectors/native/vector-actor.tsx`; `libraries/agentks-default/components/tsx/vectors/native/actor-sources.json`; `apps/packages/agentks-artifacts/src/render/vector.ts`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Default vector snapshot/finite pose/identity cases and preserved inventory tests. The native compatibility suite also passed 63 tests.

Only the documented actor set has typed pose wrappers; other native assets retain their direct/native compatibility path. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Default Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/default-migration.md)
- [Library contract](../../../../../../../../agent-knowledge-system-library/contracts/library.md)
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
Retain reusable native artwork instead of writing thousands of duplicate components. Arbitrary SVG markup/URLs are not reader inputs to the bundled actor adapter.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Backgrounds and presentation presets belong to the separate motion lane; avoid thousands of bespoke TSX copies for passive native glyph assets.
