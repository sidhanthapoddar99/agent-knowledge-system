---
title: "Ship the Vite developer package and workflow"
status: review
---

Library developers need a repeatable local methodology for inspecting and extending components.

# 01 To Do
- [x] **Scaffold the package.** Add the agreed Vite layout, dependencies, commands and public configuration in the library repository.
- [x] **Document development.** Explain checkout/install/start/build, adding a component, using fixtures and producing a browser example.
- [x] **Keep it independent.** Run against local library code without requiring a running engine or checkout-specific asset routes.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Ship a small Vite developer package with the library, usable before engine integration.
- Include examples and sample audio with the library; production voice generation remains separate.

## Done when
- A fresh checkout starts and builds the preview using documented commands.
- A developer can add a small component/example through the documented methodology and inspect its result.

# 02 Status and Result

Shipped the independent Vite developer package, persistent collection/category navigation, inspector input controls, shared light/dark and reduced-motion modes, packaged fixtures/audio and original brand marks. The final built browser proof and production byte measurements are recorded in [Library-first result](../../notes/02_library-first-result.md). Metadata-only CLI discovery and explicit native preview limitations preserve indexed assets without executing TSX during discovery.

## Result
Implementation submitted for review; the owner marks closure. No engine adapter or publication is claimed.

## Agent log
none

# 03 References
- [Library-first result](../../notes/02_library-first-result.md)
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
