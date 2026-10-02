---
title: "Register new libraries and ship representative examples"
status: review
---

A new library must be installable, discoverable and understandable to authors, beyond a folder of assets.

# 01 To Do
- [x] **Register the collection.** Populate catalog/index metadata, versions, compatibility, categories, dependencies and provenance.
- [x] **Ship examples.** Include standalone webpage and narrated demonstrations with documented inputs and source links.
- [x] **Verify discovery.** Exercise the preview and machine-readable index against the registered collection.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Use the same public component contract across collections.
- Treat styles/themes as visual choices that can reuse behavior; do not fork interaction logic simply to change appearance.

## Done when
- Every selected new collection appears in the catalog and developer gallery with resolvable dependencies.
- An author can locate a component's contract and run its example using the documented workflow.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Each new collection registers nested public definitions, complete examples and exact dependencies in the metadata catalog. The preview and focused-build workflow consume the same public collection/id identities.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: [libraries/agentks-motion-explainers/components/README.md](../../../../../../../../agent-knowledge-system-library/libraries/agentks-motion-explainers/components/README.md); [libraries/agentks-data-stories/components/README.md](../../../../../../../../agent-knowledge-system-library/libraries/agentks-data-stories/components/README.md); `libraries/agentks-story-scenes/components/examples`; `scripts/artifacts/generate.py`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Collection metadata/examples and metadata-only filesystem discovery cases. The native compatibility suite also passed 63 tests.

Local checkout discovery is proved. Remote installation, native CLI discovery and external publication remain deferred. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Library contract](../../../../../../../../agent-knowledge-system-library/contracts/library.md)
- [Browser Build contract](../../../../../../../../agent-knowledge-system-library/contracts/browser-build.md)
- [Story Scenes contract](../../../../../../../../agent-knowledge-system-library/contracts/story-scenes.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 05_libraries styles themes dependencies.md](../../brainstorm/05_libraries-styles-themes-dependencies.md)
- [Current named collections](../../../../../../../../agent-knowledge-system-library/README.md)
- [Editorial collection](../../../../../../../../agent-knowledge-system-library/libraries/agentks-editorial/README.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Discovery reads serializable declarations; executable code runs only for deliberate compilation/rendering.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Keep public names unique within a collection and record each imported asset's provenance and license.
