---
title: "Release 1.0.0"
status: open
outcome: "agentks 1.0.0 installs from GitHub Releases and migrates 0.x content"
notes: "Needs [multi-user](./35_multi-user.md). This closes launch step 1"
who: "claude"
subtasks:
  - "[140/10 One version: constants, release stream and release notes](../../subtasks/140_versioning-and-migrations/10_version-and-release-stream.md)"
  - "[140/20 agentks migrate: the migration runner](../../subtasks/140_versioning-and-migrations/20_migrate-command.md)"
  - "[140/30 Docs migration: bring every 0.x project to 1.0.0](../../subtasks/140_versioning-and-migrations/30_docs-migration-0x-to-1.md)"
  - "[140/40 Library migrations, run by library owners](../../subtasks/140_versioning-and-migrations/40_library-migrations.md)"
  - "[140/50 Version handshake: stale tabs and PWAs reload instead of talking to a newer server](../../subtasks/140_versioning-and-migrations/50_protocol-version-handshake.md)"
  - "[140/60 Settings schema versioning: typed config per version](../../subtasks/140_versioning-and-migrations/60_settings-schema-versioning.md)"
  - "[140/70 Pinning an older version per project with mise](../../subtasks/140_versioning-and-migrations/70_mise-pinning.md)"
  - "[160/10 Installer archives and the release workflow](../../subtasks/160_distribution/10_installer-and-release-workflow.md)"
  - "[160/20 The update channel: agentks update and the silent check](../../subtasks/160_distribution/20_update-channel.md)"
  - "[070/70 Update and shell-init — the updater and shell set-up under the new name](../../subtasks/070_cli/70_update-and-shell-init.md)"
---

The installer, the update channel, versioning and the migrations from 0.x.

# 01 To Do
- [ ] **Versioning and migrations:** the release stream, `agentks migrate`, the 0.x → 1.0.0 docs migration, library migrations, the protocol handshake, settings schema versions, mise pinning (group 140).
- [ ] **Distribution:** the installer, its release workflow and the update channel (160/10, 160/20, 070/70).
- [ ] **Tag 1.0.0** once the end-to-end run with the default library passes (launch step 1).

# 02 Status and Result
Not started.

# 03 References
- [The plan overview](./overview.md)
- The design: [notes index](../../notes/01_overview/01_index.md)

# 04 Decisions
- See [the plan overview](./overview.md#04-decisions).

# 05 Notes & Analysis
## 01 Scope
The `subtasks:` list above is the whole scope of this stage. Each subtask is written for a cold start: read its references first.
