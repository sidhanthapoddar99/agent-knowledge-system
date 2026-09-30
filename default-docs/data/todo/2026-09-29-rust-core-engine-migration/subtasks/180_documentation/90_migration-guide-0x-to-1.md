---
title: "Docs: the migration guide from agent-ks 0.x to agentks 1.0"
status: review
---

Every current user runs `agent-ks` 0.x: a framework folder cloned into their project, a `.env` with `CONFIG_DIR`, Bun, and the `agent-ks` CLI. Moving to 1.0 changes the command's name, the install, the project layout and parts of the content format. This leaf writes the one page set that walks them through it, and it is the only place in the new docs allowed to describe old formats. The final 0.x release's updater notice points here.

# 01 To Do
- [x] **`60_upgrading/01_overview.md`** — what changes and why in one screen: one install per machine, the `agentks` name, `config/` instead of `.env` and the framework folder, libraries, and that `agentks migrate` does the content changes.
- [x] **`02_from-agent-ks-0x.md`, step by step:**
    - [x] Install `agentks` with the one-line installer.
    - [x] In each project: run `agentks migrate` (detect, dry run, migrate, re-detect), which converts the content and config to 1.0 and bumps `engine_version`.
    - [x] Move the config: what happens to `.env`, `CONFIG_DIR`, `paths:` aliases, custom layouts (dropped: what to do instead), `theme_paths`.
    - [x] Add `config/dep.yaml` (required even when empty) — `migrate` creates it.
    - [x] Remove the old framework folder and its `node_modules`.
    - [x] Replace the `agent-ks` plugin with the `agentks` plugin from the Neuralabs marketplace.
    - [x] Check the result: `agentks check`, `agentks start`.
- [ ] **`03_staying-on-0x.md`** — who should wait (publishers until Phase 3 has shipped), pinning 0.x with mise, where the 0.x docs remain readable (the archived repository).
- [x] **`04_upgrading-within-1x.md`** — the version gate, `agentks migrate` for later format changes, reading the release notes.
- [x] **A command table** mapping every `agent-ks` command to its `agentks` form ([070/10](../070_cli/10_rename-to-agentks.md)).
- [ ] **Test the guide** on a copy of this repository's `default-docs/` and on one consumer-mode project (framework folder inside a user project), following only the page.

## Guardrails
- Group rules in [180/00 overview](./00_overview.md), except that this section may describe 0.x formats: that is its job.
- Every step is a command that was run on a real 0.x project while writing.

## Done when
- The section exists under `docs/data/user-guide/60_upgrading/` and renders.
- A fresh agent migrates a copy of this repository's `default-docs/` and a consumer-mode test project to 1.0 using only these pages, and both pass `agentks check` and render with `agentks start`.
- The final 0.x updater notice ([160/30](../160_distribution/30_final-0x-updater-notice.md)) links to the hosted URL of this section.

# 02 Status and Result
Review. The seven pages are written in `user-guide-2/60_upgrading/` and pass `agent-ks check section`; the 0.x mise pin and the test run are left, because both wait on work that has not landed (see Result).

## Result
Pages, written 2026-10-01 from the notes, the 140 subtasks and the wave-2 `config` and `cli` code:
- [Upgrading](../../../../user-guide-2/60_upgrading/01_overview.md): the two kinds of upgrade, a one-screen 0.x-to-1.0 comparison, the steps with a diagram, why the move is forced, the safety rails.
- [Upgrade a project from agent-ks 0.x](../../../../user-guide-2/60_upgrading/05_from-agent-ks-0x.md): a typical 0.x layout, install, commit, `migrate --dry-run`, `migrate`, the table of what the migration changes, reading blocking items and reports.
- [Finish the move](../../../../user-guide-2/60_upgrading/07_finish-the-move.md): replacing custom layouts (built-in layout plus CSS, or an artifact page), the `@root` meaning change, the checks, commit, removing the framework folder, swapping the plugin, removing `agent-ks` and its shell block.
- [What changes, setting by setting](../../../../user-guide-2/60_upgrading/10_what-changes.md): install, discovery, `.env`, `site.yaml`, new files, layouts, the plugin, and what stays the same (content format, the tracker's anatomy, navbar and footer, aliases).
- [Command changes](../../../../user-guide-2/60_upgrading/15_command-changes.md): renamed, changed, gone and new commands, checked against today's `agent-ks help` and the new binary's command table.
- [Staying on agent-ks 0.x](../../../../user-guide-2/60_upgrading/20_staying-on-0x.md): publishers wait until their agentks release can build; keeping a 0.x project running beside agentks; holding 0.x with `agent-ks update --pin` and no `./start update`; where the 0.x docs remain.
- [Upgrading between 1.x releases](../../../../user-guide-2/60_upgrading/25_within-1x.md): the floor, the migrate note from `update`, release notes, libraries outside the engine range, pinning one project with mise, a project newer than the binary.
- Not done: the 0.x mise pin (the CLI plus the framework checkout at a matching tag) is not worked out in [140/70](../140_versioning-and-migrations/70_mise-pinning.md), so the staying-on-0x page holds 0.x with its own updater instead. The test run on a copy of `default-docs/` and on a consumer-mode project waits on the 1.0.0 scripts ([140/30](../140_versioning-and-migrations/30_docs-migration-0x-to-1.md)) and the `migrate` CLI command ([140/20](../140_versioning-and-migrations/20_migrate-command.md)).
- To re-check when the 1.0.0 scripts land: whether `1.0.0_custom-layouts` switches sections itself or only reports them, whether a script rewrites `@root` values in `paths:`, whether themes move, and what `config/.env` the migration writes.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `docs/data/user-guide/60_upgrading/`.
- **Read first:**
  - [Versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md) — the gate, `agentks migrate`, the script contract, pinning with mise.
  - [Distribution and install](../../notes/05_delivery/04_distribution-and-install.md), section 05 — moving users over.
  - [Project config](../../notes/02_engine/02_project-config.md) — what each 0.x setting becomes.
  - Today's migration scripts and their README: [agent-ks-engine/migration](../../../../../../agent-ks-engine/migration/README.md); today's versioning pages: [user guide](../../../../user-guide/10_configuration/07_versioning.md).
- **Depends on:** [140/30 docs migration 0.x to 1](../140_versioning-and-migrations/30_docs-migration-0x-to-1.md), [140/20 migrate command](../140_versioning-and-migrations/20_migrate-command.md), [070/10 rename to agentks](../070_cli/10_rename-to-agentks.md).
- **Unblocks:** [160/30 final 0.x updater notice](../160_distribution/30_final-0x-updater-notice.md), [200/20 switch-over](../200_launch/20_switch-over.md).

# 04 Decisions
- Decided (claude, 2026-10-01): the step-by-step guide is split into running the migration (`05_from-agent-ks-0x.md`) and finishing the move (`07_finish-the-move.md`), and the setting-by-setting list gets its own page, so every page stays under 900 words.
- Decided (claude, 2026-10-01): the guide describes the 1.0.0 migration scripts by what the notes and 140/30 require them to do, not by file name, because the scripts are not written yet and their names are indicative.
- Decided (claude, 2026-10-01): the staying-on-0x page tells publishers that 1.0.0 cannot publish and to check their release's notes, because the notes decide that 1.0.0 has no `agentks build`, while the docs may go live with a later release that has it.
- Decided (sidhantha, 2026-09-29): migrations are forced; older versions are pinned with mise ([versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md)).
- Decided (sidhantha, 2026-09-30): the upgrade page is the one place in the docs that talks about old formats ([docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md)).
- Decided (claude, 2026-10-01): the command-changes page says the hosted docs that `agentks docs` opens go live at launch, after `agentks build` ships, and the staying-on-0x page names the last 0.x release pinned with mise for publishers.

# 05 Notes & Analysis

## Watch out
- Consumer mode (the framework folder inside a user's project, `CONFIG_DIR=../config`) and dogfood mode (this repository) look different on disk. Test both.
