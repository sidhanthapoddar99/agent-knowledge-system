---
title: "Dark mode"
---

Every agentks site has a light and a dark mode, and a reader can switch between them. Dark mode is not a second theme: it is a second set of colour values inside the same theme. This page shows how the mode is chosen and how to give your theme dark values.

## How the mode is chosen

- On the first visit, the site follows the reader's system setting for light or dark.
- The theme toggle in the navbar switches the mode. The browser remembers the choice, and later visits start in it.
- The mode is set before the page is drawn, so a dark page never flashes light first.

agentks marks the mode with an attribute on the page's root `<html>` element: `data-theme="light"` or `data-theme="dark"`. Your theme's CSS reacts to that attribute.

## Give your theme dark values

Write the light values under `:root` and the dark values under `[data-theme="dark"]`, in the same file:

```css
/* config/themes/brand/color.css */
:root {
  --color-bg-primary: #fafafa;
  --color-text-primary: #1a1a1a;
  --color-brand-primary: #7c3aed;
}

[data-theme="dark"] {
  --color-bg-primary: #0a0a0a;
  --color-text-primary: #fafafa;
  --color-brand-primary: #a78bfa;
}
```

Every layout reads these variables, so the whole site switches with them. You write no rule per part.

Set `supports_dark_mode: true` in your `theme.yaml` when it has dark values. A theme that leaves the field out takes its parent's value, and the built-in theme sets it to `true`.

## What to redeclare

| Redeclare in dark mode | Leave alone |
|---|---|
| Every colour variable whose value should differ: backgrounds, text, borders, brand, message colours | Font families and sizes |
| The eight issue status colours, so each status stays readable on a dark background | Spacing, radius and layout sizes |
| Shadows, if they are too faint on a dark background | The semantic text tokens (`--ui-text-*`, `--content-*`) |

Dark mode changes colour, not layout. If you find yourself redefining a size under `[data-theme="dark"]`, it probably belongs elsewhere.

## Check both modes

```bash
agentks theme tokens    # every variable's value, in light and in dark mode
```

`theme tokens` shows at a glance which variables your dark mode changes and which it inherits. Then open the site, switch the toggle and look at a docs page, the blog and the issue tracker in both modes. Code blocks take their colours from the theme too, so check one of those as well.

## Your own rules in dark mode

A rule that reads theme variables follows dark mode on its own. A rule with a fixed colour does not. When a part needs a different value in dark mode, prefer a variable. If you must write a rule, scope it to the mode:

```css
[data-theme="dark"] [data-part="sidebar"] {
  border-right-color: var(--color-border-light);
}
```

## Library widgets

A library widget runs in its own sandboxed frame and cannot see your page's mode. Pass it the mode with `?theme=dark`, or send it a theme message: see [HTML elements](../40_libraries/25_html-elements.md). Without either, a widget follows the reader's system setting.
