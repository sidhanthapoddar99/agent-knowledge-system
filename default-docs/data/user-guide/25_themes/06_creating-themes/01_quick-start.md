---
title: Quick Start — Color-Only Theme
description: The smallest possible custom theme — extend default, override a handful of colours, done in 5 minutes
sidebar_position: 1
---

# Quick Start — Colour-Only Theme

The smallest useful custom theme: **2 files, 5 lines of YAML, whatever colours you want**. Takes a couple of minutes.

This is the right starting point for:

- Rebranding a site (change the primary colour)
- Tweaking dark-mode backgrounds
- Matching a brand palette

Everything else — fonts, spacing, layouts — inherits from the default theme.

## The recipe

### 1. Create the theme folder

Custom themes live in your `themes/` folder at the project root (sibling of `config/`, `data/`, `assets/`):

```bash
mkdir -p themes/my-brand
```

### 2. Write the manifest — `theme.yaml`

```yaml
# themes/my-brand/theme.yaml
name: "My Brand"
version: "1.0.0"
extends: "@theme/default"
supports_dark_mode: true
files:
  - color.css
```

Five fields:

- `name` — display name
- `version` — semver (stored, not enforced)
- `extends: "@theme/default"` — inherit everything from default
- `supports_dark_mode: true` — declare dark-mode support
- `files: [color.css]` — only one file to add on top of default

### 3. Write the override — `color.css`

```css
/* themes/my-brand/color.css */

:root {
  --color-brand-primary: #7c3aed;      /* purple */
  --color-brand-secondary: #6d28d9;    /* darker purple */
}

[data-theme="dark"] {
  --color-brand-primary: #a78bfa;      /* lighter purple for dark */
  --color-brand-secondary: #8b5cf6;
}
```

Two colours, both modes. The rest of the 14 colours inherit from the default.

### 4. Activate in `site.yaml`

```yaml
# config/site.yaml
theme: "my-brand"
theme_paths:
  - "@themes"
```

If `theme_paths` already lists `"@themes"`, just change `theme:` to your new theme name.

### 5. Run dev, verify

```bash
./start dev
```

Open the site. Links and branded elements render in your new colour. Everything else looks identical.

## How the override works

The theme loader:

1. Reads your `theme.yaml` → sees `extends: "@theme/default"` → loads the default theme first
2. Concatenates **all** default CSS files (`color.css`, `font.css`, `element.css`, `markdown.css`, etc.) in order
3. Appends your `color.css` at the end
4. CSS cascade kicks in: later declarations win → your `--color-brand-primary` overrides the default's

So you get the full 46-variable contract for free (inherited from default), and your two overrides take precedence.

## Variations

### Full colour palette

Override all 14 colours + dark variants:

```css
:root {
  /* Backgrounds */
  --color-bg-primary:   #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary:  #f1f5f9;

  /* Text */
  --color-text-primary:   #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted:     #94a3b8;

  /* Borders */
  --color-border-default: #e2e8f0;
  --color-border-light:   #f1f5f9;

  /* Brand */
  --color-brand-primary:   #7c3aed;
  --color-brand-secondary: #6d28d9;

  /* Status — adjust only if brand conflicts */
  --color-success: #16a34a;
  --color-warning: #ca8a04;
  --color-error:   #dc2626;
  --color-info:    #0891b2;
}

[data-theme="dark"] {
  /* ...same structure with dark values... */
}
```

Still one file, still just extends default. The theme is just a colour replacement.

### Multi-file quick start

Add a second file for element tweaks:

```yaml
# theme.yaml
extends: "@theme/default"
files:
  - color.css
  - element.css
```

```css
/* element.css — adjust a couple of layout dimensions */
:root {
  --max-width-primary: 1400px;
  --sidebar-width: 260px;
}
```

No need to redeclare spacing / radius / shadow — inherits from default.

### No dark mode

Drop `supports_dark_mode: true` and skip the `[data-theme="dark"]` block:

```yaml
name: "Light Only"
extends: "@theme/default"
supports_dark_mode: false
files:
  - color.css
```

```css
:root {
  --color-brand-primary: #7c3aed;
}
```

The `supports_dark_mode` field is declarative — the loader doesn't enforce. What actually disables dark mode is removing the `[data-theme="dark"]` block. See [Dark Mode](../08_dark-mode.md).

## Common mistakes

| Mistake | What goes wrong |
|---|---|
| Declaring `--color-brand-primary` only under `:root` (not dark) | Dark mode keeps showing the default brand colour |
| Forgetting `extends: "@theme/default"` | Theme becomes standalone — most variables undefined |
| Listing a file in `files:` that doesn't exist | Loader errors at startup |
| Typo in variable name (`--color-brand-promary`) | Silent — default's value persists via cascade |
| Putting `theme_paths` inside `paths:` | Wrong location — `theme_paths:` is top-level in site.yaml |

## Example ship-it theme

Full working example (this is what a real colour-only theme looks like):

**`themes/sunset/theme.yaml`**

```yaml
name: "Sunset"
version: "1.0.0"
description: "Warm orange-to-pink brand palette"
extends: "@theme/default"
supports_dark_mode: true
files:
  - color.css
```

**`themes/sunset/color.css`**

```css
:root {
  --color-brand-primary:   #f97316;
  --color-brand-secondary: #ea580c;
  --color-info:            #f472b6;
}

[data-theme="dark"] {
  --color-brand-primary:   #fb923c;
  --color-brand-secondary: #f97316;
  --color-info:            #f9a8d4;
}
```

Two files, 14 lines of CSS, done. Everything else (fonts, spacing, layout, component styles) inherits from default.

## Next steps

- More than colours? → [Extending Default](./02_extending-default.md) — typical multi-file custom theme
- Completely replace the theme? → [Standalone Theme](./03_standalone-theme.md) — `extends: null`, define all 46 vars yourself
- Understand merge vs override? → [Inheritance and Override](../07_inheritance-and-override.md)
