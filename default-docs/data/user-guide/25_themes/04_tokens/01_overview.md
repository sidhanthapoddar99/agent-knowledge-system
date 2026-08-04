---
title: Tokens Overview
description: How variables are organised — two-tier typography, one-tier everything else, what each file owns
sidebar_position: 1
---

# Tokens Overview

"Tokens" in this framework = the CSS custom properties a theme defines. The system draws a sharp line between **variables that carry design decisions** (here) and **CSS that styles specific elements** (the [Component Styles](../05_component-styles/01_overview.md) section). This page maps the territory.

## Token tiers

| Category | Tier model | Why |
|---|---|---|
| Colours | **One-tier** (semantic only) | Colors are few and named by role (`--color-text-primary`). No primitive palette needed. |
| Typography | **Two-tier** (primitive + semantic) | Font sizes benefit from a shared scale plus role-specific tokens — see below. |
| Spacing | One-tier | Spacing names (`--spacing-sm`) are already semantic enough. |
| Radius / Shadow / Transition | One-tier | Small closed sets of values; adding a layer wouldn't earn its keep. |
| Layout dimensions | One-tier | Rarely shared — `--navbar-height`, `--sidebar-width` etc. are specific. |

**Only typography is two-tier** because it's the one thing layouts get most sloppy with. Seven size values on a naked scale (`xs / sm / base / lg / xl / 2xl / 3xl`) invite "pick the one that looks right" — which erodes consistency across components. Semantic tokens force you to pick by *role*, not by *vibe*.

## The typography two-tier model

```
┌──────────────────────────────────────────────────────────────┐
│  PRIMITIVE SCALE  (theme defines, layouts don't consume)     │
│  --font-size-xs / sm / base / lg / xl / 2xl / 3xl / ...      │
└──────────────────────────────────────────────────────────────┘
                    ↓ mapped to ↓
┌──────────────────────────────────────────────────────────────┐
│  SEMANTIC TOKENS  (layouts consume these)                    │
│                                                              │
│  UI chrome:                                                  │
│    --ui-text-micro  = --font-size-xs    badges, meta         │
│    --ui-text-body   = --font-size-sm    body, card titles    │
│    --ui-text-title  = --font-size-2xl   page titles          │
│                                                              │
│  Rendered content (markdown):                                │
│    --content-body   = --font-size-base                       │
│    --content-h1     = --font-size-2xl                        │
│    --content-h2     = --font-size-xl                         │
│    --content-h3     = --font-size-lg                         │
│    --content-h4-h6  = --font-size-base  (structural only)    │
│    --content-code   = 0.9em             (em — scales)        │
│                                                              │
│  Display (marketing / hero only):                            │
│    --display-sm / md / lg                                    │
└──────────────────────────────────────────────────────────────┘
```

### Why three tiers in UI chrome, not more

The temptation is always there — "I need a slightly-bigger-than-body size for card titles." The answer every mature design system has landed on (Polaris, Primer, Linear, Notion): **combine `--ui-text-body` with `font-weight: 600` and `color: var(--color-text-primary)`**. Size doesn't carry importance once you've already got weight and color.

Three tiers (micro / body / title) covers the entire chrome palette. Everything else uses weight + color for hierarchy.

### Why h4–h6 are the same size as body

It's deliberate. In rendered prose, `h4` through `h6` are **structural landmarks** — used by outline generators, tables of contents, accessibility tooling. They're not for *visual emphasis*. Differentiate them via `font-weight` and `color`; not by making them another rung on a size ladder readers can't distinguish anyway.

## Which file declares which token

| Tokens | Declared in | Consumed by |
|---|---|---|
| Colours + dark variants | `color.css` | Everywhere |
| Font primitives + semantic tiers | `font.css` | Layouts + `markdown.css` |
| Spacing, radii, shadows, transitions, z-index, opacity, layout dims | `element.css` | Layouts |
| `@font-face` declarations | `font.css` (or a dedicated file) | — |
| No variables, just styling | `markdown.css`, `navbar.css`, `footer.css`, `docs.css`, `blogs.css`, etc. | N/A — these consume |

The boundary is strict: variable-declaring files declare, component-styling files consume. Don't mix.

## Using tokens in layouts

```css
.card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast);
}

.card-title {
  font-size: var(--ui-text-body);
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-meta {
  font-size: var(--ui-text-micro);
  color: var(--color-text-muted);
}
```

Note: every visual decision is a `var(--…)` lookup. No `#fff`, no `16px`, no `8px 16px`. If you're ever tempted to write a hardcoded value — a colour, a font size, a spacing unit — **stop and find the token that expresses the intent**. If no token exists, the answer is almost never "invent one in my layout"; it's either "use the closest tier" or "propose a contract addition." See [Rules for Layout Authors](../10_rules-for-layout-authors.md).

## In this section

| Page | Covers |
|---|---|
| [Colours](./02_colors.md) | All 14 semantic colours, light/dark split, brand + status families |
| [Typography](./03_typography.md) | Font families, primitive scale, UI + content + display semantic tokens |
| [Spacing, Radius, Shadow](./04_spacing-radius-shadow.md) | Scale + radius + shadow + transition tokens |
| [Layout Dimensions](./05_layout-dimensions.md) | `--max-width-*`, navbar/sidebar heights, z-index, opacity |
