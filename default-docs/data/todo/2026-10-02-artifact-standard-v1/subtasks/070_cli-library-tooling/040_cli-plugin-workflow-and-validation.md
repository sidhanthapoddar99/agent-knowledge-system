---
title: "Validate the CLI-to-plugin discovery workflow"
status: blocked
---

The authoring and usage plugin must rely on real CLI capabilities that agents can discover and use reliably.

# 01 To Do
- [ ] **Connect the workflow.** Map plugin discovery/install/inspection steps to actual commands and help metadata.
- [ ] **Exercise agent scenarios.** Find an element, inspect it, install its collection and create a small artifact from its documented contract.
- [ ] **Record command evidence.** Check machine-readable payloads, failure behavior and relevant ctl results; update guidance with implemented command names.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Blocked on the external typed-artifact integration checkpoint; the native engine build and library standard are available.
- Use GitHub tag/revision-based selection; run engine checks through ctl when implementation is authorized.

## Done when
- The plugin/CLI workflow succeeds in a clean example project for webpage and narrated consumers.
- Help, examples, schemas and output agree; relevant command regression checks pass.

# 02 Status and Result

Blocked on the external engine's typed-library integration checkpoint and coordinated consumption of the accepted artifact contract. A usable native engine build already exists; library-first work does not implement the Rust CLI/client/SSG adapter. Native starter validation and repository-local catalog tooling are separate evidence, not proof that these typed integration work orders are complete. See [Library-first result](../../notes/02_library-first-result.md).

## Result
No typed-engine implementation claimed. Keep this work blocked for the engine owner; the contract/browser closures are ready as handoff inputs.

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
Do not write plugin instructions around speculative CLI verbs. This engine-dependent work remains blocked with its group.
