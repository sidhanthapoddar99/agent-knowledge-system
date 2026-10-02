---
title: "Integrate webpage embeds and narrated interactions in the reader"
status: blocked
---

Readers need the shared components in ordinary/embedded HTML and live narrated flows through one consistent consumer contract.

# 01 To Do
- [ ] **Connect the hosts.** Integrate the agreed attach/runtime API with reader islands and standalone artifact shells.
- [ ] **Wire runtime behavior.** Connect timed actions, element events, branch state and production voice/audio ownership to the library contract.
- [ ] **Preserve compatibility.** Verify existing HTML and coordinate routes/player work with the two existing artifact issues.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Blocked on the other agent's usable engine build and the independently proven library standard.
- Use ctl for engine checks and coordinate with the existing HTML/video issues instead of duplicating their work.

## Done when
- Existing HTML still opens and an opted-in component works in embedded and standalone views.
- A live narrated flow supports actions, interaction and branching with the declared seek/replay/audio behavior.

# 02 Status and Result
Scoped; implementation has not started.

## Result
No implementation result yet. Record the outcome and evidence here before moving to review.

## Agent log
none

# 03 References
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 11_distribution and engine integration.md](../../brainstorm/11_distribution-and-engine-integration.md)
- [Related idea: 02_shared tsx artifact elements.md](../../brainstorm/02_shared-tsx-artifact-elements.md)
- [Related idea: 04_multipath narrated experiences.md](../../brainstorm/04_multipath-narrated-experiences.md)
- [Engine build and package contract](../../../../../../../../agent-knowledge-system/AGENTS.md)
- [Library crate](../../../../../../../../agent-knowledge-system/apps/agentks-engine/crates/library/README.md)
- [Render crate](../../../../../../../../agent-knowledge-system/apps/agentks-engine/crates/render/README.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Respect the project's HTML/library execution boundaries and lazy-loading rules; plugin/sample audio is not a substitute for production voice integration.
