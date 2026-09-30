---
title: "Path aliases"
description: "Give folders short names under paths: in site.yaml, and use them in the rest of the config."
---

A **path alias** is a short name for a folder, such as `@data` for `../data`. You define aliases under `paths:` in `config/site.yaml` and use them in other config values. They keep the config readable, and moving a folder becomes a one-line change.

## Define an alias

```yaml
paths:
  data: "../data"
  assets: "../assets"
  shared: "@root/shared/docs"
```

Each key becomes an alias with an `@` in front: `@data`, `@assets`, `@shared`. The value is the folder it stands for, written one of two ways:

| Form | Relative to | Example |
|---|---|---|
| A plain path | The `config/` folder | `"../data"` is the `data/` folder beside `config/` |
| `@root/…` | The project root | `"@root/shared/docs"` |

`paths:` is optional, and so is every key in it. A project can name every folder directly.

## Use an alias

Write the alias at the start of a path, followed by the rest of the path:

```yaml
pages:
  guide:
    data: "@data/guide"            # the folder data/guide/
logo:
  src: "@assets/logo.svg"          # the file assets/logo.svg
theme_paths: ["@root/themes"]      # the folder themes/ at the project root
```

Aliases work in every path in the config: a section's `data`, the `theme_paths` entries and the logo files. A path without an alias is relative to `config/`, so `"../data/guide"` and `"@data/guide"` name the same folder here.

## Built-in aliases

Two aliases always exist, and you cannot redefine them:

| Alias | Stands for |
|---|---|
| `@root` | The project root: the folder that holds `config/` |
| `@config` | The `config/` folder itself |

## Rules

| Rule | Why |
|---|---|
| An alias name uses letters, digits, `-` and `_` | So it reads the same everywhere |
| These names are reserved: `root`, `config`, `docs`, `blog`, `issues`, `custom`, `navbar`, `footer`, `theme` | agentks gives them a meaning of its own, as in `@docs/default` |
| Inside a `paths:` value, only `@root` may appear | Aliases never depend on each other, so their order does not matter |
| Each value must name a folder that exists | A typo shows up at once, not as an empty section later |
| No absolute paths | The project must work wherever it is checked out |
| Nothing outside the project | A value that leaves the project root, including through a symbolic link, is refused |

Using an alias you did not define is an error. When the name is close to one you did define, the error suggests it:

```
config/site.yaml:20: alias-unknown: the alias `@dat` is not defined (key pages.guide.data)
  fix: did you mean `@data`?
```

## Aliases are for config only

Markdown pages never use aliases. A page links to another page, or to an image, with a relative path from its own folder, such as `../10_setup/05_install.md`. That path is true on disk, in any editor and in agentks alike. See [Writing content](../10_writing-content/01_overview.md).
