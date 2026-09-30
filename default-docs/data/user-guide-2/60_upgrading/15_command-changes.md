---
title: "Command changes"
description: "Every agent-ks 0.x command and its agentks 1.0 form: renamed, replaced, gone, and new."
---

This page maps every agent-ks 0.x command to its agentks 1.0 form. Most commands keep their name, flags and behaviour, and only the program's name changes. The rest are listed one by one. There is no `agent-ks` alias in 1.0: scripts and notes that call `agent-ks` need the new name.

## Renamed only

These work as before. Replace `agent-ks` with `agentks`:

| Group | Commands |
|---|---|
| Overview and context | `agentks` with no command, `overview`, `resolve-context` |
| Search | `find`, `doc list`, `doc show`, `doc search`, `blog list`, `blog show`, `blog search` |
| Issue tracker | `issue list`, `issue show`, `issue tree`, `issue context`, `issue subtasks`, `issue agent-logs`, `issue review-queue`, `issue set-state`, `issue add-comment`, `issue new-subtask`, `issue new-plan`, `issue new-stage`, `issue new-agent-log`, `issue new-round` |
| Checks | `check config`, `check section`, `check blog`, `check issues`, `check link-form` |
| Files | `move`, `img` |
| Git | `git updated`, `git changed`, `git log`, `git commit` |
| Theme | `theme tokens` |
| Help | `help`, `help <group> <command>`, `help --json` |

For example:

```sh
agent-ks issue list --status all --search 'release' --json    # 0.x
agentks issue list --status all --search 'release' --json     # 1.0
```

## Changed

| agent-ks 0.x | agentks 1.0 | Why |
|---|---|---|
| `agent-ks init <shell>` | `agentks shell-init <shell>` | `init` now creates projects |
| `agent-ks update --pin X.Y.Z` | `agentks update --version X.Y.Z` | It installs X.Y.Z now and pins it, like the installer's `--version` |
| `agent-ks update --background --check` | `agentks update --background --check-only` | The shell hook's check-only mode |
| `agent-ks start`, `./start`, `./start dev` | `agentks start` | The site is served by the binary, with no framework folder |
| `./start doctor` | `agentks doctor` | It checks config, the version gate, libraries, the port and runtimes, and reports only |
| `./start logs [--follow]` | `agentks logs [--follow]` | |
| `./start clean` | `agentks cache reset` | It removes this project's build cache |
| `./start build` | `agentks build` | It writes the static site. agentks 1.0.0 cannot publish yet; see [Staying on agent-ks 0.x](./20_staying-on-0x.md) |
| `./start update` | `agentks update` | There is no framework to pull; the binary updates itself |
| `agent-ks ps` | `agentks ps` | It lists every agentks server on the machine, not one checkout's |
| `agent-ks stop [dev\|preview]` | `agentks stop`, `agentks stop --project <folder>`, `agentks stop --all` | One server per project; stop this one, another, or all |

## Gone

| agent-ks 0.x | Instead |
|---|---|
| `agent-ks check legacy-tags` | `agentks migrate` finds and replaces retired markup as part of the migration that retired it |
| `agent-ks check skill-links` | Nothing. It checked the plugin's own files, which is a job for the plugin's maintainers |
| `start --framework-dir`, `--framework-ref` | Nothing. There is no framework checkout |
| `start --no-clean` and the `START_*` environment variables | Nothing. They controlled the framework checkout and its build |

## New in 1.0

| Command | Does |
|---|---|
| `agentks init` | Create a project from a template |
| `agentks migrate` | Bring a project's content to this agentks version |
| `agentks install` | Install the libraries `dep.lock` names that this machine lacks |
| `agentks library …` | Add, remove, list, show, find and search libraries |
| `agentks check libraries` | Check the project's libraries and every element the pages use |
| `agentks cache status`, `cache clean`, `cache reset` | See and free the space in the machine home |
| `agentks theme css`, `theme eject` | Print the compiled CSS and its hooks; copy a theme into the project to edit |
| `agentks share …` | Access keys for letting others into a running server |
| `agentks docs` | Open these docs in a browser |

The hosted docs that `agentks docs` opens go live at launch, after `agentks build` ships.

`agentks help` lists every command, and [the CLI reference](../65_cli-reference/01_overview.md) documents each one.
