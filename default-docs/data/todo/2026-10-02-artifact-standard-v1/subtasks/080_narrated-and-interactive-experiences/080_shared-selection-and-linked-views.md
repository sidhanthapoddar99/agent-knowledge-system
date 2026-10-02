---
title: "Synchronize charts, tables and inspectors through shared state"
status: review
---

Linked visual views should respond to one selected item without maintaining inconsistent copies of the dataset or state.

# 01 To Do
- [x] **Implement the state boundary.** Separate local transient details from shared selections, filters and answers.
- [x] **Connect reusable views.** Synchronize chart, table and inspector events by stable data identity.
- [x] **Handle transitions.** Preserve or reset state across filtering, scene changes and artifact hosts according to the accepted contract.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Implement this capability in independent library examples before engine integration.
- Unify narrated timing, branching and element interaction in one group while keeping each capability's work order distinct.

## Done when
- Selecting a chart point highlights its table row and inspector; table/inspector actions update the chart consistently.
- Filtering/sorting and scene navigation follow documented retention rules without stale selections.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
One host-owned dataset/filter/selected ID links chart, table and inspector. Data identity survives sorting/seek/replay; filtered-out selection clears explicitly, while scene navigation follows documented retention rules.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `libraries/agentks-default/components/tsx/reference/examples/linked-reference.tsx`; `apps/packages/agentks-artifacts/src/core/state/reader.ts`; `apps/agentks-library-preview/src/modules/experiences`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Reference linked chart/table, filtered view, host focus/selection and branch-retention cases. The native compatibility suite also passed 63 tests.

Inspector/host actions use the declared selection owner. Final browser geometry/output closure remain production checks. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Components contract](../../../../../../../../agent-knowledge-system-library/contracts/components.md)
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
Views communicate through typed events/state rather than querying each other’s DOM or copying datasets.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Do not couple views through DOM selectors or duplicate data simply because they are mounted in different host wrappers.
