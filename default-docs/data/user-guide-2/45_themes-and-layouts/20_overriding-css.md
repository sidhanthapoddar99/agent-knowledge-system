---
title: "Overriding CSS"
---

When changing theme variables is not enough, you can restyle one part of a layout with your own CSS: the sidebar, the active link, the navbar brand. This page shows how to find the parts you may style, where your CSS goes, and why your rules win without `!important`.

## Start with a variable

Before you write a rule, check whether a variable already does the job. A new brand colour, a wider sidebar or a different font is one variable in your theme, and it reaches every layout and both colour modes at once. [The theme contract](./15_theme-contract.md) lists them all.

Write a CSS rule when you want to change one part only.

## See what you are overriding

Two commands show the CSS of the agentks version you have installed:

```bash
agentks theme css            # the compiled stylesheet, exactly as the viewer loads it
agentks theme css --hooks    # only the list of hooks, per layout
```

Read their output each time rather than a copy you saved earlier. The output always matches your installed version.

> [!TIP]
> An AI agent that writes CSS for you should run `agentks theme css --hooks` first and use only the hooks it lists.

## Hooks

A **hook** is a class name or a `data-part` attribute that a layout promises to keep. There are two kinds:

- **`data-part` attributes** name the main parts of a layout, such as `[data-part="sidebar"]`, `[data-part="outline"]` or `[data-part="navbar-brand"]`.
- **Class names** name the smaller pieces and their states, such as `.sidebar__link--active`.

Each layout has its own hooks, and `agentks theme css --hooks` lists them. Hooks are a public contract: agentks renames or removes one only in a release that ships a migration for it, so your CSS does not break in silence. Markup that is not on the hook list can change in any release, so do not target it.

## Write the rules

Put your rules in a CSS file of your theme, and list the file in its `theme.yaml`. [Themes](./10_themes.md) shows how to set up a theme folder.

```yaml
# config/themes/brand/theme.yaml
name: "Brand"
version: "1.0.0"
extends: "@theme/default"
files:
  - color.css
  - overrides.css
```

```css
/* config/themes/brand/overrides.css */
[data-part="sidebar"] {
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-default);
}

.sidebar__link--active {
  font-weight: 600;
}

[data-part="navbar-brand"] {
  font-size: var(--ui-text-title);
}
```

Use theme variables inside your rules, not fixed colours or pixel sizes. A rule that reads `var(--color-bg-secondary)` follows dark mode and any later theme change. A rule with a fixed colour stays the same in both modes. When you need a new colour, add it as a variable in your theme's colour file, with a light and a dark value, and read that variable in your rule.

## Why your rules win

agentks puts all CSS into cascade layers, in this order: `reset`, `theme`, `elements`, `components`, `user`. Every file of your theme goes into `user`, the last layer. In CSS, a rule in a later layer beats a rule in an earlier layer for the same property, even when the earlier rule has a more specific selector. So your rule wins without `!important`.

One exception: for `!important` declarations, the order is reversed, and an earlier layer wins. A few built-in rules, mostly for rendered markdown, use `!important`, and they beat an `!important` of yours on the same property. Leave `!important` out of your theme; you do not need it.

## Checklist

1. Can a theme variable do it? Then change the variable.
2. Run `agentks theme css --hooks` and pick the hook for the part you want.
3. Write the rule in a file your `theme.yaml` lists, using theme variables.
4. Look at the page in light and dark mode. While `agentks start` runs, a saved theme file shows up in the open page.
