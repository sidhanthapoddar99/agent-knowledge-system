---
title: "Command map"
---

This page maps every `agentks` command group in one line each, so you can find the command for a job. For a command's exact arguments and flags, ask the installed binary, which always describes the version you run:

```bash
agentks help <group> <command>          # usage, every flag, an example
agentks help <group> <command> --json   # the same, as JSON, for agents and scripts
```

For example, `agentks help issue list` or `agentks help share create --json`. The rules every command shares (finding the project, `--json`, exit codes) are on [the CLI overview](./01_overview.md).

## Reading content

| Group | Commands | What it is for |
|---|---|---|
| Overview | `agentks`, `overview`, `resolve-context` | The project's sections and issue counts; which project, config and content folders agentks found |
| Search | `find` | Search all content at once: docs, blog, issues and config, by text, frontmatter or path |
| Docs | `doc list · show · search` | List the pages of a docs section, show one page's metadata, search a section |
| Blog | `blog list · show · search` | List posts newest first, show one post's metadata, search the posts |

## The issue tracker

| Group | Commands | What it is for |
|---|---|---|
| Read | `issue list · show · tree · context · subtasks · agent-logs · review-queue` | Filter and search issues, show one issue, list its files, get a bounded brief for an agent, list subtasks, recent agent logs and what waits for review |
| Write | `issue set-state · add-comment · new-subtask · new-plan · new-stage · new-agent-log · new-round` | Change a status, add a numbered comment, and create subtasks, plans, stages, agent logs and rounds from their templates. `new-iteration` is another name for `new-round` |

## Checking and changing files

| Group | Commands | What it is for |
|---|---|---|
| Checks | `check config · section · blog · issues · link-form · libraries` | Validate the config, a docs section, the blog, the tracker, every internal link, and the libraries with the elements pages use |
| Move | `move` | Move or rename a file or folder and rewrite every link to it. Use `--dry-run` first |
| Images | `img` | Resize and convert images, and strip their metadata, before you commit them |
| Git | `git updated · changed · log · commit` | When content last changed, what changed since a revision, a file's history, and a guarded commit of one path that never pushes |
| Theme | `theme tokens · css · eject` | The theme's resolved values for light and dark, the compiled CSS with its layout hooks, and a copy of the theme into `config/themes/` to edit |

## Running the local app

| Group | Commands | What it is for |
|---|---|---|
| Server | `start · stop · ps · logs` | Serve this project (`--detach` for the background, `--share` for other machines), stop a server, list every agentks server on the machine, read the server log |
| Health | `doctor` | Check config, the version, libraries, the port and the runtimes. Reports only |

## Projects, publishing and upgrades

| Group | Commands | What it is for |
|---|---|---|
| Create | `init` | Create a project from a template (`agentks-default` into `docs/` unless you say otherwise) |
| Publish | `build` | Write the static site ([publishing](../55_publishing/01_overview.md)) |
| Migrate | `migrate` | Bring the content to this binary's version, with a dry run first ([upgrading](../60_upgrading/01_overview.md)) |
| Update | `update · shell-init` | Update agentks, check or pin a version, turn automatic updates on or off; print the shell set-up for the path and silent updates |
| Docs | `docs` | Open the agentks documentation in a browser, or print its address |

## Libraries and the machine cache

| Group | Commands | What it is for |
|---|---|---|
| Install | `install` | Install every locked library version missing from the machine's cache; `--update` moves to newer matching versions |
| Library | `library` · `library add · remove · list · show · find · search` | With no command, an interactive browser. Otherwise: add or remove a library, list the project's libraries, show one library's elements, find elements, search the catalog ([libraries](../40_libraries/01_overview.md)) |
| Cache | `cache status · clean · reset` | Show cache sizes, clean the machine's caches after a report, reset this project's build cache |

## Sharing

| Group | Commands | What it is for |
|---|---|---|
| Share | `share create · list · revoke · log` | Create an access key with a role and a label, list keys, revoke them, and see who edited which files ([editing and sharing](../50_editing-and-sharing/01_overview.md)) |

## Global flags

| Flag | Effect |
|---|---|
| `--config-dir PATH` | Use the project whose config folder is at `PATH` |
| `--json` | Write exactly one JSON document to stdout |
| `--help` | Show the help of the command it follows |
| `--version` | Print the installed version |
