---
title: "Teach agents to use libraries in webpage and narrated artifacts"
status: review
---

Using a library is different from building one, and the new artifact kinds need clear consumer instructions.

# 01 To Do
- [x] **Teach discovery and imports.** Show how to locate components, read inputs/events/dependencies and choose a visual family.
- [x] **Provide authoring paths.** Cover ordinary/embedded webpages and live narrated artifacts, with shared TSX elements, interactions and branching.
- [x] **Integrate the existing artifact guidance.** Choose canonical ownership so the broader agentks plugin and library plugin do not issue competing instructions.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Provide a whole plugin with distinct library-building and artifact-usage guidance.
- Keep plugin instructions self-contained within their plugin boundary, following the engine's skill-link checks.

## Done when
- An agent can build a webpage artifact and narrated example using the same discovered component.
- Consumer instructions explain compiled browser output, embedding, audio/interaction and mobile behavior with working examples.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
The consumption skill covers metadata discovery, complete validated defaults, whole prebuilt closure copying, plain HTML islands, shared events and host-owned narration/branching. The independent report preserved surrounding HTML and linked chart/table selection across narrated seeking.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: [plugins/agentks-artifact-library/skills/artifact-library-use/SKILL.md](../../../../../../../../agent-knowledge-system-library/plugins/agentks-artifact-library/skills/artifact-library-use/SKILL.md); [plugins/agentks-artifact-library/references/consumption.md](../../../../../../../../agent-knowledge-system-library/plugins/agentks-artifact-library/references/consumption.md); [plugins/agentks-artifact-library/references/narrated.md](../../../../../../../../agent-knowledge-system-library/plugins/agentks-artifact-library/references/narrated.md).

Verified on 2026-10-03: Consumer compiled-output forward run: 4 tests; combined retained author/consumer captures: 7 tests/67 assertions. Retained forward captures were rerun through ctl (7 tests, 67 assertions); they execute the emitted browser code.

No TSX directly in an HTML browser script or imaginary Rust command is taught. Final HTTP/visual review is separately recorded; silent/manual-time consumption is not an audio player implementation. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Implemented standalone library plugin](../../../../../../../../agent-knowledge-system-library/plugins/agentks-artifact-library/README.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 09_library authoring plugin.md](../../brainstorm/09_library-authoring-plugin.md)
- [Related idea: 10_cli ai library discovery.md](../../brainstorm/10_cli-ai-library-discovery.md)
- [Engine plugin context](../../../../../../../../agent-knowledge-system/plugins/agentks-library/README.md)
- [Existing engine library skill](../../../../../../../../agent-knowledge-system/plugins/agentks-library/skills/agentks-library/SKILL.md)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Host artifact workflows own destination/frontmatter; the library plugin owns component selection/wiring. Optional metadata inputs require reading defaults/validators instead of guessing.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Avoid treating the new narrated experience as a rendered movie or making every consumer adopt the source framework.
