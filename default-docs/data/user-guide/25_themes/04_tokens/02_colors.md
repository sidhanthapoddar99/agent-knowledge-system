---
title: Colours
description: The 14 semantic colours, light and dark variants, and why there's no primitive palette
sidebar_position: 2
---

# Colours

Colours are **one-tier semantic** — each name carries its role (`--color-text-primary`, `--color-brand-primary`) and resolves directly to a value. There is no intermediate "primitive palette" step.

## Why one-tier

The classic two-tier colour pattern (palette like `--blue-500` → semantic like `--color-link`) pays off when:

- The palette is rich (dozens of shades across multiple hues)
- Multiple semantic tokens reuse the same palette entry
- Designers want to refactor "the blue" once and have it propagate

None of those apply here. This framework has **14 colour decisions**. Every one is named by role. A second tier would be pure ceremony — a layer of aliases for zero benefit.

## Light mode (`:root`)

### Backgrounds

| Token | Default value | Role |
|---|---|---|
| `--color-bg-primary` | `#fafafa` | Main page background |
| `--color-bg-secondary` | `#f5f5f5` | Cards, panels, secondary surfaces |
| `--color-bg-tertiary` | `#eeeeee` | Table headers, hover tints, subtle fills |

### Text

| Token | Default value | Role |
|---|---|---|
| `--color-text-primary` | `#1a1a1a` | Body text |
| `--color-text-secondary` | `#525252` | Descriptions, captions, subdued text |
| `--color-text-muted` | `#737373` | Metadata, timestamps, least prominent |

### Borders

| Token | Default value | Role |
|---|---|---|
| `--color-border-default` | `#e5e5e5` | Card outlines, input borders, dividers |
| `--color-border-light` | `#f0f0f0` | Subtle separators, tint borders |

### Brand

| Token | Default value | Role |
|---|---|---|
| `--color-brand-primary` | `#2563eb` | Links, primary buttons, accent elements |
| `--color-brand-secondary` | `#1d4ed8` | Secondary accents, active/hover state of primary |

### Status

| Token | Default value | Role |
|---|---|---|
| `--color-success` | `#16a34a` | Success states, green indicators |
| `--color-warning` | `#ca8a04` | Warning states, amber indicators |
| `--color-error` | `#dc2626` | Error states, red indicators |
| `--color-info` | `#0891b2` | Info states, blue/cyan indicators |

## Dark mode (`[data-theme="dark"]`)

Every colour is redeclared. Non-colour variables (fonts, spacing) are NOT redeclared — they're the same across modes.

| Token | Dark value |
|---|---|
| `--color-bg-primary` | `#0a0a0a` |
| `--color-bg-secondary` | `#171717` |
| `--color-bg-tertiary` | `#262626` |
| `--color-text-primary` | `#fafafa` |
| `--color-text-secondary` | `#a3a3a3` |
| `--color-text-muted` | `#737373` |
| `--color-border-default` | `#262626` |
| `--color-border-light` | `#333333` |
| `--color-brand-primary` | `#3b82f6` |
| `--color-brand-secondary` | `#60a5fa` |
| `--color-success` | `#22c55e` |
| `--color-warning` | `#eab308` |
| `--color-error` | `#ef4444` |
| `--color-info` | `#06b6d4` |

Brand and status colours are brighter in dark mode to maintain contrast against the darker backgrounds.

## Both modes in one CSS file

```css
:root {
  --color-bg-primary: #fafafa;
  --color-text-primary: #1a1a1a;
  --color-brand-primary: #2563eb;
  /* … */
}

[data-theme="dark"] {
  --color-bg-primary: #0a0a0a;
  --color-text-primary: #fafafa;
  --color-brand-primary: #3b82f6;
  /* … */
}
```

The `[data-theme="dark"]` attribute is toggled on `<html>` by the framework's dark-mode switcher. Layouts don't need to read the attribute — `var(--color-bg-primary)` resolves to the right value automatically based on which selector matches.

See [Dark Mode](../08_dark-mode.md) for the full story.

## Choosing brand + status colours

**The 14 roles are fixed, but the values are yours.** That's the whole point of theming — swap the hex codes and the site re-skins.

### Brand

Pick two — primary (main) and secondary (hover / active / darker accent). The secondary should be a **darker** or **more-saturated** variant of the primary in light mode, and **brighter** in dark mode (counterintuitive, but it's what works for dark surfaces).

Good pairs:

```
#2563eb / #1d4ed8   blue  (default)
#7c3aed / #6d28d9   purple
#059669 / #047857   emerald
#dc2626 / #b91c1c   red
```

### Status

These are mostly cultural conventions — green/amber/red/blue are recognised globally. Stick close to those hues even if your brand palette is non-traditional; status colours aren't the place to be creative.

## Using colours in a layout

```css
.card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-default);
  color: var(--color-text-primary);
}

.card-meta {
  color: var(--color-text-muted);
}

.link {
  color: var(--color-brand-primary);
  transition: color var(--transition-fast);
}

.link:hover {
  color: var(--color-brand-secondary);
}

.status-badge-success {
  background: var(--color-success);
  color: var(--color-bg-primary);
}
```

Every colour is a `var(--color-…)`. **No `#fff`, no `rgba(0,0,0,0.1)` for borders, no `#ccc` for subtle dividers.** If the colour isn't in the contract, use the closest token or reconsider whether the intent matches an existing role.

## What NOT to do

```css
/* ❌ hardcoded hex */
.banner { background: #fef3c7; color: #92400e; }

/* ❌ invented token with hardcoded fallback */
.banner { background: var(--color-banner-bg, #fef3c7); }

/* ❌ ad-hoc transparency */
.overlay { background: rgba(0, 0, 0, 0.5); }

/* ✅ use warning semantics */
.banner { background: var(--color-warning); color: var(--color-text-primary); }

/* ✅ use bg tokens + opacity var */
.overlay { background: var(--color-bg-primary); opacity: var(--opacity-50); }
```

## See also

- [The Theme Contract](../02_the-theme-contract.md) — the 46-variable fixed set
- [Dark Mode](../08_dark-mode.md) — how `[data-theme="dark"]` works end-to-end
- [Typography](./03_typography.md) — the other major token category
- [Rules for Layout Authors](../10_rules-for-layout-authors.md) — full no-hardcoded-values contract
