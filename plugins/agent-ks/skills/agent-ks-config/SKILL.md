---
name: agent-ks-config
description: Set up and configure an agent-knowledge-system project. Use it for a new project from the starter template, a new top-level section, and every file under config/ (site.yaml, navbar.yaml, footer.yaml), the framework .env, path aliases, themes and theme.yaml, layout styles and custom layouts, custom pages and their YAML, and format migrations after a version-gate error. Trigger it for any setup or configuration question, even a one-line change. Content inside a section belongs to agent-ks-docs, agent-ks-blog or agent-ks-issues.
argument-hint: [new | section <name> | a topic]
allowed-tools: Read, Write, Edit, Bash
---

# agent-ks-config

Setup happens once, or once in a long while. So this skill is a set of complete references, one per topic. Read the one the task names; two when it crosses topics.

**Source of truth.** The bundled user guide at `@root/default-docs/data/user-guide/` wins over this skill; `@root` is the framework folder. When the two disagree, follow the guide, fix the skill, and say so.

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

## Two modes, one code path

Consumer mode: the framework is a subfolder of the user's project, and its `.env` says `CONFIG_DIR=../config`. Dogfood mode: the framework repo is the project, content lives under `default-docs/`, and `CONFIG_DIR=./default-docs/config`. The references write paths as `config/`, `data/`, `themes/`. Read them through the active mode.

## Never

| Never | Do instead |
|---|---|
| Scaffold, or append to `site.yaml`, without showing the plan and getting a yes | The confirm step in [01](./references/01_new-project.md) and [02](./references/02_add-section.md) |
| Overwrite an existing `settings.json`, `site.yaml` block or `CLAUDE.md` | `Edit` in place, or stop and ask |
| Clone the framework for the user | Print the command. The fork is their choice |
| Hardcode a colour, font, size or spacing in theme or layout CSS | A variable from the contract: [05_themes.md](./references/05_themes.md#the-contract) |
| Invent a CSS variable name with a fallback value | A contract variable, or propose one in `theme.yaml → required_variables` |
| Write a site-absolute path in a `paths:` value, or name another alias in it | Relative to the config dir, absolute, or `@root/…` |
| Bump `engine_version` past the gate | The migration chain: [08_migrations.md](./references/08_migrations.md) |
| Name a theme folder `default` | Any other name. `@theme/default` is the built-in |
| Rewrite a YAML file with `Write`, or reorder its keys | `Edit` the block that changes |

## After every change

Run `agent-ks check config`. Exit `0` is clean. A new `pages:` entry or a new layout folder needs a dev-server restart with `./start`. A CSS or YAML value edit hot-reloads.

If this skill is wrong, fix it and tell the user; do not work around it. Keep the user guide's skill catalogue page (`05_getting-started/05_claude-skills.md`) in step.
