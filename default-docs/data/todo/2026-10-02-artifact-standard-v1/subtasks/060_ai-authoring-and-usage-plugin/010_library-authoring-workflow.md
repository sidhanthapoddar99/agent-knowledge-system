---
title: "Provide the library-building workflow and skills"
status: review
---

Agents need coherent instructions for creating TSX components, assets, themes and examples against the new standard.

# 01 To Do
- [x] **Extend the existing plugin.** Map capabilities to authoring, validation and release preparation rather than simply renaming its single skill.
- [x] **Teach the workflow.** Cover collection scaffolding, component APIs, dependency reuse, SVG/motion, examples and the Vite developer methodology.
- [x] **Validate instructions.** Link implemented commands/contracts, provide runnable examples and check plugin-local references.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Provide a whole plugin with distinct library-building and artifact-usage guidance.
- Keep plugin instructions self-contained within their plugin boundary, following the engine's skill-link checks.

## Done when
- A fresh agent following the plugin can create and validate a small library component/example without unstated project knowledge.
- Instruction/command references match the implemented standard and plugin-link checks pass.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
A standalone plugin now separates library authoring from artifact consumption and bundles a runnable miniature collection. A fresh independent forward run built message-progress, validated inputs/events, compiled page/narrated outputs and proved backward seeking/reduced motion.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: [plugins/agentks-artifact-library/skills/artifact-library-author/SKILL.md](../../../../../../../../agent-knowledge-system-library/plugins/agentks-artifact-library/skills/artifact-library-author/SKILL.md); `plugins/agentks-artifact-library/assets/mini-collection`.

Verified on 2026-10-03: Plugin structural/link suite: 7 tests; author forward fixture: 11 tests; retained compiled author capture rerun: 3 tests. Retained forward captures were rerun through ctl (7 tests, 67 assertions); they execute the emitted browser code.

The author fixture is review-only on commit ceebf58, not a new production collection. No personal plugin installation or outward publication occurred. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

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
Installed guidance is not a writable checkout or runtime installer. Use real ctl commands and contract readers; keep discovery metadata separate from execution.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
Load the instruction-writing and plugin-development guidance when implementing instruction files; do not duplicate outdated format rules.
