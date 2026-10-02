---
title: "Build a reference TSX component and choose the authoring approach"
status: review
---

A concrete reference prevents teams from migrating components against incompatible framework or composition assumptions.

# 01 To Do
- [x] **Evaluate the stack.** Compare the proposed authoring approach with current Preact and the framework-free player, including SSR, bundle cost and plain HTML consumption.
- [x] **Build one reference.** Demonstrate a typed chart/table or SVG component in a webpage embed and narrated host using the same implementation.
- [x] **Define extension rules.** Document shared primitives, composition/variants, any useful inheritance and lifecycle behavior; record the selected approach before parallel migration.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Keep ordinary HTML artifacts supported alongside live narrated artifacts.
- Make pre-rendering and mobile/touch behavior part of the contract before migration depends on it.

## Done when
- One reference component works in both hosts and can be rendered initially without browser-only globals.
- The framework/composition recommendation has recorded tradeoffs and an agreed extension example.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
The synthetic logarithmic quadrant chart, linked comparison table and concept vector render initial markup without browser globals and attach in ordinary HTML or narrated contexts. Editorial and Storybook demonstrate extension by composition.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `libraries/agentks-default/components/tsx/reference/quadrant-chart.tsx`; `libraries/agentks-default/components/tsx/reference/examples/linked-reference.tsx`; `apps/packages/agentks-artifacts/src/render/mount.client.ts`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Reference rendering, real hydration/update/disposal and shared selection cases. The native compatibility suite also passed 63 tests.

Browser payload costs and final geometry are recorded by the production pass; no comparative benchmark of alternative UI frameworks is asserted. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
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
Retain Preact 11 for TSX/SSR and the framework-free time core; compose typed variants instead of subclassing views. This does not replace the existing engine player.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Mentioning React or TSX does not authorize silently replacing the current engine stack; the selected contract must account for its existing boundaries.
