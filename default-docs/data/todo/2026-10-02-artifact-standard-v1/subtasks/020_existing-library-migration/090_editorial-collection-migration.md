---
title: "Migrate Editorial with its own collection worktree"
status: open
---

Editorial can migrate its books/accounts/paper/precise visual families independently of Default and Storybook.

# 01 To Do
- [ ] **Own Editorial sources.** Convert the collection's components, local themes and examples to the frozen TSX contract.
- [ ] **Reuse shared behavior.** Depend on published/frozen primitive interfaces or typed fixtures rather than duplicating chart/state logic.
- [ ] **Submit collection metadata.** Preserve names/assets/licenses and provide a fragment for canonical manifest generation.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Branch from the merged contract/foundation checkpoint and follow its interfaces.
- Own only the assigned source/assets/examples and a local metadata fragment; the integrator owns catalogs, manifests, shared configuration and locks.

## Done when
- Editorial examples and component contracts work independently in webpage and narrated hosts.
- The complete collection migration map and provenance are accounted for with focused proof.

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
- [Current library catalog](../../../../../../../../agent-knowledge-system-library/README.md)
- [Default manifest](../../../../../../../../agent-knowledge-system-library/libraries/agentks-default/manifest.json)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
The central Editorial manifest and root catalog are integration-owned; worker ownership covers its local component/theme/example subtree.
