---
title: Directory Paths
description: Configure content, asset, and theme directory paths with @key aliases
---

# Directory Paths

The `paths:` section defines where the system looks for content, assets, and themes. Each key becomes an `@key` alias (e.g., `data` → `@data/...`).

```yaml
paths:
  data: "../data"        # Content (docs, blog, pages)
  assets: "../assets"    # Static assets (logos, images)
  themes: "../themes"    # Custom theme directories
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data` | `string` | No | Path to content directory. Default: `../data` |
| `assets` | `string` | No | Path to static assets. Default: `../assets` |
| `themes` | `string` | No | Path to themes directory. Default: `../themes` |

**Paths are relative to the config directory** (where `site.yaml` lives). Absolute paths are also supported.

> **How this differs from `.env`:** `CONFIG_DIR` in `.env` is relative to **the framework folder** (where `.env` lives — `agent-knowledge-system/`). Paths in `site.yaml`'s `paths:` section are relative to the **config directory** (where `site.yaml` lives). Consumer-mode example: with `CONFIG_DIR=../config` (which puts the config dir at `<your-project>/config/`) and `data: "../data"`, the data directory resolves to `<your-project>/data/`. Dogfood-mode example: with `CONFIG_DIR=./default-docs/config` and `data: "../data"`, it resolves to `<framework-folder>/default-docs/data/`.

## Multiple Directories

You can define additional directories — each key becomes its own `@key` alias:

```yaml
paths:
  data: "../data"
  assets: "../assets"
  themes: "../themes"
  data2: "/other/project/data"     # @data2/...
  assets2: "/shared/brand-assets"  # @assets2/...
```

Additional directories are automatically categorized:
- Keys starting with `data` or `content` → content category
- Keys starting with `asset` → asset category (served at `/assets/`)
- Keys starting with `theme` → theme category
- `config` → config category

## Using `@root` in `paths:` values

Values in `paths:` can be relative to the config directory, absolute, or prefixed with `@root` to compose paths against the **framework folder** (where `.env` and `default-docs/` live — see [Path Aliases](../../05_getting-started/03_aliases.md) for what `@root` means in each mode):

```yaml
paths:
  data: "../data"                                # relative to config dir
  assets: "/shared/brand-assets"                 # absolute
  default-docs: "@root/default-docs/data"        # @root + subpath into the framework folder
```

This lets a user-defined alias (`@default-docs/...` here) reach into the framework's bundled content — that's the canonical way to make the framework's user-guide / dev-docs / themes available alongside your own content (e.g. include them as nav sections in your site).

`@root` cannot reach *outside* the framework folder (path-traversal is blocked). For your own content, use the regular relative or absolute paths shown above.

**Only `@root` is allowed in `paths:` values.** Other system aliases (`@docs`, `@theme`, …) are layout / theme concepts, and user-aliases-referencing-other-user-aliases is rejected to avoid declaration-ordering ambiguity. The framework will throw a clear error if you try, e.g.:

```yaml
paths:
  data: "../data"
  derived: "@data/something"   # ❌ throws — only @root is supported here
```

The same path-traversal guard applies — `@root/../escape` is rejected.

## Reserved Keys

The following keys cannot be used in `paths:` because they conflict with built-in layout / system aliases: `docs`, `blog`, `issues`, `custom`, `navbar`, `footer`, `theme`, `config`, `root`.

## Default Behavior

If `paths:` is omitted entirely, the system defaults to sibling directories of the config dir (`../data`, `../assets`, `../themes`).
