---
name: agent-ks-config
description: Set up and configure an agent-knowledge-system project. Use it for a new project from the starter template, a new top-level section, and every file under config/ (site.yaml, navbar.yaml, footer.yaml), the framework .env and its port, path aliases and routes, themes and theme.yaml — colours, fonts, dark mode, the logo and favicon — layout styles and custom layouts, custom pages (home, about, countdown) and their YAML, and format migrations when the site refuses to start with an engine-version error. Trigger it for any setup or configuration question, even a one-line change, and whenever the site will not start. Content inside a section belongs to agent-ks-docs, agent-ks-blog or agent-ks-issues.
argument-hint: [new | section <name> | a topic]
allowed-tools: Read, Write, Edit, Bash
---

# agent-ks-config

Setup happens once, or once in a long while. So this skill is a set of complete references, one per topic. Read the one the task names; two when it crosses topics.

**Source of truth.** The engine and the CLI decide anything they implement: the config keys, the layouts, the theme contract, the commands and the flags. Check a claim against them first, because they are what runs. The bundled user guide at `@root/default-docs/data/user-guide/` wins only on convention the code does not enforce; `@root` is the framework folder.

## Triage

| Task | Read |
|---|---|
| A fresh directory, "set up a project", `/agent-ks-config` with no argument | [01_new-project.md](./references/01_new-project.md) |
| Add a top-level section, `/agent-ks-config section <name>` | [02_add-section.md](./references/02_add-section.md) |
| Project structure, `.env`, `site.yaml`, routes, aliases, `./start`, `check config` | [03_site-config.md](./references/03_site-config.md) |
| `navbar.yaml`, `footer.yaml`, the logo | [04_navbar-footer.md](./references/04_navbar-footer.md) |
| A theme: new, extend, dark mode, a variable, a theme error | [05_themes.md](./references/05_themes.md) |
| Pick a layout style, or ship a custom layout | [06_layouts.md](./references/06_layouts.md) |
| A custom page: home, info, countdown, or a new layout for one | [07_custom-pages.md](./references/07_custom-pages.md) |
| A version-gate error, a legacy-field warning, "does this need migrating" | [08_migrations.md](./references/08_migrations.md) |
| Any `agent-ks` command or flag | [cli-toolkit.md](../agent-ks-cli/references/cli-toolkit.md) |
| A page inside a docs section | [the docs skill](../agent-ks-docs/SKILL.md) |
| A blog post | [the blog skill](../agent-ks-blog/SKILL.md) |
| The issue tracker | [the issues skill](../agent-ks-issues/SKILL.md) |

## Two modes

The references write paths as `config/`, `data/` and `themes/`. Read them through the active mode, consumer or dogfood: [03_site-config.md](./references/03_site-config.md).

## Never

| Never | Do instead |
|---|---|
| Scaffold, or append to `site.yaml`, without showing the plan and getting a yes | The confirm step in [01](./references/01_new-project.md) and [02](./references/02_add-section.md). You are writing into a folder the user owns |
| Overwrite an existing `settings.json`, `site.yaml` block or `CLAUDE.md` | `Edit` in place, or stop and ask. Each of these files already holds the user's own work |
| Clone the framework for the user | Print the command. Cloning reaches the network, and the fork is the user's choice |
| Rewrite a YAML file with `Write`, or reorder its keys | `Edit` the block that changes. The comments and the key order are the file's documentation, and a rewrite destroys both |

## After every change

Run `agent-ks check config`. Exit `0` is clean. A CSS or YAML value edit hot-reloads. A new `pages:` entry or a new layout folder needs a restart: run `./start stop`, then `./start --detach`. Never launch with a bare `./start`; it holds the terminal until `Ctrl-C` and the task stalls there.

If this skill is wrong, fix it and tell the user; do not work around it. The fix belongs in the framework repo, not in the installed plugin copy.
