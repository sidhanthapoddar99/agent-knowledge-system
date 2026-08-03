---
title: Navbar Styles
description: How the site navbar is styled — logo, links, dropdowns, search, theme toggle
sidebar_position: 3
---

# Navbar Styles

`navbar.css` (305 lines in the default theme) styles the site navbar — the persistent top bar containing the logo, main nav, dropdowns, search, and dark-mode toggle.

Structure comes from `src/layouts/navbar/default/Navbar.astro`; styling comes from `navbar.css`. Swap either independently.

## Key classes

| Class | Element |
|---|---|
| `.site-navbar` | Outer navbar container |
| `.site-navbar__logo` | Logo anchor |
| `.site-navbar__nav` | Main nav list |
| `.site-navbar__link` | Each nav link |
| `.site-navbar__dropdown` | Dropdown menu panel |
| `.site-navbar__dropdown-item` | Item in a dropdown |
| `.site-navbar__theme-toggle` | Dark-mode toggle button |
| `.site-navbar__search` | Search trigger |

Exact class names may vary across framework versions; grep the current `navbar.css` for the source of truth.

## Primary tokens consumed

- `--navbar-height` — fixed bar height (load-bearing for sticky offsets elsewhere)
- `--color-bg-primary` — navbar background
- `--color-border-default` — bottom border
- `--color-text-primary`, `--color-text-secondary` — link text states
- `--color-brand-primary` — active link + hover accents
- `--ui-text-body` — link size
- `--font-weight-medium/semibold` — link weights
- `--spacing-sm`, `--spacing-md`, `--spacing-lg` — padding + gaps
- `--transition-fast` — hover transitions
- `--z-index-sticky` — stacking order
- `--shadow-sm` — subtle elevation (optional)

## Common patterns

### Sticky navbar with backdrop blur

```css
.site-navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  height: var(--navbar-height);
  background: color-mix(in srgb, var(--color-bg-primary) 85%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border-default);
}
```

### Link hover states

```css
.site-navbar__link {
  color: var(--color-text-secondary);
  font-size: var(--ui-text-body);
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-md);
  transition: color var(--transition-fast);
}

.site-navbar__link:hover,
.site-navbar__link--active {
  color: var(--color-text-primary);
}
```

### Dropdown panels

```css
.site-navbar__dropdown {
  position: absolute;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-sm);
  z-index: var(--z-index-dropdown);
}
```

### Dark-mode adjustments

Most navbar styling works identically in both modes because it consumes `--color-*` tokens that redefine under `[data-theme="dark"]`. Occasional extras for dark-mode-specific feel:

```css
[data-theme="dark"] .site-navbar {
  background: color-mix(in srgb, var(--color-bg-primary) 80%, transparent);
  /* slightly more opaque in dark mode for better contrast */
}
```

## Customisation examples

### Branded navbar background

```css
.site-navbar {
  background: var(--color-brand-primary);
}

.site-navbar__link {
  color: var(--color-bg-primary);       /* inverted text */
}

.site-navbar__link:hover {
  color: var(--color-bg-primary);
  background: color-mix(in srgb, var(--color-bg-primary) 15%, transparent);
}
```

### Minimal, borderless

```css
.site-navbar {
  background: transparent;
  border-bottom: none;
  box-shadow: none;
}
```

### Taller navbar

Override `--navbar-height` in your theme's `element.css`:

```css
:root {
  --navbar-height: 80px;
}
```

All sticky sidebars and offsets recompute automatically — that's the payoff of consuming the token everywhere.

## What NOT to do

```css
/* ❌ hardcoded navbar height */
.site-navbar { height: 64px; }

/* ❌ hardcoded colour */
.site-navbar { background: #ffffff; }

/* ❌ invented token with hex fallback */
.site-navbar { background: var(--navbar-bg, #ffffff); }
```

The last one is especially dangerous — in dark mode, your navbar stays white.

## See also

- [Layout Dimensions](../tokens/layout-dimensions) — `--navbar-height` and why sticky elements depend on it
- [Navbar Configuration](../../10_configuration/04_navbar.md) — content side (what goes in the bar)
- [Dark Mode](../dark-mode) — the `[data-theme="dark"]` pattern
