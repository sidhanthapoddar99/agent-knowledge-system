---
title: Rules for Layout Authors
description: The no-hardcoded-values contract every layout must follow — what to do, what to never do, how to verify
sidebar_position: 10
---

# Rules for Layout Authors

**Everything in this page is a contract, not a suggestion.** Layouts that violate these rules break theme switching, dark mode, and user customisation in silent and confusing ways.

The audience for this page is: anyone writing CSS in `astro-doc-code/src/layouts/*` or any custom layout under `layouts/` (when `LAYOUT_EXT_DIR` is set). The discipline described here is why the current codebase has **zero** hardcoded colours / font sizes / spacing values across 457 `var(--…)` uses. Today's state is clean. Your job is to keep it that way.

## The core rule

> **Every visual value in layout CSS must be a theme token. No hardcoded colours, font sizes, spacing, radii, shadows, transitions, or dimensions.**

Grep your CSS for any of these patterns and rewrite them as tokens:

- `#[0-9a-f]{3,8}` — hex colours
- `rgb(…)`, `rgba(…)`, `hsl(…)`, `hsla(…)` — CSS colour functions with literal values
- Raw `px`, `rem`, `em` values in `font-size`, `padding`, `margin`, `gap`, `border-radius`, `box-shadow`, `width`, `height`
- Raw `ms` / `s` values in `transition` / `animation`

Exceptions:

- **`@media` breakpoints** — CSS variables don't work in `@media` queries (browser limitation). Hardcoded pixel values are the only option. Document your breakpoints consistently.
- **`em` for parent-relative sizing** — `padding: 0.2em 0.4em` on inline elements is intentionally relative. `em` for scaling with parent font size is legitimate.
- **Resets and global CSS defaults** — `reset.css`-style baseline rules.

Everything else is a token lookup.

## What "use a token" means

### For colours

```css
/* ❌ hardcoded */
color: #1a1a1a;
background: #2563eb;
border: 1px solid #e5e5e5;

/* ✅ tokens */
color: var(--color-text-primary);
background: var(--color-brand-primary);
border: 1px solid var(--color-border-default);
```

### For font sizes

```css
/* ❌ hardcoded */
font-size: 14px;
font-size: 0.875rem;

/* ❌ primitive consumed directly */
font-size: var(--font-size-sm);

/* ✅ semantic UI token */
font-size: var(--ui-text-body);

/* ✅ semantic content token (for prose) */
font-size: var(--content-body);
```

The primitive scale (`--font-size-sm`, `--font-size-lg`, etc.) is **for themes to define, not for layouts to consume**. Layouts use the three tiers (`--ui-text-micro / body / title`) for chrome, or the content tiers (`--content-body / h1 / h2 / …`) for prose.

### For spacing / radii / shadows

```css
/* ❌ hardcoded */
padding: 8px 16px;
border-radius: 4px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

/* ✅ tokens */
padding: var(--spacing-sm) var(--spacing-md);
border-radius: var(--border-radius-sm);
box-shadow: var(--shadow-sm);
```

### For transitions

```css
/* ❌ hardcoded */
transition: background 0.2s ease;

/* ✅ token */
transition: background var(--transition-fast);
```

## Never invent variable names

The dangerous anti-pattern:

```css
/* ❌ BUG FACTORY */
.my-card {
  background: var(--color-card-bg, #fafafa);
  font-size: var(--card-title-size, 15px);
}
```

`--color-card-bg` and `--card-title-size` aren't in the [theme contract](./02_the-theme-contract.md). No theme defines them. `var()` falls through to the hardcoded fallback — **which freezes the value across dark/light mode and across theme switches.** Dark mode won't flip the card background. Changing themes won't change the title size. The code silently "works" while the feature is broken.

### The fix

Use a variable that's already in the contract. Almost always one of:

| Bad invention | Good contract variable |
|---|---|
| `--color-accent` | `--color-brand-primary` |
| `--color-card-bg` | `--color-bg-secondary` |
| `--color-nav-bg` | `--color-bg-primary` |
| `--color-code-bg` | `--color-bg-tertiary` |
| `--card-title-size` | `--ui-text-body` (+ `font-weight: 600`) |
| `--button-text-size` | `--ui-text-body` |
| `--caption-size` | `--ui-text-micro` |
| `--sidebar-padding` | `--spacing-md` |
| `--card-radius` | `--border-radius-md` |

### When no contract variable fits

If you genuinely cannot express the intent with an existing token:

1. **First**: re-examine the intent. Is it really different from the closest existing token?
2. **Second**: consider whether the design can use weight/color/position to carry the meaning instead of a new token.
3. **Third**: if you still need a new variable, **propose adding it to the contract** (edit `astro-doc-code/src/styles/theme.yaml → required_variables`). The validator will then enforce it across every theme.

**Never ship a layout with an invented variable name and a hardcoded fallback.** That path always ends in "feature works in our theme but breaks in a user theme."

## Emphasis via weight + colour, not size

The #1 mistake in chrome styling: adding a new size tier for emphasis.

```css
/* ❌ instinct: "card title should be bigger" */
.card-title {
  font-size: 16px;   /* bigger than body, smaller than title */
}
```

The framework has three UI text tiers (micro / body / title). That's the entire palette. For emphasis at card-title level:

```css
/* ✅ combine body + weight + colour */
.card-title {
  font-size: var(--ui-text-body);
  font-weight: 600;
  color: var(--color-text-primary);
}
```

Weight (`600`) + colour (`primary`, not muted) carry the hierarchy. No fourth size tier needed. This is what mature design systems (Polaris, Primer, Linear, Notion) use for chrome.

For **content** (rendered markdown), the content tokens (`--content-h1`, `--content-h2`, etc.) provide seven tiers — use those. Different domain, different model.

## Dark mode is automatic — unless you break it

Because layouts consume `--color-*` tokens (and nothing else for colours), dark mode "just works" as long as you never reach for a literal colour.

Ways layouts break dark mode:

| Pattern | What breaks |
|---|---|
| Hardcoded hex colour | Stays light-coloured in dark mode |
| Hardcoded `rgba(…)` for borders / overlays | Same — frozen in one mode |
| Invented variable with hex fallback | Fallback activates, value freezes across modes |
| Colour filter / blend with hardcoded value | One of the values is fixed across modes |

See [Dark Mode](./08_dark-mode.md) for the full gotcha list.

## `@media` and CSS variables — the one exception

```css
/* ❌ doesn't work */
@media (min-width: var(--breakpoint-md)) { … }

/* ✅ works */
@media (min-width: 768px) { … }
```

Browsers evaluate `@media` queries at parse time, before CSS variables resolve. So breakpoint pixel values are hardcoded by necessity. Document them consistently:

```css
/* Breakpoints — see astro-doc-code/src/styles/breakpoints.css
 * sm: 640px+   md: 768px+   lg: 1024px+   xl: 1280px+
 */

@media (min-width: 768px) {
  .docs-layout { … }
}
```

Don't invent per-file breakpoint pixel values. Use the framework's convention.

## Verification

### Grep your own CSS

```bash
# Hex colours (run from the repo root — framework source lives in astro-doc-code/)
grep -rE '#[0-9a-fA-F]{3,8}' astro-doc-code/src/layouts/
# Should return empty (or only in comments)

# Literal rgba/rgb/hsl
grep -rE 'rgba?\([0-9]' astro-doc-code/src/layouts/
grep -rE 'hsla?\([0-9]' astro-doc-code/src/layouts/

# Raw pixel values in specific properties
grep -rE 'font-size:\s*[0-9]' astro-doc-code/src/layouts/
grep -rE 'padding:\s*[0-9]' astro-doc-code/src/layouts/ | grep -v 'var\(' | grep -v '0\s*;'
```

Any match is a potential contract violation. Investigate each.

### Check computed styles in DevTools

Pick any element on the page → DevTools → Computed tab → Custom properties (`--`). Every colour, font size, spacing value in use should trace back to a theme variable.

### Test theme switch

Change `site.yaml theme:` from `default` to `minimal` (or another theme). Run `./start dev`. The site should re-skin without breakage. Any element that "doesn't look right" is either (a) a legitimate theme difference, or (b) a hardcoded value in your layout.

### Test dark mode

Click the theme toggle. Navigate every layout type. No white-on-white text, no unreadable contrast, no frozen hex colours.

## Why this discipline matters

1. **Theme switching** — the reason someone would use this framework over plain Astro. If layouts hardcode colours, swapping themes only partially works.
2. **Dark mode** — the framework ships dark mode for free IF layouts consume tokens. Hardcoded values silently freeze in light.
3. **User themes** — letting users customise by editing `color.css` only works if layouts consume through variables. Hardcoded values are invisible to the user's theme.
4. **Text size standardisation** — the two-tier model prevents pixel-level bikeshedding across components. Every card title is the same size everywhere because every layout uses `--ui-text-body`.
5. **Accessibility** — users with visual needs can bump primitive sizes (`--font-size-sm`) and have the entire UI follow. Can't do that if layouts hardcode `14px`.

The discipline isn't aesthetic. It's load-bearing infrastructure for features users actually use.

## See also

- [The Theme Contract](./02_the-theme-contract.md) — the 46 variables to consume
- [Tokens / Typography](./04_tokens/03_typography.md) — when to use UI tokens vs content tokens
- [Dark Mode](./08_dark-mode.md) — the `[data-theme="dark"]` pattern that depends on this discipline
- [Validation](./09_validation.md) — what the loader checks (contract enforcement on theme side)
