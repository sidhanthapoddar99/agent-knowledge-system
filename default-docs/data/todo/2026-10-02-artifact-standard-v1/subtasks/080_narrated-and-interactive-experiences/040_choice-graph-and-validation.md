---
title: "Define and validate the choice/scene graph"
status: open
---

Divergent explanations need stable scene identities and understandable conditions instead of hidden control flow.

# 01 To Do
- [ ] **Define the model.** Specify entry scenes, choices, conditions, outcomes, rejoining paths and retained answers using the standard's typed authoring API.
- [ ] **Validate references.** Diagnose missing scene/choice targets, unreachable or invalid paths and malformed conditions as defined by the contract.
- [ ] **Document examples.** Express a technical-versus-analogy branch and a later answer-dependent decision.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Keep branching a separately defined capability within the live narrated artifact standard.
- Provide explicit choice/state behavior; the current linear player is not evidence that conditional paths already work.

## Done when
- A typed example describes both paths and a shared rejoin with unambiguous identity and state.
- Invalid graph/condition examples return actionable diagnostics rather than silently choosing a route.

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
Choose a cycle/backtracking policy deliberately; do not assume every graph is a simple tree or forbid useful loops without a scoped reason.
