---
title: "Verify migration parity and update the library guidance"
status: review
---

A migration is complete only when consumers, generated assets and documentation agree with the new contract.

# 01 To Do
- [x] **Check coverage.** Verify the migrated index against the baseline map, including identity, assets, licenses and diagnostics.
- [x] **Compare behavior.** Exercise light/dark, reduced motion, shared selection and timed/replayed states in independent examples.
- [x] **Update guidance.** Revise library README/contracts/AGENTS and authoring checks with the implemented choices, recording compatibility and known limits.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Do this work in the library repository, with independent preview proof before engine integration.
- Preserve existing public identities and provenance, or document any deliberate compatibility change through the standard.

## Done when
- The full inventory has a documented supported/migrated disposition, with no unexplained missing names or assets.
- Relevant library checks and representative browser parity evidence are recorded; guidance describes implemented behavior.

# 02 Status and Result

Final inventory, typed replacement maps, all 73 focused browser closures and built gallery/HTML/mobile parity pass. All original native identities are preserved; explicit retained assets remain native. See [Library-first result](../../notes/02_library-first-result.md).

## Result
Submitted for owner review.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
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
Use separate evidence for inventory coverage, source behavior and final browser output; a source preview alone does not close migration parity.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Keep baseline diagnostics visible. New TSX validation must exist before an old JSON-only checker can be treated as proof of the new format.
