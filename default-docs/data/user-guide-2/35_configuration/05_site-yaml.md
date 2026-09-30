---
title: "site.yaml"
description: "Every top-level key of config/site.yaml: the site's identity, the content version, the port, the theme, the logo, the hosting prefix and the sections."
---

`config/site.yaml` is the main config file. It names the site, states which agentks version the content targets, chooses the theme and logo, and declares the sections. This page covers every top-level key. The sections under `pages:` have [their own page](./10_sections.md), and so do [the path aliases](./15_path-aliases.md) under `paths:`.

## A complete example

```yaml
site:
  name: "Handbook"
  title: "Team Handbook"
  description: "How we build and ship"

engine_version: "1.0.0"

server:
  port: 3088

paths:
  data: "../data"
  assets: "../assets"

theme: "default"
theme_paths: ["./themes"]

logo:
  src: "@assets/logo-dark.svg"
  alt: "Handbook"
  theme:
    dark: "@assets/logo-dark.svg"
    light: "@assets/logo-light.svg"
  favicon: "@assets/favicon.png"

pages:
  guide:
    base_url: "/guide"
    type: docs
    layout: "@docs/default"
    data: "@data/guide"
  todo:
    base_url: "/todo"
    type: issues
    layout: "@issues/default"
    data: "@data/todo"
  home:
    base_url: "/"
    type: custom
    layout: "@custom/home"
    data: "@data/pages/home.yaml"
```

## The keys

| Key | Required | Meaning |
|---|---|---|
| `site` | Yes | The site's name, title and description |
| `engine_version` | Yes | The content version the project targets |
| `server` | No | Settings for the local server: `port` |
| `paths` | No | Short names (aliases) for folders, used in the rest of the config |
| `theme` | Yes | The name of the active theme |
| `theme_paths` | No | Folders that hold your own themes |
| `logo` | No | The logo for each colour mode, and the favicon |
| `base_path` | No | The URL prefix a published site is served under. Default `/` |
| `pages` | Yes | The sections of the site |

A key agentks does not know is a warning that names the nearest known key. A key from an older content format is an error whose fix names `agentks migrate`; see [Upgrading](../60_upgrading/01_overview.md).

## site

```yaml
site:
  name: "Handbook"                        # required: the short name
  title: "Team Handbook"                  # required: the full title
  description: "How we build and ship"    # optional
```

The layouts show these in the site's chrome, such as the navbar, and in each page's metadata. The default navbar shows the name as text when no logo is set.

## engine_version

```yaml
engine_version: "1.0.0"
```

The content version: the version of the agentks content format that this project follows. agentks refuses to start a project whose content version it cannot read, and says how to fix it. Quote the value, and let `agentks init` and `agentks migrate` set it. A missing `engine_version` counts as `0.0.0`. [The version gate](./35_version-gate.md) explains the rules.

## server

```yaml
server:
  port: 3088
```

`server.port` fixes the local server's port for everyone who runs the project. Leave it out and agentks picks a stable port for the project on its first start. `AGENTKS_PORT` in `config/.env` overrides it on one machine. [Run the local server](../05_getting-started/20_local-server.md) explains the order.

The local server always listens on this machine only. No key in `site.yaml` changes that; sharing is a flag of `agentks start`.

## theme and theme_paths

```yaml
theme: "default"
theme_paths: ["./themes"]
```

`theme` names the active theme. `default` is built in. Any other name must be a theme folder inside one of the `theme_paths` folders. `theme_paths` entries are paths relative to `config/`, or aliases, and a folder that does not exist yet is allowed. [Themes and layouts](../45_themes-and-layouts/01_overview.md) covers writing a theme.

## logo

```yaml
logo:
  src: "@assets/logo.svg"              # required when logo is set
  alt: "Handbook"                      # optional; defaults to site.name
  theme:
    dark: "@assets/logo-dark.svg"      # optional: the logo in dark mode
    light: "@assets/logo-light.svg"    # optional: the logo in light mode
  favicon: "@assets/favicon.png"       # optional
```

Each value names a file inside the project, through an alias or a path relative to `config/`. The file must exist. A web address is refused: save the file in the project and name it.

## base_path

```yaml
base_path: "/docs"
```

The URL prefix under which a published copy of the site is served, such as `/docs` for a site at `example.com/docs/`. It matters only to `agentks build`, which also takes `--base` to override it. The local server always serves the site at `/`. See [Publishing](../55_publishing/01_overview.md).

## pages

Each entry under `pages:` declares one section: its address, its type, its built-in layout and its data. [Sections](./10_sections.md) documents the four fields and the rules between sections.
