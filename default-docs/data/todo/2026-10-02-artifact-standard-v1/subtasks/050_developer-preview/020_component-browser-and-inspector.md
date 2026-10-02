---
title: "Build the gallery and component inspector"
status: open
---

Authors should be able to find a component and understand its inputs, behavior and visual variants.

# 01 To Do
- [ ] **Browse the catalog.** Filter by collection, category, tags and style; show SVGs/icons and runtime examples.
- [ ] **Inspect contracts.** Display typed inputs, events, dependencies, source and usage examples; provide input/state controls.
- [ ] **Compare contexts.** Offer webpage/narrated, light/dark, responsive and reduced-motion views.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Ship a small Vite developer package with the library, usable before engine integration.
- Include examples and sample audio with the library; production voice generation remains separate.

## Done when
- Every indexed element is discoverable, with a clear preview or explicit preview limitation.
- Representative components expose their contract and react to inspector controls across the documented host modes.

# 02 Status and Result
Scoped; implementation has not started.

## Result
No implementation result yet. Record the outcome and evidence here before moving to review.

## Agent log
none

# 03 References
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 08_vite developer package.md](../../brainstorm/08_vite-developer-package.md)
- [Library development entry](../../../../../../../../agent-knowledge-system-library/README.md)
- [Current preview examples](../../../../../../../../agent-knowledge-system-library/preview/video/concepts.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
A gallery snapshot is not proof of all component states; surface diagnostics and do not silently skip broken entries.
