---
title: Typography
description: Font families, the primitive scale, and the semantic tokens (UI, content, display) that layouts consume
sidebar_position: 3
---

# Typography

Typography is **two-tier** — a primitive scale defines the raw sizes, and semantic tokens layer meaning on top. Layouts consume semantic tokens. Themes can override the primitives, the semantics, or both.

## Font families

| Token | Default | Role |
|---|---|---|
| `--font-family-base` | system-ui stack | Body text, UI chrome, everything non-code |
| `--font-family-mono` | Fira Code + fallbacks | Inline `<code>`, fenced code blocks, monospace labels |
| `--font-family-heading` | `var(--font-family-base)` | Headings (default: same as base) |

Override to use a custom typeface:

```css
@font-face {
  font-family: 'Inter';
  src: url('./assets/Inter-var.woff2') format('woff2');
  font-weight: 100 900;
}

:root {
  --font-family-base: 'Inter', system-ui, sans-serif;
  --font-family-heading: 'Inter Display', 'Inter', system-ui, sans-serif;
}
```

Keep fallbacks. If the custom font fails to load, the site shouldn't collapse — it should render with a reasonable system font.

## Primitive size scale — 9 tiers

| Token | Default | px |
|---|---|---|
| `--font-size-xs` | `0.75rem` | 12px |
| `--font-size-sm` | `0.875rem` | 14px |
| `--font-size-base` | `1rem` | 16px |
| `--font-size-lg` | `1.125rem` | 18px |
| `--font-size-xl` | `1.25rem` | 20px |
| `--font-size-2xl` | `1.5rem` | 24px |
| `--font-size-3xl` | `1.875rem` | 30px |
| `--font-size-4xl` | `2.25rem` | 36px |
| `--font-size-5xl` | `3rem` | 48px |

**The contract requires sm / base / lg / xl / 2xl** (5 of 9). Themes **may** define the extended tiers (xs, 3xl, 4xl, 5xl); custom layouts that reach for them should use the semantic tokens (below) where they exist, and fall back gracefully where they don't:

```css
font-size: var(--font-size-xs, var(--font-size-sm));
```

This pattern says *"prefer `xs` if the theme defines it; otherwise use `sm`."*

**Layouts should not consume the primitive scale directly.** Use the semantic tokens below.

## Semantic UI tokens — 3 tiers

For chrome: buttons, cards, tables, badges, forms, nav, footer.

| Token | Maps to | Role |
|---|---|---|
| `--ui-text-micro` | `--font-size-xs` (12px) | Badges, counts, ids, timestamps, meta labels |
| `--ui-text-body` | `--font-size-sm` (14px) | Default UI body, table rows, inputs, **card titles** |
| `--ui-text-title` | `--font-size-2xl` (24px) | Page titles, major landmarks |

### Three tiers is the whole chrome palette

For card titles, primary buttons, and anything that needs to feel emphasised: use `--ui-text-body` + `font-weight: 600` + `color: var(--color-text-primary)`.

```css
.card-title {
  font-size: var(--ui-text-body);
  font-weight: 600;
  color: var(--color-text-primary);
}
```

**Do not add a fourth UI size tier.** Adding `--ui-text-card-title` or `--ui-text-button-large` is the typical mistake — once a fourth tier exists, designers start *using* it, and you're on a slide into pixel-level size soup. Modern chrome design (Polaris, Primer, Linear, Notion) universally uses exactly three tiers.

## Semantic content tokens — 8 tiers

For rendered markdown and prose. Consumed by `markdown.css`; custom layouts embedding prose should reuse them.

| Token | Maps to | Role |
|---|---|---|
| `--content-body` | `--font-size-base` (16px) | Paragraphs |
| `--content-h1` | `--font-size-2xl` (24px) | h1 |
| `--content-h2` | `--font-size-xl` (20px) | h2 |
| `--content-h3` | `--font-size-lg` (18px) | h3 |
| `--content-h4` | `--font-size-base` (16px) | h4 — same size, differentiated by weight/colour |
| `--content-h5` | `--font-size-base` | h5 |
| `--content-h6` | `--font-size-base` | h6 |
| `--content-code` | `0.9em` | Inline `<code>` — em-relative, scales with parent |

### h4–h6 are structural, not visual

Reading prose, nobody distinguishes "a 16px heading" from "a 15px heading." Those differences are noise. What matters for accessibility + outlines + TOCs is the **semantic level** (`<h4>`, `<h5>`, `<h6>`) and the **visual weight** (bold, medium).

The default `markdown.css` differentiates h4+ via `font-weight` and `color`, not `font-size`. If your theme needs h4 to look distinct from body, make it bolder or shift its colour — don't make it another rung on a size ladder.

### `--content-code` uses em, not rem

```css
--content-code: 0.9em;
```

That's intentional. Inline code sits inside heading or paragraph text; making it `0.9em` means it's 90% of the surrounding font size — so a code snippet in a h2 is slightly smaller than the h2 text, and a code snippet in a paragraph is slightly smaller than body. One rule, right behaviour everywhere.

## Display tokens — marketing only

| Token | Maps to | Role |
|---|---|---|
| `--display-sm` | `--font-size-3xl` (30px) | Subhero / large headline |
| `--display-md` | `--font-size-4xl` (36px) | Landing page titles |
| `--display-lg` | `--font-size-5xl` (48px) | Hero, countdown |

**Use only in:** `src/layouts/custom/home`, countdown, hero sections, marketing surfaces. **Do not use in:** docs, blog, issues, app chrome.

Custom layouts may also use `clamp()` for fluid display text:

```css
font-size: clamp(2rem, 5vw + 1rem, 3rem);
```

`clamp()` is acceptable in marketing contexts — it adapts poster-style text to the viewport. Don't use it in docs or chrome.

## Font weights

Primitive scale (not in `required_variables`, but defined by the default theme):

| Token | Default |
|---|---|
| `--font-weight-normal` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |

Typical uses:

- **400 normal** — body text
- **500 medium** — button text, slightly emphasised UI
- **600 semibold** — card titles, h3/h4 in markdown, any body-sized text that needs to feel heavier
- **700 bold** — h1, h2, major display text

Like display tokens, weights aren't in `required_variables`. The default theme defines them; custom themes usually inherit them via `extends`.

## Line heights

| Token | Default | Use |
|---|---|---|
| `--line-height-tight` | `1.25` | Dense headings |
| `--line-height-snug` | `1.375` | Compact UI |
| `--line-height-base` | `1.6` | Body prose — **the only one in the contract** |
| `--line-height-relaxed` | `1.75` | Generous prose |
| `--line-height-loose` | `2` | Display / hero |

`--line-height-base` is required. Others are default-theme-only; custom themes inherit.

## Using typography in a layout

```css
.page {
  font-family: var(--font-family-base);
  font-size: var(--content-body);
  line-height: var(--line-height-base);
  color: var(--color-text-primary);
}

.page-title {
  font-size: var(--ui-text-title);
  font-weight: 700;
  color: var(--color-text-primary);
}

.nav-item {
  font-size: var(--ui-text-body);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.badge {
  font-size: var(--ui-text-micro);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

pre code {
  font-family: var(--font-family-mono);
  font-size: var(--content-code);
}
```

## What NOT to do

```css
/* ❌ hardcoded */
.card-title { font-size: 15px; }

/* ❌ primitive consumed directly in a layout */
.card-title { font-size: var(--font-size-sm); }

/* ❌ arbitrary rem */
.card-title { font-size: 0.9375rem; }

/* ❌ inventing a new semantic tier */
.card-title { font-size: var(--ui-text-card); }

/* ✅ semantic UI token + weight for emphasis */
.card-title {
  font-size: var(--ui-text-body);
  font-weight: 600;
  color: var(--color-text-primary);
}
```

## See also

- [The Theme Contract](../02_the-theme-contract.md) — 19 font tokens, full list
- [Colours](./02_colors.md) — the colour side of the token story
- [Rules for Layout Authors](../10_rules-for-layout-authors.md) — the full no-hardcoded-values contract
