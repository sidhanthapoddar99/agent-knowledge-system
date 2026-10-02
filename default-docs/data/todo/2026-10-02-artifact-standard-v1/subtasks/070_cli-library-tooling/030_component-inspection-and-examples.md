---
title: "Inspect component contracts, source and examples"
status: blocked
---

Finding an element is only useful when an agent can learn how to import it and supply correct inputs.

# 01 To Do
- [ ] **Inspect a component.** Expose inputs, events/state, themes, assets, dependencies, compatibility and supported artifact hosts.
- [ ] **Navigate its material.** Return source/document/example locations and focused usage snippets from the declared index.
- [ ] **Support cold pickup.** Provide bounded output that distinguishes unavailable information from real empty values.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Blocked on the other agent's usable engine build and the accepted library standard.
- Use GitHub tag/revision-based selection; run engine checks through ctl when implementation is authorized.

## Done when
- An agent can inspect a discovered component and follow its public usage example without broad repository scans.
- Unknown elements, incomplete metadata and unsupported host modes return clear diagnostics.

# 02 Status and Result
Scoped; implementation has not started.

## Result
No implementation result yet. Record the outcome and evidence here before moving to review.

## Agent log
none

# 03 References
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 10_cli ai library discovery.md](../../brainstorm/10_cli-ai-library-discovery.md)
- [Related idea: 11_distribution and engine integration.md](../../brainstorm/11_distribution-and-engine-integration.md)
- [Library crate](../../../../../../../../agent-knowledge-system/apps/agentks-engine/crates/library/README.md)
- [Engine CLI/build contract](../../../../../../../../agent-knowledge-system/AGENTS.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Keep the CLI output contract independent of folder depth and avoid inventing supported props or example paths.
