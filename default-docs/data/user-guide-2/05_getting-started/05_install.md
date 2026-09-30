---
title: "Install and update agentks"
description: "Install the agentks binary, keep it up to date, pin a version or turn automatic updates off."
---

This page gets the `agentks` binary onto your machine and keeps it current. You install it once per machine, not once per project.

## Install

On Linux or macOS:

```sh
curl -fsSL https://agentks.neuralabs.org/install.sh | sh
```

On Windows, in PowerShell:

```powershell
irm https://agentks.neuralabs.org/install.ps1 | iex
```

The address on agentks.neuralabs.org only redirects to the latest GitHub release, so you can also fetch the script from GitHub directly:

```sh
curl -fsSL https://github.com/NeuraLabsHQ/agent-knowledge-system/releases/latest/download/install.sh | sh
```

Then check that it works:

```sh
agentks --version
```

It prints the version, for example `agentks 1.0.0`. If your shell says the command is not found, open a new terminal, so the shell reads the PATH line the installer added.

## What the installer does

1. It downloads the latest stable release for your platform: Linux (x64 or ARM64), macOS (Intel or Apple Silicon) or Windows (x64).
2. It checks the download against the release's checksums, checks the archive's contents, and runs the new binary to confirm its version.
3. It puts `agentks` in `~/.local/bin`. On Windows it uses a folder under your user's local programs folder.
4. It adds two lines to your shell's startup file: one puts the install folder on your PATH, the other starts a silent update check.

The installer needs `curl`, `tar`, and `sha256sum` or `shasum`. It needs no `sudo`, no Rust and no JavaScript runtime.

## Installer options

Pass options to the script after `sh -s --`, or set the matching environment variable:

| Option | Variable | Effect |
|---|---|---|
| `--version X.Y.Z` | `AGENTKS_VERSION` | Install exactly this version and pin it, which pauses automatic updates |
| `--install-dir PATH` | `AGENTKS_INSTALL_DIR` | Install into another folder |
| `--no-shell-setup` | | Leave your shell startup files alone, for CI and containers |

For example, to install and pin 1.0.0:

```sh
curl -fsSL https://agentks.neuralabs.org/install.sh | sh -s -- --version 1.0.0
```

## What agentks needs to run

For reading, searching, checking and serving content, `agentks` needs nothing else. A few commands call another program, and each one tells you what to install when it is missing:

| Program | Needed by |
|---|---|
| `git` | The `agentks git …` commands only |
| ImageMagick | `agentks img`, which optimises images |
| `uv` (Python) | `agentks migrate`, which runs migration scripts |
| Bun or Node | `agentks build`, which writes a static site |

Only a few commands use the network: `init`, `install`, `library`, `migrate`, `update`, `docs` and `build`. `start` uses it only to install a library that is missing from the machine. Content commands never do.

## Set up your shell again

The installer writes the shell set-up for you. If you installed with `--no-shell-setup`, or you switch to another shell, print the set-up with `agentks shell-init` and add it to that shell's startup file:

```sh
agentks shell-init zsh >> ~/.zshrc
```

The shell can be `bash`, `zsh`, `fish` or `powershell`. For zsh the output is two lines, with your own install path:

```sh
export PATH='/home/you/.local/bin':"$PATH"
'/home/you/.local/bin/agentks' update --background >/dev/null 2>&1
```

## Update

`agentks update` installs the newest stable release now:

```sh
agentks update            # install the newest release
agentks update --check    # check for a newer release, install nothing
agentks update --status   # show the update settings and the last check, offline
```

You rarely need to run it. The line the shell set-up added runs a silent check at most every five hours, and installs a new release in the background. Ordinary commands never check for updates, so they stay fast.

Before a new binary replaces the old one, agentks checks its checksum and runs it to confirm its version. The swap is a single rename, so a failed update leaves the old binary in place.

When an update crosses a major version, `update` says so and names `agentks migrate`. A project whose content is older than the new version can read stops at the version gate until you migrate it. See [Upgrading](../60_upgrading/01_overview.md).

## Pin a version or turn updates off

| Command | Effect |
|---|---|
| `agentks update --version X.Y.Z` | Install exactly X.Y.Z and pin it. Automatic updates pause |
| `agentks update --unpin` | Follow stable releases again |
| `agentks update --disable` | Turn automatic updates off. `agentks update` still works |
| `agentks update --enable` | Turn automatic updates back on |

Setting `AGENTKS_AUTO_UPDATE=0` in your environment also turns automatic updates off. `false` and `off` work too.

These settings apply to the whole machine. To hold one project on an older version while the rest move on, pin it with mise, as [Upgrading between 1.x releases](../60_upgrading/25_within-1x.md) shows.

## Next

[Create your first project](./10_first-project.md).
