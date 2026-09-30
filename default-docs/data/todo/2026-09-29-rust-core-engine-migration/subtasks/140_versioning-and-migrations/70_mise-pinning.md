---
title: "Pinning an older version per project with mise"
status: open
---

Migrations are forced, so a project that is not ready to migrate needs a way to keep an older agentks. agentks builds no version manager of its own: mise does it, per project, through its GitHub backend. This leaf makes sure the release assets work with `mise use github:NeuraLabsHQ/agent-knowledge-system@X.Y.Z`, documents the pin, and makes the version gate's error name it. It also covers publishers, who stay on the last 0.x release until Phase 3 ships `agentks build`.

# 01 To Do
- [ ] **Asset naming that mise understands.** Confirm the archive names from [160/10](../160_distribution/10_installer-and-release-workflow.md) (`agentks-<version>-<target>.tar.gz`, `.zip` on Windows) are picked correctly by mise's `github:` backend on every platform; if not, add the asset-matching options mise supports and document them.
- [ ] **Test the pin.** In a clean folder: `mise use github:NeuraLabsHQ/agent-knowledge-system@1.0.0`, then `agentks --version` inside the folder shows 1.0.0 while the global install shows the latest. Automate in CI after the first two releases exist.
- [ ] **The gate's error** names the pin when content is newer than the binary or older than the floor: "pin this project with `mise use github:NeuraLabsHQ/agent-knowledge-system@<version>`".
- [ ] **The 0.x pin for publishers.** Work out and document how to pin the last 0.x: the `agent-ks` CLI from this repository (`agent-ks-cli-vX.Y.Z` tags) plus the framework checkout at the matching `agent-ks-engine-vX.Y.Z` tag. Write the exact `mise.toml` and test it. It keeps working after this repository is transferred and archived only because GitHub redirects transferred repositories; say so.
- [ ] **Docs.** A user-guide page (in [180/90 migration guide](../180_documentation/90_migration-guide-0x-to-1.md) or the versioning page) with both pins.
- [ ] **Inside the main repository** (state 1), mise puts `data/builds/` first on the PATH so `agentks` means the working-tree build; that is set up by [010/00 project setup](../010_project-setup/00_overview.md). Cross-check the names do not clash with a project-level pin.

## Guardrails
- No built-in version manager.
- The pin must not need Rust or a JavaScript runtime.

## Done when
- A clean machine pins 1.0.0 in one folder with mise and runs it, while `agentks --version` elsewhere shows the newer release.
- The 0.x pin instructions are tested once on a real 0.x project.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system` (release assets, gate message, docs).

**Read first**
- [Versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md), section 07.
- [Distribution and install](../../notes/05_delivery/04_distribution-and-install.md), sections 02 and 05.
- [Publishing](../../notes/05_delivery/02_publishing-ssg.md), section 10 (the gap between 1.0.0 and Phase 3).
- Today's tags and streams: [RELEASING.md](../../../../../../RELEASING.md).

**Depends on:** [160/10 release workflow](../160_distribution/10_installer-and-release-workflow.md), [020/60 gate](../020_content-contract/60_engine-version-gate.md).
**Unblocks:** [180/90 migration guide](../180_documentation/90_migration-guide-0x-to-1.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): mise is the recommended way to pin an older version per project ([versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md)).
- Decided (sidhantha, 2026-09-29): publishers stay on the last 0.x release until Phase 3 ships.

# 05 Notes & Analysis
## Watch out
- The last 0.x is two things (the CLI binary and the Astro framework checkout), not one binary. The pin story must cover both, or publishers will pin the CLI and still pull a newer framework.
