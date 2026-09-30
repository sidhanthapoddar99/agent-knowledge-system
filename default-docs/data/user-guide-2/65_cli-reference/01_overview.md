---
title: "The agentks CLI"
---

`agentks` is one command-line program for everything outside the browser: searching and checking content, writing to the issue tracker, moving files, running the local server, managing libraries, sharing and publishing. This page explains the rules every command follows, so you can use any of them, and read their output, the same way. The [command map](./05_command-map.md) lists every command group.

The CLI and the local app run the same code. A problem `agentks check` reports is the problem the page shows.

## How agentks finds your project

A **project** is a folder that contains a `config/` folder. agentks picks the config folder in this order:

1. `--config-dir PATH`, if you pass it.
2. The `AGENTKS_CONFIG_FOLDER` environment variable, if it is set.
3. `./config`, in the current folder.

The project root is the config folder's parent. If the chosen folder does not exist, a command that needs a project stops with an error; it never falls back to another folder.

```bash
agentks resolve-context                    # which project, config folder and content folders agentks found
agentks --config-dir ~/work/docs/config    # the project overview of another project
```

These commands work anywhere, without a project: `help`, `--version`, `init`, `ps`, `update`, `shell-init`, `docs`, `cache status` and `cache clean`.

Run `agentks` with no command to see the project overview: its sections and issue counts.

## Output

| You want | Use | What you get |
|---|---|---|
| To read it yourself | Nothing extra | Human-readable text |
| To feed it to a script or an agent | `--json` | Exactly one JSON document on stdout |

`--json` and `--config-dir` work before or after any command. Diagnostics always go to stderr, never to stdout, so `--json` output stays clean. A diagnostic starts with `agentks:`, then lists each problem as `file:line: kind: message`, with a `fix:` line under it when agentks knows the fix.

A command that fails under `--json` still writes one JSON document:

```json
{ "error": { "kind": "…", "message": "…", "records": [] } }
```

`records` holds the individual problems, when there are any.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | No result, a runtime error, or validation errors |
| `2` | Invalid usage: an unknown command or flag, or a bad value |

An unknown flag is always an error. agentks never ignores a flag, so a typo can never quietly widen a search.

Validators report errors and warnings separately. Warnings alone exit with `0`, so read the counts, not only the exit code.

## Getting exact flags

This reference names the commands. The installed binary describes its own flags, and that description always matches the version you run.

```bash
agentks help                        # every command, with one line each
agentks help issue                  # the commands in one group
agentks help issue list             # one command: usage, every flag, an example
agentks issue list --help           # the same
agentks help issue list --json      # one command, as JSON
agentks help --json                 # the whole catalog, as JSON
agentks --version                   # the installed version
```

`agentks help <command> --json` returns a list of entries. Each entry names the command and its group, a one-line summary, the usage line, every argument and flag with its description and default, an example, and what the command needs: a project, the network, or another program. Agents should read this instead of guessing a flag.

## What commands need

| Needs | Commands |
|---|---|
| Nothing but the binary | Every query, tracker, check, theme, server, cache and share command, `move`, and `library list`, `show`, `find` and `remove` |
| The network | `init`, `install`, `library`, `library add`, `library search`, `migrate`, `update` and `docs`; `build` and `start` only when a locked library is not in the machine's cache yet |
| `git` | The `git` commands |
| ImageMagick (`magick`) | `img` |
| Bun or Node | `build` |
| `uv` or Bun | `migrate`, depending on the language of the migration scripts |

A missing program is an error that names what to install. agentks never bundles or downloads a runtime by itself. `agentks doctor` checks the runtimes, among other things, and changes nothing.

Content commands start in milliseconds. They never touch the network and never check for updates. Only `agentks update`, and the optional shell hook that `agentks shell-init` sets up, look for a new release.

## Commands that remove things

A command that removes files outside your project, such as `agentks cache clean`, shows a report first and asks before it removes anything. So do `agentks cache reset` and `agentks share revoke`. Add `--yes` to skip the question, for example in a script that has already shown the report to a person.
