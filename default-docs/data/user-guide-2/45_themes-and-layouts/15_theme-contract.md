---
title: "The theme contract"
---

The theme contract is the list of CSS variables every theme must provide, because the built-in layouts read them. This page lists all 66, explains the rule that decides the list, and shows which text-size variables to use in your own CSS. To see each variable's value in your theme, run `agentks theme tokens`.

## The rule

**A variable is on the contract if, and only if, a built-in layout reads it.**

The rule matters most for a theme with `override_mode: replace`. Such a theme drops its parent and keeps only what it defines itself. So the contract must name exactly what the layouts need: a missing name would break a page, and an extra name would make every theme author define something no layout uses.

This is also why a variable you expect may be absent. The contract has `--font-weight-normal` but no bold weight, because the layouts read the normal weight from the theme and write bold as a fixed value. A theme may declare as many extra variables as it likes. Those are its own palette, not the contract.

A theme that extends the built-in theme with the default `merge` mode inherits all 66, so it only changes the ones it wants.

## Colours

| Variable | Used for |
|---|---|
| `--color-bg-primary` | The page background |
| `--color-bg-secondary` | Cards and panels |
| `--color-bg-tertiary` | Table headers and subtle tints |
| `--color-text-primary` | Main text |
| `--color-text-secondary` | Secondary text |
| `--color-text-muted` | Quiet text, such as dates and counts |
| `--color-border-default` | Normal borders |
| `--color-border-light` | Faint borders |
| `--color-brand-primary` | Links, accents and active items |
| `--color-brand-secondary` | A second brand colour, such as a hover state |
| `--color-success` | Success messages |
| `--color-warning` | Warnings |
| `--color-error` | Errors |
| `--color-info` | Information |

### Issue status colours

The issue tracker has eight fixed statuses, and each has its own colour. A theme can change these colours but cannot add a status.

| Variable | Status |
|---|---|
| `--status-open` | open |
| `--status-blocked` | blocked |
| `--status-in-progress` | in-progress |
| `--status-input-needed` | input-needed |
| `--status-review` | review |
| `--status-done` | done |
| `--status-dropped` | dropped |
| `--status-superseded` | superseded |

## Fonts and text

| Variable | Used for |
|---|---|
| `--font-family-base` | Body text |
| `--font-family-mono` | Code |
| `--font-size-sm` | The primitive size scale (see below) |
| `--font-size-base` | |
| `--font-size-lg` | |
| `--font-size-xl` | |
| `--font-size-2xl` | |
| `--line-height-base` | Body line height |
| `--font-weight-normal` | Normal text weight |
| `--ui-text-micro` | Small interface text: badges, counts, ids, timestamps, field labels |
| `--ui-text-body` | Most interface text: table rows, inputs, descriptions, card titles |
| `--ui-text-title` | Page titles and major landmarks |
| `--content-body` | Paragraphs of a rendered page |
| `--content-h1` | Headings of a rendered page, level 1 |
| `--content-h2` | Level 2 |
| `--content-h3` | Level 3 |
| `--content-h4` | Level 4 |
| `--content-h5` | Level 5 |
| `--content-h6` | Level 6 |
| `--content-code` | Inline code. Its default is relative to the text around it, so code in a heading grows with the heading |
| `--display-sm` | Large display text on the home and countdown pages |
| `--display-md` | Larger display text on the same pages |

## Spacing, shapes and sizes

| Variable | Used for |
|---|---|
| `--spacing-xs` | The spacing scale, smallest to largest |
| `--spacing-sm` | |
| `--spacing-md` | |
| `--spacing-lg` | |
| `--spacing-xl` | |
| `--spacing-2xl` | |
| `--spacing-3xl` | |
| `--border-radius-sm` | Corner radius, small to fully round |
| `--border-radius-md` | |
| `--border-radius-lg` | |
| `--border-radius-full` | |
| `--shadow-sm` | Shadows, faint to strong |
| `--shadow-md` | |
| `--shadow-lg` | |
| `--shadow-xl` | |
| `--transition-fast` | Quick animations, such as hover |
| `--transition-normal` | Other animations |
| `--sidebar-width` | The docs sidebar |
| `--navbar-height` | The navbar |
| `--outline-width` | The heading outline beside a page |
| `--max-width-primary` | The outer frame: the whole docs layout and the navbar |
| `--max-width-secondary` | The content column, the blog and the footer |

The five size variables at the end shape the page grid. A theme that drops them collapses the layout instead of restyling it.

## Text sizes: two tiers

Text sizes come in two tiers:

- **The primitive scale**, the `--font-size-*` variables, is the theme's palette of sizes.
- **The semantic tokens** say what the text is for: `--ui-text-*` for the interface, `--content-*` for rendered pages, and `--display-*` for the home and countdown pages. The built-in theme defines each one from the primitive scale.

The layouts read only the semantic tokens. Do the same in your own CSS:

```css
/* In your theme's CSS */
[data-part="sidebar"] {
  font-size: var(--ui-text-body);                /* not a fixed px size */
}
```

A redesign can then change the interface sizes without shrinking the headings of your pages, because the two use different names even where their values match today.

Three interface sizes are the whole set. For emphasis, such as a card title, use `--ui-text-body` with a heavier weight and `--color-text-primary`, not a fourth size.

## Where else the names appear

- **HTML elements from libraries** style themselves with these names, so a page can pass its own values to them: see [HTML elements](../40_libraries/25_html-elements.md).
- **Artifact pages** in `site` theme mode use these names to follow your site's theme. [Writing content](../10_writing-content/01_overview.md) covers artifact pages.
