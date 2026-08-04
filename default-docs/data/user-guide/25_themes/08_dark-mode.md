---
title: Dark Mode
description: How dark mode works — the [data-theme="dark"] pattern, what to redeclare, what to leave alone, testing
sidebar_position: 8
---

# Dark Mode

Dark mode in this framework is **not a separate theme** — it's a **mode switch inside the same theme**. Both light and dark values live in the same CSS files. The framework toggles `data-theme="dark"` on `<html>`, and CSS cascade does the rest.

## The one pattern to know

```css
/* Light mode — default */
:root {
  --color-bg-primary: #fafafa;
  --color-text-primary: #1a1a1a;
}

/* Dark mode — redefine via attribute selector */
[data-theme="dark"] {
  --color-bg-primary: #0a0a0a;
  --color-text-primary: #fafafa;
}
```

Any element on the page consuming `var(--color-bg-primary)` gets `#fafafa` in light mode and `#0a0a0a` in dark — automatically, no JS involved, no layout changes needed.

## Why this works

CSS variables cascade like any other CSS. The browser resolves `var(--color-bg-primary)` at paint time by walking up the DOM looking for the nearest declaration. When `<html data-theme="dark">` is set, `[data-theme="dark"] { --color-bg-primary: … }` matches higher in the cascade than `:root { --color-bg-primary: … }` — so the dark value wins.

Toggle the attribute → every use of the variable repaints with the new value. No JS-driven re-render.

## What to redeclare in `[data-theme="dark"]`

**Colours** — nearly always. Every colour variable that differs between modes needs a redefine.

**Shadows** — sometimes. Default shadows are `rgba(0, 0, 0, 0.05)` etc., which are barely visible on dark backgrounds. Redefine if you want more prominent dark-mode shadows:

```css
[data-theme="dark"] {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.6);
}
```

## What NOT to redeclare

**Fonts** — font families, sizes, weights, line-heights are the same in both modes. Never put them inside `[data-theme="dark"]`.

**Spacing / radii / transitions** — all the same. Dark mode is a **colour** change, not a layout change.

**Semantic token mappings** — `--ui-text-body: var(--font-size-sm);` works the same regardless of mode. Don't redeclare semantic tokens in dark mode.

If you catch yourself redefining a non-colour variable under `[data-theme="dark"]`, ask whether there's a real reason or you're just going through the motions.

## The full default theme pattern

Here's what the default `color.css` looks like — a template for any theme:

```css
/* Light mode (default) */
:root {
  --color-bg-primary: #fafafa;
  --color-bg-secondary: #f5f5f5;
  --color-bg-tertiary: #eeeeee;

  --color-text-primary: #1a1a1a;
  --color-text-secondary: #525252;
  --color-text-muted: #737373;

  --color-border-default: #e5e5e5;
  --color-border-light: #f0f0f0;

  --color-brand-primary: #2563eb;
  --color-brand-secondary: #1d4ed8;

  --color-success: #16a34a;
  --color-warning: #ca8a04;
  --color-error: #dc2626;
  --color-info: #0891b2;
}

/* Dark mode */
[data-theme="dark"] {
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #171717;
  --color-bg-tertiary: #262626;

  --color-text-primary: #fafafa;
  --color-text-secondary: #a3a3a3;
  --color-text-muted: #737373;

  --color-border-default: #262626;
  --color-border-light: #333333;

  --color-brand-primary: #3b82f6;
  --color-brand-secondary: #60a5fa;

  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-error: #ef4444;
  --color-info: #06b6d4;
}
```

14 colours declared twice — once per mode. Every layout in the framework consumes these tokens. Nothing else needs to change.

## The attribute toggle

The framework ships a theme toggle in the navbar that does roughly:

```js
document.documentElement.setAttribute('data-theme', 'dark');
```

Persisted in `localStorage` so the preference survives navigation. On page load, the stored preference is applied before any content renders (to avoid FOUC — flash of unstyled colour).

For custom implementations, the pattern is:

```js
// Save preference
localStorage.setItem('theme', 'dark');

// Apply
document.documentElement.setAttribute('data-theme', 'dark');
```

## Component-level dark mode tweaks

Sometimes you need **element-level** dark mode adjustments — not a variable redefine but a selector-specific rule:

```css
/* Generally — prefer token-based adjustments */
.card {
  background: var(--color-bg-secondary);
  box-shadow: var(--shadow-sm);
}

/* But occasionally, you need element-specific dark tweaks */
[data-theme="dark"] .hero-image {
  filter: brightness(0.85);       /* dim hero images slightly in dark mode */
}

[data-theme="dark"] .code-block {
  border: 1px solid var(--color-border-light);   /* add border in dark */
}
```

**Prefer token-based solutions** when possible — they're simpler and auto-apply everywhere. Element-specific overrides are an escape hatch.

## `@media (prefers-color-scheme: dark)` — an alternative pattern

Some themes want to **auto-detect** the user's OS preference without a toggle:

```css
:root {
  --color-bg-primary: #fafafa;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #0a0a0a;
  }
}
```

This framework **doesn't use this pattern by default** — the navbar toggle is the primary mechanism. But you can combine both if you want OS preference as the initial default with toggle override.

The combined form:

```css
:root {
  --color-bg-primary: #fafafa;              /* light fallback */
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #0a0a0a;            /* dark if OS prefers */
  }
}

[data-theme="light"] {
  --color-bg-primary: #fafafa;              /* force light via toggle */
}

[data-theme="dark"] {
  --color-bg-primary: #0a0a0a;              /* force dark via toggle */
}
```

Verbose. Most themes just use the attribute pattern and expose the toggle — simpler and more predictable.

## Testing dark mode

Things to check:

- [ ] Toggle dark mode and navigate every layout — docs, blog, issues, custom. Nothing should render invisible text, broken chrome, or missing borders.
- [ ] Search the theme CSS for hardcoded colours (`#[0-9a-f]+`, `rgba(`, `rgb(`) — any match is a potential dark-mode bug.
- [ ] Search for `var(--color-*)` that appears in light mode but has no `[data-theme="dark"]` declaration — those stay light-coloured in dark mode.
- [ ] Check contrast ratios in both modes (aim for WCAG AA at minimum — 4.5:1 for body text).
- [ ] Verify `localStorage` persistence works — reload the page and check the mode sticks.

## Things that silently break dark mode

### Hardcoded colours

```css
.card { background: #f5f5f5; }    /* ❌ stays white-ish in dark */
```

The fix is always: use a token.

### Variable fallbacks

```css
.card { background: var(--card-bg, #f5f5f5); }    /* ❌ --card-bg doesn't exist → fallback freezes */
```

The fallback activates because `--card-bg` is never declared. The hex freezes. **Dark mode has no effect.**

Fix: use a variable from the contract.

### `color-mix()` with a hardcoded colour

```css
background: color-mix(in srgb, #2563eb 50%, white);   /* ❌ both hex values frozen */
```

Fix: mix using only tokens.

```css
background: color-mix(in srgb, var(--color-brand-primary) 50%, var(--color-bg-primary));
```

## See also

- [Colors](./04_tokens/02_colors.md) — all 14 colour tokens, both modes
- [Rules for Layout Authors](./10_rules-for-layout-authors.md) — the no-hardcoded-values contract
- [Theme Structure](./03_theme-structure.md) — where `color.css` sits
