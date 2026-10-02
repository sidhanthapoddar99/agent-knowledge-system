---
title: "Define and validate the choice/scene graph"
status: review
---

Divergent explanations need stable scene identities and understandable conditions instead of hidden control flow.

# 01 To Do
- [x] **Define the model.** Specify entry scenes, choices, conditions, outcomes, rejoining paths and retained answers using the standard's typed authoring API.
- [x] **Validate references.** Diagnose missing scene/choice targets, unreachable or invalid paths and malformed conditions as defined by the contract.
- [x] **Document examples.** Express a technical-versus-analogy branch and a later answer-dependent decision.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Keep branching a separately defined capability within the live narrated artifact standard.
- Provide explicit choice/state behavior; the current linear player is not evidence that conditional paths already work.

## Done when
- A typed example describes both paths and a shared rejoin with unambiguous identity and state.
- Invalid graph/condition examples return actionable diagnostics rather than silently choosing a route.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Typed graph compilation validates entry/scene/choice IDs, targets, reachability, conditions, finite values and ambiguous navigation. Technical/analogy paths rejoin and a later option depends on an earlier answer.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `apps/packages/agentks-artifacts/src/core/model/compile.ts`; `apps/packages/agentks-artifacts/src/core/model/conditions.ts`; `apps/packages/agentks-artifacts/tests/core/fixtures.ts`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Core compile error matrix and both branch/rejoin/answer-condition cases. The native compatibility suite also passed 63 tests.

Graph validation reads declarations and does not execute component code or supply engine/player adapters. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Runtime contract](../../../../../../../../agent-knowledge-system-library/contracts/runtime.md)
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
Allow explicit cycles without automatic graph traversal; refuse invalid/no-eligible choices instead of inventing a route.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Choose a cycle/backtracking policy deliberately; do not assume every graph is a simple tree or forbid useful loops without a scoped reason.
