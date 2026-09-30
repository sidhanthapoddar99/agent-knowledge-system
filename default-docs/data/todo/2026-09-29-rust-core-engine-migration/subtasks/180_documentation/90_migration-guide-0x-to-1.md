---
title: "Docs: the migration guide from agent-ks 0.x to agentks 1.0"
status: open
---

Every current user runs `agent-ks` 0.x: a framework folder cloned into their project, a `.env` with `CONFIG_DIR`, Bun, and the `agent-ks` CLI. Moving to 1.0 changes the command's name, the install, the project layout and parts of the content format. This leaf writes the one page set that walks them through it, and it is the only place in the new docs allowed to describe old formats. The final 0.x release's updater notice points here.

# 01 To Do
- [ ] **`60_upgrading/01_overview.md`** — what changes and why in one screen: one install per machine, the `agentks` name, `config/` instead of `.env` and the framework folder, libraries, and that `agentks migrate` does the content changes.
- [ ] **`02_from-agent-ks-0x.md`, step by step:**
    - [ ] Install `agentks` with the one-line installer.
    - [ ] In each project: run `agentks migrate` (detect, dry run, migrate, re-detect), which converts the content and config to 1.0 and bumps `engine_version`.
    - [ ] Move the config: what happens to `.env`, `CONFIG_DIR`, `paths:` aliases, custom layouts (dropped: what to do instead), `theme_paths`.
    - [ ] Add `config/dep.yaml` (required even when empty) — `migrate` creates it.
    - [ ] Remove the old framework folder and its `node_modules`.
    - [ ] Replace the `agent-ks` plugin with the `agentks` plugin from the Neuralabs marketplace.
    - [ ] Check the result: `agentks check`, `agentks start`.
- [ ] **`03_staying-on-0x.md`** — who should wait (publishers until Phase 3 has shipped), pinning 0.x with mise, where the 0.x docs remain readable (the archived repository).
- [ ] **`04_upgrading-within-1x.md`** — the version gate, `agentks migrate` for later format changes, reading the release notes.
- [ ] **A command table** mapping every `agent-ks` command to its `agentks` form ([070/10](../070_cli/10_rename-to-agentks.md)).
- [ ] **Test the guide** on a copy of this repository's `default-docs/` and on one consumer-mode project (framework folder inside a user project), following only the page.

## Guardrails
- Group rules in [180/00 overview](./00_overview.md), except that this section may describe 0.x formats: that is its job.
- Every step is a command that was run on a real 0.x project while writing.

## Done when
- The section exists under `docs/data/user-guide/60_upgrading/` and renders.
- A fresh agent migrates a copy of this repository's `default-docs/` and a consumer-mode test project to 1.0 using only these pages, and both pass `agentks check` and render with `agentks start`.
- The final 0.x updater notice ([160/30](../160_distribution/30_final-0x-updater-notice.md)) links to the hosted URL of this section.

# 02 Status and Result
Open. Not started.

## Result
None yet.

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
- Decided (sidhantha, 2026-09-29): migrations are forced; older versions are pinned with mise ([versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md)).
- Decided (sidhantha, 2026-09-30): the upgrade page is the one place in the docs that talks about old formats ([docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md)).

# 05 Notes & Analysis

## Watch out
- Consumer mode (the framework folder inside a user's project, `CONFIG_DIR=../config`) and dogfood mode (this repository) look different on disk. Test both.
