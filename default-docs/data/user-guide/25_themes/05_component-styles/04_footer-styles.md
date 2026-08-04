---
title: Footer Styles
description: The site footer — columns, links, copyright, credits
sidebar_position: 4
---

# Footer Styles

`footer.css` (116 lines in the default theme) styles the site footer — the bar / block at the bottom of every page containing column links, copyright, and optional credits.

Shortest component-style file in the framework. There's not much surface to style.

## Key classes

| Class | Element |
|---|---|
| `.site-footer` | Outer footer container |
| `.site-footer__container` | Inner wrapper (max-width + padding) |
| `.site-footer__columns` | Multi-column grid |
| `.site-footer__column` | Single column |
| `.site-footer__heading` | Column heading |
| `.site-footer__link` | Link in a column |
| `.site-footer__bottom` | Bottom row (copyright, legal) |

## Primary tokens consumed

- `--color-bg-secondary` — footer background (slightly tinted vs page)
- `--color-border-default` — top border separating footer from content
- `--color-text-primary`, `--color-text-secondary`, `--color-text-muted` — text states
- `--ui-text-body` — link text
- `--ui-text-micro` — copyright / legal text
- `--font-weight-semibold` — column headings
- `--max-width-secondary` — constrains footer width for readability
- `--spacing-md`, `--spacing-lg`, `--spacing-xl` — padding + gaps

## Common patterns

### Default footer block

```css
.site-footer {
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-default);
  padding: var(--spacing-xl) 0;
  margin-top: var(--spacing-2xl);
}

.site-footer__container {
  max-width: var(--max-width-secondary);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.site-footer__columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--spacing-lg);
}
```

### Column styling

```css
.site-footer__heading {
  font-size: var(--ui-text-body);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.site-footer__link {
  display: block;
  font-size: var(--ui-text-body);
  color: var(--color-text-secondary);
  padding: var(--spacing-xs) 0;
  transition: color var(--transition-fast);
}

.site-footer__link:hover {
  color: var(--color-brand-primary);
}
```

### Bottom row

```css
.site-footer__bottom {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
  font-size: var(--ui-text-micro);
  color: var(--color-text-muted);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

Note the size tier step-down — `--ui-text-body` for nav links, `--ui-text-micro` for copyright. The 3-tier UI chrome system handles the whole footer.

## Customisation

### Invert footer (dark bar)

```css
.site-footer {
  background: var(--color-text-primary);          /* dark in light mode */
  border-top: none;
}

.site-footer__heading,
.site-footer__link {
  color: var(--color-bg-primary);                 /* light text */
}

.site-footer__bottom {
  border-top-color: color-mix(in srgb, var(--color-bg-primary) 20%, transparent);
}
```

### Minimal footer (one line)

```css
.site-footer {
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--color-border-light);
}

.site-footer__columns {
  display: none;                                  /* hide columns */
}

.site-footer__bottom {
  margin: 0;
  padding: 0;
  border: none;
}
```

## See also

- [Footer Configuration](../../10_configuration/05_footer.md) — the content side (what columns/links appear)
- [Typography](../04_tokens/03_typography.md) — the 3-tier UI text model
- [Colors](../04_tokens/02_colors.md) — what `--color-text-*` and `--color-bg-*` resolve to
