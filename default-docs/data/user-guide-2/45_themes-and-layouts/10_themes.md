---
title: "Themes"
---

A theme sets your site's colours, fonts, text sizes, spacing and widths, in light and dark mode, across every layout at once. This page shows how to choose a theme, how to write your own on top of the built-in one, and what agentks checks.

## Choose a theme

`config/site.yaml` names the active theme. The key is required.

```yaml
theme: "default"                 # the built-in theme
```

To use a theme of your own, name it and say where themes live:

```yaml
theme: "brand"
theme_paths: ["./themes"]        # folders that hold themes, relative to config/
```

`theme_paths` lists the folders agentks searches for a theme folder with that name. `./themes` is `config/themes/`, the usual place. The name `default` always means the built-in theme, so no theme folder may use it.

## A theme folder

A theme is a folder with a `theme.yaml` and the CSS files it lists:

```text
config/themes/brand/
  theme.yaml
  color.css
  layout.css
```

```yaml
# config/themes/brand/theme.yaml
name: "Brand"
version: "1.0.0"
description: "Acme purple and a wider sidebar"
extends: "@theme/default"
supports_dark_mode: true
files:
  - color.css
  - layout.css
```

```css
/* config/themes/brand/color.css */
:root {
  --color-brand-primary: #7c3aed;
  --color-brand-secondary: #6d28d9;
}

[data-theme="dark"] {
  --color-brand-primary: #a78bfa;
  --color-brand-secondary: #c4b5fd;
}
```

```css
/* config/themes/brand/layout.css */
:root {
  --sidebar-width: 18rem;
}
```

That is a complete theme. It changes three variables and inherits everything else from the built-in theme.

## theme.yaml

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | The theme's display name |
| `version` | yes | The theme's own version, for you |
| `description` | no | One line on what it changes |
| `extends` | no | The parent theme, written `@theme/<name>`. Use `@theme/default` for the built-in theme |
| `supports_dark_mode` | no | `true` when the theme has dark values. Without it, the theme takes its parent's value |
| `override_mode` | no | How the theme's files meet its parent's: `merge` (the default), `override` or `replace` (below) |
| `files` | yes | The CSS files to load, in order |

agentks reads only the files that `files` lists, in that order. It does not follow `@import`, so list every file you want.

## Extending a theme

`extends` can name the built-in theme or another theme of yours, and that theme can extend a third. The chain always ends at the built-in `default` theme, or at a theme with no `extends`.

`override_mode` decides how a theme's files combine with its parent's:

| Mode | Result | Use it when |
|---|---|---|
| `merge` | The parent's files, then yours | You change some variables and add rules. This is almost always right |
| `override` | The parent's files, except any file whose name you also list, then yours | You replace one of the parent's files, such as `color.css`, completely |
| `replace` | Your files only | You write a theme from scratch. It must then define every variable on [the theme contract](./15_theme-contract.md) itself |

With `merge`, your files come after the parent's, so a variable you set wins over the parent's value.

## Start from the built-in CSS

```bash
agentks theme eject brand --use
```

`theme eject` copies the current theme into `config/themes/brand/` as a starting point for your edits. `--use` also sets `theme: "brand"` in `site.yaml`. Make sure `theme_paths` lists `./themes`, as shown above.

Two more commands help while you work:

- `agentks theme css` prints the compiled CSS of your project, exactly as the viewer uses it.
- `agentks theme tokens` prints every variable's value in light and dark mode. Add `--theme <name>` to see another theme.

While `agentks start` runs, it watches your theme folder. Save a file, and the open page picks up the new CSS.

## What agentks checks

agentks compiles your theme when it loads the project, and stops with an error that names the theme when:

- no folder in `theme_paths` holds the theme `site.yaml` names;
- a theme folder is named `default`;
- `extends` does not use the `@theme/<name>` form, names a theme that does not exist, or loops back on itself;
- `theme.yaml` is missing or does not parse, or a file it lists does not exist;
- the finished theme lacks a variable on [the theme contract](./15_theme-contract.md). The error names each missing variable.

A theme that extends `@theme/default` with `merge` inherits every contract variable, so it cannot miss one. Check the list when you use `override` or `replace`, or write a theme without `extends`.
