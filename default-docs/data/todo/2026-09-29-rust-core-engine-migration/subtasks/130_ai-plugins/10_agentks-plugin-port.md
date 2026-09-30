---
title: "Port the agentks usage plugin: rename and rewrite the ten skills"
status: open
---

Today's `agent-ks` plugin teaches agents to operate an agent-knowledge-system project through ten skills. After the migration the tool is `agentks`, a project is just a folder with `config/`, custom layouts are gone, libraries exist, and the binary can print its own CSS contract and command catalog. This leaf builds `plugins/agentks/` in the new main repository: every skill renamed to `agentks-…` and rewritten for 1.0.0, pointing at commands instead of copying facts. It also keeps the engine's bundled issue guide in step with the issues skill.

# 01 To Do
- [ ] **Create the plugin folder** `plugins/agentks/` with `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` (name `agentks`, version `1.0.0`, the new homepage and repository `https://github.com/NeuraLabsHQ/agent-knowledge-system`), `README.md`, `LICENSE`.
- [ ] **Port each skill** (read today's skill in full, then write the new one; never copy unchanged):
    - [ ] `agentks-config` — no framework folder and no `CONFIG_DIR`; a project is a folder with `config/`; new projects through `agentks init --template`; `dep.yaml` and `dep.lock` join the config files; branding is CSS starting from `agentks theme css`; migrations through `agentks migrate`. Drop the custom-layout references and the starter template copy (templates now live in the library repository).
    - [ ] `agentks-docs` — markdown stays plain: `[text](path)` links and `[[path]]` embeds, both relative; no library names in markdown.
    - [ ] `agentks-blog` — the rename, plus any blog layout change from [100/20](../100_layouts/20_blog-layouts.md).
    - [ ] `agentks-issues`, `agentks-issue-logs`, `agentks-qna`, `agentks-quick-idea-note`, `agentks-index-check` — the rename and the new CLI name in every example. The tracker anatomy does not change.
    - [ ] `agentks-artifacts` — run `agentks library find <words> --json` and `agentks library show <alias>` before building an icon, frame or artifact from scratch; load elements through `/_lib/<alias>/<element>`; library HTML is sandboxed; a library script runs with the artifact's rights; the path-prefix rule from [120/50](../120_libraries/50_lib-route-and-sandbox.md). **Delete the inline copy of the theme variables**; point at `agentks theme tokens --json` and `agentks theme css`.
        - [ ] Explain how to get a theme-coloured library icon: a CSS mask or an inline SVG, because an icon loaded through `<img>` draws black. Explain the `agentks:element:theme` message, which passes the mode and the theme values to a library frame ([library system](../../notes/04_ecosystem/01_library-system.md), section 13). The default library's README already shows both.
    - [ ] `agentks-cli` — the new command surface: `library`, `install`, `cache`, `init --template`, `build`, `migrate`, `docs`, `shell-init`, `share`. Point at `agentks help <command> --json` for flags.
- [ ] **Point at the hosted docs** (agentks.neuralabs.org/docs, one link per page) instead of the bundled user guide, since no framework checkout exists on the machine any more. Until the site is live (launch step 5), link to the docs' source files in the main repository and replace the links at step 5.
- [ ] **The issue guide twin.** The engine's short issue-anatomy guide (today [guide.ts](../../../../../../agent-ks-engine/src/layouts/issues/default/guide.ts)) and `agentks-issues` must stay in step. Add a check in the main repository's gate that fails when the guide's section list and the skill's section table disagree.
- [ ] **Commands folder parity.** Keep every slash command a skill folder, so Codex reads it too.
- [ ] **Skill checks.** Port `check skill-links` as a development script in the main repository (it leaves the binary, per the [Rust CLI note](../../notes/02_engine/05_rust-cli.md) section 06) and run it in the gate.
- [ ] **Evaluate.** Run each rewritten skill on a real task in a test project (write a doc, add an issue, build an artifact with a library icon, configure a theme) with the new binary; fix what the agent got wrong. Record the runs in the result.

## Guardrails
- A skill never holds a fact the binary prints; it names the command.
- No history in skills. No "in 0.x this was…".
- Do not touch this repository's `plugins/agent-ks/` — it stays in use until the switch-over.

## Done when
- `plugins/agentks/` holds ten skills named `agentks-…`, each with a rewritten `SKILL.md` and references.
- `grep -r "agent-ks" plugins/agentks` finds nothing except deliberate mentions in migration notes (there should be none).
- The skill-link check and the guide-parity check pass in the gate.
- The evaluation runs in a test project succeed with the new binary.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `plugins/agentks/`.

**Read first**
- [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md), sections 02–04 and 06.
- Today's skills, all ten: [plugins/agent-ks/skills](../../../../../../plugins/agent-ks/skills); manifests: [Claude Code](../../../../../../plugins/agent-ks/.claude-plugin/plugin.json), [Codex](../../../../../../plugins/agent-ks/.codex-plugin/plugin.json).
- [Rust CLI](../../notes/02_engine/05_rust-cli.md) — the command surface the skills describe.
- [Theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) — `theme css`, `theme tokens`, `theme eject`.
- [This repository's AGENTS.md](../../../../../../AGENTS.md) — the coupling between the theme contract and the artifacts skill that this leaf removes.

**Depends on:** [070/00 CLI](../070_cli/00_overview.md) (commands must exist to be described), [120/40 library commands](../120_libraries/40_library-commands-and-tui.md), [120/70 icons](../120_libraries/70_elements-icons.md).
**Unblocks:** [130/30 marketplace listing](./30_marketplace-listing.md), [180/95 skills update](../180_documentation/95_skills-update.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): a skill teaches how to override CSS and points to the CLI command that prints the compiled CSS ([AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md)).
- Decided (sidhantha, 2026-09-30): the skills for the new version are ready before the switch; this repository's skills stay in use until then.
- Decided (claude, 2026-09-30): skills never copy facts the binary can print (same note).

# 05 Notes & Analysis
## Watch out
- The artifacts skill today has an inline variable contract that `AGENTS.md` says must be mirrored "byte-identically" into the installed cache. That coupling ends here; make sure nothing in the new repository recreates it.
- A video skill joins the plugin when video pages ship; it is owned by the video issue, not this leaf.
