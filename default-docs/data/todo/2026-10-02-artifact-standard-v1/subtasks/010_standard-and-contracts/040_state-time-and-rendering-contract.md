---
title: "Define state, timestamped actions and rendering lifecycles"
status: review
---

A live narrated artifact must coordinate timed actions, reader interaction and initial rendering without hiding ambiguous state transitions.

# 01 To Do
- [x] **Model ownership.** Separate component/local state, shared reader choices and timeline/narration state; define events and scene/component lifecycle.
- [x] **Specify time semantics.** Define timestamped actions, pause/resume, seeking, replay, back navigation and branching-history behavior.
- [x] **Specify rendering.** Define initial HTML/SVG, hydration/attachment, responsive hosts and reduced-motion/touch equivalents.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Keep ordinary HTML artifacts supported alongside live narrated artifacts.
- Make pre-rendering and mobile/touch behavior part of the contract before migration depends on it.

## Done when
- Transition examples define the expected state after a timed action, a choice, backward seeking and replay.
- A server-rendered initial view and its interactive attachment contract are explicit and compatible with both artifact kinds.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
The pure runtime separates reconstructed timeline values from selection, filters and choice answers. Timestamp ties, seek/replay/history, epochs and outgoing work have defined state transitions; SSR and mount/hydrate/update/dispose have checked lifecycles.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `apps/packages/agentks-artifacts/src/core/model/types.ts`; `apps/packages/agentks-artifacts/src/core/state/reducer.ts`; `apps/packages/agentks-artifacts/src/render/mount.client.ts`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Core compile/playback/branch/clock and render attachment cases. The native compatibility suite also passed 63 tests.

Production host cleanup/network proof and engine adaptation remain separate from the pure contract tests. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Runtime contract](../../../../../../../../agent-knowledge-system-library/contracts/runtime.md)
- [Components contract](../../../../../../../../agent-knowledge-system-library/contracts/components.md)
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
Time is host-owned and absolute. Hover/focus is transient; only explicit reader effects and choices persist. Component initial rendering has no hidden clock/audio.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
A hover must not accidentally persist a narrative answer; build-time rendering needs a stable initial state rather than browser side effects.
