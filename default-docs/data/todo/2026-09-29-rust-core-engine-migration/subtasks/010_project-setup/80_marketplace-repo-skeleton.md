---
title: "Marketplace repository skeleton — the Neuralabs Claude Code marketplace"
status: in-progress
---

The Neuralabs marketplace replaces the personal marketplace as the place to install agentks's AI plugins. It holds no plugin code: each entry points at a plugin folder in the main repository, so a skill changes in the same commit as the engine behaviour it describes. This leaf creates the marketplace file with the two agentks plugins. It goes live in step 2 of the launch, after the engine, client and default library work.

# 01 To Do
- [ ] **`.claude-plugin/marketplace.json`**, modelled on the personal marketplace's file (`~/.claude/plugins/marketplaces/sids-plugin-marketplace/.claude-plugin/marketplace.json`):
    ```json
    {
      "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
      "name": "neuralabs-plugin-marketplace",
      "description": "NeuraLabs plugins for Claude Code and Codex",
      "owner": { "name": "NeuraLabs", "email": "developer@neuralabs.org" },
      "plugins": [
        {
          "name": "agentks",
          "source": { "source": "git-subdir", "url": "https://github.com/NeuraLabsHQ/agent-knowledge-system.git", "path": "plugins/agentks" },
          "description": "..."
        },
        {
          "name": "agentks-library",
          "source": { "source": "git-subdir", "url": "https://github.com/NeuraLabsHQ/agent-knowledge-system.git", "path": "plugins/agentks-library" },
          "description": "..."
        }
      ]
    }
    ```
- [ ] **`README.md`**: how to add the marketplace in Claude Code and in Codex, and the list of plugins.
- [ ] **Validate the file** with Claude Code's plugin validator (`claude plugin validate` or the equivalent at the time of work) in a `check.yml` workflow.
- [ ] **Do not remove anything from the personal marketplace.** Its `agent-ks` entry is removed at the switch-over ([200/00 launch](../200_launch/00_overview.md)).

## Guardrails
- No plugin code in this repository.
- The two plugin folders do not exist with content until [130/00 AI plugins](../130_ai-plugins/00_overview.md); the entries may point at empty folders until then, but nobody is told to install them yet.

## Done when
- `marketplace.json` validates.
- Adding the marketplace from its local folder in Claude Code lists `agentks` and `agentks-library`.

# 02 Status and Result
In progress. The catalogues exist and are empty until the plugins are rewritten.

## Result
- `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`, both valid JSON with an empty plugin list, plus `README.md`, `AGENTS.md` (the two-catalogue sync checklist) and `LICENSE`. Commit `5c1b48d`.
- Left: the `agentks` and library-development plugin entries ([130/30](../130_ai-plugins/30_marketplace-listing.md)).

## Agent log
none

# 03 References
- **Where:** `/home/sid/projects/06_02_NeuraLabs/neuralabs-plugin-marketplace`.
- **Read first:** [04/02 AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md) sections 05 and 06; the personal marketplace file named above, whose `agent-ks` entry is the model.
- **Depends on:** [10](./10_create-neuralabshq-repos.md).
- **Unblocks:** [130/10](../130_ai-plugins/10_agentks-plugin-port.md) (installation testing), [130/30 marketplace listing](../130_ai-plugins/30_marketplace-listing.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the marketplace moves from the personal account to NeuraLabsHQ and serves all of Neuralabs; the personal marketplace keeps personal plugins.
- Decided (sidhantha, 2026-09-30): the marketplace goes live in step 2 of the launch.

# 05 Notes & Analysis
## Watch out
- A private marketplace and a private main repository need git credentials to install from. That is fine for testing; the launch makes both public.
