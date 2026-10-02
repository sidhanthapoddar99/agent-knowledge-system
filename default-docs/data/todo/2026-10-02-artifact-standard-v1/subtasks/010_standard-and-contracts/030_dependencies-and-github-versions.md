---
title: "Specify library dependencies and GitHub version resolution"
status: in-progress
---

Reusable TSX imports need complete reproducible dependencies even when distribution uses GitHub tags rather than a package registry.

# 01 To Do
- [ ] **Specify source selection.** Define repository/collection paths, tag ranges, locked revisions, compatibility and catalog version behavior.
- [ ] **Define dependency closure.** Specify reusable code/assets across libraries, cycle/missing-version failures and where compilation occurs.
- [ ] **Document distribution.** Use GitHub tags/release notes, source links and a consumer build/cache model; define metadata that installation and discovery can inspect.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Keep ordinary HTML artifacts supported alongside live narrated artifacts.
- Make pre-rendering and mobile/touch behavior part of the contract before migration depends on it.

## Done when
- A two-library example can be resolved to a complete pinned dependency graph with documented error cases.
- GitHub-based installation/build behavior is specified without requiring a package-registry publication.

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
- [Related idea: 03_interactive artifact kinds.md](../../brainstorm/03_interactive-artifact-kinds.md)
- [Related idea: 11_distribution and engine integration.md](../../brainstorm/11_distribution-and-engine-integration.md)
- [Library catalog contract](../../../../../../../../agent-knowledge-system-library/AGENTS.md)
- [Engine package and rendering boundaries](../../../../../../../../agent-knowledge-system/AGENTS.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Current dependencies are flat. New transitive imports require a deliberate resolver/build contract; release tags do not themselves compile TSX.
