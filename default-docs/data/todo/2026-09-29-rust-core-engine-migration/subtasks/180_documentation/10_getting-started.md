---
title: "Docs: getting started"
status: review
---

The first section a new user reads. It takes them from nothing to a running project in a few minutes: install the binary, create a project from a template, start the viewer, find their way around the project folder, and connect an AI agent through the plugin. It replaces today's getting-started section, which assumes a cloned framework folder, `.env`, `CONFIG_DIR` and Bun, none of which a 1.0 user needs.

# 01 To Do
- [x] **`01_overview.md` — what agentks is.** One tool, installed once per machine, that turns a folder of markdown into a site you can read, edit and publish. The filesystem is the document; the site is one view of it. Who it is for: people and AI agents writing docs, trackers and artifacts together.
- [x] **`02_install.md`.** The one-line installers (`curl -fsSL https://agentks.neuralabs.org/install.sh | sh`, `irm https://agentks.neuralabs.org/install.ps1 | iex`); the GitHub release as the second source; `--version`, `--install-dir`, `--no-shell-setup`; automatic updates and how to pin or turn them off; what the binary needs (nothing, except Bun or Node for `agentks build` and migrations).
- [x] **`03_first-project.md`.** `agentks init` (default template `agentks-default`, default path `docs`), `agentks init --template <id or url> <path>`, `agentks start`, opening the browser, `agentks ps` and `agentks stop`, `agentks docs`.
- [x] **`04_project-folder.md`.** What `init` created: `config/` (`site.yaml`, `navbar.yaml`, `footer.yaml`, `dep.yaml`, `dep.lock`), the data sections, `assets/` folders beside pages. What lives in `~/.agentks` instead (build cache, libraries) and that none of it belongs in git.
- [x] **`05_using-with-ai.md`.** Installing the agentks plugin from the Neuralabs marketplace; what the skills do; the CLI as the agent's tool (`agentks issue …`, `agentks find`, `agentks check`); the rule that the AI writes most content and humans review and make small edits. Present tense only: every command named here exists in 1.0.
- [x] **`06_storage-and-footprint.md`.** One binary per machine; the build cache and library cache under `~/.agentks`; `agentks cache clean <root>` and `agentks cache reset`; that cleanup is always started by the user.
- [ ] **Run every command** on a clean machine (a container) while writing, and paste real output.

## Guardrails
- Follow the group rules in [180/00 overview](./00_overview.md): current system only, relative links, renders with the new engine.
- No mention of the framework checkout, `.env`, `CONFIG_DIR`, `agent-ks` or Astro. Those belong to the migration guide ([90](./90_migration-guide-0x-to-1.md)) only.

## Done when
- The pages exist under `docs/data/user-guide/05_getting-started/` and render with the new engine.
- A fresh agent in a clean container, given only these pages, installs agentks, creates a project and has the viewer running.

# 02 Status and Result
Review. All seven pages are written in `user-guide-2/05_getting-started/` and pass `agent-ks check section`; the commands were not run, because the assembled binary does not exist yet (see Result).

## Result
Pages, written 2026-10-01 from the notes and the wave-2 code (the `cli`, `config` and `server` worktrees):
- [Getting started](../../../../user-guide-2/05_getting-started/01_overview.md): what agentks is, the four-line quick start, a diagram of files, binary, browser and agent, and the page map.
- [Install and update agentks](../../../../user-guide-2/05_getting-started/05_install.md): the two install URLs and the GitHub source, what the installer does and needs, `--version` · `--install-dir` · `--no-shell-setup`, the runtimes some commands need, `shell-init`, `update` and its flags, pinning and turning automatic updates off.
- [Create your first project](../../../../user-guide-2/05_getting-started/10_first-project.md): `agentks init` and its flags, what `init` does step by step, starting the site, putting the project under git, `agentks docs`.
- [The project folder](../../../../user-guide-2/05_getting-started/15_project-folder.md): an example tree, the config files table, sections, assets, the machine home, what to commit.
- [Run the local server](../../../../user-guide-2/05_getting-started/20_local-server.md): `start` and its flags, stable ports and their order, `ps`, `stop`, `logs`, `doctor`, the common start-up errors.
- [Use agentks with AI agents](../../../../user-guide-2/05_getting-started/25_using-with-ai.md): the plugin install commands, the ten skills, the CLI conventions an agent relies on, the binary as the reference, where the agent stops and asks.
- [The machine home and cleanup](../../../../user-guide-2/05_getting-started/30_machine-home.md): `~/.agentks/` and `AGENTKS_HOME`, what each entry holds, `cache status`, `cache reset`, `cache clean`.
- Not done: the "run every command on a clean machine" item. The `cli` worktree's binary has no config discovery, `init`, `ps` or `start` yet, so only `shell-init` and `update --status` were run; error texts on the pages are taken from the code's message strings. Re-run every example when the wave merges.
- Open for the pages: the Codex install command, the `.env.example` and section folders the default template ships, and whether `init --template` also takes `owner/repo` and a local folder.

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
- Decided (claude, 2026-10-01): the pages use gap-spaced prefixes (`05_install` to `30_machine-home`) instead of the planned 02–06, because the docs skill requires gaps; the storage page is named after the notes' term, "the machine home".
- Decided (claude, 2026-10-01): start, stop, `ps`, `logs` and ports get their own page, `20_local-server.md`, because together they are too long for the first-project page. The running process is called "the local server" throughout, as the notes call it.
- Decided (claude, 2026-10-01): project discovery is documented as the code does it (`--config-dir`, `AGENTKS_CONFIG_FOLDER`, `./config`, no upward search), not as "the nearest `config/`", because the code is more precise than the plan.
- Decided (claude, 2026-10-01): `init --template` is documented as "a catalog id or a git URL", as the binary's help says, because `owner/repo` and local folders appear only in the notes' prose.
- Decided (sidhantha, 2026-09-30): `agentks init --template <url or id> <path>`, with `agentks-default` and `docs` as the defaults ([templates and init](../../notes/04_ecosystem/04_templates-and-init.md)).
- Decided (sidhantha, 2026-09-30): the install URL on agentks.neuralabs.org only redirects to the GitHub release ([deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md)).

# 05 Notes & Analysis

## Watch out
- The install URLs work only once hosting is live ([195/20](../195_hosting/20_build-and-deploy-pipeline.md)). Until then, test with the GitHub release URL and switch the page at launch.
