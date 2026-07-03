---
title: Markdown Styles
description: How rendered prose is styled — headings, paragraphs, lists, code, tables, blockquotes
sidebar_position: 2
---

# Markdown Styles

`markdown.css` (485 lines in the default theme) styles everything inside `.markdown-content` — the class wrapped around rendered markdown everywhere prose appears: docs bodies, blog posts, issue overviews, note sub-docs.

## Scope rule

Every selector in `markdown.css` is prefixed with `.markdown-content`. Bare selectors (`h1`, `p`, etc.) would leak into the navbar, sidebar, buttons — everywhere else on the page that happens to use those HTML elements. Scoping keeps prose styling contained.

```css
.markdown-content h1 { … }          /* ✅ scoped */
.markdown-content p { … }

h1 { … }                             /* ❌ leaks everywhere */
```

One exception: a small `body { … }` block at the top sets global background + font family. That's intentional — it's the only place those need to declare themselves.

## What it styles — the inventory

| Element / construct | Scoped class | Primary tokens consumed |
|---|---|---|
| Links | `.markdown-content a` | `--color-brand-primary`, `--color-brand-secondary`, `--transition-fast` |
| Inline code | `.markdown-content code` | `--font-family-mono`, `--content-code`, `--color-bg-tertiary`, `--border-radius-sm` |
| Code blocks | `.markdown-content pre` | `--spacing-md`, `--border-radius-md`, `--color-border-light`, `--color-bg-secondary` |
| Code block label + copy button | `.code-label` | `--font-family-base`, `--font-size-xs`, `--color-bg-secondary`, `--spacing-xs` |
| Headings h1–h6 | `.markdown-content h1…h6` | `--content-h1` through `--content-h6`, `--font-weight-bold/semibold`, `--color-text-primary`, `--spacing-*` |
| Paragraph | `.markdown-content p` | `--content-body`, `--line-height-base`, `--color-text-primary`, `--spacing-md` |
| Lists | `.markdown-content ul`, `ol`, `li` | `--spacing-*`, `--color-text-primary` |
| Blockquote | `.markdown-content blockquote` | `--color-border-default`, `--color-text-secondary`, `--spacing-md` |
| Tables | `.markdown-content table`, `th`, `td` | `--color-border-default`, `--color-bg-tertiary`, `--ui-text-body`, `--spacing-sm` |
| Images | `.markdown-content img` | `--border-radius-md`, `--shadow-sm` |
| HR | `.markdown-content hr` | `--color-border-default`, `--spacing-xl` |
| Collapsible | `.markdown-content details`, `summary` | `--color-border-default`, `--color-bg-secondary`, `--spacing-md`, `--border-radius-md` |
| Callouts (GFM alerts) | `.markdown-alert`, `.markdown-alert-{note,tip,important,warning,caution}`, `.markdown-alert-title` | `--color-info`, `--color-success`, `--color-brand-primary`, `--color-warning`, `--color-error`, `--spacing-*`, `--border-radius-md` |

## Key patterns

### Inline code

```css
.markdown-content code {
  font-family: var(--font-family-mono);
  font-size: var(--content-code);           /* 0.9em — relative to parent */
  background-color: var(--color-bg-tertiary);
  padding: 0.2em 0.4em;                     /* em — relative to font size */
  border-radius: var(--border-radius-sm);
}
```

Note the `em` padding — it scales with the font size of the surrounding text. Inline code inside a heading gets slightly larger padding than inline code in a paragraph. Intentional.

### Code blocks with dual-theme syntax highlighting

Shiki renders code with inline-style spans. Light-mode styles are inline; dark mode switches to custom properties:

```css
[data-theme="dark"] .markdown-content .shiki,
[data-theme="dark"] .markdown-content .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}
```

The `--shiki-dark` variables are generated per-token by Shiki itself. The theme doesn't need to declare them; layouts don't need to consume them — they're part of the code-highlighting pipeline.

### Heading rhythm

```css
.markdown-content h1 { font-size: var(--content-h1); font-weight: 700; }
.markdown-content h2 { font-size: var(--content-h2); font-weight: 700; }
.markdown-content h3 { font-size: var(--content-h3); font-weight: 600; }
.markdown-content h4 { font-size: var(--content-h4); font-weight: 600; color: var(--color-text-primary); }
.markdown-content h5 { font-size: var(--content-h5); font-weight: 600; color: var(--color-text-secondary); }
.markdown-content h6 { font-size: var(--content-h6); font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: var(--letter-spacing-wide); }
```

Note `h4`, `h5`, `h6` are the **same size as body**. They differentiate via weight + colour shift + (at h6) text-transform. That's the "structural landmarks, not visual emphasis" principle from [Typography](../tokens/typography#h4h6-are-structural-not-visual).

### Spacing between paragraphs / headings

```css
.markdown-content p + p   { margin-top: var(--spacing-md); }
.markdown-content h2      { margin-top: var(--spacing-xl); margin-bottom: var(--spacing-md); }
.markdown-content h3      { margin-top: var(--spacing-lg); margin-bottom: var(--spacing-sm); }
.markdown-content blockquote + p { margin-top: var(--spacing-md); }
```

The adjacent-sibling selectors (`p + p`) produce tighter-first-paragraph, generous-between-paragraphs rhythm without magic numbers.

## Customising markdown styles

Typical custom-theme overrides:

```css
/* my-theme/markdown.css */
.markdown-content a {
  text-decoration: underline;                   /* style hyperlinks differently */
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
}

.markdown-content blockquote {
  border-left-color: var(--color-brand-primary);  /* branded blockquote */
  background: var(--color-bg-secondary);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
}

.markdown-content h2 {
  font-size: calc(var(--content-h2) * 1.1);       /* slightly larger h2 */
}
```

All consuming tokens. If you reach for a hardcoded value — stop, use a token, or propose a contract addition.

## Things that violate the contract

```css
/* ❌ hardcoded colour */
.markdown-content a { color: #2563eb; }

/* ❌ hardcoded font size */
.markdown-content h2 { font-size: 20px; }

/* ❌ hardcoded spacing */
.markdown-content p + p { margin-top: 16px; }

/* ❌ hardcoded border */
.markdown-content table td { border-bottom: 1px solid #e5e5e5; }

/* ❌ invented variable name with hardcoded fallback */
.markdown-content code { background: var(--color-code-bg, #f0f0f0); }
```

Each of these freezes a value that should flow through the theme. The last one is the sneakiest — `var()` with a hardcoded fallback breaks dark mode silently.

## See also

- [Typography](../tokens/typography) — `--content-*` tokens the markdown styles consume
- [Colors](../tokens/colors) — `--color-*` tokens for links, code backgrounds, borders
- [Writing Content / Markdown Basics](/user-guide/writing-content/markdown-basics) — what the rendered output looks like from the author side
