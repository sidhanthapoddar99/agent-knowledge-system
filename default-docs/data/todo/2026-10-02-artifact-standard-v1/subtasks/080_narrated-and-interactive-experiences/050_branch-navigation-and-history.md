---
title: "Implement branch choices, history and replay behavior"
status: review
---

A reader's choices must influence the explanation while supporting understandable back navigation and replay.

# 01 To Do
- [x] **Implement choice transitions.** Pause for a choice, evaluate the declared condition and enter the selected scene.
- [x] **Record history.** Apply the accepted answer-retention, back-navigation, revisit and reset rules.
- [x] **Coordinate timing.** Cancel outgoing actions/audio and initialize the chosen path with deterministic state.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Keep branching a separately defined capability within the live narrated artifact standard.
- Provide explicit choice/state behavior; the current linear player is not evidence that conditional paths already work.

## Done when
- Both branches, a rejoin and a later choice dependent on an earlier answer work as declared.
- Back/replay/reset behavior is demonstrated without stale actions, unexpected automatic choices or overlapping narration.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Explicit choices pause at their gate, retain answers through rejoin and use visit history for Back. Back rolls back that answer and descendants; replay retains exploration, while Reset returns to clean entry state.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `apps/packages/agentks-artifacts/src/core/state/reducer.ts`; `apps/packages/agentks-artifacts/src/core/state/reader.ts`; `apps/packages/agentks-artifacts/src/audio/binding.ts`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Both branch histories, rejoin eligibility, replay/reset, stale submissions and audio epoch cases. The native compatibility suite also passed 63 tests.

This is the library runtime/host contract, not evidence that the existing linear engine player gained branching. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Runtime contract](../../../../../../../../agent-knowledge-system-library/contracts/runtime.md)
- [Experiences contract](../../../../../../../../agent-knowledge-system-library/contracts/experiences.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 04_multipath narrated experiences.md](../../brainstorm/04_multipath-narrated-experiences.md)
- [Related idea: 03_interactive artifact kinds.md](../../brainstorm/03_interactive-artifact-kinds.md)
- [Current linear player data](../../../../../../../../agent-knowledge-system/apps/packages/agentks-video/src/data.ts)
- [Library preview entry](../../../../../../../../agent-knowledge-system-library/README.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Choice history is separate from time. Epochs cancel outgoing work; hover/focus never becomes a narrative answer.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Choice history and timeline position are separate data; a hover/focus event must not become a persistent narrative answer.
