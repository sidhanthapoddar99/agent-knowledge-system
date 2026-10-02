---
title: "Inventory existing components and map their migration"
status: open
---

The existing catalog is large and mixes assets with executable behavior; a complete map prevents dropped elements and misleading parity claims.

# 01 To Do
- [ ] **Capture the baseline.** Inventory all collections, categories, names, source paths, data contracts, assets, licenses and current validation failures.
- [ ] **Classify conversion.** Identify what stays SVG/font/data, what needs a typed TSX wrapper and what requires behavioral migration.
- [ ] **Define ownership lanes.** Map component families to independent migration batches and a shared reference/validation contract.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Do this work in the library repository, with independent preview proof before engine integration.
- Preserve existing public identities and provenance, or document any deliberate compatibility change through the standard.

## Done when
- Every manifested element appears in a migration map with an owner lane and expected output.
- Baseline failures and supported behaviors are recorded separately from migration regressions.

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
- [Related idea: 05_libraries styles themes dependencies.md](../../brainstorm/05_libraries-styles-themes-dependencies.md)
- [Current library structure](../../../../../../../../agent-knowledge-system-library/README.md)
- [Default collection manifest](../../../../../../../../agent-knowledge-system-library/libraries/agentks-default/manifest.json)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
A successful preview does not establish that every catalog declaration passes native validation; verify rather than assume.
