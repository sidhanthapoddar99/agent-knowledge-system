---
title: "Installer archives and the release workflow"
status: open
---

This leaf builds how a version becomes downloadable: a GitHub Actions workflow that runs only on a pushed `vX.Y.Z` tag, builds the client and the static renderer, embeds them, builds the Rust binary for five platforms, packs one archive per platform plus `SHA256SUMS`, and publishes a GitHub release with the version's note. It also ports the two install scripts to the new name and repository. When it is done, `curl -fsSL …/install.sh | sh` installs a checksum-verified `agentks` on Linux and macOS, and the PowerShell script does the same on Windows.

# 01 To Do
- [ ] **Workflow** `.github/workflows/release.yml`, triggered only by tags matching `v[0-9]+.[0-9]+.[0-9]+` (and pre-releases `-…`):
    - [ ] Validate: the tag equals the Cargo version; the release note `apps/agentks-engine/release-notes/X.Y.Z.md` exists ([140/10](../140_versioning-and-migrations/10_version-and-release-stream.md)).
    - [ ] Gate: format, clippy, tests, and the end-to-end checks ([170/30](../170_testing/30_end-to-end.md)).
    - [ ] Build the client (`apps/agentks-client`) and the static renderer (`apps/agentks-ssg`) once, with Bun, and pass them as artefacts to every platform job so all binaries embed the same bundles.
    - [ ] Release builds: `x86_64-unknown-linux-musl`, `aarch64-unknown-linux-musl`, `x86_64-apple-darwin`, `aarch64-apple-darwin`, `x86_64-pc-windows-msvc`, on Rust 1.98.1 from `rust-toolchain.toml`.
    - [ ] Pack `agentks-<version>-<target>.tar.gz` (`.zip` on Windows) with the binary at a fixed path; write `SHA256SUMS`.
    - [ ] Publish only when every job is green; title `agentks X.Y.Z — <summary>`; body from the release note; mark the newest stable as GitHub's Latest (port today's "select the greatest stable" logic).
    - [ ] Record each binary's size in the job summary, for the release note.
    - [ ] Serialise publication with a concurrency group.
- [ ] **Install scripts** `install.sh` and `install.ps1` at the repository root (published as release assets too):
    - [ ] `repo='NeuraLabsHQ/agent-knowledge-system'`, binary `agentks`, env `AGENTKS_VERSION`, `AGENTKS_INSTALL_DIR`, flags `--version`, `--install-dir`, `--no-shell-setup`.
    - [ ] Asset names match the new archives; checks: checksum, archive layout, `agentks --version` reports the requested version.
    - [ ] Shell setup: PATH and the silent update hook via `agentks shell-init` ([070/70](../070_cli/70_update-and-shell-init.md)).
    - [ ] Linux jobs test the installer against the just-built archives.
- [ ] **A local release check** (`ctl release-check`): runs the validation part of the workflow locally before a tag is pushed.
- [ ] **First release** `v1.0.0` when Phases 1 and 2 are done ([140/10](../140_versioning-and-migrations/10_version-and-release-stream.md)); pre-releases (`v1.0.0-beta.N`) before that for end-to-end testing.

## Guardrails
- No builds on branch pushes for publishing; the gate on pull requests is a separate workflow ([010/00](../010_project-setup/00_overview.md)).
- A binary never embeds a client from another commit.
- No sudo, Rust or JavaScript runtime needed to install.

## Done when
- Pushing a `v1.0.0-beta.1` tag produces five archives and `SHA256SUMS` on a GitHub pre-release.
- On a clean Linux and macOS machine, the install script installs that version and `agentks --version` matches (with auth while the repository is private).
- On Windows, `install.ps1` does the same.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `.github/workflows/`, `install.sh`, `install.ps1`, `ctl`.

**Read first**
- [Distribution](../../notes/05_delivery/04_distribution-and-install.md), sections 01–03 and 06.
- Today's: [the CLI release workflow](../../../../../../.github/workflows/agent-ks-cli-release.yml), [install.sh](../../../../../../agent-ks-cli/install.sh), [install.ps1](../../../../../../agent-ks-cli/install.ps1), [RELEASING.md](../../../../../../RELEASING.md), [the release-contracts workflow](../../../../../../.github/workflows/release-contracts.yml).
- [Toolchain versions](../../agent-memory/toolchain-versions.md).

**Depends on:** [140/10](../140_versioning-and-migrations/10_version-and-release-stream.md), [080/70 embed in binary](../080_ui-and-client/70_embed-in-binary.md), [150/20 SSG renderer](../150_publishing/20_ssg-renderer.md), [010/00 project setup](../010_project-setup/00_overview.md).
**Unblocks:** [160/20 update channel](./20_update-channel.md), [140/70 mise pinning](../140_versioning-and-migrations/70_mise-pinning.md), [150/70 Dockerfile](../150_publishing/70_dockerfile.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the only release is the compressed installer with the engine and the built client ([distribution](../../notes/05_delivery/04_distribution-and-install.md)).
- Proposed (claude, 2026-09-30): the platform list and archive names (same note). Build as proposed.
- Decided (claude, 2026-09-30): the tag is plain `vX.Y.Z`, because there is one product in this repository.

# 05 Notes & Analysis
## Watch out
- macOS binaries downloaded by `curl` are not quarantined, but Gatekeeper may still warn on first run for unsigned binaries if users download through a browser. Signing and notarisation are out of scope for 1.0.0; note it in the release note if it bites.
