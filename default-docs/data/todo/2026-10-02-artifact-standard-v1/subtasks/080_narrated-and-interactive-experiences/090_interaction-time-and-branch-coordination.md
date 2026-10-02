---
title: "Coordinate reader actions, timeline and branch transitions"
status: review
---

A live narrated flow must let readers explore or choose without racing timed actions and narration.

# 01 To Do
- [x] **Coordinate exploration.** Apply the contract's pause/continue behavior for element interaction and explicit choices.
- [x] **Resolve transitions.** Cancel outgoing effects, prevent duplicate submissions and establish state for the target scene.
- [x] **Exercise sequences.** Cover repeated clicks/taps, hover while playing, pause/seek during exploration and returning from a branch.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Implement this capability in independent library examples before engine integration.
- Unify narrated timing, branching and element interaction in one group while keeping each capability's work order distinct.

## Done when
- Exploration and branch transitions produce the declared state with no duplicate actions or stale audio.
- The same interaction contracts work in a standalone/embedded webpage and a narrated host.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Explicit reader effects pause exploration by default, with opt-in continuing playback. Epoch checks suppress repeated/stale choice events; seek/navigation/unmount cancels outgoing clock/audio leases and restores documented reader state.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `apps/agentks-library-preview/src/modules/experiences/useExperience.client.ts`; `apps/packages/agentks-artifacts/src/core/state/reducer.ts`; `apps/packages/agentks-artifacts/src/audio/binding.ts`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Rapid duplicate host choices, transient hover, pause/seek/history and pending-audio cancellation cases. The native compatibility suite also passed 63 tests.

The same definitions attach in ordinary HTML and narrated hosts. Rust reader transport and production voice services remain separately blocked work. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

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
- [Related idea: 02_shared tsx artifact elements.md](../../brainstorm/02_shared-tsx-artifact-elements.md)
- [Existing player contract](../../../../../../../../agent-knowledge-system/apps/packages/agentks-video/README.md)
- [Library examples](../../../../../../../../agent-knowledge-system-library/README.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Keep conflict/retention policy in the shared host/runtime contract; timed actions never overwrite reader answers.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Record the intended conflict/retention policy in the standard before choosing local shortcuts; mobile taps and keyboard actions must remain equivalent.
