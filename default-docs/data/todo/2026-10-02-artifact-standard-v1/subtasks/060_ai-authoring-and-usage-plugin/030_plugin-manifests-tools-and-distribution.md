---
title: "Wire plugin capabilities and distribution metadata"
status: review
---

A whole plugin must install coherently and expose its workflows/tools through the supported agent surfaces.

# 01 To Do
- [x] **Wire entrypoints.** Update applicable plugin manifests, capability descriptions and references for authoring and consumption.
- [x] **Connect discovery tools.** Define how plugin workflows use the Rust CLI or other public interfaces without inventing unavailable commands.
- [x] **Prepare distribution.** Document installation/update and marketplace/repository references; validate the complete plugin before any publication.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Provide a whole plugin with distinct library-building and artifact-usage guidance.
- Keep plugin instructions self-contained within their plugin boundary, following the engine's skill-link checks.

## Done when
- The supported plugin surfaces expose the intended workflows and resolve every bundled reference.
- Install/update documentation and tool requirements match actual capabilities; relevant ctl/plugin checks pass.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Matching Claude/Codex manifests expose two self-contained skills, local reference/assets and GitHub repository metadata. Distribution guidance separates source dependencies, compiled browser roots and optional agent loading.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `plugins/agentks-artifact-library/.claude-plugin/plugin.json`; `plugins/agentks-artifact-library/.codex-plugin/plugin.json`; [plugins/agentks-artifact-library/references/distribution.md](../../../../../../../../agent-knowledge-system-library/plugins/agentks-artifact-library/references/distribution.md).

Verified on 2026-10-03: ctl test plugin: 7 structural/reference tests passed at source 7b2c057. Retained forward captures were rerun through ctl (7 tests, 67 assertions); they execute the emitted browser code.

Manifests and instructions are prepared and locally tested. No marketplace registration, tag, push, installation or release is claimed. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

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
Developer catalog commands are real ctl interfaces. Rust CLI integration remains deferred; loading/installation uses each receiving agent product’s supported flow.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
External marketplace registration or publication is a later release action. This work should prepare concrete metadata without claiming the plugin has already shipped.
