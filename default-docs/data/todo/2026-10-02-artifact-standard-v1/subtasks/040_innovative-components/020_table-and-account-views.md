---
title: "Build comparative, structured and account-style tables"
status: review
---

Tables are a primary interactive artifact surface and should coordinate with charts and inspectors.

# 01 To Do
- [x] **Define formats.** Supply comparison, structured row/column and account views with typed data and readable empty/error states.
- [x] **Implement behavior.** Add appropriate sorting/filtering/selection and semantic events without duplicating the source dataset.
- [x] **Demonstrate linking.** Connect a table, chart and inspector; provide responsive narrow-screen layouts and accessible navigation.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Make components reusable in webpage and narrated artifacts.
- Keep diagram-renderer development in its existing tracker component; use the supplied graph as a visual reference rather than a factual benchmark dataset.

## Done when
- Sorting/filtering preserve item identity and chart/table/inspector selection stays consistent.
- Both artifact hosts display the same table implementation, including empty data and mobile-width examples.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Comparison, structured grids and cash-account views share stable data IDs, controlled selection, filtering and sorting. Linked reference/narrated views share one dataset and inspector; empty rows stay readable and narrow tables scroll without dropping columns.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `libraries/agentks-default/components/tsx/tables/common/grid.tsx`; `libraries/agentks-default/components/tsx/reference/examples/linked-reference.tsx`; `apps/agentks-library-preview/src/modules/experiences`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Table/grid-header numeric sorting, empty/filtered cases and linked host-selection cases. The native compatibility suite also passed 63 tests.

Narrow-screen/device/browser geometry remains final production review; no essential table columns are silently hidden. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Default Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/default-migration.md)
- [Components contract](../../../../../../../../agent-knowledge-system-library/contracts/components.md)
- [Experiences contract](../../../../../../../../agent-knowledge-system-library/contracts/experiences.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 06_charts and tables.md](../../brainstorm/06_charts-and-tables.md)
- [Related idea: 07_svg objects and motion.md](../../brainstorm/07_svg-objects-and-motion.md)
- [Default collection](../../../../../../../../agent-knowledge-system-library/libraries/agentks-default/README.md)
- [Existing component categories](../../../../../../../../agent-knowledge-system-library/libraries/agentks-default/components/README.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Keep exact money/row identities while sorting a view; preserve meaningful header groups and expose native Inspect controls with contextual accessible names.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Choose between horizontal scrolling, stacked rows or simplified views according to the table's meaning; do not hide essential columns silently.
