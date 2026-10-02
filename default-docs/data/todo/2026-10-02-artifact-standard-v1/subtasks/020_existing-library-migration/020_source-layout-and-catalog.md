---
title: "Establish the TSX source layout and component index"
status: review
---

Nested component organization must remain discoverable and preserve stable public names as source files and build outputs evolve.

# 01 To Do
- [x] **Lay out the source.** Apply the accepted TSX/shared-primitives structure inside the collection/component contract, with nested semantic categories.
- [x] **Generate the index.** Connect source exports, descriptions, typed inputs, themes, assets and examples to stable element identities.
- [x] **Update authoring tools.** Adapt catalog/manifests and importer/generator path resolution; document the transition and engine-compatibility boundary.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Do this work in the library repository, with independent preview proof before engine integration.
- Preserve existing public identities and provenance, or document any deliberate compatibility change through the standard.

## Done when
- A nested element resolves through its public identity to source, metadata and a browser build output.
- Importers/generators reproduce the index and assets without guessing paths or leaving unlisted elements.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Nested component registrations map stable collection-qualified identities to named source exports, schemas, examples and contained assets. Deterministic JSON metadata and a lazy registry are generated without executing TSX.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `scripts/artifacts/generate.py`; `scripts/artifacts/registrations.py`; `apps/packages/agentks-artifacts/src/catalog/source.ts`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Filesystem generation, containment, duplicate-key and metadata-only discovery cases. The native compatibility suite also passed 63 tests.

Current source discovery contains six collections and 73 executable definitions; production locators are being refreshed separately at the reviewed source checkpoint. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Library contract](../../../../../../../../agent-knowledge-system-library/contracts/library.md)
- [Browser Build contract](../../../../../../../../agent-knowledge-system-library/contracts/browser-build.md)
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
An element category describes meaning independently of its path under components/. Keep executable registrations separate from retained native manifests.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Do not add unsupported TSX entries to an old manifest and describe them as engine-compatible; the standard must define the transition.
