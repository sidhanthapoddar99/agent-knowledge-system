---
title: "What changes, setting by setting"
description: "Every agent-ks 0.x setting, file and habit that changes in agentks 1.0, what replaces it, and what stays the same."
---

This page lists every difference between an agent-ks 0.x project and an agentks 1.0 project, so you can check your own project against it. `agentks migrate` makes the content and config changes; the rest are changes to how you install and run the program.

## Install and run

| agent-ks 0.x | agentks 1.0 |
|---|---|
| The `agent-ks` CLI, plus a framework folder cloned into each project | One `agentks` binary per machine, serving every project |
| `node_modules` in each project's framework folder | None. The site's code is inside the binary |
| Bun or Node to run the site | Nothing. Bun or Node only for `agentks build`, and `uv` only for `agentks migrate` |
| `./start` and `start.cmd` in the framework folder | `agentks start` in the project root |
| `./start update` pulled a newer framework | `agentks update` replaces the binary |
| Update state in your system's state folder | `~/.agentks/update.json`, in the machine home |
| `AGENTKS_UPDATE_DIR` | Gone. `AGENTKS_HOME` moves the whole machine home |

## Finding the project

| agent-ks 0.x | agentks 1.0 |
|---|---|
| `CONFIG_DIR` in the framework `.env` pointed at the config folder | Gone. agentks finds `config/` from `--config-dir`, then `AGENTKS_CONFIG_FOLDER`, then `./config` |
| The framework root was where the engine ran | There is no framework root. The project root is the folder that holds `config/` |
| `@root` meant the framework folder | `@root` means the project root |

## .env

| agent-ks 0.x | agentks 1.0 |
|---|---|
| `.env` at the framework root | `config/.env`, optional and never committed |
| `CONFIG_DIR=…` | Gone |
| `PORT=3088` | `server.port: 3088` in `site.yaml`. `AGENTKS_PORT` in `config/.env` overrides it on one machine |
| `HOST=true` | Gone. The server listens on this machine only; `agentks start --share` lets others in with an access key |
| `LAYOUT_EXT_DIR=…` | Gone, with custom layouts |

A removed variable left in `config/.env` is an error that names its fix. [Local overrides](../35_configuration/25_local-overrides.md) documents the new file.

## site.yaml

| agent-ks 0.x | agentks 1.0 |
|---|---|
| `engine_version: "0.x.y"` | `engine_version: "1.0.0"` |
| `server.allowedHosts` | Gone. Sharing is a flag of `agentks start`, with access keys |
| The `editor:` block with autosave and presence timings | Gone |
| `paths:` with `data` and `assets` required | `paths:` optional, and no key in it is required |
| `@ext-layouts` in a `layout` value | Gone. `layout` names a built-in layout only |
| No `base_path` | `base_path`, optional: the URL prefix for a published site |

Every other key keeps its meaning: `site`, `theme`, `theme_paths`, `logo` and each section's `base_url`, `type`, `layout` and `data`. [site.yaml](../35_configuration/05_site-yaml.md) documents them all.

## New files

| File | What it is |
|---|---|
| `config/dep.yaml` | The project's libraries. Required, even as `libraries: {}`. The migration creates it |
| `config/dep.lock` | The exact library versions. agentks writes it when it first installs the project's libraries; you never edit it |

## Layouts

| agent-ks 0.x | agentks 1.0 |
|---|---|
| Your own layouts in a layouts folder, found through `LAYOUT_EXT_DIR` | Gone. Pick a built-in layout, and brand it with CSS |
| A custom page type through a custom layout | An HTML artifact page |

The built-in layout names are unchanged: `@docs/default`, `@docs/compact`, `@blog/default`, `@issues/default`, `@custom/home`, `@custom/info`, `@custom/countdown`, and the navbar and footer styles. [Finish the move](./07_finish-the-move.md) explains the replacements.

## The AI plugin

| agent-ks 0.x | agentks 1.0 |
|---|---|
| The `agent-ks` plugin | The `agentks` plugin |
| Skills named `agent-ks-*` | Skills named `agentks-*` |
| Installed from a personal marketplace | Installed from `NeuraLabsHQ/neuralabs-plugin-marketplace` |

## What stays the same

- **Your pages.** Markdown with relative links and `[[path]]` embeds, `NN_` prefixes, a `settings.json` in every docs folder, and `title` frontmatter. If a release changes any of it, `agentks migrate` makes the change for you.
- **The issue tracker's anatomy.** One folder per issue with its `settings.json` and `issue.md`, and the same `brainstorm/`, `notes/`, `plans/`, `subtasks/`, `agent-log/`, `agent-memory/` and `comments/` sections. The statuses and their categories are the same. See [The issue tracker](../30_issue-tracker/01_overview.md).
- **`navbar.yaml` and `footer.yaml`.** Same keys, same `page:` and `href:` links.
- **Path aliases** under `paths:`, and the theme settings.
- **Where your content lives.** Your section folders stay where they are.
- **The command conventions.** `--config-dir`, `AGENTKS_CONFIG_FOLDER`, `--json`, and exit codes 0, 1 and 2. Most commands only change their first word; see [Command changes](./15_command-changes.md).
