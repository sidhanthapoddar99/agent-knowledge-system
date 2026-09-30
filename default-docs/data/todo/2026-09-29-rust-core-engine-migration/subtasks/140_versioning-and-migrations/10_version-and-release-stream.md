---
title: "One version: constants, release stream and release notes"
status: open
---

Today agentks has three release streams (engine, plugin, CLI) with namespaced tags. After the migration there is one product binary with one x.y.z version, released as a compressed installer; the plugins and the default library version on their own. This leaf sets up that single version: where it is declared, the two gate constants, the tag form, the release-note format, and a check that they all agree. It does not build the release workflow; [160/10](../160_distribution/10_installer-and-release-workflow.md) does.

# 01 To Do
- [ ] **One source of the version.** The Rust package version in the engine's workspace `Cargo.toml` (`[workspace.package] version`). Every crate inherits it. The client and static-renderer `package.json` versions are set from it by the build, never edited by hand.
- [ ] **Constants.** `ENGINE_VERSION` comes from `env!("CARGO_PKG_VERSION")`. `MIN_CONTENT_VERSION` is a constant in the same module, with a doc comment carrying today's rule: it moves only on breaking changes.
    - [ ] For 1.0.0: `MIN_CONTENT_VERSION = "1.0.0"`; every 0.x project migrates once.
- [ ] **Tag form.** `vX.Y.Z` on `NeuraLabsHQ/agent-knowledge-system`; no product namespace, since there is one product.
- [ ] **Release notes.** `apps/agentks-engine/release-notes/X.Y.Z.md`, one per version, with a README describing the format:
    - [ ] Title line, date, summary.
    - [ ] **Breaking changes** and **what to run** (`agentks migrate`), when any.
    - [ ] New features, fixes, the binary size per platform.
    - [ ] Written for users (the audience of the binary), not maintainers.
- [ ] **The version check** (a `ctl` gate step, see [010/00](../010_project-setup/00_overview.md)): the Cargo version, the release note file, the embedded client's build stamp and the tag (when present) all agree; `MIN_CONTENT_VERSION ≤ ENGINE_VERSION`; the migrations folder has no script whose version is greater than `ENGINE_VERSION`. Port the useful parts of today's release-contract check.
- [ ] **`agentks --version`** prints `agentks X.Y.Z (commit, build date)`; `--version --json` prints the same as JSON plus `min_content_version`.
- [ ] **Position rule** in the release-note README: x = breaking (0 was beta), y = major upgrades, z = small additions and fixes.

## Guardrails
- No second place where the version is typed by hand.
- The gate constants never depend on the network.

## Done when
- `agentks --version --json` reports the version, commit and `min_content_version`.
- The version check fails a branch where the release note is missing or a script is newer than the version, and passes otherwise.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `Cargo.toml`, the version module in the core crate, `apps/agentks-engine/release-notes/`.

**Read first**
- [Versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md), sections 01, 02 and 08.
- [Distribution and install](../../notes/05_delivery/04_distribution-and-install.md), section 02 (the release).
- Today: [RELEASING.md](../../../../../../RELEASING.md), [engine-version.ts](../../../../../../agent-ks-engine/src/loaders/engine-version.ts), [the engine release notes](../../../../../../agent-ks-engine/release-notes/README.md), [the release-contracts workflow](../../../../../../.github/workflows/release-contracts.yml).

**Depends on:** [010/00 project setup](../010_project-setup/00_overview.md), [030/10 crate boundaries](../030_rust-engine/10_workspace-and-crate-boundaries.md).
**Unblocks:** [140/20](./20_migrate-command.md), [140/50](./50_protocol-version-handshake.md), [160/10](../160_distribution/10_installer-and-release-workflow.md), [120/20](../120_libraries/20_fetch-and-resolve.md) (the running version for engine ranges).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the only release is the compressed installer; the plugins and default library version on their own ([versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md)).
- Decided (sidhantha, 2026-09-30): 1.0.0 is the first Rust release.

# 05 Notes & Analysis
## Watch out
- The notes list "release notes in `apps/agentks-engine/release-notes/`" as a delivery-fork choice not discussed in brainstorm. It fits today's layout; keep it unless sidhantha objects.
