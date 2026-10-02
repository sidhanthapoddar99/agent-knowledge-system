---
title: "Ship the Vite developer package and workflow"
status: open
---

Library developers need a repeatable local methodology for inspecting and extending components.

# 01 To Do
- [ ] **Scaffold the package.** Add the agreed Vite layout, dependencies, commands and public configuration in the library repository.
- [ ] **Document development.** Explain checkout/install/start/build, adding a component, using fixtures and producing a browser example.
- [ ] **Keep it independent.** Run against local library code without requiring a running engine or checkout-specific asset routes.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Ship a small Vite developer package with the library, usable before engine integration.
- Include examples and sample audio with the library; production voice generation remains separate.

## Done when
- A fresh checkout starts and builds the preview using documented commands.
- A developer can add a small component/example through the documented methodology and inspect its result.

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
The Vite gallery is developer tooling; it does not replace the engine standalone artifact writer or become a mandatory reader dependency.
