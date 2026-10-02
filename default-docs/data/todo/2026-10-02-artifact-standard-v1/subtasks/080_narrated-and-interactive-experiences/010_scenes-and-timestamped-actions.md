---
title: "Implement live scenes and timestamped component actions"
status: review
---

A narrated explanation needs a deterministic flow of scenes and component actions while retaining interactive elements.

# 01 To Do
- [x] **Build the scene host.** Compose shared TSX elements, layout and initial state using the accepted lifecycle contract.
- [x] **Implement timed actions.** Apply ordered actions at declared times, with clear invalid-target/time diagnostics and asynchronous readiness behavior.
- [x] **Demonstrate narration flow.** Provide a live technical/analogy example whose actions can be inspected and replayed.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Treat the experience as live slides/components with timestamped actions and narration, rather than rendered movie output.
- Prototype library-runtime/examples independently before engine/player integration.

## Done when
- A scene renders shared components and applies ordered actions at the intended timeline positions.
- Direct entry, replay and invalid-target examples produce deterministic states or useful diagnostics.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
The shared scene host composes real TSX definitions with initial values and ordered set/clear actions. Actions at zero, tied timestamps, invalid targets and scene readiness have explicit reconstruction semantics.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `apps/packages/agentks-artifacts/src/core/state/timeline.ts`; `apps/agentks-library-preview/src/modules/experiences/ExperienceDemo.tsx`; `libraries/agentks-default/examples/narrated`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Core compile/timestamp/boundary and real host initial/branch/replay cases. The native compatibility suite also passed 63 tests.

This is independently implemented library-runtime/preview behavior, not the Rust player/engine integration. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Runtime contract](../../../../../../../../agent-knowledge-system-library/contracts/runtime.md)
- [Experiences contract](../../../../../../../../agent-knowledge-system-library/contracts/experiences.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 03_interactive artifact kinds.md](../../brainstorm/03_interactive-artifact-kinds.md)
- [Related idea: 04_multipath narrated experiences.md](../../brainstorm/04_multipath-narrated-experiences.md)
- [Current player contract](../../../../../../../../agent-knowledge-system/apps/packages/agentks-video/README.md)
- [Library concept examples](../../../../../../../../agent-knowledge-system-library/preview/video/concepts.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Reconstruct from absolute scene time; do not replay side-effect handlers when seeking. New scenes enter paused so component/audio readiness is explicit.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Timed actions and reader events must share an explicit lifecycle without duplicating component implementations.
