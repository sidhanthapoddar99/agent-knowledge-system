---
title: "Update and shell-init — the updater and shell set-up under the new name"
status: open
---

Today's toolkit updates itself from GitHub releases and offers a shell hook that checks at most every five hours. The new binary keeps that updater, with three changes: it downloads `agentks` from the new repository, its state moves into `~/.agentks/update.json`, and the shell set-up command becomes `agentks shell-init` because `init` now creates projects. The release channel it reads (the repository, archive names, checksums) is [160/20](../160_distribution/20_update-channel.md).

# 01 To Do
- [ ] **Port** [update.rs](../../../../../../agent-ks-cli/src/update.rs) into the CLI crate: `agentks update` (install newest stable now), `--check --json` (check without installing), `--status --json` (read cached state), `--version X` (pin).
- [ ] **State** in `~/.agentks/update.json` (`format`, last check, available version, last error), replacing the XDG state folder; honour `AGENTKS_HOME`.
- [ ] **Verification** before replacing the binary: checksum from the release, then run the new binary's `--version`, then one rename over the old one (Windows: the rename-aside dance for a running `.exe`).
- [ ] **Off switches:** a pinned install or `AGENTKS_AUTO_UPDATE=0` disables automatic updates; a development build (a binary under a repository's `data/builds/`) never updates itself.
- [ ] **`agentks shell-init <bash|zsh|fish|powershell>`**: prints the PATH set-up and the silent update hook with the five-hour cooldown (today's `init <shell>` output, renamed).
- [ ] **Across a breaking version** the update is allowed; the version gate then stops old projects and names `agentks migrate`. `update` prints that consequence when the major version changes.
- [ ] **No update checks** in any other command.

## Guardrails
- Ordinary commands never check for updates; only `update` and the shell hook do.
- The update source is fixed in the binary; no command-line or environment override points it at another host (a supply-chain risk).

## Done when
- Against a local fake release server (test-only build flag), `update --check --json` reports the newer version; `update` installs it after checksum and `--version` checks; a bad checksum aborts with the old binary intact.
- `shell-init zsh` prints a script that, sourced in a test shell, puts `agentks` on the PATH.
- `update.json` appears under `AGENTKS_HOME` in tests, never in the real home.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/agentks-cli/`.

**Read first:**
- [Distribution and install, sections 03–05](../../notes/05_delivery/04_distribution-and-install.md) — installing, updating, moving users over.
- [Rust CLI, section 03](../../notes/02_engine/05_rust-cli.md).
- Today's updater: [update.rs](../../../../../../agent-ks-cli/src/update.rs) (`init` at the shell set-up), and the [installer](../../../../../../agent-ks-cli/tests/install.py) test.

**Depends on:** [070/10](./10_rename-to-agentks.md), [160/20](../160_distribution/20_update-channel.md).
**Unblocks:** [160/30 final 0.x updater notice](../160_distribution/30_final-0x-updater-notice.md) (the new command name it prints).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): only the installer is released: the binary with the engine and the built client, compressed.
- Proposed (claude, 2026-09-30), adopted here: `shell-init` replaces today's shell-setup `init`; update state moves to `~/.agentks/update.json`.
- Decided (claude, 2026-09-30): the update source cannot be overridden outside test builds.

# 05 Notes & Analysis

## Watch out
- Keep the five-hour cooldown logic identical to today's so existing shell hooks behave the same after users re-run `shell-init`.
