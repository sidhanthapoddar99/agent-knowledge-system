---
title: "Implement branch choices, history and replay behavior"
status: open
---

A reader's choices must influence the explanation while supporting understandable back navigation and replay.

# 01 To Do
- [ ] **Implement choice transitions.** Pause for a choice, evaluate the declared condition and enter the selected scene.
- [ ] **Record history.** Apply the accepted answer-retention, back-navigation, revisit and reset rules.
- [ ] **Coordinate timing.** Cancel outgoing actions/audio and initialize the chosen path with deterministic state.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Keep branching a separately defined capability within the live narrated artifact standard.
- Provide explicit choice/state behavior; the current linear player is not evidence that conditional paths already work.

## Done when
- Both branches, a rejoin and a later choice dependent on an earlier answer work as declared.
- Back/replay/reset behavior is demonstrated without stale actions, unexpected automatic choices or overlapping narration.

# 02 Status and Result
Scoped; implementation has not started.

## Result
No implementation result yet. Record the outcome and evidence here before moving to review.

## Agent log
none

# 03 References
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
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Choice history and timeline position are separate data; a hover/focus event must not become a persistent narrative answer.
