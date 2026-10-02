---
title: "Inventory existing components and map their migration"
status: review
---

The existing catalog is large and mixes assets with executable behavior; a complete map prevents dropped elements and misleading parity claims.

# 01 To Do
- [x] **Capture the baseline.** Inventory all collections, categories, names, source paths, data contracts, assets, licenses and current validation failures.
- [x] **Classify conversion.** Identify what stays SVG/font/data, what needs a typed TSX wrapper and what requires behavioral migration.
- [x] **Define ownership lanes.** Map component families to independent migration batches and a shared reference/validation contract.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Do this work in the library repository, with independent preview proof before engine integration.
- Preserve existing public identities and provenance, or document any deliberate compatibility change through the standard.

## Done when
- Every manifested element appears in a migration map with an owner lane and expected output.
- Baseline failures and supported behaviors are recorded separately from migration regressions.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
The generated inventory accounts for every original manifested identity, source/category, owner lane, expected disposition and retained license metadata. The three migration maps distinguish typed replacements from native compatibility assets.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `scripts/artifacts/inventory.py`; `scripts/artifacts/generate.py`; `data/artifacts/inventory.json`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Filesystem inventory/generation cases and the 63-test native suite. The native compatibility suite also passed 63 tests.

Inventory disposition is coverage evidence, not proof that every native preset was rewritten or that all browser parity checks have finished. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Library contract](../../../../../../../../agent-knowledge-system-library/contracts/library.md)
- [Default Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/default-migration.md)
- [Editorial Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/editorial-migration.md)
- [Storybook Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/storybook-migration.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 02_shared tsx artifact elements.md](../../brainstorm/02_shared-tsx-artifact-elements.md)
- [Related idea: 05_libraries styles themes dependencies.md](../../brainstorm/05_libraries-styles-themes-dependencies.md)
- [Current library structure](../../../../../../../../agent-knowledge-system-library/README.md)
- [Default collection manifest](../../../../../../../../agent-knowledge-system-library/libraries/agentks-default/manifest.json)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Preserve the 2,753 original native identities. The current inventory adds four brand SVG marks (2,757 native entries); 49 original identities have explicit typed replacements. Passive assets need no bespoke TSX copy.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
A successful preview does not establish that every catalog declaration passes native validation; verify rather than assume.
