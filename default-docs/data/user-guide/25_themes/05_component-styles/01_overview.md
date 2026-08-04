---
title: Component Styles Overview
description: The CSS files that style specific elements — markdown, navbar, footer, docs, blog, issues
sidebar_position: 1
---

# Component Styles

A theme's **token files** (`color.css`, `font.css`, `element.css`) declare the variables. A theme's **component-style files** consume those variables to style specific parts of the rendered site: prose content, the navbar, the footer, docs sidebars, blog layouts, issues UI.

This section documents each component-style file — what it scopes, what it styles, and what tokens it consumes. The defaults all live in `src/styles/`; custom themes override them selectively.

## The files

| File | Scope | Lines (default) | What it owns |
|---|---|---:|---|
| [`markdown.css`](./02_markdown-styles.md) | `.markdown-content` | 485 | Rendered markdown — headings, paragraphs, lists, code, blockquotes, tables |
| [`navbar.css`](./03_navbar-styles.md) | Site navbar classes | 305 | Site navbar — logo, links, dropdowns, search, theme toggle |
| [`footer.css`](./04_footer-styles.md) | Site footer classes | 116 | Footer — columns, links, copyright |
| [`docs.css`](./05_docs-styles.md) | Docs layout classes | 466 | Docs layout — sidebar, outline, pagination, breadcrumbs |
| [`blogs.css`](./06_blogs-styles.md) | Blog layout classes | 341 | Blog index + post — cards, meta, tags |
| [`issues.css`](./07_issues-styles.md) | Issues layout classes | — | Issues layout — filter chips, state tabs, sub-doc sidebar, metadata form |

## The cardinal rule

Every line of CSS in these files consumes theme tokens. **Zero hardcoded values.** A recent grep across the entire `src/layouts/` + `src/styles/` found:

- 457 `var(--…)` uses
- 0 hardcoded colours
- 0 hardcoded font sizes
- 0 hardcoded spacing values

The lone exception is `@media` queries (breakpoints), because CSS custom properties cannot be used inside media queries — browsers evaluate those at parse time. Breakpoint pixel values are documented in `breakpoints.css` and referenced consistently across component-style files.

## Scoping convention

Each component-style file uses a **class prefix** to avoid leaking across the page:

```css
/* markdown.css — scoped to .markdown-content */
.markdown-content h1 { … }
.markdown-content p { … }

/* docs.css — scoped to docs layout classes */
.docs-sidebar { … }
.docs-outline { … }

/* navbar.css — scoped to navbar */
.site-navbar { … }
```

This scoping is critical. If `markdown.css` wrote bare `h1 { … }`, those rules would hit the navbar's `<h1>` (the site title), breaking the chrome. Scoping is the guard rail.

## Dark mode inside component styles

Component styles don't declare variables; they declare element styles. When dark-mode-specific tweaks are needed (e.g. a different shadow on dark-mode cards), use the `[data-theme="dark"]` selector:

```css
.card {
  background: var(--color-bg-secondary);
  box-shadow: var(--shadow-sm);
}

[data-theme="dark"] .card {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);   /* ❌ hardcoded — avoid */
}

/* Better: declare --shadow-sm differently under [data-theme="dark"]
   in color.css, and let .card inherit the correct shadow automatically. */
```

Prefer to solve dark-mode differences via token redefines in `color.css` rather than element-level overrides in component styles. Keeps the logic in one place. See [Dark Mode](../08_dark-mode.md) for the full pattern.

## Overriding component styles

A custom theme can override any component-style file by shipping its own copy:

```yaml
# my-theme/theme.yaml
extends: "@theme/default"
override_mode: "merge"     # default — appends child on top of parent
files:
  - color.css              # override colours
  - markdown.css           # override rendered prose styling
```

With `merge`, both parent and child `markdown.css` load — CSS cascade resolves conflicts. With `override`, only the child's `markdown.css` loads; the parent's is skipped.

See [Inheritance and Override](../07_inheritance-and-override.md) for merge vs override decisions.

## Extending with new layouts

If you've built a custom layout type (e.g. a custom `portfolio` layout), ship its CSS as part of your theme:

```
my-theme/
├── theme.yaml
├── ...token files...
└── portfolio.css         ← scoped to .portfolio class, new file
```

Declare it in the manifest's `files:` array, same as the built-in component styles. No framework changes needed — the loader reads whatever's listed.

## See also

- [Tokens Overview](../04_tokens/01_overview.md) — what these files consume
- [Markdown Styles](./02_markdown-styles.md) — the biggest file, the prose surface
- [Theme Structure](../03_theme-structure.md) — where these files fit in the overall layout
- [Rules for Layout Authors](../10_rules-for-layout-authors.md) — the no-hardcoded-values rule that applies here
