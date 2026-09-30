---
title: "CLI — the `agentks` command surface"
status: in-progress
---

The index leaf of the CLI group. `agentks` is one binary: the engine, the server and the command-line tool. This group renames today's `agent-ks` to `agentks`, ports every content command onto the shared core, and adds the commands a single machine-wide install needs. Commands owned by other groups are listed below so nothing is built twice.

# 01 To Do

| Leaf | Delivers | Status |
|---|---|---|
| [070/10 Rename to agentks](./10_rename-to-agentks.md) | Binary, installer, env vars, home folder, help text, the dev alias | open |
| [070/20 Content commands port](./20_content-commands-port.md) | Queries, tracker writers, validators, `move`, `find`, `img`, git helpers, `help` — on the shared core | open |
| [070/30 Start and dev mode](./30_start-and-dev-mode.md) | `start`, `stop`, `ps`, `logs`, `doctor`, `resolve-context`; state-1 dev mode | open |
| [070/40 Init from a template](./40_init-template.md) | `agentks init [--template] [path]` | open |
| [070/50 Docs command](./50_docs-command.md) | `agentks docs [page]` | open |
| [070/60 Cache commands](./60_cache-commands.md) | `cache status · clean · reset` | open |
| [070/70 Update and shell-init](./70_update-and-shell-init.md) | `update`, `shell-init`, update state in `~/.agentks/` | open |
| [070/80 Theme commands](./80_theme-commands.md) | `theme tokens · css · eject` | open |
| [070/90 Share commands](./90_share-commands.md) | `share create · list · revoke · log`, `start --share` | open |

**Owned elsewhere:** `install` and `library …` → [120/40](../120_libraries/40_library-commands-and-tui.md); `migrate` → [140/20](../140_versioning-and-migrations/20_migrate-command.md); `build` → [150/10](../150_publishing/10_agentks-build.md); the release channel behind `update` → [160/20](../160_distribution/20_update-channel.md). Those leaves follow the conventions below.

**Order of work.** 10 and 20 first (everything else plugs into the ported command framework), then 30, 80, 60, 70, 40, 90, and 50 last (it ships when the site is live).

## Guardrails
The conventions every command follows (carried from today's CLI, [Rust CLI, section 01](../../notes/02_engine/05_rust-cli.md)):
- Project selection: `--config-dir PATH` > `AGENTKS_CONFIG_FOLDER` > `./config`. `help` and `--version` work without a project.
- `--json` writes exactly one JSON document to stdout; diagnostics go to stderr.
- Exit codes: `0` success; `1` no result, runtime error or validation errors; `2` invalid usage.
- Unknown flags are errors, never ignored.
- One manifest drives `help`, `help <group> <command>` and `help --json`.
- Deleting anything outside the project shows a report and needs `--yes` or a typed confirmation.
- Content commands never touch the network, never check for updates and need no JavaScript runtime.
- Every rule a command checks comes from the shared core, so `check` and the rendered page agree.

## Done when
- Every leaf is closed.
- `agentks help --json` lists every command of the CLI note, including those owned elsewhere, and each one's help has an example.
- The CLI test suite ([170/10](../170_testing/10_rust-tests.md)) runs every command in `--json` mode against fixture projects on Linux, macOS and Windows.

# 02 Status and Result
In progress. Wave 2 (branch `wave2/cli`) built the command surface, the conventions, the updater and `shell-init`; see [070/10](./10_rename-to-agentks.md), [070/20](./20_content-commands-port.md) and [070/70](./70_update-and-shell-init.md).

## Result
- `agentks help --json` lists 65 commands: every command of the CLI note, including those owned elsewhere (`install`, `library …`, `check libraries`, `migrate`, `build`), each with an example.
- The conventions hold and are tested: project selection through `agentks-config`, `--json` one document, diagnostics on stderr, exit 0/1/2, unknown flags rejected, one manifest for all help.
- Commands that delete outside the project (`cache clean`, `cache reset`, `share revoke`) show a report and need `--yes` or a typed confirmation on a terminal; with no terminal and no `--yes`, or under `--json` without `--yes`, they change nothing.
- **Left:** the leaves listed in the table; most command logic waits for the lower crates.

## Agent log
none

# 03 References

**Where the work happens:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, crate `agentks-cli` in `apps/agentks-engine/crates/cli/` (the binary's `main`).

**Read first (every leaf):**
- [The Rust CLI](../../notes/02_engine/05_rust-cli.md) — the whole command surface, conventions, what leaves the binary, runtimes, the rename.
- [The agentks rename and new commands (brainstorm)](../../brainstorm/01_initial-discussion/08_cli-rename-and-commands.md).
- Today's CLI: [source](../../../../../../agent-ks-cli/src), [command manifest](../../../../../../agent-ks-cli/src/manifest.json), [tests](../../../../../../agent-ks-cli/tests/cli.rs), [README](../../../../../../agent-ks-cli/README.md).
- [Toolchain versions](../../agent-memory/toolchain-versions.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the installer and binary are named `agentks`; the rename covers binary, installer, home folder, plugins and skills.
- Decided (sidhantha, 2026-09-29): server commands such as `agentks ps` stay part of the CLI.
- Decided (sidhantha, 2026-09-29): the CLI and the server share one core.
- Decided (claude, 2026-10-01): the in-memory cache budget the CLI passes to `Site::open` is 256 MB (the proposed default of 040/30) until a crate reads `cache.memory_mb` from `~/.agentks/settings.json`.

# 05 Notes & Analysis

## Watch out
- The CLI crate stays thin: argument parsing, output formatting and calls into the core. A rule written in the CLI crate is a rule the site does not share.
