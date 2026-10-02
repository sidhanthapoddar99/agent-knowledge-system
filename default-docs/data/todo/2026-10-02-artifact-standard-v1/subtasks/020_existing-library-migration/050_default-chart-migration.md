---
title: "Migrate Default charts in an independent worktree"
status: review
---

The large Default collection can migrate analytical charts independently from tables, artwork and motion.

# 01 To Do
- [x] **Own the chart lane.** Convert existing Default chart behavior and its typed wrappers/examples, excluding the separately owned optional 3D subtree.
- [x] **Expand in the same lane.** Carry the richer line/scatter/quadrant chart work here so a second agent does not edit the same modules.
- [x] **Submit metadata and proof.** Provide local registration fragments and both host examples for integration into the canonical manifest.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Branch from the merged contract/foundation checkpoint and follow its interfaces.
- Own only the assigned source/assets/examples and a local metadata fragment; the integrator owns catalogs, manifests, shared configuration and locks.

## Done when
- Mapped existing chart names and the richer chart work use the frozen shared API.
- Chart examples and focused checks pass without editing another lane's source or canonical manifests.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
All 18 legacy Default chart presets have typed identity-preserving counterparts, with multi-line, time series, supplied bands, scatter trend and numeric quadrants. The later comparison workbench adds four synthetic metric tabs and linked exact-value views.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `libraries/agentks-default/components/tsx/charts/common/cartesian.tsx`; `libraries/agentks-default/components/tsx/charts/scatter`; `libraries/agentks-default/components/tsx/charts/workbench/index.tsx`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Default chart/domain/axis-extreme, workbench model/interaction and metadata cases. The native compatibility suite also passed 63 tests.

Old preset files remain valid for existing consumers; new typed inputs are deliberately documented rather than silently replacing the old compiler contract. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

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
Reuse shared numeric scales/frontier math; distinguish supplied bands/lines from computed fits and non-dominated frontier. All example values are synthetic.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Shared scales/primitives are foundation-owned. Request additions through the integrator instead of forking them.
