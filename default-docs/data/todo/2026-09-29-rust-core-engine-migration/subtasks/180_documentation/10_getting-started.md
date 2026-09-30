---
title: "Docs: getting started"
status: open
---

The first section a new user reads. It takes them from nothing to a running project in a few minutes: install the binary, create a project from a template, start the viewer, find their way around the project folder, and connect an AI agent through the plugin. It replaces today's getting-started section, which assumes a cloned framework folder, `.env`, `CONFIG_DIR` and Bun, none of which a 1.0 user needs.

# 01 To Do
- [ ] **`01_overview.md` — what agentks is.** One tool, installed once per machine, that turns a folder of markdown into a site you can read, edit and publish. The filesystem is the document; the site is one view of it. Who it is for: people and AI agents writing docs, trackers and artifacts together.
- [ ] **`02_install.md`.** The one-line installers (`curl -fsSL https://agentks.neuralabs.org/install.sh | sh`, `irm https://agentks.neuralabs.org/install.ps1 | iex`); the GitHub release as the second source; `--version`, `--install-dir`, `--no-shell-setup`; automatic updates and how to pin or turn them off; what the binary needs (nothing, except Bun or Node for `agentks build` and migrations).
- [ ] **`03_first-project.md`.** `agentks init` (default template `agentks-default`, default path `docs`), `agentks init --template <id or url> <path>`, `agentks start`, opening the browser, `agentks ps` and `agentks stop`, `agentks docs`.
- [ ] **`04_project-folder.md`.** What `init` created: `config/` (`site.yaml`, `navbar.yaml`, `footer.yaml`, `dep.yaml`, `dep.lock`), the data sections, `assets/` folders beside pages. What lives in `~/.agentks` instead (build cache, libraries) and that none of it belongs in git.
- [ ] **`05_using-with-ai.md`.** Installing the agentks plugin from the Neuralabs marketplace; what the skills do; the CLI as the agent's tool (`agentks issue …`, `agentks find`, `agentks check`); the rule that the AI writes most content and humans review and make small edits. Present tense only: every command named here exists in 1.0.
- [ ] **`06_storage-and-footprint.md`.** One binary per machine; the build cache and library cache under `~/.agentks`; `agentks cache clean <root>` and `agentks cache reset`; that cleanup is always started by the user.
- [ ] **Run every command** on a clean machine (a container) while writing, and paste real output.

## Guardrails
- Follow the group rules in [180/00 overview](./00_overview.md): current system only, relative links, renders with the new engine.
- No mention of the framework checkout, `.env`, `CONFIG_DIR`, `agent-ks` or Astro. Those belong to the migration guide ([90](./90_migration-guide-0x-to-1.md)) only.

## Done when
- The pages exist under `docs/data/user-guide/05_getting-started/` and render with the new engine.
- A fresh agent in a clean container, given only these pages, installs agentks, creates a project and has the viewer running.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `docs/data/user-guide/05_getting-started/`.
- **Read first:**
  - [Distribution and install](../../notes/05_delivery/04_distribution-and-install.md) — installers, updates, pinning.
  - [Templates and init](../../notes/04_ecosystem/04_templates-and-init.md) and [the Rust CLI](../../notes/02_engine/05_rust-cli.md).
  - [Project config](../../notes/02_engine/02_project-config.md) and [machine home and build cache](../../notes/02_engine/06_machine-home-and-build-cache.md).
  - [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md).
  - Today's pages for tone and coverage: [getting started](../../../../user-guide/05_getting-started) and [using with AI](../../../../user-guide/19_issues/09_using-with-ai.md).
  - Absorbed: [docs-phase-2 subtask 08, using with AI in present tense](../../../2026-04-19-docs-phase-2/subtasks/08_using-with-ai-present-tense.md).
- **Depends on:** [070/40 init template](../070_cli/40_init-template.md), [070/30 start and dev mode](../070_cli/30_start-and-dev-mode.md), [160/10 installer and release workflow](../160_distribution/10_installer-and-release-workflow.md), [130/10 agentks plugin port](../130_ai-plugins/10_agentks-plugin-port.md).
- **Unblocks:** [200/20 switch-over](../200_launch/20_switch-over.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): `agentks init --template <url or id> <path>`, with `agentks-default` and `docs` as the defaults ([templates and init](../../notes/04_ecosystem/04_templates-and-init.md)).
- Decided (sidhantha, 2026-09-30): the install URL on agentks.neuralabs.org only redirects to the GitHub release ([deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md)).

# 05 Notes & Analysis

## Watch out
- The install URLs work only once hosting is live ([195/20](../195_hosting/20_build-and-deploy-pipeline.md)). Until then, test with the GitHub release URL and switch the page at launch.
