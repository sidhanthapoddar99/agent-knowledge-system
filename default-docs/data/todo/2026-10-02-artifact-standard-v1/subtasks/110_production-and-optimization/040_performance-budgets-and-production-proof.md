---
title: "Set load budgets and verify built library examples"
status: review
---

Performance claims need measurements on actual production outputs rather than a fast development server.

# 01 To Do
- [x] **Capture baselines.** Measure initial rendering, loading, interaction readiness and asset sizes for simple and rich examples.
- [x] **Agree budgets.** Record measured thresholds and optional-feature loading rules in the standard without inventing unapproved targets.
- [x] **Verify output.** Exercise built examples with fresh caches, limited/mobile loading, both themes and optional audio/branch paths.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Include mobile/touch support and build-time renderability in the standard.
- Prove production outputs independently before the engine adapter; honor existing engine bundle contracts when integration later occurs.

## Done when
- A reproducible measurement report compares initial and interactive readiness across representative built examples.
- Accepted budgets and focused regression checks cover the intended loading strategy; bottlenecks/limits are documented.

# 02 Status and Result

Reproducible production measurements now cover three digest-verified standalone cases with no-store headers/fresh resource URLs and a local 256 KiB/s per-response streaming limit. Each case has readable SVG/text before bootstrap, successful synchronous hydration, real selected IDs and zero observed errors. In this desktop Edge run, uncapped hydration upper bounds were 69.8/80.5/95.8 ms; limited bounds were 215.7/391.0/218.1 ms for quadrant/workbench/3D. Limited selection-event acknowledgements were 0.3/0.2/0.9 ms. First paint, hydration availability and selection-confirmed time are recorded separately; the latter includes wait before an actual click.

Byte ceilings pass for the preview entry and all 73 focused bootstraps. Shared fonts/cache boundaries, the developer catalog cost and optional module/audio loading are recorded in the production contract. Both probe self-tests, the full library gate and fresh-checkout plugin smoke pass. The measurement servers removed their temporary fixtures after capture. See [Library-first result](../../notes/02_library-first-result.md).

## Result
Submitted for owner review. These are local reproducible baselines; no universal phone/network speed or acoustic latency claim is made.

## Agent log
none

# 03 References
- [Library-first result](../../notes/02_library-first-result.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 02_shared tsx artifact elements.md](../../brainstorm/02_shared-tsx-artifact-elements.md)
- [Related idea: 03_interactive artifact kinds.md](../../brainstorm/03_interactive-artifact-kinds.md)
- [Related idea: 08_vite developer package.md](../../brainstorm/08_vite-developer-package.md)
- [Shared UI islands](../../../../../../../../agent-knowledge-system/apps/packages/agentks-ui/src/islands/registry.ts)
- [Library preview/build workflow](../../../../../../../../agent-knowledge-system-library/README.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Follow the accepted standard; record material local design choices and their reasons here when implementation starts.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Do not claim universal speed from one desktop run. Engine/static-publishing end-to-end proof belongs to the later integration work.
