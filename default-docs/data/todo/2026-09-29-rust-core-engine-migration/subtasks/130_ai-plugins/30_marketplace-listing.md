---
title: "List both plugins in the Neuralabs marketplace"
status: open
---

Claude Code installs plugins from a **marketplace**: a repository whose `.claude-plugin/marketplace.json` lists plugins and where to fetch them. Today `agent-ks` is listed in the personal marketplace `sidhanthapoddar99/sids-plugin-marketplace`. This leaf sets up `NeuraLabsHQ/neuralabs-plugin-marketplace` for all of Neuralabs, lists `agentks` and `agentks-library` there (each pointing at the main repository's `plugins/<name>`), and, at the switch-over, removes the `agent-ks` entry from the personal marketplace so there is one place to install agentks skills from. This is launch step 2.

# 01 To Do
- [ ] **Scaffold the marketplace repository** at `/home/sid/projects/06_02_NeuraLabs/neuralabs-plugin-marketplace`:
    - [ ] `.claude-plugin/marketplace.json` with `name: neuralabs-plugin-marketplace`, a description, the owner (Neuralabs), and the plugin list.
    - [ ] `AGENTS.md` (only instruction file), `README.md` (how to add the marketplace and install each plugin), `LICENSE`.
- [ ] **Entries.** For each plugin, a `git-subdir` source: `url: https://github.com/NeuraLabsHQ/agent-knowledge-system.git`, `path: plugins/agentks` (and `plugins/agentks-library`), with description, category, tags, homepage (agentks.neuralabs.org) and repository.
- [ ] **Codex.** Check how Codex installs plugins from a repository today and document the command in the README; the plugin folders already carry `.codex-plugin/plugin.json`.
- [ ] **Validate** `marketplace.json` against the schema Claude Code publishes, and test `/plugin marketplace add NeuraLabsHQ/neuralabs-plugin-marketplace` then `/plugin install agentks@neuralabs-plugin-marketplace` on a clean machine or profile.
- [ ] **Push** to `origin`; the repository stays private until the launch makes the three repositories public.
- [ ] **At the switch-over** (part of [200/00 launch](../200_launch/00_overview.md)): remove the `agent-ks` entry from `sids-plugin-marketplace` and say in its README where agentks moved. This touches the personal marketplace, which is outside the three repositories Claude owns: prepare the change and ask sidhantha before pushing it.

## Guardrails
- The marketplace holds no plugin code; entries only point at the main repository, so a plugin changes in the same commit as the behaviour it describes.
- The personal marketplace keeps its other plugins untouched.

## Done when
- `marketplace.json` validates and both plugins install from the Neuralabs marketplace with the owner's account.
- After the switch-over, `agent-ks` is no longer listed in the personal marketplace.

# 02 Status and Result
Open. Not started. The empty private repository exists (created 2026-09-30, `origin` set, no commits).

## Result
None yet.

## Agent log
none

# 03 References
**Where:** `/home/sid/projects/06_02_NeuraLabs/neuralabs-plugin-marketplace` (`NeuraLabsHQ/neuralabs-plugin-marketplace`).

**Read first**
- [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md), sections 05 and 06.
- [Docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md) — step 2 and the switch-over.
- [Permissions and repositories](../../agent-memory/permissions-and-repositories.md).
- Today's personal marketplace entry for `agent-ks` uses a `git-subdir` source pointing at `plugins/agent-ks`; copy that shape.
- The rebrand issue's marketplace subtask: [80_marketplace-repo-update](../../../2026-04-26-project-rebrand/subtasks/80_marketplace-repo-update.md).

**Depends on:** [130/10 agentks plugin port](./10_agentks-plugin-port.md), [130/20 library-development plugin](./20_library-dev-plugin.md), [120/60 default library](../120_libraries/60_default-library-scaffold.md) (launch step 1 complete).
**Unblocks:** [200/00 launch](../200_launch/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the Claude Code marketplace moves to the NeuraLabsHQ organisation and serves all of Neuralabs; the personal marketplace stays for personal plugins ([AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md)).
- Decided (sidhantha, 2026-09-30): the marketplace goes live in launch step 2.
- Decided (claude, 2026-09-30): the repository is named `neuralabs-plugin-marketplace`, after its local folder and the organisation's `neuralabs-*` convention ([permissions and repositories](../../agent-memory/permissions-and-repositories.md)).

# 05 Notes & Analysis
## Watch out
- Other Neuralabs plugins (project-setup, instruction-writing, uvenv) may move here later. That is out of scope; do not move them without sidhantha.
