---
title: "Update and shell-init — the updater and shell set-up under the new name"
status: review
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
Review. The updater and `shell-init` are ported into `crates/cli/src/update/` (wave 2, branch `wave2/cli`); `ctl gate` is green.

## Result
- `agentks update` installs the newest stable release; `--check` checks without installing; `--status` reads the cached state without the network; `--enable` / `--disable` switch automatic updates; `--version X.Y.Z` installs exactly that version and pins it; `--unpin` follows stable again; `--background [--check-only]` is what the shell hook runs. The flags are mutually exclusive (exit 2).
- Release channel: tags `vX.Y.Z` on the repository in `agentks_core::OFFICIAL_REPOSITORY` (only exact `vX.Y.Z`, parsed by `agentks_core::Version`); assets `agentks-<version>-<target>.tar.gz` (`.zip` on Windows) and `SHA256SUMS`. GitHub's Latest is used when valid and not older than this build, else the newest stable entry of the release history (up to 1,000). HTTPS only, 45-second limit, bounded sizes.
- Install: checksum, archive layout (exactly one regular `agentks` / `agentks.exe`), the new binary's `--version` must print `agentks X.Y.Z` within 10 seconds, then one rename on the executable's file system (Windows: move the running `.exe` aside, restore it on failure, clean leftovers on the next hook run).
- State: `~/.agentks/update.json` (`format`, `automaticUpdates`, `pin`, `checkedAt`, `available`, `error`) under `AGENTKS_HOME`, written atomically; `update.lock` stops two shells updating at once. A file of another format is ignored and rebuilt.
- Off switches: `AGENTKS_AUTO_UPDATE=0|false|off`, a pin, `--disable`, and a development build (under `data/builds/`, or in a cargo `target/` beside a `Cargo.toml`) never update automatically; a development build also refuses a manual install.
- A major step (x or y changes) prints a note naming `agentks migrate`.
- `agentks shell-init <bash|zsh|fish|powershell>` prints the PATH line and `agentks update --background` with its output silenced; the five-hour cooldown logic is unchanged. `--json` returns `{shell, script}`.
- Tests (15, in `update/tests.rs` and `update/state.rs`, all under 0.1 s): tag parsing, history selection, the Latest fast path, stale and malformed Latest fallback, checksum and layout failures, zip layout, a bad checksum never falling back to an older release, check-only never installing, a failed replacement keeping the old file, a full download-verify-replace on Unix and a lying binary refused, the major-version note, development-build detection, the shell script text, and a sourced POSIX script finding `agentks` on the PATH, and `update.json` round-tripping under a temporary `AGENTKS_HOME`.
- A real `agentks update --check --json` against GitHub today returns a clean error (HTTP 404: the repository has no public releases yet) and records it in `update.json`.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/cli/`.

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
- Decided (claude, 2026-10-01): the "local fake release server" is a fake download function passed into the updater in tests, not a test-only build flag, because it tests the same code without a network port and cannot ship in a release build. The real download function is the only one the binary can call, so the update source still cannot be overridden.
- Decided (claude, 2026-10-01): one file, `update.json`, holds both the settings (automatic updates, pin) and the last check, replacing today's `settings.json` and `state.json`, because the design names one file and both are read together.
- Decided (claude, 2026-10-01): `--version X.Y.Z` replaces today's `--pin X.Y.Z`: it installs X.Y.Z now and pins it, matching the installer's `--version`. The pin is written only after the install succeeds. `--background --check` became `--background --check-only`, because the flags are mutually exclusive under clap.
- Decided (claude, 2026-10-01): a development build refuses a manual `agentks update` too, not only the automatic one, because replacing `data/builds/agentks` with a release would silently hide the working tree.
- Decided (claude, 2026-10-01): the "major version" that triggers the migrate note is a change of x or y, because `agentks_core::Version` says y moves for major upgrades.

# 05 Notes & Analysis

## Watch out
- Keep the five-hour cooldown logic identical to today's so existing shell hooks behave the same after users re-run `shell-init`.
