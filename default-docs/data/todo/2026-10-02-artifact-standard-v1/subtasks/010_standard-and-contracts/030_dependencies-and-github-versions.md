---
title: "Specify library dependencies and GitHub version resolution"
status: review
---

Reusable TSX imports need complete reproducible dependencies even when distribution uses GitHub tags rather than a package registry.

# 01 To Do
- [ ] **Specify source selection.** Define repository/collection paths, tag ranges, locked revisions, compatibility and catalog version behavior. The resolved repository/path/revision portion is defined; concrete remote tag/range and installed-cache policy remains with the deferred CLI work.
- [x] **Define dependency closure.** Specify reusable code/assets across libraries, cycle/missing-version failures and where compilation occurs.
- [x] **Document distribution.** Use GitHub tags/release notes, source links and a consumer build/cache model; define metadata that installation and discovery can inspect.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Keep ordinary HTML artifacts supported alongside live narrated artifacts.
- Make pre-rendering and mobile/touch behavior part of the contract before migration depends on it.

## Done when
- A two-library example can be resolved to a complete pinned dependency graph with documented error cases.
- GitHub-based installation/build behavior is specified without requiring a package-registry publication.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Collection descriptors declare exact resolved dependency versions. Dependency ordering rejects cycles, missing collections and incompatible versions; focused builds bind the selected collection closure to immutable Git source revisions.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `apps/packages/agentks-artifacts/src/catalog/dependencies.ts`; `scripts/artifacts/browser/source.ts`; `libraries/agentks-editorial/artifact-library.json`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Dependency topology/error and immutable build-index contract cases. The native compatibility suite also passed 63 tests.

A two-collection Default/Editorial dependency is declared and checked. This is not a working remote installer or a claim that range resolution has been implemented. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Library contract](../../../../../../../../agent-knowledge-system-library/contracts/library.md)
- [Browser Build contract](../../../../../../../../agent-knowledge-system-library/contracts/browser-build.md)
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
GitHub revisions/tags and release links distribute source/prebuilt outputs without an npm release. Remote tag/range selection and lock/cache writes belong to the deferred installer; discovery never fetches.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Current dependencies are flat. New transitive imports require a deliberate resolver/build contract; release tags do not themselves compile TSX.
