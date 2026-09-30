---
title: "The update channel: agentks update and the silent check"
status: open
---

`agentks update` keeps users current, and a silent shell hook checks at most every five hours. Today's updater already does this well for `agent-ks`; this leaf carries it into the new binary with the new repository and asset names, the state file moved into `~/.agentks/update.json`, and the same safety checks. The `update` and `shell-init` commands' argument handling is [070/70](../070_cli/70_update-and-shell-init.md); this leaf owns the channel behind them.

# 01 To Do
- [ ] **Port the updater** from [update.rs](../../../../../../agent-ks-cli/src/update.rs):
    - [ ] The repository constant `NeuraLabsHQ/agent-knowledge-system`, shared with the migration and catalog constants in one module.
    - [ ] Discovery: the official Latest endpoint, validating a stable `vX.Y.Z` tag and the platform asset; fall back to bounded release history when Latest fails.
    - [ ] Download: archive and `SHA256SUMS`, checksum check, archive layout check, run the new binary's `--version`, then replace the running binary in one rename (Windows: the rename-aside dance today's code does).
    - [ ] State in `~/.agentks/update.json` (last check, available version, last error), with a lock so two shells never update at once.
- [ ] **Behaviour kept:** `agentks update` installs the newest stable now; `--check --json` checks without installing; `--status --json` reads the cached state; ordinary commands never check; `--version` pins and `AGENTKS_AUTO_UPDATE=0` turn automatic updates off; a binary under `data/builds/` never updates itself.
- [ ] **Across a breaking version**: updating is allowed; the gate then stops each old project and names `agentks migrate`. `update` prints that note when the major version changes.
- [ ] **Tests.** Port today's unit tests (release selection, checksum failures, layout failures, pinned installs, development builds) with the new names; add one for the major-version note.

## Guardrails
- Never replace the binary without a passing checksum and version check.
- Never check for updates during ordinary commands.

## Done when
- The ported tests pass.
- With two published pre-releases, `agentks update` on the older one installs the newer one and `--status --json` reports it.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, the update module under `apps/agentks-engine/`.

**Read first**
- [Distribution](../../notes/05_delivery/04_distribution-and-install.md), section 04.
- [Machine home and build cache](../../notes/02_engine/06_machine-home-and-build-cache.md) — `update.json`.
- Today's [update.rs](../../../../../../agent-ks-cli/src/update.rs) and its tests.

**Depends on:** [160/10 installer and release workflow](./10_installer-and-release-workflow.md), [070/70 update and shell-init](../070_cli/70_update-and-shell-init.md).
**Unblocks:** [160/30 final 0.x notice](./30_final-0x-updater-notice.md) (points users here).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): one global install; the installer and binary are named `agentks` ([distribution](../../notes/05_delivery/04_distribution-and-install.md)).
- Proposed (claude, 2026-09-30): the updater carry-over, and moving its state into `~/.agentks/update.json` ([machine home](../../notes/02_engine/06_machine-home-and-build-cache.md)). Build as proposed.

# 05 Notes & Analysis
## Watch out
- Today's release selection skips other product streams (engine and plugin tags). The new repository has one stream, but keep the filter strict to `vX.Y.Z` so a future tag of another kind cannot be mistaken for a release.
