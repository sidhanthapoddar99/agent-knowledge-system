---
title: Spacing, Radius, Shadow, Transition
description: The element-level tokens — spacing scale, border radii, shadow tiers, transition speeds
sidebar_position: 4
---

# Spacing, Radius, Shadow, Transition

These are the **one-tier element tokens** — 13 of the 46 contract variables live here. All are semantic enough to be consumed directly; no primitive-then-semantic layering.

## Spacing scale

A compact scale of six steps in the contract, plus optional extensions the default theme provides.

### Required (5)

| Token | Default | px |
|---|---|---|
| `--spacing-xs` | `0.25rem` | 4px |
| `--spacing-sm` | `0.5rem` | 8px |
| `--spacing-md` | `1rem` | 16px |
| `--spacing-lg` | `1.5rem` | 24px |
| `--spacing-xl` | `2rem` | 32px |

### Optional (default-theme-only)

| Token | Default | Use |
|---|---|---|
| `--spacing-0` | `0` | Zero padding/margin (convenience) |
| `--spacing-px` | `1px` | Hair-line spacing |
| `--spacing-0-5` | `0.125rem` (2px) | Sub-4px rarities |
| `--spacing-2xl` | `3rem` (48px) | Section dividers |
| `--spacing-3xl` | `4rem` (64px) | Hero sections |
| `--spacing-4xl` | `6rem` (96px) | Marketing spacing |

Themes extending default inherit all. Standalone themes must declare at minimum `xs / sm / md / lg / xl` (the five required). The rest are nice-to-have.

### Usage patterns

```css
.card {
  padding: var(--spacing-md) var(--spacing-lg);   /* 16px / 24px */
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-sm);
}

.inline-icon {
  margin-right: var(--spacing-xs);                 /* 4px between icon + text */
}

.section {
  padding: var(--spacing-2xl) 0;                   /* generous vertical rhythm */
}
```

**Don't invent spacing values.** If the scale doesn't have the exact value you want, round to the nearest tier. `13px padding` is almost never better than `var(--spacing-md)` — and the consistency of a scale beats a pixel-perfect one-off every time.

## Border radius

### Required (3)

| Token | Default | px |
|---|---|---|
| `--border-radius-sm` | `0.25rem` | 4px |
| `--border-radius-md` | `0.5rem` | 8px |
| `--border-radius-lg` | `0.75rem` | 12px |

### Optional

| Token | Default | Use |
|---|---|---|
| `--border-radius-none` | `0` | Square corners |
| `--border-radius-xl` | `1rem` (16px) | Large cards |
| `--border-radius-2xl` | `1.5rem` (24px) | Hero cards |
| `--border-radius-full` | `9999px` | Pills, avatars, circular buttons |

### Usage

```css
.badge  { border-radius: var(--border-radius-sm); }   /* small UI */
.card   { border-radius: var(--border-radius-md); }   /* default card */
.dialog { border-radius: var(--border-radius-lg); }   /* modal */
.pill   { border-radius: var(--border-radius-full); } /* avatar / pill */
```

## Shadow

### Required (3)

| Token | Default |
|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.05)` |
| `--shadow-md` | `0 4px 6px rgba(0, 0, 0, 0.1)` |
| `--shadow-lg` | `0 10px 15px rgba(0, 0, 0, 0.1)` |

### Optional

| Token | Default | Use |
|---|---|---|
| `--shadow-none` | `none` | Removing a shadow |
| `--shadow-xl` | `0 20px 25px rgba(0, 0, 0, 0.1)` | Dialog / modal |
| `--shadow-inner` | `inset 0 2px 4px rgba(0, 0, 0, 0.05)` | Input depth |

### Usage

```css
.card:hover { box-shadow: var(--shadow-md); }
.dialog     { box-shadow: var(--shadow-xl); }
.input      { box-shadow: var(--shadow-inner); }
```

**Ad-hoc transparency is not acceptable for shadows.** Don't write `box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)` even if it's "just close" to `--shadow-sm`. Use the token.

### Shadows in dark mode

The default theme does **not** redefine `--shadow-*` under `[data-theme="dark"]` — the same `rgba(0, 0, 0, …)` values render as barely-visible in dark surfaces, which is usually the right behaviour. If you need more prominent dark-mode shadows, redefine them:

```css
[data-theme="dark"] {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5);
}
```

## Transition

### Required (2)

| Token | Default |
|---|---|
| `--transition-fast` | `150ms ease` |
| `--transition-normal` | `250ms ease` |

### Optional

| Token | Default |
|---|---|
| `--transition-slow` | `350ms ease` |

### Usage patterns

```css
.button {
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.card {
  transition: box-shadow var(--transition-normal);
}

.modal {
  transition: opacity var(--transition-slow), transform var(--transition-slow);
}
```

Rule of thumb:

- **`fast` (150ms)** — hover states, button feedback, instant response
- **`normal` (250ms)** — card interactions, tab switches, pane transitions
- **`slow` (350ms)** — modal enters, page transitions

**Don't write raw millisecond durations.** `transition: background 0.2s` is non-compliant even though `200ms` is a reasonable value. Use a token.

## Border width (optional, not in contract)

The default theme provides:

| Token | Default |
|---|---|
| `--border-width-0` | `0` |
| `--border-width-1` | `1px` |
| `--border-width-2` | `2px` |
| `--border-width-4` | `4px` |

Use directly: `border: var(--border-width-1) solid var(--color-border-default);`. Themes may override; layouts may consume.

## Z-index (optional, not in contract)

The default theme provides a stacking scale used across all overlay components:

| Token | Value | Use |
|---|---|---|
| `--z-index-dropdown` | `1000` | Dropdowns, comboboxes |
| `--z-index-sticky` | `1020` | Sticky headers |
| `--z-index-fixed` | `1030` | Fixed nav |
| `--z-index-modal-backdrop` | `1040` | Modal dim layer |
| `--z-index-modal` | `1050` | Modal dialog |
| `--z-index-popover` | `1060` | Popovers, menus |
| `--z-index-tooltip` | `1070` | Tooltips (highest) |

Use the scale. Don't write arbitrary `z-index: 999` values.

## Opacity (optional, not in contract)

| Token | Value |
|---|---|
| `--opacity-0` | `0` |
| `--opacity-25` | `0.25` |
| `--opacity-50` | `0.5` |
| `--opacity-75` | `0.75` |
| `--opacity-100` | `1` |

Use for semi-transparent overlays and subdued states.

## Putting it together — a card component

```css
.card {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-md);
  background: var(--color-bg-secondary);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-default);
}

.card--emphasised {
  border-width: var(--border-width-2);
  border-color: var(--color-brand-primary);
}

.card--disabled {
  opacity: var(--opacity-50);
}
```

Every value is a token. No magic numbers.

## See also

- [The Theme Contract](../02_the-theme-contract.md) — 13 element variables, full list
- [Layout Dimensions](./05_layout-dimensions.md) — max-width, heights, sidebar/outline widths
- [Rules for Layout Authors](../10_rules-for-layout-authors.md) — the discipline
