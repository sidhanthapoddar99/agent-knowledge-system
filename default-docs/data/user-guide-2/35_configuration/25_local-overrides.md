---
title: "Local overrides: config/.env"
description: "Override a setting on your machine only with config/.env, document it in .env.example, and the environment variables agentks reads."
---

`config/.env` changes a setting on your machine only, without touching the committed config. In agentks 1.0 it overrides one setting: the local server's port. This page covers the file, its companion `.env.example`, and the environment variables agentks reads from your shell.

## config/.env

```sh
# config/.env: this machine only; never committed
AGENTKS_PORT=3090
```

| Rule | Detail |
|---|---|
| Where | `config/.env`, beside `site.yaml` |
| Optional | A project runs without it |
| Not committed | It holds settings for one machine. The default template's `.gitignore` lists it |
| Overrides only | It may only override a setting `site.yaml` defines. It cannot add settings or choose where config lives |

The one key it accepts in 1.0:

| Key | Overrides | Example |
|---|---|---|
| `AGENTKS_PORT` | `server.port` in `site.yaml` | `AGENTKS_PORT=3090` |

Use it when the project's usual port clashes with something else on your machine, or when you want your own port without changing it for everyone. The full order in which agentks picks a port is in [Run the local server](../05_getting-started/20_local-server.md).

## The file format

- One `NAME=value` per line.
- Blank lines and lines that start with `#` are ignored.
- A line may start with `export `, so the same file works in a shell.
- A value may be wrapped in single or double quotes. An unquoted value ends at ` #`, where a comment starts.

agentks reads the file on every start and every command that reads the project, and reports problems like any other config problem:

| You wrote | agentks says |
|---|---|
| A line that is not `NAME=value` | An error. A silently dropped line would be a lost setting |
| A port that is not a number from 1 to 65535 | An error |
| A key it does not know, such as `AGENTKS_PROT` | A warning that the key overrides nothing, with the nearest known key |
| A key from an older content format | An error that names the fix. See [Upgrading](../60_upgrading/01_overview.md) |

## config/.env.example

`.env.example` sits beside `.env` and is committed. It documents every key `.env` may set, so a new contributor knows what they can override. agentks does not read it. You write it as you like; for example:

```sh
# Copy to config/.env and uncomment what you need.
# AGENTKS_PORT=3090    # use another port for the local server on this machine
```

## What does not go in .env

- **Secrets and access keys.** Access keys for sharing a server are kept in the machine home, stored only as hashes. See [Editing and sharing](../50_editing-and-sharing/01_overview.md).
- **The location of the project.** agentks finds `config/` from the command line, the environment or the current folder, never from `.env`. See [Configuration](./01_overview.md).

## Environment variables in your shell

These variables are read from your shell's environment, not from `config/.env`:

| Variable | Effect |
|---|---|
| `AGENTKS_CONFIG_FOLDER` | The config folder to use when `--config-dir` is not given |
| `AGENTKS_HOME` | Another location for the machine home instead of `~/.agentks/`. Must be an absolute path |
| `AGENTKS_AUTO_UPDATE` | `0`, `false` or `off` turns automatic updates off |
