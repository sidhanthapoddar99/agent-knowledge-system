---
title: "Migrate existing component families with parallel ownership"
status: open
---

Migration can be divided among agents after the reference API is agreed, while keeping behavior and public interfaces consistent.

# 01 To Do
- [ ] **Assign bounded lanes.** Define independent chart/table/widget, SVG/object, motion/style and asset-wrapper batches with clear file ownership.
- [ ] **Convert behavior.** Implement existing families against the shared TSX API, reusing primitives and keeping vector/font assets in suitable native forms.
- [ ] **Supply proof.** Add a webpage and narrated usage example for each migrated behavior; reconcile shared changes through the contract owner.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Do this work in the library repository, with independent preview proof before engine integration.
- Preserve existing public identities and provenance, or document any deliberate compatibility change through the standard.

## Done when
- All mapped families are accounted for and expose the agreed inputs/events rather than competing APIs.
- Representative migrated behaviors work in both hosts, and shared files have explicit integration ownership.

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
This task scopes the multi-agent migration workflow; creating the work order does not launch agents. Preserve imported asset bytes unless a reviewed conversion needs a change.
