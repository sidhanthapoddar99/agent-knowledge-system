---
title: "AI plugins — overview and rules for the group"
status: open
---

This group builds the AI-agent side of agentks: the two plugins (the `agentks` usage plugin, rewritten from today's `agent-ks` skills, and the smaller `agentks-library` plugin for library authors), their listing in the Neuralabs marketplace, and two later-stage ideas recorded so nothing blocks them: **extensions** (`agentksx` commands and site scripts) and **agent hooks and retrieval**. In agentks, a **plugin** always means an AI-agent plugin (a folder of skills with a manifest per agent), never a code extension. The plugins are rewritten against the real binary during launch step 1, and the marketplace goes live in step 2.

# 01 To Do
- [ ] **Work the leaves in this order.**

| Leaf | Status | When | Delivers |
|---|---|---|---|
| [130/10 agentks plugin port](./10_agentks-plugin-port.md) | open | launch step 1, as commands land | The ten skills renamed and rewritten; skills point at commands, not copies |
| [130/20 Library-development plugin](./20_library-dev-plugin.md) | open | launch step 1, after libraries | `agentks-library`: build, test, version and migrate a library |
| [130/30 Marketplace listing](./30_marketplace-listing.md) | open | launch step 2 | `NeuraLabsHQ/neuralabs-plugin-marketplace` lists both plugins; the personal marketplace entry is removed at the switch-over |
| [130/40 Extensions](./40_extensions.md) | open | later stage | The `agentksx` design, from what survives of the old plugin-system issue |
| [130/50 Agent hooks and retrieval](./50_agent-hooks-and-retrieval.md) | open | later stage | Hooks for Claude Code and Codex; one retrieval index shared with site search |

Order: 10 → 20 → 30. 40 and 50 wait until after 1.0.0.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where the work happens.** Plugins: the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, under `plugins/agentks/` and `plugins/agentks-library/`. The marketplace: `/home/sid/projects/06_02_NeuraLabs/neuralabs-plugin-marketplace` (`NeuraLabsHQ/neuralabs-plugin-marketplace`).

**Rules every leaf in this group follows**
- **The binary is the reference, not the skill.** A skill never copies a fact the installed binary can print (commands, flags, the CSS contract, library manifests); it names the command. This replaces today's inline copy of the theme variables in the artifacts skill.
- **Skills describe the current system only.** No history, no "before 1.0.0" asides. Format transitions belong to migrations ([AGENTS.md, skills are lean](../../../../../../AGENTS.md)).
- **Plain skill folders**, so Claude Code and Codex read the same files; one manifest per agent (`.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`).
- **Until the switch-over**, this repository's `agent-ks` plugin, docs and binary stay in use. Do not change or remove them from here; the switch happens at once ([200/00 launch](../200_launch/00_overview.md)).
- **Skills that delete outside the project** (`agentks cache clean`) tell the agent to run it only when the user asks, show the report, and wait for a yes.
- Writing follows the instruction-writing rules the user's plugins use: short sentences, one idea each, reasons given.

**Read first**
- [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md) — the design.
- [Extensions](../../notes/04_ecosystem/03_extensions.md), [library system](../../notes/04_ecosystem/01_library-system.md), [Rust CLI](../../notes/02_engine/05_rust-cli.md).
- Today's plugin: [plugins/agent-ks](../../../../../../plugins/agent-ks) and its [skills](../../../../../../plugins/agent-ks/skills).

**Depends on:** [070/00 CLI](../070_cli/00_overview.md), [120/00 libraries](../120_libraries/00_overview.md), [010/00 project setup](../010_project-setup/00_overview.md).
**Unblocks:** [180/95 skills update](../180_documentation/95_skills-update.md), [200/00 launch](../200_launch/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): two plugins in the main repository's `plugins/`; the marketplace moves to the NeuraLabsHQ organisation ([AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md)).
- Decided (sidhantha, 2026-09-29): the rename covers the plugin and the skills: `agent-ks` becomes `agentks`.
- Decided (sidhantha, 2026-09-29): hooks and fast retrieval for agents are a later stage.

# 05 Notes & Analysis
## Watch out
- The marketplace repository is `NeuraLabsHQ/neuralabs-plugin-marketplace` (renamed from the notes' earlier `plugin-marketplace` on 2026-09-30).
- All three repositories are private until the launch. A marketplace entry pointing at a private repository only installs for accounts with access; test installs with the owner's account, and make the repositories public as part of [200/00 launch](../200_launch/00_overview.md).
