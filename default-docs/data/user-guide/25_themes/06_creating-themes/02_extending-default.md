---
title: Extending Default
description: A typical multi-file custom theme — colours, fonts, spacing, component styles, all inheriting from default
sidebar_position: 2
---

# Extending Default

The **typical custom theme shape** — extend the default, override multiple files, cherry-pick which parts to customise. Different from [Quick Start](./01_quick-start.md) in scale: multiple CSS files, richer customisation. Different from [Standalone Theme](./03_standalone-theme.md) in approach: still inheriting from default, not rebuilding from scratch.

This is the recommended path for most custom themes. You get the 46-variable contract, dark mode, component styles, and all default behaviour for free — then override exactly what you want to change.

## When to extend vs go standalone

| Extend default | Go standalone (`extends: null`) |
|---|---|
| You want to re-brand | You want total visual control |
| You're happy with the default's structure | You have a radically different design system |
| You'll change ≤ 5 files | You'll change every file |
| You want dark mode to "just work" | You want custom dark mode logic |

When in doubt, **extend**. You can always go standalone later.

## Example project: "Nordic" theme

A custom theme that:

- Uses Inter for UI, Lora for content headings
- Cool blue-gray colour palette
- Tighter spacing
- Larger rounded corners
- Custom navbar styling

### Directory

```
themes/nordic/
├── theme.yaml
├── color.css          ← colour palette override
├── font.css           ← Inter + Lora + @font-face
├── element.css        ← tighter spacing, larger radii
├── navbar.css         ← restyled navbar
└── assets/
    ├── Inter-var.woff2
    └── Lora-var.woff2
```

### Manifest — `theme.yaml`

```yaml
name: "Nordic"
version: "1.0.0"
description: "Cool, minimal, Inter + Lora"
extends: "@theme/default"
override_mode: "merge"      # default — both parent and child CSS load
supports_dark_mode: true
files:
  - color.css
  - font.css
  - element.css
  - navbar.css
```

### `color.css` — palette

```css
:root {
  --color-bg-primary:   #f8fafc;
  --color-bg-secondary: #f1f5f9;
  --color-bg-tertiary:  #e2e8f0;

  --color-text-primary:   #1e293b;
  --color-text-secondary: #475569;
  --color-text-muted:     #94a3b8;

  --color-border-default: #cbd5e1;
  --color-border-light:   #e2e8f0;

  --color-brand-primary:   #0ea5e9;
  --color-brand-secondary: #0284c7;

  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error:   #ef4444;
  --color-info:    #06b6d4;
}

[data-theme="dark"] {
  --color-bg-primary:   #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-tertiary:  #334155;

  --color-text-primary:   #f1f5f9;
  --color-text-secondary: #cbd5e1;
  --color-text-muted:     #94a3b8;

  --color-border-default: #334155;
  --color-border-light:   #1e293b;

  --color-brand-primary:   #38bdf8;
  --color-brand-secondary: #0ea5e9;

  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error:   #f87171;
  --color-info:    #22d3ee;
}
```

### `font.css` — custom fonts + override semantic tokens

```css
@font-face {
  font-family: 'Inter';
  src: url('./assets/Inter-var.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
}

@font-face {
  font-family: 'Lora';
  src: url('./assets/Lora-var.woff2') format('woff2');
  font-weight: 400 700;
  font-style: normal;
}

:root {
  /* Families */
  --font-family-base: 'Inter', system-ui, sans-serif;
  --font-family-heading: 'Lora', Georgia, serif;
  --font-family-mono: 'Fira Code', 'SF Mono', monospace;

  /* Ever-so-slightly different scale — a few points tighter */
  --font-size-sm:  0.8125rem;       /* 13px */
  --font-size-base: 0.9375rem;      /* 15px */
  --font-size-lg:  1.0625rem;       /* 17px */

  /* Semantic mappings stay the same — they pick from the primitive scale */
  /* but since we've nudged the primitives, the whole UI gets tighter */
}
```

Notice the approach: **we override the primitive scale, and the semantic tokens automatically follow**. The default theme's `--ui-text-body: var(--font-size-sm);` now resolves to 13px instead of 14px, without redeclaring `--ui-text-body`. One source of truth.

### `element.css` — tighter spacing, larger radii

```css
:root {
  /* Tighter spacing — 75% of default */
  --spacing-xs: 0.1875rem;     /* 3px  (was 4px) */
  --spacing-sm: 0.375rem;      /* 6px  (was 8px) */
  --spacing-md: 0.75rem;       /* 12px (was 16px) */
  --spacing-lg: 1.125rem;      /* 18px (was 24px) */
  --spacing-xl: 1.5rem;        /* 24px (was 32px) */

  /* Larger radii — more generous rounded corners */
  --border-radius-sm: 0.375rem;    /* 6px */
  --border-radius-md: 0.75rem;     /* 12px */
  --border-radius-lg: 1.25rem;     /* 20px */
}
```

### `navbar.css` — restyled navbar

```css
.site-navbar {
  background: var(--color-bg-secondary);
  border-bottom: none;
  box-shadow: var(--shadow-sm);
}

.site-navbar__link {
  font-family: var(--font-family-base);
  font-weight: 500;
  letter-spacing: var(--letter-spacing-tight);
}

.site-navbar__link--active {
  color: var(--color-brand-primary);
  font-weight: 600;
}
```

All styling consumes tokens. Every value is theme-driven.

## How the loader handles this

With `extends: "@theme/default"` and `override_mode: "merge"`, the loader concatenates:

```
/* --- Parent: @theme/default --- */
/* default color.css, font.css, element.css, markdown.css,
   navbar.css, footer.css, docs.css, blogs.css, ... */

/* --- Child Theme Overrides --- */
/* nordic/color.css, font.css, element.css, navbar.css */
```

CSS cascade means your overrides win. Default's `markdown.css` still renders prose (you didn't override it); your `navbar.css` takes precedence for nav styling; default `docs.css` remains in effect.

## Common extension patterns

### Override just fonts + colours

Most re-brand themes:

```yaml
files:
  - color.css
  - font.css
```

### Override element sizing only

"Same look, denser layout":

```yaml
files:
  - element.css
```

### Override everything *except* markdown

"I want tight chrome but default prose":

```yaml
files:
  - color.css
  - font.css
  - element.css
  - navbar.css
  - footer.css
  - docs.css
  - blogs.css
  # — no markdown.css, inherits from default
```

## When to use `override_mode: "override"`

The default is `merge` — both parent and child CSS load, cascade resolves conflicts. In specific cases you want the parent's file **skipped entirely**, not merged:

```yaml
override_mode: "override"
files:
  - color.css    # ← parent's color.css will be SKIPPED
```

With `override`, parent's `color.css` doesn't load. Your `color.css` is the only one. All other parent files (font.css, element.css, etc.) still load.

**Use when**: you're replacing a file entirely and don't want accidental leaks via cascade. **Typical**: a colour palette that shares variable names with default but with very different values — you don't want any of the parent's defaults flowing through.

See [Inheritance and Override](../07_inheritance-and-override.md) for the full decision matrix.

## Testing checklist

Before shipping a custom theme:

- [ ] Both light and dark mode render correctly on every page type (docs, blog, issues, custom)
- [ ] No hardcoded colours, sizes, or spacing — grep your theme CSS for `#[0-9a-f]`, `px`, `rem` outside `var(--…)`
- [ ] Font assets load without FOUT (flash of unstyled text) — `woff2` preload if needed
- [ ] No broken `var(--…)` references (browser DevTools → Computed styles)
- [ ] Validation panel in the dev-toolbar shows no errors for your theme

## See also

- [Quick Start](./01_quick-start.md) — smaller scope, single file
- [Standalone Theme](./03_standalone-theme.md) — larger scope, `extends: null`
- [Inheritance and Override](../07_inheritance-and-override.md) — merge / override / replace in depth
- [Dark Mode](../08_dark-mode.md) — how the `[data-theme="dark"]` pattern works
