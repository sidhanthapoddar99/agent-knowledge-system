---
title: "Define state, timestamped actions and rendering lifecycles"
status: in-progress
---

A live narrated artifact must coordinate timed actions, reader interaction and initial rendering without hiding ambiguous state transitions.

# 01 To Do
- [ ] **Model ownership.** Separate component/local state, shared reader choices and timeline/narration state; define events and scene/component lifecycle.
- [ ] **Specify time semantics.** Define timestamped actions, pause/resume, seeking, replay, back navigation and branching-history behavior.
- [ ] **Specify rendering.** Define initial HTML/SVG, hydration/attachment, responsive hosts and reduced-motion/touch equivalents.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Keep ordinary HTML artifacts supported alongside live narrated artifacts.
- Make pre-rendering and mobile/touch behavior part of the contract before migration depends on it.

## Done when
- Transition examples define the expected state after a timed action, a choice, backward seeking and replay.
- A server-rendered initial view and its interactive attachment contract are explicit and compatible with both artifact kinds.

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
- [Related idea: 03_interactive artifact kinds.md](../../brainstorm/03_interactive-artifact-kinds.md)
- [Related idea: 11_distribution and engine integration.md](../../brainstorm/11_distribution-and-engine-integration.md)
- [Library catalog contract](../../../../../../../../agent-knowledge-system-library/AGENTS.md)
- [Engine package and rendering boundaries](../../../../../../../../agent-knowledge-system/AGENTS.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
A hover must not accidentally persist a narrative answer; build-time rendering needs a stable initial state rather than browser side effects.
