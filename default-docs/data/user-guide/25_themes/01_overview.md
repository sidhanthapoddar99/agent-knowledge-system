---
title: Themes Overview
description: What a theme is, what the contract guarantees, and the "no hardcoded values" rule the whole system rests on
sidebar_position: 1
---

# Themes

A theme is a set of CSS files that define every visual decision in the site: colors, typography, spacing, shadows, layout dimensions. The framework's layouts don't make any of those decisions themselves — they consume CSS custom properties that a theme provides. Switch the theme and the site re-skins entirely, no layout edits needed.

## The rule that makes it work

**Layouts MUST NOT hardcode colors, font sizes, spacing, radii, shadows, or any other visual values.** Every visual decision goes through a theme variable.

```css
/* ❌ NEVER */
color: #1a1a1a;
font-size: 14px;
padding: 8px 16px;

/* ✅ ALWAYS */
color: var(--color-text-primary);
font-size: var(--ui-text-body);
padding: var(--spacing-sm) var(--spacing-md);
```

This isn't a style preference — it's the **contract** that makes every other feature work: theme switching, dark mode, user themes that extend the default, enforced typography standards. Break the rule in one place and switching themes leaks weird artifacts.

**Today's audit:** grep across `src/layouts/` found 457 `var(--…)` uses and **zero** hardcoded colors, font sizes, or spacing values. The system is clean. See [Rules for Layout Authors](./10_rules-for-layout-authors.md) for the full contract.

## The 46-variable contract

Every theme must define **46 CSS variables** across three categories:

| Category | Count | What they carry |
|---|---:|---|
| Colors | 14 | Backgrounds, text, borders, brand, status |
| Fonts | 19 | Font families, primitive size scale, semantic UI + content + display tokens |
| Elements | 13 | Spacing, radii, shadows, transitions |

That's the fixed set. A theme missing any of them warns at load time (or errors, depending on inheritance mode). The full list + what each variable means is on the next page: [The Theme Contract](./02_the-theme-contract.md).

## Text size standardisation — the two-tier typography model

Font sizes are the **one part of the system that's two-tier**, because they're the easiest thing for layouts to get sloppy with. Instead of reaching for `--font-size-sm` or `--font-size-lg` directly, layouts consume **semantic tokens** that carry intent:

| Tier | Example tokens | Role |
|---|---|---|
| **Primitive scale** | `--font-size-xs / sm / base / lg / xl / 2xl / …` | The palette. Themes define. **Layouts don't use directly.** |
| **UI semantic** | `--ui-text-micro / body / title` | Chrome — buttons, cards, nav, forms. Three tiers, no more. |
| **Content semantic** | `--content-body / h1 / h2 / …` | Rendered markdown. Consumed by `markdown.css`. |
| **Display** | `--display-sm / md / lg` | Marketing / landing only. |

For card titles, primary buttons, anything needing emphasis: use `--ui-text-body` + `font-weight: 600`. Don't add a fourth UI size tier — weight and color carry hierarchy better than size once you're past three tiers.

Colors, spacing, radii, shadows, transitions are **one-tier** — semantic names used directly. There's no "primitive color palette" to pick from; colors are already named by role (`--color-text-primary`, `--color-brand-primary`).

Full story: [Typography](./04_tokens/03_typography.md), [Colors](./04_tokens/02_colors.md).

## How a theme gets loaded

```
site.yaml
  theme: "minimal"
  theme_paths: ["@themes"]
        │
        ▼
  Config loader
    1. Scan theme_paths directories
    2. Find "minimal/theme.yaml"
    3. Resolve to absolute path
        │
        ▼
  Theme loader
    1. Load theme.yaml manifest
    2. If extends: recursively load parent chain
    3. Concatenate CSS files in manifest order
    4. Validate against required_variables
        │
        ▼
  BaseLayout.astro
    Injects concatenated CSS into <head>
```

No runtime switching — the active theme is baked in at build/dev-start time. Switch themes by changing `site.yaml theme:` and re-running.

## Default vs custom themes

| Kind | Where | How to activate |
|---|---|---|
| **Built-in default** | `astro-doc-code/src/styles/` (inside the framework) | `theme: "default"` |
| **Framework-bundled** | `default-docs/themes/<name>/` (e.g. `full-width`, `minimal`) | `theme: "<name>"` with `theme_paths: ["@root/default-docs/themes"]` |
| **Your custom** | `themes/<name>/` (your project root) | `theme: "<name>"` with `theme_paths: ["@themes"]` |

Custom themes almost always `extend: "@theme/default"` — you get all 46 variables for free and only override what you actually want to change. A color-only custom theme can be **two files and 30 lines**. See [Creating Themes / Quick Start](./06_creating-themes/01_quick-start.md).

Standalone themes (`extends: null`) are possible too — for those, you define all 46 variables from scratch. [Standalone Theme walkthrough](./06_creating-themes/03_standalone-theme.md).

## Dark mode

Not a separate theme — a **mode switch inside the same theme**. Both sets of color values live in the same CSS file:

```css
:root {
  --color-bg-primary: #fafafa;
  --color-text-primary: #1a1a1a;
}

[data-theme="dark"] {
  --color-bg-primary: #0a0a0a;
  --color-text-primary: #fafafa;
}
```

Non-color variables (fonts, spacing) stay the same across modes. See [Dark Mode](./08_dark-mode.md).

## What's in this section

| Page | For |
|---|---|
| [The Theme Contract](./02_the-theme-contract.md) | The 46 required variables, grouped, with meanings |
| [Theme Structure](./03_theme-structure.md) | `theme.yaml` schema · directory layout · file loading · CSS merge order |
| [Tokens](./04_tokens/01_overview.md) | Per-category variable reference — colors, typography, spacing, etc. |
| [Component Styles](./05_component-styles/01_overview.md) | The non-variable CSS that consumes tokens — markdown, navbar, docs, etc. |
| [Creating Themes](./06_creating-themes/01_quick-start.md) | Three walkthroughs — color-only, extending default, standalone |
| [Inheritance and Override](./07_inheritance-and-override.md) | `extends` · `merge` / `override` / `replace` modes · cascade order |
| [Dark Mode](./08_dark-mode.md) | The `[data-theme="dark"]` pattern · testing · gotchas |
| [Validation](./09_validation.md) | What the loader checks · error vs warning behaviour |
| [Rules for Layout Authors](./10_rules-for-layout-authors.md) | The no-hardcoded-values contract, enforced |
