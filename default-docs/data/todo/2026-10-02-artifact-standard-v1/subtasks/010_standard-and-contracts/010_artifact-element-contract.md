---
title: "Define artifact kinds and the shared component contract"
status: review
---

Authors need one usable element contract across normal webpages, embedded artifacts and live narrated scenes.

# 01 To Do
- [x] **Define artifact kinds.** Specify webpage and narrated hosts, component identity, typed inputs/events, assets, themes, initial state and supported host lifecycle.
- [x] **Define imports and metadata.** Specify how a named library element maps to TSX source, compiled browser entrypoints, documentation and serializable input descriptions.
- [x] **Document compatibility.** Cover existing HTML/SVG/widgets/JSON, unknown fields and invalid inputs; prepare the public contract for review.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Keep ordinary HTML artifacts supported alongside live narrated artifacts.
- Make pre-rendering and mobile/touch behavior part of the contract before migration depends on it.

## Done when
- A contract matrix covers all three hosting contexts and distinguishes source TSX from browser output.
- Example inputs and failures have precise meanings; existing HTML adoption and migration paths are documented.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
The contract separates webpage/embedded hosts from narrated hosts and source TSX from compiled browser files. Identity, validated inputs/events, assets, theme context, initial HTML and attachment are explicit.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `apps/packages/agentks-artifacts/src/types.ts`; `apps/packages/agentks-artifacts/src/render/definition.ts`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Catalog contract and reference rendering/attachment cases. The native compatibility suite also passed 63 tests.

Rust transport, installer and reader routes remain externally owned; executable metadata is not a sandbox or an engine compatibility claim. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Library contract](../../../../../../../../agent-knowledge-system-library/contracts/library.md)
- [Components contract](../../../../../../../../agent-knowledge-system-library/contracts/components.md)
- [Browser Build contract](../../../../../../../../agent-knowledge-system-library/contracts/browser-build.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 02_shared tsx artifact elements.md](../../brainstorm/02_shared-tsx-artifact-elements.md)
- [Related idea: 03_interactive artifact kinds.md](../../brainstorm/03_interactive-artifact-kinds.md)
- [Related idea: 11_distribution and engine integration.md](../../brainstorm/11_distribution-and-engine-integration.md)
- [Library catalog contract](../../../../../../../../agent-knowledge-system-library/AGENTS.md)
- [Engine package and rendering boundaries](../../../../../../../../agent-knowledge-system/AGENTS.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Use one Preact TSX definition in both artifact modes; keep JSON for finite discovery metadata and authored data.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
The tracker component, artifact kind and library element category are different concepts; do not overload one field to mean all three.
