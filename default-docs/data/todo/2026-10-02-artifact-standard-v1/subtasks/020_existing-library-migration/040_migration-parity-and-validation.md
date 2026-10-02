---
title: "Verify migration parity and update the library guidance"
status: open
---

A migration is complete only when consumers, generated assets and documentation agree with the new contract.

# 01 To Do
- [ ] **Check coverage.** Verify the migrated index against the baseline map, including identity, assets, licenses and diagnostics.
- [ ] **Compare behavior.** Exercise light/dark, reduced motion, shared selection and timed/replayed states in independent examples.
- [ ] **Update guidance.** Revise library README/contracts/AGENTS and authoring checks with the implemented choices, recording compatibility and known limits.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Do this work in the library repository, with independent preview proof before engine integration.
- Preserve existing public identities and provenance, or document any deliberate compatibility change through the standard.

## Done when
- The full inventory has a documented supported/migrated disposition, with no unexplained missing names or assets.
- Relevant library checks and representative browser parity evidence are recorded; guidance describes implemented behavior.

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
Keep baseline diagnostics visible. New TSX validation must exist before an old JSON-only checker can be treated as proof of the new format.
