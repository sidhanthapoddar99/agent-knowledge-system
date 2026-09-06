---
title: Developing the Native Toolkit
description: Rust CLI architecture, local builds, tests and independent GitHub releases.
---

# Developing the Native Toolkit

The `agent-ks-cli/` crate builds the standalone `agent-ks` executable. The plugin supplies skills and template sources; it no longer ships a JavaScript dispatcher or executable wrapper.

## Build and verify

```bash
mise run cli-build
agent-ks-dev
```

Mise leaves the installed `agent-ks` on PATH and exposes the working-tree binary as the directory-scoped `agent-ks-dev` shell alias. Both commands select the bundled `default-docs/config`, so they can be compared against the same content without shadowing each other. In a noninteractive agent shell, use `mise run agent-ks-dev -- <args>`. Without mise, build and invoke the absolute executable path:

```bash
cd agent-ks-cli
cargo build --release --locked
cargo test --locked
cargo clippy --locked --all-targets -- -D warnings
python3 tests/install.py
```

Build output is ignored under `releases/`. The installer tests use local archives and a simulated download endpoint. They do not install into the user's home or publish releases.

## Command architecture

The [manifest](../../../../agent-ks-cli/src/manifest.json) owns command names and flags. The [argument parser](../../../../agent-ks-cli/src/args.rs) adds shared flags, validates invocation and renders help. Native modules implement content search, tracker queries, scaffolding, link maintenance, checks, themes, images and viewer startup.

Scaffold templates are embedded from the CLI skill's `templates/` directory. The built-in theme is also embedded. Content operations work after copying just the executable to another machine. Image encoding delegates to ImageMagick; Git commands delegate to Git. Only `start` invokes the framework's JavaScript viewer launcher.

Config selection is explicit: `--config-dir` > `AGENTKS_CONFIG_FOLDER` > current directory's `config/`. The viewer receives an absolute `CONFIG_DIR` environment override so it uses the same project as the native commands.

When adding a command, update the manifest, implement its behavior, add useful examples and meaningful integration coverage, then update the [CLI skill contract](../../../../plugins/agent-ks/skills/agent-ks-cli/references/contract.md).

## Updater

`update` is a native manual updater. The shell-startup form, `update --background`, detaches a silent worker and checks the shared five-hour timestamp under an exclusive file lock. Normal commands never invoke it. The worker compares stable CLI versions, validates HTTPS downloads, checks the archive checksum and executable version, and stages replacement on the executable’s filesystem. Windows swaps a running EXE through a backup and restores it if replacement fails.

The installer maintains one startup block for PATH and `update --background`. `init <shell>` prints equivalent code for manual installations. Pinning and disabling live in per-user update preferences, separate from project config. Source builds inside the crate skip automatic updates.

Tests exercise release selection, cooldown, locking, archive rejection, replacement failure, silent background behavior and installer profile idempotence using temporary fixtures. They do not fetch or install a public release.

## Independent releases

Update Cargo's package version and lockfile, add `agent-ks-cli/release-notes/<version>.md`, and pass the local checks. A maintainer can then push `agent-ks-cli-v<version>` after merging the change.

The [CLI release workflow](../../../../.github/workflows/agent-ks-cli-release.yml) builds Linux x86_64 and ARM64 with musl, macOS Intel and Apple Silicon, and Windows x64. It uploads archives and `SHA256SUMS` to the matching GitHub release. The Cargo version must equal the tag version. The separate [CLI CI workflow](../../../../.github/workflows/agent-ks-cli.yml) runs branch and pull-request checks without publishing. Engine and plugin releases use `agent-ks-engine-vX.Y.Z` and `agent-ks-plugin-vX.Y.Z`; neither attaches CLI binaries.

The [installer](../../../../agent-ks-cli/install.sh) selects stable CLI tags, verifies archive hashes and executable versions, and atomically replaces the installed binary. Failed verification preserves an existing installation. Building locally does not publish anything.
