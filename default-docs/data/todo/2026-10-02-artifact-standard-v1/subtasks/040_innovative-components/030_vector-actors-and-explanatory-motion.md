---
title: "Build vector actors and reusable concept motion"
status: review
---

Computers, servers, books, accounts, birds, humans and trees can explain concepts through meaningful motion.

# 01 To Do
- [x] **Build reusable objects.** Supply SVG parts and TSX wrappers for the requested object families, using shared primitives and styles.
- [x] **Compose actions.** Implement useful poses, transitions and bounded gestures with declared pivots, timing and reset behavior.
- [x] **Explain a concept.** Ship technical and analogy scenes such as a server request or bird carrying a message, with reduced-motion states.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Make components reusable in webpage and narrated artifacts.
- Keep diagram-renderer development in its existing tracker component; use the supplied graph as a visual reference rather than a factual benchmark dataset.

## Done when
- Requested families have inspectable objects and documented parts/events/poses.
- The same actor/action works in an HTML example and narrated scene; replay/backward seeking restore the intended pose.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Computer/server/book/account/human/bird/tree/table actors support typed inspection and original request/message analogies. Shared finite part poses and bounded motion restore earlier state on seek; native artwork and SVG identity are preserved.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `libraries/agentks-motion-explainers/components/scenes/actors.tsx`; `libraries/agentks-default/components/tsx/motion/actors/model.ts`; `libraries/agentks-storybook/components/tsx/scenes/courier.tsx`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Motion actor input, native pivot/pose, courier/reverse-time and scene composition cases. The native compatibility suite also passed 63 tests.

This supports bounded explanation scenes, not a general film-animation editor or arbitrary untrusted vector inputs. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Default Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/default-migration.md)
- [Storybook Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/storybook-migration.md)
- [Story Scenes contract](../../../../../../../../agent-knowledge-system-library/contracts/story-scenes.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 06_charts and tables.md](../../brainstorm/06_charts-and-tables.md)
- [Related idea: 07_svg objects and motion.md](../../brainstorm/07_svg-objects-and-motion.md)
- [Default collection](../../../../../../../../agent-knowledge-system-library/libraries/agentks-default/README.md)
- [Existing component categories](../../../../../../../../agent-knowledge-system-library/libraries/agentks-default/components/README.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Explain concepts through reusable actors and absolute motion; keep the shared pose/math implementation in one place.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Keep imported provenance, SVG identity and containment rules intact; proper explanatory motion is the goal, not an unrestricted film-animation editor.
