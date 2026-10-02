---
title: "Establish the TSX source layout and component index"
status: open
---

Nested component organization must remain discoverable and preserve stable public names as source files and build outputs evolve.

# 01 To Do
- [ ] **Lay out the source.** Apply the accepted TSX/shared-primitives structure inside the collection/component contract, with nested semantic categories.
- [ ] **Generate the index.** Connect source exports, descriptions, typed inputs, themes, assets and examples to stable element identities.
- [ ] **Update authoring tools.** Adapt catalog/manifests and importer/generator path resolution; document the transition and engine-compatibility boundary.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Do this work in the library repository, with independent preview proof before engine integration.
- Preserve existing public identities and provenance, or document any deliberate compatibility change through the standard.

## Done when
- A nested element resolves through its public identity to source, metadata and a browser build output.
- Importers/generators reproduce the index and assets without guessing paths or leaving unlisted elements.

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
Do not add unsupported TSX entries to an old manifest and describe them as engine-compatible; the standard must define the transition.
