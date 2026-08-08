---
title: The Theme Contract
description: The 65 CSS variables every theme must define — the fixed set the whole framework relies on
sidebar_position: 2
---

# The Theme Contract

Every theme defines **exactly 65 CSS variables**. They're declared in `src/styles/theme.yaml → required_variables` and checked at load time. Any theme — built-in default, inheriting custom, or standalone — must define (or inherit) all 65, or the loader warns / errors.

This page is the flat list. For the *what each one does* breakdown, see the [Tokens](./04_tokens/01_overview.md) section; for the CSS files the defaults live in, see the [Built-in Default Theme](./03_theme-structure.md#built-in-default-theme).

## Why a contract?

Before any discussion of aesthetics, this is the engineering answer: **every layout in the framework uses these variable names.** Rename one, and layouts break in untraceable ways (dark mode stops working, text goes invisible, margins collapse). The contract gives theme authors a guarantee in both directions:

- **Layouts promise**: we will never invent new variable names or hardcode values — we only consume what's in the contract.
- **Themes promise**: we will define every name in the contract — layouts can rely on them existing.

This is why inventing a variable like `--color-accent` in a layout is dangerous. The contract doesn't promise it exists, so the theme won't define it, so `var(--color-accent)` falls through to whatever fallback the layout wrote — and that hardcoded fallback freezes the value across dark/light mode. See [Rules for Layout Authors](./10_rules-for-layout-authors.md) for the full anti-pattern list.

## What decides whether a variable is on this list

One rule, and it is narrower than "everything useful":

> **A variable is required if a shipped layout reads it. Nothing else qualifies.**

The reason is `replace` mode. A theme that extends the default and merges inherits every variable and never notices a gap. A theme with `override_mode: replace` skips the parent entirely — so anything the layouts need but this list doesn't name is simply *gone*, and validation stays quiet, because validation only checks this list.

The corollary catches people out: **the list does not complete scales for tidiness.** `--font-weight-normal` is required; `--font-weight-bold` is not, because layouts read the first and write the second as a literal `700`. A theme may declare as many extra variables as it likes — that's its palette. The contract is only the part the layouts depend on.

## The 65 variables

### Colors — 21 variables

| Variable | Role |
|---|---|
| `--color-bg-primary` | Main page background |
| `--color-bg-secondary` | Cards, panels, secondary surfaces |
| `--color-bg-tertiary` | Table headers, subtle tints, hover backgrounds |
| `--color-text-primary` | Body text |
| `--color-text-secondary` | Descriptions, captions, subdued text |
| `--color-text-muted` | Metadata, timestamps, least-prominent text |
| `--color-border-default` | Card outlines, dividers, input borders |
| `--color-border-light` | Subtle separators, tint borders |
| `--color-brand-primary` | Links, primary buttons, accents |
| `--color-brand-secondary` | Secondary accents, hover state of primary |
| `--color-success` | Success states, green indicators |
| `--color-warning` | Warning states, amber indicators |
| `--color-error` | Error states, red indicators |
| `--color-info` | Info states, blue/cyan indicators |

**One-tier** — these are semantic names used directly. No primitive colour palette sits behind them. Each is declared twice in the theme (once under `:root` for light mode, once under `[data-theme="dark"]` for dark mode).

**Issue status — 7 variables.** One per status in the tracker's fixed vocabulary:

| Variable | Status |
|---|---|
| `--status-open` | open |
| `--status-blocked` | blocked |
| `--status-in-progress` | in-progress |
| `--status-input-needed` | input-needed |
| `--status-review` | review |
| `--status-done` | done |
| `--status-dropped` | dropped |

A theme may recolour these; it cannot add an eighth. The status *names* are fixed in the framework's `issue-status.ts` and are not configurable by any tracker — the colours are theme-owned, the vocabulary is not.

Full details: [Tokens / Colors](./04_tokens/02_colors.md).

### Fonts — 22 variables

**Primitive scale (8)** — the palette. Themes define; layouts don't consume these directly:

| Variable | Default (default theme) |
|---|---|
| `--font-family-base` | system-ui stack |
| `--font-family-mono` | Fira Code / monospace stack |
| `--font-size-sm` | `0.875rem` (14px) |
| `--font-size-base` | `1rem` (16px) |
| `--font-size-lg` | `1.125rem` (18px) |
| `--font-size-xl` | `1.25rem` (20px) |
| `--font-size-2xl` | `1.5rem` (24px) |
| `--line-height-base` | `1.6` |

**UI semantic tokens (3)** — for chrome (buttons, cards, nav, forms). Three tiers is the entire palette:

| Variable | Default value | Role |
|---|---|---|
| `--ui-text-micro` | `--font-size-xs` (12px in default) | Badges, counts, ids, timestamps |
| `--ui-text-body` | `--font-size-sm` (14px) | Default UI body, table rows, card titles |
| `--ui-text-title` | `--font-size-2xl` (24px) | Page titles |

For emphasis at the "card title" level, use `--ui-text-body` + `font-weight: 600`. Don't add a fourth size tier.

**Content semantic tokens (8)** — for rendered markdown / prose:

| Variable | Default value | Role |
|---|---|---|
| `--content-body` | `--font-size-base` (16px) | Paragraph body |
| `--content-h1` | `--font-size-2xl` (24px) | h1 |
| `--content-h2` | `--font-size-xl` (20px) | h2 |
| `--content-h3` | `--font-size-lg` (18px) | h3 |
| `--content-h4` | `--font-size-base` (16px) | h4 |
| `--content-h5` | `--font-size-base` | h5 |
| `--content-h6` | `--font-size-base` | h6 |
| `--content-code` | `0.9em` | Inline `<code>` — em-relative, scales with parent |

`h4`–`h6` are intentionally the same size as body. They're structural landmarks for outlines and tables-of-contents, not visual emphasis — differentiate via `font-weight` and `color`, not size.

**Weight (1)** — `--font-weight-normal` (`400`). Only this one is required, because it's the only weight layouts read through a variable; the rest of the scale (`medium` / `semibold` / `bold`) is the theme's own palette.

**Display tier (2)** — for marketing surfaces only:

| Variable | Default value | Used by |
|---|---|---|
| `--display-sm` | `--font-size-3xl` | Home hero, countdown |
| `--display-md` | `--font-size-4xl` | Home hero |

These are required despite being marketing-only, because the home and countdown layouts ship with the framework. A theme that omits them breaks the landing page. (`--display-lg` exists in the default theme but no shipped layout reads it, so it isn't on the contract.)

Full details: [Tokens / Typography](./04_tokens/03_typography.md).

### Elements — 22 variables

**Spacing scale (7):**

| Variable | Default |
|---|---|
| `--spacing-xs` | `0.25rem` (4px) |
| `--spacing-sm` | `0.5rem` (8px) |
| `--spacing-md` | `1rem` (16px) |
| `--spacing-lg` | `1.5rem` (24px) |
| `--spacing-xl` | `2rem` (32px) |
| `--spacing-2xl` | `3rem` (48px) |
| `--spacing-3xl` | `4rem` (64px) |

**Border radius (4):**

| Variable | Default |
|---|---|
| `--border-radius-sm` | `0.25rem` (4px) |
| `--border-radius-md` | `0.5rem` (8px) |
| `--border-radius-lg` | `0.75rem` (12px) |
| `--border-radius-full` | `9999px` — pills, avatars |

**Shadow (4):**

| Variable | Default |
|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.05)` |
| `--shadow-md` | `0 4px 6px rgba(0, 0, 0, 0.1)` |
| `--shadow-lg` | `0 10px 15px rgba(0, 0, 0, 0.1)` |
| `--shadow-xl` | `0 20px 25px rgba(0, 0, 0, 0.1)` |

**Transitions (2):**

| Variable | Default |
|---|---|
| `--transition-fast` | `150ms ease` |
| `--transition-normal` | `250ms ease` |

**Layout dimensions (5)** — these carry *structure*, not style. The docs layout reads them to size its grid, so a theme that drops one collapses the page rather than restyling it:

| Variable | Default | Role |
|---|---|---|
| `--sidebar-width` | `280px` | Docs sidebar column |
| `--navbar-height` | `64px` | Sticky nav offset — scroll anchoring depends on it |
| `--outline-width` | `280px` | Right-hand outline column |
| `--max-width-primary` | `1600px` | Main content width |
| `--max-width-secondary` | `1336px` | Narrow content width |

Full details: [Tokens / Spacing, Radius, Shadow](./04_tokens/04_spacing-radius-shadow.md) and [Tokens / Layout Dimensions](./04_tokens/05_layout-dimensions.md).

## Variables the framework uses but doesn't require

The default theme defines extras for its own stylesheets to use. Custom themes that extend the default inherit them; standalone themes **don't have to** provide them, because no shipped layout reads them — they only travel between the default theme's own CSS files, and a `replace` theme swaps that whole set out together.

| Extra variable | Purpose |
|---|---|
| `--font-size-xs` / `3xl` / `4xl` / `5xl` | Extended type scale, behind the semantic tokens |
| `--font-weight-medium` / `semibold` / `bold` | The rest of the weight scale |
| `--display-lg` | Third display tier, currently unused by any layout |
| `--line-height-tight` / `relaxed` | Rhythm variants |
| `--font-family-heading` | Heading face, defaults to the base family |
| `--z-index-dropdown` / `sticky` / `modal` / … | Stacking order, used only inside the default theme |
| `--opacity-*`, `--border-width-*` | Fine control — borderless states, skeletons |

These are documented in [Tokens / Layout Dimensions](./04_tokens/05_layout-dimensions.md). They're **optional** — a theme can override them but doesn't have to.

## How the list is kept honest

The count above drifts the moment a layout starts reading a new variable, and nothing about that failure is visible: the page still renders, just with a frozen colour. So it's checked rather than remembered.

`scripts/checks/check-theme-contract.mjs` runs three gates over the source:

| Gate | Fails when |
|---|---|
| **A** | a `var(--x)` anywhere in the engine names something nothing declares |
| **B** | a shipped layout reads a variable the contract doesn't require — the `replace`-mode hole |
| **C** | a circular `extends` isn't detected, proven against five on-disk theme fixtures |

Gate B is what makes this page's number trustworthy: it fails in *both* directions, so a variable can neither quietly leave the contract nor quietly enter the layouts without it.

## Variables you must NEVER invent

The dangerous anti-pattern — a layout CSS file with a new variable name the contract doesn't promise:

```css
/* ❌ BUG FACTORY */
.my-card {
  background: var(--color-accent, #7aa2f7);
  font-size: var(--card-title-size, 15px);
}
```

`--color-accent` and `--card-title-size` aren't in the contract. No theme defines them. `var()` falls through to the hardcoded fallback — which freezes the value across dark/light mode. **Switching themes won't change it. Dark mode won't change it.** The code silently "works" while the feature is broken.

The fix: use a variable that's in the contract. Almost always one of:
- `--color-brand-primary` instead of `--color-accent`
- `--ui-text-body` (+ `font-weight: 600`) instead of some custom card-title size

## How the contract is enforced

At theme load time, the loader checks every variable in `required_variables` against the concatenated theme CSS:

1. **Child theme `extends: null`** — every required variable must be defined in the theme's own CSS. Missing → error.
2. **Child theme `extends: "@theme/default"` with `merge` mode** — missing variables inherit from parent. Warning only.
3. **`override` mode** — parent's file is skipped if child provides one; missing in both → warning.
4. **`replace` mode** — parent entirely skipped, child is standalone. Missing → error.

See [Validation](./09_validation.md) for the full failure-mode table.

## See also

- [Tokens / Overview](./04_tokens/01_overview.md) — tier structure · naming rules
- [Tokens / Colors](./04_tokens/02_colors.md) — 14 colors, light/dark split
- [Tokens / Typography](./04_tokens/03_typography.md) — two-tier model explained
- [Rules for Layout Authors](./10_rules-for-layout-authors.md) — the consumption side
