---
title: "The CLI crate"
description: "agentks-cli: how the agentks binary is laid out, how a command runs, the output and exit-code contract, and where a new command's rule belongs."
---

`agentks-cli` (layer 8) builds the `agentks` binary. It sits at the top of the workspace: it may use every other crate, and nothing uses it. It owns argument parsing, the command surface, the output formats and exit codes, the self-updater, and the embedded static renderer. It is the only crate that prints.

**No content rule lives here.** When a command needs a rule, the rule goes into the lower crate that owns it, and the command calls it. That is what keeps `agentks check` and the page in the browser in agreement.

This page explains the crate's shape. The commands themselves are listed in the [CLI reference](../../user-guide-2/65_cli-reference/01_overview.md).

## Layout

| Path in `apps/agentks-engine/crates/cli/` | Holds |
|---|---|
| `src/main.rs` | Parses the arguments, runs the command, maps the result to an exit code |
| `src/args/` | The clap command tree: every command, flag and argument. This tree is the manifest of the CLI |
| `src/catalog/` | What clap cannot hold: each command's example and what it needs to run; `agentks help`, `help <group> <command>` and `help --json` |
| `src/run/` | One runner per family of commands. Each finds the project, calls the lower crate and formats the result |
| `src/output.rs` | The only module that writes to stdout and stderr |
| `src/error.rs` | `CliError` and the exit codes |
| `src/update/` | The self-updater and `shell-init` |
| `src/img/` | `agentks img`, which calls ImageMagick |

## How a command runs

1. `main` reads the arguments and parses them against the clap tree from `catalog::command()`. A usage error prints clap's message and exits with `2`.
2. `run::run` dispatches to the runner for the command family.
3. The runner builds a `Ctx`: the global flags, the output, the machine home and, when the command reads a project, the project location from the config crate's `discover`.
4. The runner calls the lower crates: for example `agentks-site` opened in `Check` mode, `agentks-cache` for the cache commands, or `agentks-migrate` for `migrate`.
5. The runner hands the result to `Output`, which writes human text or one JSON document.
6. `main` turns the result into the exit code.

When a command asks before it changes something outside the project, such as `agentks cache clean`, the runner asks through `Ctx`. A `--yes` flag answers in advance.

## The catalog

`apps/agentks-engine/crates/cli/src/catalog/table.rs` holds one entry per command:

| Field | Meaning |
|---|---|
| `name` | The command path, such as `issue list` |
| `example` | One or more full `agentks …` example lines |
| `project` | Whether it reads a project |
| `network` | Whether it may use the network |
| `runtime` | Programs it needs on the `PATH`, such as ImageMagick for `img` |

`agentks help --json` prints the whole catalog: each command's usage, arguments, flags, example and needs. An agent can plan a command from it without guessing a flag. Tests keep the catalog honest:

- the table and the clap tree must name exactly the same commands;
- every example must run `agentks`;
- a JSON entry must carry the flags, the example and the needs.

## The output contract

| Rule | Detail |
|---|---|
| `--json` writes exactly one JSON document to stdout | So a caller can parse stdout without cleaning it |
| Human text goes to stdout, diagnostics always to stderr | Diagnostics start `agentks: message` |
| Problems print as `file:line: kind: message` | With `  fix: suggestion` on the next line, the same form as the [error model](./15_error-model.md) |
| A failed command under `--json` writes `{"error": {"kind", "message", "records"?}}` | `records` holds the error records behind the failure |

| Exit code | Meaning |
|---|---|
| `0` | Success |
| `1` | No result, a runtime error, validation errors, or a command that is not built yet |
| `2` | Invalid usage: an unknown flag, a bad value, a missing argument |

An unknown flag fails. It never widens a query.

## Project selection and the machine home

- **The project.** `--config-dir`, then `AGENTKS_CONFIG_FOLDER`, then `./config`, through the config crate's `discover`. Commands that need no project, such as `help`, `--version`, `ps` and `update`, never call it.
- **The machine home.** `AGENTKS_HOME` when set, otherwise `~/.agentks`.

## The updater

Only `agentks update` and the shell hook check for updates. Ordinary commands never do, so they start fast. The release source is the official repository named in `agentks-core`, and nothing overrides it. The updater keeps its state in `update.json` in the machine home, and takes `update.lock` while it installs. `agentks shell-init <shell>` prints the hook that runs a silent background check. The background process prints nothing.

## The embedded bundles

The binary carries two prebuilt JavaScript bundles, included at compile time: the client, which `agentks-server` embeds and serves, and the static renderer, which this crate embeds and `agentks build` unpacks and runs with Bun or Node.

## Adding a command

1. Put the rule in the lower crate that owns it, with its tests.
2. Add the command, its flags and their help to `apps/agentks-engine/crates/cli/src/args/`.
3. Add its catalog entry, with an example and its needs, to `apps/agentks-engine/crates/cli/src/catalog/table.rs`. The tests fail until the table and the tree match.
4. Add the runner in `apps/agentks-engine/crates/cli/src/run/`: find the project if it needs one, call the lower crate, hand the result to `Output`.

## Related

- [The engine](./01_overview.md): the crates a command calls.
- [Site: the engine as one object](./45_site.md): what one-shot commands open in `Check` mode.
