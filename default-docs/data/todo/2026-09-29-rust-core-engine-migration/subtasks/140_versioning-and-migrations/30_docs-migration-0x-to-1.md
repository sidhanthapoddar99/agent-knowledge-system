---
title: "Docs migration: bring every 0.x project to 1.0.0"
status: open
---

1.0.0 breaks every existing project: the binary is renamed, the config layout changes, custom layouts go, and `dep.yaml` becomes required. This leaf writes the migration scripts that bring any content from the oldest supported 0.x version up to 1.0.0, so `agentks migrate` takes a 0.x project to a working 1.0.0 project in one run. It includes porting today's 0.x scripts into the new home, so content that is several 0.x versions behind still migrates. It is tested on this repository's own docs and tracker first.

# 01 To Do
- [ ] **Port today's 0.x scripts** from [agent-ks-engine/migration/](../../../../../../agent-ks-engine/migration/README.md) into `apps/agentks-engine/migrations/docs/` unchanged in behaviour: `0.1.0_done-to-state`, `0.1.1_state-to-status`, `0.1.2_legacy-custom-tags`, `0.1.2_root-settings-schema`, `0.2.0_agent-log-slot-numbering`, `0.2.0_agent-log-status-vocabulary`, `0.2.0_status-colors-to-css`, `0.2.3_slug-form-links`. Adapt only their I/O to the runner's `--root` and `--json` contract.
- [ ] **Write the 1.0.0 scripts**, one statement each (names indicative):
    - [ ] `1.0.0_config-folder-and-env` — find the config folder the 0.x project used (`CONFIG_DIR` in the framework `.env`); make sure content sits under the project root as `config/` plus section folders; move `PORT`/`HOST` from `.env` into `server.port` in `site.yaml`; create `config/.env` only for real overrides; remove `CONFIG_DIR`.
    - [ ] `1.0.0_dep-yaml` — create `config/dep.yaml` with `libraries: {}` when missing.
    - [ ] `1.0.0_custom-layouts` — find `LAYOUT_EXT_DIR`, `@ext-layouts` references and user layout folders; switch each section to the closest built-in style; report every section it changed and every user layout it could not replace. Never delete user layout code; list it for the user.
    - [ ] `1.0.0_site-yaml-keys` — remove `server.allowedHosts` and the `editor:` block; keep a report of removed values.
    - [ ] `1.0.0_themes-location` — move user themes to the 1.0.0 theme location decided in [100/10 theme contract](../100_layouts/10_theme-contract-and-css.md) and update `theme_paths`.
    - [ ] Any content-syntax change the new renderer makes (confirm with [020/00 content contract](../020_content-contract/00_overview.md); if there is none, record that in the result).
- [ ] **The framework folder** in consumer projects (`<project>/agent-knowledge-system/`): do not delete it. Report it and tell the user to remove it after checking the migrated site ([180/90 migration guide](../180_documentation/90_migration-guide-0x-to-1.md)).
- [ ] **Each script** has `detect`, `dry-run`, `migrate` (idempotent), `verify`, `--json`, self-contained dependencies, and a test with before/after fixtures.
- [ ] **Try the chain on real content first:** a copy of this repository's `default-docs/`, the [demo issue fixture](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md), and the starter template; then run [170/20 route and content parity](../170_testing/20_route-and-content-parity.md) against the 0.x output.
- [ ] **Record the checklist** of every 0.x → 1.0.0 change in the 1.0.0 release note ([140/10](./10_version-and-release-stream.md)).

## Guardrails
- Never delete user files that are not provably generated; report them instead.
- Each script touches one kind of change and is idempotent.
- Syntax changes need a script too: old markup misrenders silently.

## Done when
- A copy of this repository's `default-docs/` migrates with `agentks migrate --yes`, verifies clean, and passes route and content parity.
- A consumer-mode 0.x fixture (framework subfolder, `CONFIG_DIR=../config`) migrates and starts with the new binary.
- Running the chain twice changes nothing the second time.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/agentks-engine/migrations/docs/`.

**Read first**
- [Project config](../../notes/02_engine/02_project-config.md), section 04 (what changes from 0.x).
- [Versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md), sections 03 and 04.
- Today's scripts and README: [migration/](../../../../../../agent-ks-engine/migration/README.md); consumer and dogfood modes: [this repository's AGENTS.md](../../../../../../AGENTS.md), "Two operating modes".
- [Layouts](../../brainstorm/01_initial-discussion/11_layouts.md) — dropping custom layouts.

**Depends on:** [140/20 migrate command](./20_migrate-command.md), [020/20 config folder](../020_content-contract/20_config-folder.md), [100/10 theme contract](../100_layouts/10_theme-contract-and-css.md), [120/10 dep.yaml](../120_libraries/10_dep-yaml-and-lock.md).
**Unblocks:** [180/90 migration guide](../180_documentation/90_migration-guide-0x-to-1.md), [200/00 launch](../200_launch/00_overview.md) (moving this repository's docs and tracker).

# 04 Decisions
- Decided (claude, under sidhantha's delegation, 2026-09-30): `paths:` aliases stay in 1.0.0 ([020/20 config folder](../020_content-contract/20_config-folder.md)), so no script rewrites them.
- Decided (sidhantha, 2026-09-29): migrations are forced ([versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md)).
- Decided (sidhantha, 2026-09-29): user-authored custom layouts are dropped ([project config](../../notes/02_engine/02_project-config.md)).
- Decided (sidhantha, 2026-09-30): `config/dep.yaml` is required.

# 05 Notes & Analysis
## Watch out
- This repository's own content is at `engine_version: "0.3.10"`. The 0.x chain after 0.2.3 has no scripts; verify no format change between 0.2.3 and 0.3.10 went without one before trusting the chain.
