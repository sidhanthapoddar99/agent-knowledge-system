---
title: "The machine home and cleanup"
description: "What agentks keeps in ~/.agentks, why nothing there is content, and how to see and free the space it uses."
---

agentks keeps everything that is not part of a project in one folder per machine, `~/.agentks/`, called the **machine home**. This page says what is in it and how to free space. Nothing in it is content, and agentks never cleans it on its own: you start every cleanup.

## Where it is

| System | Folder |
|---|---|
| Linux and macOS | `~/.agentks/` |
| Windows | `%USERPROFILE%\.agentks\` |

Set `AGENTKS_HOME` to an absolute path to use another folder, for example in CI or a container.

## What is in it

| Entry | Holds |
|---|---|
| `build-cache/` | One cache per project and agentks version: rendered pages, compiled theme CSS, highlighted code, and issue dates read from git |
| `build-cache.json` | One record per build cache, so status and cleanup need not walk every folder |
| `libraries/` | Every library commit a project has used, one folder per repository and commit, shared by all projects |
| `migrations/` | Migration scripts that `agentks migrate` downloaded, one folder per agentks version |
| `run/` | A record and a log for each running server |
| `ports.json` | The port agentks picked for each project |
| `share/` | Access keys for sharing a server, stored only as hashes |
| `update.json` | The update settings and the result of the last update check |

**Everything here can be rebuilt or downloaded again.** A deleted build cache is rebuilt on the next start. A deleted library commit is fetched again from the project's `dep.lock`. Losing the folder costs time and network, never content.

A project's build cache is tied to the project's location. If you move a project, it gets a fresh cache, and the next cleanup removes the old one.

## See how much space it uses

```sh
agentks cache status
```

`cache status` shows the size of the build caches and of the library cache. It changes nothing.

## Reset one project's cache

```sh
agentks cache reset
```

`cache reset` removes the build cache of the current project only. It asks first; add `--yes` to skip the question. The next `agentks start` rebuilds it. A server that is already running keeps its in-memory copy until it restarts.

Use it when a page looks stale and you want to rule out the cache.

## Clean the whole machine

```sh
agentks cache clean ~/projects
```

`cache clean` takes one or more folders to search, and works in four steps:

1. **It finds your projects.** It searches each folder for projects, which it recognises by their `config/dep.yaml`. On a large disk this can take a few minutes.
2. **It works out what they need.** It keeps every library commit that the found projects' `dep.lock` files name, on every local git branch, and everything a running server uses.
3. **It reports.** It lists the projects it found, what it would remove, and how much space that frees.
4. **It removes, after a yes.** It asks before deleting anything. Add `--yes` to skip the question.

It removes library commits that no found project needs, and build caches whose project folder no longer exists.

| Option | Effect |
|---|---|
| `--yes` | Remove without asking |
| `--current-branch-only` | Keep only what the checked-out branch's `dep.lock` needs, not every local branch's |
| `--json` | The report as one JSON document |

Cleanup is safe even when you get the folders wrong. If it removes a library that a project outside those folders uses, that project fetches the library again on its next start.

## Cleanup and AI agents

`cache clean` deletes files outside the project, so the agentks skills tell an agent to run it only when you ask, to show you the report, and to wait for your yes.

## Next

You have a running project. Go on to [Writing content](../10_writing-content/01_overview.md), or read [Configuration](../35_configuration/01_overview.md) to change the site's name, sections and theme.
