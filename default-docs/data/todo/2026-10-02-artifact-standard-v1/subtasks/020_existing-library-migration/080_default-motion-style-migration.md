---
title: "Migrate Default motion and presentation families in an independent worktree"
status: open
---

Motion/style/layout families have distinct files and can progress alongside vector, table and chart conversion.

# 01 To Do
- [ ] **Own presentation sources.** Migrate Default motion, styles, layouts/slides, backgrounds and related font bindings.
- [ ] **Use actor fixtures.** Implement bounded poses/gestures/transitions against fixed part/pivot and clock contracts.
- [ ] **Submit family outputs.** Provide local metadata, both theme modes and reduced-motion/replay examples.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Branch from the merged contract/foundation checkpoint and follow its interfaces.
- Own only the assigned source/assets/examples and a local metadata fragment; the integrator owns catalogs, manifests, shared configuration and locks.

## Done when
- Presentation families preserve documented behavior through the standard's inputs and lifecycle.
- Fixtures demonstrate timing/pose reset without touching actor artwork, root themes or global build files.

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
Collection-local theme/source files may be owned here; shared theme adapters and contract roles remain integrator-owned.
