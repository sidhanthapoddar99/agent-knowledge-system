---
title: "Publish optimized static artifacts and verify the full flow"
status: blocked
---

The integrated feature is useful only when published outputs preserve data, interaction, narration and fast initial rendering.

# 01 To Do
- [ ] **Connect static output.** Produce initial HTML/SVG, needed browser chunks and complete fonts/data/audio/assets through the engine publishing path.
- [ ] **Exercise consumers.** Verify webpage, embed and narrated/branching artifacts, including installation/discovery and production audio behavior.
- [ ] **Record proof.** Run relevant ctl checks and browser tests for light/dark, mobile, reduced motion, loading, seek/replay and invalid inputs.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Blocked on the other agent's usable engine build and the independently proven library standard.
- Use ctl for engine checks and coordinate with the existing HTML/video issues instead of duplicating their work.

## Done when
- Published representative artifacts work without a development server and meet the accepted render/load contract.
- End-to-end evidence covers plain HTML compatibility, shared components, branches, audio and mobile interaction.

# 02 Status and Result

Blocked on the external engine's typed-library integration checkpoint and coordinated consumption of the accepted artifact contract. A usable native engine build already exists; library-first work does not implement the Rust CLI/client/SSG adapter. Native starter validation and repository-local catalog tooling are separate evidence, not proof that these typed integration work orders are complete. See [Library-first result](../../notes/02_library-first-result.md).

## Result
No typed-engine implementation claimed. Keep this work blocked for the engine owner; the contract/browser closures are ready as handoff inputs.

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
Do not infer static-site success from the library's Vite preview alone; the other engine build and production interfaces remain explicit dependencies.
