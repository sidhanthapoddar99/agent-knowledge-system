---
title: Native viewer lifecycle and bootstrap scripts
description: How the Rust CLI manages the viewer and how repository wrappers select configuration.
sidebar_label: Repo Scripts & start
sidebar_position: 2
---

# Native viewer lifecycle and bootstrap scripts

The Rust CLI owns viewer operations in `agent-ks-cli/src/viewer.rs` and its
`viewer/` modules. It invokes Bun or npm directly in `agent-ks-engine/`.
Astro supplies the dev and preview lock files and the server control commands.

The framework-root `start` and `start.cmd` wrappers perform bootstrap work:

1. Find `agent-ks` on PATH. If absent, offer the platform installer in an interactive terminal.
2. Read `CONFIG_DIR` from the framework-root `.env`. A process environment value takes precedence.
3. Run `agent-ks start --config-dir <path> --framework-dir <checkout>` with the caller's arguments.

Relative configuration paths resolve from the framework root. The wrappers parse
the environment file as data. They do not execute shell expressions in it.
Noninteractive runs with a missing CLI print installation instructions and exit.
Unix uses `agent-ks-cli/install.sh`; native Windows uses `agent-ks-cli/install.ps1`.
The Windows installer verifies the archive checksum and executable version before installation.

## Commands and dispatch

| Command | Native operation |
|---|---|
| `agent-ks start` or `start dev` | Start dev and follow logs. |
| `agent-ks start preview` | Serve the existing production build. |
| `agent-ks start build` | Stop servers, clean caches, and build. `--no-clean` preserves caches. |
| `agent-ks start doctor` | Dependency and version checks followed by a full build, without cleaning. |
| `agent-ks start update` | Check framework upstream and offer a fast-forward pull. |
| `agent-ks ps [dev\|preview]` | Report dev and preview servers; an argument selects one. |
| `agent-ks stop [dev\|preview]` | Stop dev and preview servers; an argument selects one. |
| `agent-ks start logs [dev\|preview]` | Read logs; defaults to dev. `--follow` streams them. |
| `agent-ks start clean [command]` | Stop servers, remove caches, then optionally run another command. |
| `agent-ks start <script>` | Run an engine package script. |

`start status` and `start stop` also expose server control.
All process controls are scoped to the selected framework checkout.
`agent-ks update` updates the CLI itself; `agent-ks start update` checks the framework.
Extra start arguments pass to the package runner. Use `--` before arguments that
share names with CLI flags. Viewer JSON output requires `--dry-run`.

## Dependency and version checks

The CLI prefers Bun and falls back to npm. It hashes `package.json` and the
selected runner's lockfile into `node_modules/.start-deps-stamp`.
A missing stamp or changed hash triggers installation. npm users receive a disk
usage notice because npm installs separate dependency trees for each project.

Before launch or build, the CLI reads `ENGINE_VERSION` and
`MIN_CONTENT_VERSION` from the engine's TypeScript source and compares them
with the selected `site.yaml`. Unsupported content stops the command.
Migration scripts are listed in numeric version order. The engine retains its
own version gate. An unreadable version constant produces a warning and defers
to that gate.

Server control and standalone cache cleanup skip dependency installation,
update prompts and the version check, so those operations remain available
when the content needs migration.

## Foreground and detached servers

Astro registers detached servers in its lock files. The CLI uses
`astro dev|preview status|stop|logs` through the package runner to find and
control them. Process-tree matching cannot reliably identify these daemons.

A foreground invocation follows logs. Interrupting it stops a server it started.
If the server already existed, interrupting the follower detaches and leaves the
server running. Signal handlers are installed before launch. An interrupted
launch waits for a late daemon registration before stopping it.
`--detach` returns after launch and leaves the server available to `ps` and `stop`.

Cleanup stops servers before removing `.astro/`, `dist/`,
`node_modules/.vite/` and `node_modules/.astro/` under the engine directory.
The first directory contains server lock files; removing it while a server runs
would orphan the server.

## Framework updates

Interactive launches check upstream at most once every six hours. The timestamp
lives in the checkout's Git directory. Updates require a clean tracked tree,
a configured upstream and a fast-forward relationship. Pulling requires an
interactive affirmative answer.

`start update` bypasses the timer and automatic-check opt-out. It reports why
an update cannot proceed. Noninteractive runs can report available commits but
do not pull. Consumer checkouts with full history may also offer an interactive
shallow-clone conversion.

| Environment variable | Effect |
|---|---|
| `START_NONINTERACTIVE=1` | Disable prompts. |
| `START_SKIP_UPDATE_CHECK=1` | Skip automatic framework update and shallow checks. |
| `START_UPDATE_INTERVAL_HOURS=N` | Change the check interval; zero checks every time. |
| `START_SKIP_VERSION_CHECK=1` | Skip the CLI precheck; the engine still enforces its gate. |

## Source ownership

- `agent-ks-cli/src/viewer.rs`: command dispatch, checkout selection, cloning and package execution.
- `agent-ks-cli/src/viewer/lifecycle.rs`: server control, signals, log following and cleanup.
- `agent-ks-cli/src/viewer/maintenance.rs`: dependencies, framework updates and content versions.
- `start`, `start.cmd`, `scripts/bootstrap.ps1`: CLI installation and configuration bootstrap.
- `scripts/bin/start`: the repository-local bare-name shim supplied by mise.
- `scripts/checks/`: development checks against the engine and rendered site.

## Read next

- [The native toolkit](../../user-guide/05_getting-started/10_native-toolkit.md)
- [The repo check scripts](../20_development/08_repo-check-scripts.md)
- [The version gate](../30_versioning/02_version-gate.md)
- [Code structure](./01_code-structure.md)
