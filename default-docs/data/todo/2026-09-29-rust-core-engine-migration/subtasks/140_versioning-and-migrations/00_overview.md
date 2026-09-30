---
title: "Versioning and migrations — overview and rules for the group"
status: in-progress
---

This group builds how agentks versions itself and moves content forward: the single binary version and its release note, the version gate's constants, `agentks migrate` (a thin runner that downloads migration scripts from the official repository at the binary's own tag), the 0.x → 1.0.0 docs migration that every existing project runs once, library migrations run by library owners, the version handshake that makes a stale browser tab reload instead of talking to a newer server, the versioning of the settings schema, and pinning an older version per project with mise. Migrations are **forced**: the engine supports current content only.

# 01 To Do
- [ ] **Work the leaves in this order.**

| Leaf | Status | Phase | Delivers |
|---|---|---|---|
| [140/10 Version and release stream](./10_version-and-release-stream.md) | open | 1 | One version, `ENGINE_VERSION` and `MIN_CONTENT_VERSION`, release notes |
| [140/50 Protocol version handshake](./50_protocol-version-handshake.md) | open | 1 | A stale tab or PWA reloads instead of talking to a newer server |
| [140/60 Settings schema versioning](./60_settings-schema-versioning.md) | open | 1 | Typed settings per version; a published schema; every schema change has a migration |
| [140/20 migrate command](./20_migrate-command.md) | in-progress | 1 (before 1.0.0) | `agentks migrate`: fetch, detect, dry run, migrate, verify, bump |
| [140/30 Docs migration 0.x → 1.0.0](./30_docs-migration-0x-to-1.md) | in-progress | before 1.0.0 | The scripts that bring every 0.x project to 1.0.0 |
| [140/40 Library migrations](./40_library-migrations.md) | open | before 1.0.0 (runner flag); scripts after | `agentks migrate --library` for library owners |
| [140/70 mise pinning](./70_mise-pinning.md) | open | 1.0.0 release | Per-project pins for 1.x and for the last 0.x |

Order: 10 → 50 and 60 → 20 → 30 → 40 → 70.

# 02 Status and Result
In progress. 20 and 30 are in progress; 10, 40, 50, 60 and 70 are open.

## Result
None yet.

## Agent log
none

# 03 References
**Where the work happens.** The main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: version constants and the gate in `apps/agentks-engine/`, scripts in `apps/agentks-engine/migrations/{docs,library}/`, release notes in `apps/agentks-engine/release-notes/`.

**Rules every leaf in this group follows**
- **One version** for the binary (engine, CLI, client, static renderer). Content targets it through `engine_version` in `config/site.yaml`. Libraries and plugins have their own series.
- **The gate is offline.** The version check lives in the binary and never depends on a download.
- **Migrations are code in git, not in the binary.** `agentks migrate` downloads only from the official repository, at the binary's release tag. No hash list: git and HTTPS protect the download.
- **Every format change owes a script**, including content-syntax changes, because old markup misrenders silently instead of failing ([today's discipline](../../../../dev-docs/30_versioning/04_migrations.md)).
- **The floor moves only on breaking changes.** `MIN_CONTENT_VERSION` means the oldest content that still works unmigrated.
- **Safety first.** Refuse a dirty git tree; dry run before change; re-detect after; bump `engine_version` last.
- Agents prepare versions and notes. Tagging, pushing and publishing releases in the new repositories is within Claude's autonomy ([permissions](../../agent-memory/permissions-and-repositories.md)); in this repository they stay with sidhantha.

**Read first**
- [Versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md) — the design.
- [Project config](../../notes/02_engine/02_project-config.md), sections 04 (what changes from 0.x) and 08 (the gate).
- Today's gate [engine-version.ts](../../../../../../agent-ks-engine/src/loaders/engine-version.ts), today's scripts [migration/](../../../../../../agent-ks-engine/migration/README.md), today's discipline [dev-docs 30_versioning](../../../../dev-docs/30_versioning/01_overview.md), [RELEASING.md](../../../../../../RELEASING.md).

**Depends on:** [020/60 engine version gate](../020_content-contract/60_engine-version-gate.md), [070/00 CLI](../070_cli/00_overview.md).
**Unblocks:** [160/00 distribution](../160_distribution/00_overview.md), [180/90 migration guide](../180_documentation/90_migration-guide-0x-to-1.md), [200/00 launch](../200_launch/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): migrations are forced; mise pins an older version per project ([versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md)).
- Decided (sidhantha, 2026-09-30): the first Rust release is 1.0.0, after Phases 1 and 2.
- Decided (sidhantha, 2026-09-30): scripts live in git and are downloaded; two kinds of migration (docs by users, library by owners).

# 05 Notes & Analysis
## Watch out
- The gate itself (reading `engine_version`, comparing the range, the error text) is built in [020/60](../020_content-contract/60_engine-version-gate.md). This group owns the constants, the policy and the migrations around it.
