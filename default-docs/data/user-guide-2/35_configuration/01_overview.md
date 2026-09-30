---
title: "Configuration"
description: "The config folder: which files it holds, how agentks finds it, and how agentks reports a config problem."
---

Every setting of an agentks project lives in its `config/` folder. This section documents each file in it. This page covers what the folder holds, how agentks finds it, and how to check it.

## The files

| File | Required | Holds | Page |
|---|---|---|---|
| `site.yaml` | Yes | The site's identity, content version, sections, theme, logo and port | [site.yaml](./05_site-yaml.md), [Sections](./10_sections.md), [Path aliases](./15_path-aliases.md) |
| `navbar.yaml` | Yes | The navbar's style and links | [Navbar and footer](./20_navbar-and-footer.md) |
| `footer.yaml` | Yes | The footer's style, link columns and copyright | [Navbar and footer](./20_navbar-and-footer.md) |
| `dep.yaml` | Yes, even with no libraries | The libraries the project uses | [dep.yaml and dep.lock](./30_dep-yaml.md) |
| `dep.lock` | Written by agentks | The exact commit of every git library | [dep.yaml and dep.lock](./30_dep-yaml.md) |
| `.env` | No | Local overrides for your machine only | [Local overrides](./25_local-overrides.md) |
| `.env.example` | No | Documents every key `.env` may set | [Local overrides](./25_local-overrides.md) |

The version gate, which decides whether this agentks can read the project at all, has [its own page](./35_version-gate.md).

## How agentks finds the project

Every command that reads a project looks for its config folder in this order, and the first one given wins:

1. `--config-dir <path>` on the command line.
2. The `AGENTKS_CONFIG_FOLDER` environment variable.
3. `./config` in the folder you run the command from.

The **project root** is the config folder's parent. agentks does not search parent folders, so run commands from the project root or name the config folder:

```sh
cd ~/work/handbook && agentks start
agentks start --config-dir ~/work/handbook/config
AGENTKS_CONFIG_FOLDER=~/work/handbook/config agentks overview
```

A folder that is given but does not exist is an error. agentks does not fall back to the next source. `help`, `--version`, `update` and `shell-init` work without a project.

To see what agentks found, run:

```sh
agentks resolve-context
```

It prints the project root, the config folder, the content folders, the project's key and which of the three sources named the folder.

## How paths in config work

A path in a config file is either relative to the `config/` folder, such as `../data/guide`, or starts with an alias, such as `@data/guide`. [Path aliases](./15_path-aliases.md) explains aliases. Two rules apply everywhere:

- **No absolute paths.** A project must work wherever it is checked out.
- **Nothing outside the project.** A path that leaves the project root, including through a symbolic link, is an error.

## Check the config

```sh
agentks check config
```

agentks reads all four required files and `config/.env` together, and reports every problem it finds in one run, not only the first. Each problem names the file, the line, the kind of problem, the key and the fix. For example, a section that names a layout agentks does not have:

```
config/site.yaml:12: layout-unknown: `@docs/wide` is not a built-in docs layout (key pages.guide.layout)
  fix: use one of: @docs/default, @docs/compact
```

The same check runs every time a command reads the project, so `agentks start` refuses a broken config with the same messages. Two kinds of finding are only warnings, and the command carries on:

- **An unknown key** in a YAML file. The warning names the nearest known key, which catches typos.
- **An unknown variable** in `config/.env`. It overrides nothing, and agentks says so.

A key from an older content format is an error, not a warning, and its fix names `agentks migrate`. See [Upgrading](../60_upgrading/01_overview.md).

## What config does not do

- **Config holds no layout code.** Each section names one of the built-in layouts. You change the look with CSS; see [Themes and layouts](../45_themes-and-layouts/01_overview.md).
- **Markdown never uses aliases.** Pages link to each other with relative paths. See [Writing content](../10_writing-content/01_overview.md).
