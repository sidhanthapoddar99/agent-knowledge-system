---
title: "Migrate Default vector objects and assets in an independent worktree"
status: open
---

Native assets and actor wrappers can be migrated without waiting for analytical components or narrative playback.

# 01 To Do
- [ ] **Own the vector lane.** Cover Default icons, illustrations, frames and annotations, plus the new explanatory actor work.
- [ ] **Preserve assets.** Keep native SVG/font bytes where appropriate, expose typed wrappers/parts and retain provenance.
- [ ] **Provide fixtures.** Ship deterministic object/part examples and local metadata for the motion/runtime lanes.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Branch from the merged contract/foundation checkpoint and follow its interfaces.
- Own only the assigned source/assets/examples and a local metadata fragment; the integrator owns catalogs, manifests, shared configuration and locks.

## Done when
- Mapped vectors retain identities/provenance and render in both artifact hosts.
- Actor-part fixtures satisfy the frozen API without requiring the complete narrated runtime.

# 02 Status and Result
Scoped; implementation has not started.

## Result
No implementation result yet. Record the outcome and evidence here before moving to review.

## Agent log
none

# 03 References
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
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Backgrounds and presentation presets belong to the separate motion lane; avoid thousands of bespoke TSX copies for passive native glyph assets.
