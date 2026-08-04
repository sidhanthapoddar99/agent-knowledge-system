---
title: Standalone Theme
description: "A from-scratch theme — extends: null, every variable defined yourself"
sidebar_position: 3
---

# Standalone Theme

A **standalone theme** uses `extends: null` (or no `extends` at all). It inherits nothing — you define every one of the 46 contract variables yourself, plus any optional extras your layouts need.

Use this when:

- Your design system diverges from the default significantly
- You want total control over the full CSS bundle (nothing from default leaks in)
- You're building a "theme brand kit" to distribute

For most projects, extending default is the right choice — see [Extending Default](./02_extending-default.md). Standalone is rare, but when it's right it's clearer than building the same thing as a giant `extends: "@theme/default"` that overrides everything.

## Directory layout

```
themes/brand-zero/
├── theme.yaml
├── color.css
├── font.css
├── element.css
├── reset.css
├── markdown.css
├── navbar.css
├── footer.css
├── docs.css
├── blogs.css
└── (optional) breakpoints.css, issues.css, assets/
```

Essentially the same shape as the built-in default theme. You're building a peer, not an extension.

## Manifest

```yaml
# theme.yaml
name: "Brand Zero"
version: "1.0.0"
description: "Fully custom theme, zero default inheritance"
extends: null              # ← the key line
supports_dark_mode: true

files:
  - color.css
  - font.css
  - element.css
  - reset.css
  - markdown.css
  - navbar.css
  - footer.css
  - docs.css
  - blogs.css

# Optional: declare your own contract
# If omitted, the default theme's required_variables is inherited
required_variables:
  colors:
    - --color-bg-primary
    # ... all 14 ...
  fonts:
    - --font-family-base
    # ... all 19 ...
  elements:
    - --spacing-xs
    # ... all 13 ...
```

## Required variables — the contract

**Every one of the 46 contract variables must be defined** in your CSS. The validator checks each against the `required_variables` list and errors on missing ones (since there's no parent to inherit from).

The 46 variables (summary — full list in [The Theme Contract](../02_the-theme-contract.md)):

### Colours — 14

- `--color-bg-primary / secondary / tertiary`
- `--color-text-primary / secondary / muted`
- `--color-border-default / light`
- `--color-brand-primary / secondary`
- `--color-success / warning / error / info`

### Fonts — 19

- `--font-family-base / mono`
- `--font-size-sm / base / lg / xl / 2xl` (5 primitives)
- `--line-height-base`
- `--ui-text-micro / body / title` (3 UI semantic)
- `--content-body / h1 / h2 / h3 / h4 / h5 / h6 / code` (8 content semantic)

### Elements — 13

- `--spacing-xs / sm / md / lg / xl`
- `--border-radius-sm / md / lg`
- `--shadow-sm / md / lg`
- `--transition-fast / normal`

## Example skeleton

### `color.css`

```css
:root {
  --color-bg-primary:   #ffffff;
  --color-bg-secondary: #fafafa;
  --color-bg-tertiary:  #f0f0f0;

  --color-text-primary:   #111111;
  --color-text-secondary: #555555;
  --color-text-muted:     #888888;

  --color-border-default: #e0e0e0;
  --color-border-light:   #f0f0f0;

  --color-brand-primary:   #000000;
  --color-brand-secondary: #333333;

  --color-success: #22aa44;
  --color-warning: #dd9922;
  --color-error:   #cc2222;
  --color-info:    #2277aa;
}

[data-theme="dark"] {
  --color-bg-primary:   #000000;
  --color-bg-secondary: #0a0a0a;
  --color-bg-tertiary:  #1a1a1a;

  --color-text-primary:   #ffffff;
  --color-text-secondary: #aaaaaa;
  --color-text-muted:     #777777;

  --color-border-default: #222222;
  --color-border-light:   #111111;

  --color-brand-primary:   #ffffff;
  --color-brand-secondary: #cccccc;

  --color-success: #33cc55;
  --color-warning: #eebb33;
  --color-error:   #dd3333;
  --color-info:    #3388bb;
}
```

### `font.css`

```css
:root {
  --font-family-base: 'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'Courier New', Courier, monospace;

  /* Primitives */
  --font-size-sm:   0.875rem;
  --font-size-base: 1rem;
  --font-size-lg:   1.125rem;
  --font-size-xl:   1.25rem;
  --font-size-2xl:  1.5rem;

  --line-height-base: 1.6;

  /* Semantic UI */
  --ui-text-micro: var(--font-size-sm);      /* no xs — use sm */
  --ui-text-body:  var(--font-size-base);
  --ui-text-title: var(--font-size-2xl);

  /* Semantic content */
  --content-body: var(--font-size-base);
  --content-h1:   var(--font-size-2xl);
  --content-h2:   var(--font-size-xl);
  --content-h3:   var(--font-size-lg);
  --content-h4:   var(--font-size-base);
  --content-h5:   var(--font-size-base);
  --content-h6:   var(--font-size-base);
  --content-code: 0.9em;
}
```

Notice how you can remap the semantic tokens however you like. Here `--ui-text-micro` uses `--font-size-sm` instead of `--font-size-xs` — because this theme doesn't ship an `xs` primitive.

### `element.css`

```css
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  --border-radius-sm: 0;         /* hard corners */
  --border-radius-md: 0;
  --border-radius-lg: 0;

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);

  --transition-fast: 100ms ease-out;
  --transition-normal: 200ms ease-out;
}
```

### Component styles

`markdown.css`, `navbar.css`, `footer.css`, `docs.css`, `blogs.css` — write these from scratch too. Use the token reference in [Component Styles](../05_component-styles/01_overview.md) as a structural guide. Remember the scoping rule — every selector prefixed with its component class.

## Custom required_variables

Add new variables your custom layouts need:

```yaml
required_variables:
  colors:
    - --color-bg-primary
    - ... (standard 14)
    - --color-accent-tertiary         # ← your addition
  fonts:
    - ... (standard 19)
  elements:
    - ... (standard 13)
    - --spacing-gutter                # ← your addition
```

Layouts in the built-in framework consume only the standard 46, so adding extras is safe. Extras are for **your own custom layouts** — they can `var(--color-accent-tertiary)` and know the theme will always define it.

Shrinking the contract is also possible (drop `--shadow-lg` if you never use it) but discouraged — built-in layouts may consume it.

## Sharing a standalone theme

Standalone themes can be distributed as a directory, a git repo, or an npm package:

### Directory

```bash
# Consumer copies the theme into their project
cp -r brand-zero/ my-project/themes/
```

Update `site.yaml`:

```yaml
theme: "brand-zero"
```

### Git submodule

```bash
cd my-project/themes/
git submodule add https://github.com/yourorg/brand-zero.git
```

### npm (future direction)

Not supported yet, but the shape works: each theme is a folder of CSS + a manifest, so an `npm install @yourorg/brand-zero-theme` that dumps into `themes/` is the natural path.

## When standalone is NOT the answer

If you find yourself writing `color.css`, `font.css`, `element.css` that mostly reproduce the default's values with minor tweaks — **you're on the wrong path**. Switch to `extends: "@theme/default"` and override only what's different. Standalone is for substantial divergence, not cosmetic changes.

## See also

- [The Theme Contract](../02_the-theme-contract.md) — every required variable
- [Tokens](../04_tokens/01_overview.md) — per-category reference
- [Component Styles](../05_component-styles/01_overview.md) — what each CSS file styles
- [Inheritance and Override](../07_inheritance-and-override.md) — when `extends: null` is right vs wrong
