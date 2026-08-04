---
title: Layout Dimensions
description: Page widths, heights, sidebar/outline widths — the structural-sizing tokens
sidebar_position: 5
---

# Layout Dimensions

Structural sizing tokens — widths, heights, column dimensions. **None of these are in the 46-variable contract** (they're not required). The default theme defines them, and layouts use them. Custom themes extending default inherit them; custom themes can override them to restyle page widths, navbar height, sidebar proportions.

Not required doesn't mean unimportant — these are the tokens that most visibly change the "feel" of a site when adjusted.

## Page widths

| Token | Default | Role |
|---|---|---|
| `--max-width-primary` | `1600px` | Primary content — docs body, blog posts, most pages |
| `--max-width-secondary` | `900px` | Narrower content — blog index, single-column pages |
| `--max-width-prose` | `65ch` | Prose width — measured in characters for readability |

### Using `ch` for prose

`65ch` means "65 character widths at the current font size." It's the **measured-by-characters** approach to line length — the same prose reads well whether the font is Inter or Georgia because `ch` adapts. For anything primarily *text* (docs content, blog bodies), `--max-width-prose` produces better line lengths than `px`.

### Example override — full width theme

```css
/* default-docs/themes/full-width/element.css */
:root {
  --max-width-primary: none;        /* remove the page-width cap */
  --max-width-secondary: 1200px;    /* widen secondary */
}
```

This is exactly what the `full-width/` example theme in `default-docs/themes/` does. A single CSS override + `extends: "@theme/default"` gets you a wider site without touching anything else.

## Column widths

| Token | Default | Role |
|---|---|---|
| `--sidebar-width` | `280px` | Docs left sidebar |
| `--outline-width` | `220px` | Docs right-side table of contents |

Tweak these when:

- Your content has long headings that wrap in the outline → bump `--outline-width`
- Your sidebar nav is crowded with long labels → bump `--sidebar-width`
- You want a more minimal look → shrink both

## Heights

| Token | Default | Role |
|---|---|---|
| `--navbar-height` | `64px` | Site navbar, used for sticky-offset calculations |
| `--footer-height` | `auto` | Footer — typically auto |

`--navbar-height` is load-bearing — sticky sidebars compute their offset as `top: var(--navbar-height);`. Changing it updates every sticky element on the page automatically.

## Using layout dimensions

```css
/* Content container — capped by primary width */
.page-content {
  max-width: var(--max-width-primary);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* Blog post — narrower prose width */
.blog-post {
  max-width: var(--max-width-prose);
  margin: 0 auto;
}

/* Docs layout — three-column */
.docs {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr var(--outline-width);
  gap: var(--spacing-xl);
}

/* Sticky sidebar offset */
.sidebar {
  position: sticky;
  top: var(--navbar-height);
  max-height: calc(100vh - var(--navbar-height));
}
```

## Overriding in a custom theme

Create one file that redefines just the dimensions you want to change:

```css
/* my-theme/element.css */
:root {
  --max-width-primary: 1400px;    /* tighter than default's 1600 */
  --sidebar-width: 260px;
  --outline-width: 200px;
}
```

Manifest:

```yaml
# my-theme/theme.yaml
name: "Tight Layout"
extends: "@theme/default"
files:
  - element.css    # overrides only the dimensions
```

Everything else (colours, fonts, spacing, other element values) inherits from the default theme.

## Breakpoints — why there's no variable

Look in `src/styles/breakpoints.css` and you'll see it's mostly documentation, no actual CSS:

```css
/* Breakpoints (reference only)
 *
 * xs: < 640px
 * sm: 640px+
 * md: 768px+
 * lg: 1024px+
 * xl: 1280px+
 * 2xl: 1536px+
 */
```

**CSS custom properties can't be used inside `@media` queries.** This isn't a framework limitation — it's how CSS works. The browser evaluates `@media` at parse time, before CSS variables resolve. So:

```css
@media (min-width: var(--breakpoint-md)) { … }   /* ❌ doesn't work */
@media (min-width: 768px) { … }                   /* ✅ works */
```

Layouts just hardcode pixel breakpoints with a comment referencing the convention. That's the one legitimate exception to "no hardcoded values." Document breakpoints consistently across the codebase.

## What NOT to do

```css
/* ❌ Magic dimensions */
.sidebar { width: 256px; }
.navbar  { height: 60px; }
.page    { max-width: 1200px; }

/* ✅ Consume tokens */
.sidebar { width: var(--sidebar-width); }
.navbar  { height: var(--navbar-height); }
.page    { max-width: var(--max-width-primary); }
```

## See also

- [The Theme Contract](../02_the-theme-contract.md#variables-the-framework-uses-but-doesnt-require) — layout dimensions are optional
- [Spacing, Radius, Shadow](./04_spacing-radius-shadow.md) — element-level tokens
- [Theme Structure](../03_theme-structure.md) — where `element.css` sits in the default theme
