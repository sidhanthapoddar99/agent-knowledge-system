---
title: Theme Configuration
description: Configure site theme and theme inheritance in site.yaml
---

# Theme Configuration

This page covers the `theme` and `theme_paths` fields in `site.yaml` — how to **select** a theme. For the full theme system (token contract, creating themes, variable reference), see the [Themes section](../../25_themes/01_overview.md).

The `theme` field specifies which theme to use for the site's styling. The value is a **theme name** (not an alias).

```yaml
# Use default built-in theme
theme: "default"

# Use a custom theme
theme: "minimal"
```

| Value | Description |
|-------|-------------|
| `"default"` | Built-in theme from `src/styles/` |
| `"<name>"` | Custom theme found in `theme_paths` directories |

## Theme Discovery (`theme_paths`)

The `theme_paths` field lists directories to scan for user themes. Each entry can be an `@alias`, a relative path (from config dir), or an absolute path.

```yaml
# Explicit list of directories containing themes
theme_paths:
  - "@themes"                          # YOUR themes folder (via the @themes user alias)
  - "@root/default-docs/themes"        # framework-bundled themes (the defaults)
  # - "/other/themes"                  # absolute path also works
```

If `theme_paths` is omitted, only the built-in `"default"` theme is available.

## Theme Inheritance

Custom themes can inherit from the default theme, only overriding specific variables:

```yaml
# In themes/minimal/theme.yaml
name: "Minimal Theme"
extends: "@theme/default"  # Inherit from default
supports_dark_mode: true
```

See [Themes section](../../25_themes/01_overview.md) for complete details on creating and using themes, the token contract, and available variables.
