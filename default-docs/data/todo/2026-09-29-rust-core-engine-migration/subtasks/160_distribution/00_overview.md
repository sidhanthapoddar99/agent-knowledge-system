---
title: "Distribution — overview and rules for the group"
status: open
---

This group ships agentks to users. agentks releases one thing: a compressed installer per platform on the main repository's GitHub Releases, holding the `agentks` binary with the Rust engine and CLI, the built client and the static renderer embedded. Users install with a one-line script and stay current with `agentks update`. There is no Docker image. The group also covers moving existing `agent-ks` users over: the final 0.x release prints a notice naming the new install command instead of jumping silently to a renamed binary.

# 01 To Do
- [ ] **Work the leaves in this order.**

| Leaf | Status | When | Delivers |
|---|---|---|---|
| [160/10 Installer and release workflow](./10_installer-and-release-workflow.md) | open | before 1.0.0 | The tag-triggered workflow, archives, checksums, install scripts |
| [160/20 Update channel](./20_update-channel.md) | open | before 1.0.0 | The updater and shell hook for the new repository |
| [160/30 Final 0.x updater notice](./30_final-0x-updater-notice.md) | open | at the switch-over | This repository's last 0.x release prints the move notice |

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where the work happens.** Leaves 10 and 20: the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`. Leaf 30: **this** repository (`agent-ks-cli/`), where Claude edits but sidhantha commits, tags and publishes ([permissions](../../agent-memory/permissions-and-repositories.md)).

**Rules every leaf in this group follows**
- One release artefact: the installer archive per platform plus `SHA256SUMS`. No Docker image, no separate plugin or library release.
- Keep today's installer and updater behaviour (checksums, archive layout checks, running the new binary's `--version` before an atomic replace, pinning, the five-hour silent check), renamed and pointed at the new repository.
- A development build (a binary under a repository's `data/builds/`) never updates itself.
- Tags, pushes and releases in the new repositories are within Claude's autonomy; in this repository they stay with sidhantha.

**Read first**
- [Distribution, install and update](../../notes/05_delivery/04_distribution-and-install.md) — the design.
- Today's installer, updater and workflow, which this group keeps: [install.sh](../../../../../../agent-ks-cli/install.sh), [install.ps1](../../../../../../agent-ks-cli/install.ps1), [update.rs](../../../../../../agent-ks-cli/src/update.rs), [the CLI release workflow](../../../../../../.github/workflows/agent-ks-cli-release.yml), [RELEASING.md](../../../../../../RELEASING.md).

**Depends on:** [140/10 version](../140_versioning-and-migrations/10_version-and-release-stream.md), [080/70 embed in binary](../080_ui-and-client/70_embed-in-binary.md), [150/20 SSG renderer](../150_publishing/20_ssg-renderer.md) (embedded), [170/00 testing](../170_testing/00_overview.md).
**Unblocks:** [140/70 mise pinning](../140_versioning-and-migrations/70_mise-pinning.md), [195/00 hosting](../195_hosting/00_overview.md) (the install URL redirect), [200/00 launch](../200_launch/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): agentks publishes only its installer, compressed; no Docker image ([distribution](../../notes/05_delivery/04_distribution-and-install.md)).
- Decided (sidhantha, 2026-09-30): the install URL can be on agentks.neuralabs.org (a redirect only) or a GitHub release.

# 05 Notes & Analysis
## Watch out
- The main repository is private until the launch. Releases on a private repository are not downloadable without auth, so end-to-end install tests before the launch must use an authenticated download (for example `gh release download`) and the public path must be tested right after the repository goes public.
