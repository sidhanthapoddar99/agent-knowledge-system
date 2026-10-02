---
title: "Ship examples, fixtures and sample narration audio"
status: open
---

Working examples communicate the library's methodology better than static catalog descriptions alone.

# 01 To Do
- [ ] **Create representative examples.** Cover analytical charts/tables, technical and analogy scenes, element interaction and a branching narrated flow.
- [ ] **Package audio and assets.** Include bounded sample audio, fixtures, fonts/SVGs and provenance with documented paths.
- [ ] **Demonstrate optional audio.** Support deliberate playback and useful text/visual content when audio is disabled.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Ship a small Vite developer package with the library, usable before engine integration.
- Include examples and sample audio with the library; production voice generation remains separate.

## Done when
- The example set runs from a fresh library checkout and its built output resolves all required assets.
- Sample narration can be enabled deliberately; transcript/content and interactions remain usable without sound.

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
Do not depend on private production voice caches or commit generated end-user audio as if it were a library fixture.
