---
title: Docs Styles
description: The docs layout — sidebar, outline, pagination, breadcrumbs
sidebar_position: 5
---

# Docs Styles

`docs.css` (466 lines in the default theme) styles the docs layout — the three-column pattern with a left sidebar, centre content, and right-side outline (table of contents). Also covers pagination controls and breadcrumb navigation.

Second-largest component-style file after `markdown.css`. Docs are the most structured content type — lots of UI affordances.

## Key classes

| Class | Element |
|---|---|
| `.docs-layout` | Outer three-column grid |
| `.docs-sidebar` | Left sidebar container |
| `.docs-sidebar__nav` | Nav list inside sidebar |
| `.docs-sidebar__group` | Collapsible section (folder) |
| `.docs-sidebar__group-label` | Group heading |
| `.docs-sidebar__item` | Individual page link |
| `.docs-sidebar__item--active` | Currently-viewed page |
| `.docs-content` | Main content column |
| `.docs-outline` | Right-side TOC |
| `.docs-outline__item` | TOC entry |
| `.docs-pagination` | Prev/Next buttons at page bottom |
| `.docs-breadcrumb` | Top breadcrumb trail |

## Primary tokens consumed

- `--sidebar-width` — left column width
- `--outline-width` — right column width
- `--navbar-height` — sticky-offset anchor
- `--max-width-primary` — docs grid max-width
- `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-tertiary` — column + item backgrounds
- `--color-border-light`, `--color-border-default` — dividers
- `--color-text-primary`, `--color-text-secondary`, `--color-text-muted` — text states
- `--color-brand-primary` — active states
- `--ui-text-body`, `--ui-text-micro` — sidebar + outline text
- `--spacing-*` — padding + gaps everywhere
- `--border-radius-md` — item corners
- `--transition-fast` — hover transitions
- `--z-index-sticky` — sticky sidebar stacking

## The three-column grid

```css
.docs-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr var(--outline-width);
  gap: var(--spacing-xl);
  max-width: var(--max-width-primary);
  margin: 0 auto;
  padding: var(--spacing-lg);
}
```

At narrower viewports, the outline drops away, then the sidebar collapses to a slide-over. Breakpoints are pixel values (since CSS variables can't be used in `@media`), documented in `breakpoints.css`.

## Sticky sidebars

Both sidebars stick to the top, offset by the navbar height:

```css
.docs-sidebar,
.docs-outline {
  position: sticky;
  top: calc(var(--navbar-height) + var(--spacing-lg));
  max-height: calc(100vh - var(--navbar-height) - var(--spacing-xl));
  overflow-y: auto;
}
```

If a theme changes `--navbar-height`, the sticky offset recomputes automatically. This is why `--navbar-height` is load-bearing.

## Sidebar items

```css
.docs-sidebar__item {
  display: block;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--ui-text-body);
  color: var(--color-text-secondary);
  border-radius: var(--border-radius-sm);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.docs-sidebar__item:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.docs-sidebar__item--active {
  background: var(--color-bg-tertiary);
  color: var(--color-brand-primary);
  font-weight: 600;
}
```

`--ui-text-body` (14px default) for sidebar items, standard weight. Active state combines background tint + brand colour + `font-weight: 600`. Three-axis hierarchy — not a size change.

## Outline (TOC)

```css
.docs-outline__item {
  font-size: var(--ui-text-micro);      /* 12px — smaller than sidebar */
  color: var(--color-text-muted);
  padding: var(--spacing-xs) 0;
  border-left: 2px solid transparent;
  padding-left: var(--spacing-sm);
  transition: all var(--transition-fast);
}

.docs-outline__item--active {
  color: var(--color-text-primary);
  border-left-color: var(--color-brand-primary);
}
```

Outline uses `--ui-text-micro` (12px) — intentionally smaller than sidebar. The TOC is secondary navigation; the sidebar is primary.

## Indented outline entries

Heading depth is surfaced via padding, not font size:

```css
.docs-outline__item--h2 { padding-left: var(--spacing-sm); }
.docs-outline__item--h3 { padding-left: var(--spacing-md); }
.docs-outline__item--h4 { padding-left: var(--spacing-lg); }
```

Different `padding-left` → visual hierarchy. Font size stays constant (`--ui-text-micro`).

## Customisation

### Wider sidebar for long labels

```css
:root {
  --sidebar-width: 320px;     /* bump from 280px default */
}
```

No CSS changes needed — the grid template reads from the token.

### No outline (two-column layout)

```css
.docs-layout {
  grid-template-columns: var(--sidebar-width) 1fr;
}

.docs-outline {
  display: none;
}
```

### Compact sidebar

```css
.docs-sidebar__item {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs, var(--ui-text-micro));    /* tiny tier */
}
```

Note the fallback pattern for `--font-size-xs` — required if your theme might not define it.

## See also

- [Layout Dimensions](../04_tokens/05_layout-dimensions.md) — `--sidebar-width`, `--outline-width`, `--navbar-height`
- [Typography](../04_tokens/03_typography.md) — `--ui-text-*` tiers used in sidebar + outline
- [Docs Content Type](../../17_docs/01_overview.md) — the content side (what's in the sidebar)
