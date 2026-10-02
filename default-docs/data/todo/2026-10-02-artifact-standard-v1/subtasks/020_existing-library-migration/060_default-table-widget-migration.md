---
title: "Migrate Default tables and widgets in an independent worktree"
status: review
---

Table/widget behavior can be converted and expanded while the chart lane implements its own modules.

# 01 To Do
- [x] **Own the table/widget lane.** Migrate Default table, account and device/widget behavior with clear element/source mapping.
- [x] **Reuse events.** Implement richer table formats against the frozen selection/filter interfaces and chart fixtures.
- [x] **Submit outputs.** Supply source/examples, local metadata and compatibility evidence; coordinate complete linked-view proof at convergence.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Branch from the merged contract/foundation checkpoint and follow its interfaces.
- Own only the assigned source/assets/examples and a local metadata fragment; the integrator owns catalogs, manifests, shared configuration and locks.

## Done when
- Existing table/widget consumers have a supported migration or compatibility path.
- Table examples work against typed chart/event fixtures before the real chart branch lands.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Typed data/compare/key-value grids and an exact-cent cash ledger support stable sorting/filtering/selection. Header groups now retain only genuine grouping, with singleton row spans; visible Inspect controls retain contextual accessible Select labels.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `libraries/agentks-default/components/tsx/tables/common/grid.tsx`; `libraries/agentks-default/components/tsx/tables/common/headers.tsx`; `libraries/agentks-default/components/tsx/tables/ledger/account-ledger.tsx`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Default table/grid-header/interactive cases and nested Editorial/Storybook ledger events. The native compatibility suite also passed 63 tests.

The ledger is not double-entry accounting. Retained HTML widgets are supported native assets, not newly rewritten TSX implementations. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Default Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/default-migration.md)
- [Components contract](../../../../../../../../agent-knowledge-system-library/contracts/components.md)
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
Use one shared row identity/event contract. Retain native HTML device/widget parameter/message compatibility; use integer cents for the cash-movement ledger.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Do not rewrite chart modules or shared event types to make linking work; that integration belongs to the common contract/coordinator.
