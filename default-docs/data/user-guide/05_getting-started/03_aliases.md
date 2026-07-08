---
title: Path Aliases
description: Complete reference for all path aliases and how to use them
---

# Path Aliases

Path aliases provide a clean, consistent way to reference files and directories across the framework. Instead of using relative or absolute paths, you can use `@alias/path` syntax.

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PATH ALIAS RESOLUTION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   @data/docs/overview.md                                                    │
│        │                                                                    │
│        ▼                                                                    │
│   ┌──────────────────────────────────────┐                                  │
│   │   Alias Resolver                     │                                  │
│   │   1. Extract prefix (@data)          │                                  │
│   │   2. Look up base path               │                                  │
│   │   3. Append remaining path           │                                  │
│   └──────────────────────────────────────┘                                  │
│        │                                                                    │
│        ▼                                                                    │
│   /path/to/project/data/docs/overview.md                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Available Aliases

Aliases fall into two camps: **system reserved** (fixed by the framework) and **user defined** (declared in `site.yaml`).

```
                            PATH ALIASES
                            ════════════

┌─ SYSTEM RESERVED ───────────────────────────────────────────────┐
│ Fixed prefixes shipped with the framework.                      │
│ Cannot be renamed or removed. Resolved at render time.          │
│                                                                 │
│   Layouts   @docs   @blog   @issues   @custom                   │
│             @navbar   @footer   @ext-layouts                    │
│                                                                 │
│   Themes    @theme/default   @theme/<name>                      │
│                                                                 │
│   Framework @root  (the framework folder — bundled content)    │
└─────────────────────────────────────────────────────────────────┘

┌─ USER DEFINED ──────────────────────────────────────────────────┐
│ Declared in site.yaml → paths: section.                         │
│ Rename or add freely. Resolved at config load time.             │
│                                                                 │
│   Defaults     @data   @assets   @themes                        │
│                                                                 │
│   Bootstrap    @config    (set via CONFIG_DIR in .env)          │
│                                                                 │
│   Custom       any @key/ you declare under paths:               │
└─────────────────────────────────────────────────────────────────┘
```

### Layout Aliases (system, reserved)

Each content type has its own layout alias, pointing at a folder under `src/layouts/<type>/<style>/` inside the framework root (`astro-doc-code/`). From the repo root, the full disk path is e.g. `astro-doc-code/src/layouts/docs/default/`.

| Alias | Resolves To | Usage |
|-------|-------------|-------|
| `@docs/<style>` | `src/layouts/docs/<style>/` | Docs layouts |
| `@blog/<style>` | `src/layouts/blogs/<style>/` | Blog layouts |
| `@issues/<style>` | `src/layouts/issues/<style>/` | Issues layouts |
| `@custom/<style>` | `src/layouts/custom/<style>/` | Custom page layouts |
| `@navbar/<style>` | `src/layouts/navbar/<style>/` | Navbar layouts |
| `@footer/<style>` | `src/layouts/footer/<style>/` | Footer layouts |
| `@ext-layouts/` | External layouts directory (`LAYOUT_EXT_DIR` in `.env`) | Override built-in styles |

### Framework Root Alias (system, reserved)

`@root` resolves to **the framework folder** — specifically, the parent of `astro-doc-code/`, which is also where `.env` and `default-docs/` live. In consumer mode that's `agent-knowledge-system/` (a subfolder of your project); in dogfood mode it happens to be your project root because the framework repo *is* the project. Either way, `@root` always points at the framework folder, never at the consumer's outer project.

This is what you want when reaching the framework's bundled content — themes, the user-guide, the init template, etc. all live under `@root/default-docs/...`.

| Alias | Resolves To | Usage |
|-------|-------------|-------|
| `@root/<path>` | `<framework-folder>/<path>` | Any file under the framework folder |
| `@root/default-docs/...` | bundled content | The most common use — themes, the framework's own user-guide, etc. |
| `@root` (no subpath) | the framework folder itself | Rarely useful directly |

**Path-traversal is blocked** — `@root/../something` is rejected, since the normalised result must stay under the framework folder. This intentionally also prevents `@root` from reaching *out* into the consumer's project (e.g. `@root/../config` would fail). For consumer content, use the user-defined aliases declared in `site.yaml → paths:` (`@data`, `@assets`, etc.) which resolve relative to the config directory.

`@root` can also be used in `paths:` values in `site.yaml` to define your own user aliases against the framework folder — see [Directory Paths](../10_configuration/03_site/03_paths.md). The most common pattern is `default-docs: "@root/default-docs/data"` so the framework's bundled docs become reachable via `@default-docs/...`.

### Theme Aliases (system, reserved)

Used in `extends:` fields in `theme.yaml` manifests (not in site.yaml `theme:` field, which takes a plain theme name).

| Alias | Resolves To | Description |
|-------|-------------|-------------|
| `@theme/default` | `src/styles/` | Built-in default theme |
| `@theme/<name>` | `<themes-root>/<name>/` | Custom theme (scanned from `theme_paths`) |

### User Defined : Content & Data Aliases 

Any key under `paths:` in `site.yaml` becomes a usable `@key/...` alias. The defaults:

| Alias | Resolves To | Configured In |
|-------|-------------|---------------|
| `@data/` | Data directory | `site.yaml` → `paths.data` |
| `@assets/` | Assets directory | `site.yaml` → `paths.assets` |
| `@themes/` | Themes root (scanned for user themes) | `site.yaml` → `paths.themes` |
| `@config/` | Config directory | `CONFIG_DIR` (.env) |

Add more by declaring new keys — e.g. `paths: { shared_data: "../../shared" }` creates `@shared_data/`.

## Usage by Context

### In site.yaml

```yaml
# Layout aliases
pages:
  docs:
    layout: "@docs/default"    # src/layouts/docs/default/
    data: "@data/docs/final_docs" # paths.data/docs/final_docs/

  blog:
    layout: "@blog/default"   # src/layouts/blogs/default/
    data: "@data/blog"            # paths.data/blog/

# Theme (just the name — not an alias)
theme: "minimal"                  # scanned from theme_paths directories
theme_paths:
  - "@themes"                     # resolves via @themes alias

# Asset aliases
logo:
  src: "@assets/logo.svg"         # paths.assets/logo.svg → /assets/logo.svg
  favicon: "@assets/favicon.png"
```

### In navbar.yaml / footer.yaml

```yaml
# Footer layout alias
layout: "@footer/default"

# Page references (not aliases, but related)
links:
  - label: "Blog"
    page: "blog"  # Resolves to page's base_url
```

### In Markdown/MDX Files

```markdown
<!-- Asset embedding -->
\[[./assets/code.py]]

<!-- Image references -->
![Logo](@assets/logo.svg)
```

## Resolution at a glance

Three things to know about how aliases resolve — the rest is just applying these rules.

**1. Layout aliases point at folders, not files.**

```
@docs/default   →  src/layouts/docs/default/Layout.astro
@blog/default   →  src/layouts/blogs/default/IndexLayout.astro + PostLayout.astro
@navbar/default →  src/layouts/navbar/default/index.astro
```

**2. Data aliases resolve to filesystem paths.**

```
@data/docs/overview   →  <paths.data>/docs/overview
@data/pages/home.yaml →  <paths.data>/pages/home.yaml
```

**3. Asset aliases resolve to web URLs, not filesystem paths.**

```
@assets/logo.svg  →  /assets/logo.svg         (web URL)
                     <paths.assets>/logo.svg  (actual file location on disk)
```

## Path Configuration

Aliases are configured in two places, each with different path relativity:

| Setting | File | Relative To |
|---------|------|-------------|
| `CONFIG_DIR` | `.env` | **Framework folder** (where `.env` lives — `agent-knowledge-system/`) |
| `paths:` entries | `site.yaml` | **Config directory** (where `site.yaml` lives) |

Absolute paths work in both places.

**Consumer mode** — your content folders sit beside the framework folder:

```env
# agent-knowledge-system/.env — CONFIG_DIR points up to your config/
CONFIG_DIR=../config
```

```yaml
# config/site.yaml — paths relative to this file's directory
paths:
  data: "../data"       # config dir + ../data → <your-project>/data
  assets: "../assets"   # config dir + ../assets → <your-project>/assets
  themes: "../themes"   # config dir + ../themes → <your-project>/themes
  # data2: "/other/project/data"   # absolute path → used as-is
```

Resolution chain in consumer mode:
```
.env:  CONFIG_DIR = ../config   →  <your-project>/config/
site.yaml:  data = "../data"    →  <your-project>/data/
```

**Dogfood mode** (only relevant if you're working *on* the framework itself, against its bundled `default-docs/`):

```env
CONFIG_DIR=./default-docs/config   # framework folder + ./default-docs/config
```

| Alias | Configured In | Default (consumer mode) |
|-------|---------------|---------|
| `@data` | `site.yaml` paths | `../data` (relative to config dir) |
| `@assets` | `site.yaml` paths | `../assets` (relative to config dir) |
| `@themes` | `site.yaml` paths | `../themes` (relative to config dir) |
| `@config` | `.env` CONFIG_DIR | `../config` (relative to framework folder) |

## Error Display Aliases

In error logs and the dev toolbar, absolute paths are converted back to aliases for readability:

```
/Users/.../data/docs/overview.md
  → @data/docs/overview.md

/Users/.../config/site.yaml
  → @config/site.yaml

/Users/.../src/layouts/docs/...
  → @src/layouts/docs/...
```

## Best Practices

1. **Always use aliases in configuration files** — makes config portable across environments.
2. **Use `@assets/` for static files** — it resolves to a web URL so the link works in the browser.
3. **Use `@theme/` only inside `theme.yaml` `extends:`** — not in `site.yaml`'s `theme:` field (that takes a plain theme name).
4. **Declare user aliases in `site.yaml` `paths:`** rather than hardcoding relative paths — one place to change if content moves.
