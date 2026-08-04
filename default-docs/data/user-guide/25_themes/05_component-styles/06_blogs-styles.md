---
title: Blog Styles
description: The blog layouts — index (list of posts) and detail (single post)
sidebar_position: 6
---

# Blog Styles

`blogs.css` (341 lines in the default theme) styles the two blog layouts: the **index** (list of posts) and the **detail** (individual post page).

Shorter than `docs.css` because blogs are flatter — no sidebar tree, no outline panel. Just cards and posts.

## Key classes

### Index (list)

| Class | Element |
|---|---|
| `.blog-index` | Outer container |
| `.blog-index__grid` | Card grid |
| `.blog-card` | Single post preview |
| `.blog-card__title` | Post title |
| `.blog-card__excerpt` | Short description |
| `.blog-card__meta` | Author + date + reading time |
| `.blog-card__tag` | Tag chips |

### Detail (single post)

| Class | Element |
|---|---|
| `.blog-post` | Outer container |
| `.blog-post__header` | Title, date, author block |
| `.blog-post__title` | Title |
| `.blog-post__meta` | Metadata row |
| `.blog-post__body` | Rendered markdown (wraps `.markdown-content`) |
| `.blog-post__footer` | Related posts, share buttons |

## Primary tokens consumed

- `--max-width-secondary` — index width
- `--max-width-prose` — post body width
- `--color-bg-primary`, `--color-bg-secondary` — card backgrounds
- `--color-border-default` — card outlines
- `--color-text-primary`, `--color-text-secondary`, `--color-text-muted` — text states
- `--ui-text-body`, `--ui-text-micro` — meta text sizes
- `--content-h1` — post title size
- `--border-radius-md`, `--border-radius-lg` — card corners
- `--shadow-sm`, `--shadow-md` — card elevations
- `--spacing-*` — padding + gaps
- `--transition-fast` — card hover transitions

## The index grid

```css
.blog-index {
  max-width: var(--max-width-secondary);
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.blog-index__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}
```

Responsive without `@media` — `auto-fit` + `minmax(320px, 1fr)` handles reflow from 3 columns → 2 → 1 automatically.

## Card styling

```css
.blog-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
}

.blog-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.blog-card__title {
  font-size: var(--ui-text-body);      /* not oversized */
  font-weight: 600;                    /* hierarchy via weight */
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.blog-card__excerpt {
  font-size: var(--ui-text-body);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.blog-card__meta {
  font-size: var(--ui-text-micro);
  color: var(--color-text-muted);
  display: flex;
  gap: var(--spacing-sm);
}
```

Classic three-tier UI chrome — title at body+bold, excerpt at body, meta at micro. No fourth size for the title.

## Post detail — narrow prose width

```css
.blog-post {
  max-width: var(--max-width-prose);    /* 65ch — optimal line length */
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.blog-post__title {
  font-size: var(--content-h1);          /* 24px default */
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.blog-post__meta {
  font-size: var(--ui-text-micro);
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-xl);
}

.blog-post__body {
  /* nothing — inherits from .markdown-content styles */
}
```

Note: the post title uses `--content-h1` (content-semantic) while the index card title uses `--ui-text-body` (chrome-semantic). Different contexts, different tokens — a *content* heading vs a *UI* card label.

## Tag chips

```css
.blog-card__tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-size: var(--ui-text-micro);
  font-weight: 600;
  border-radius: var(--border-radius-full);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}
```

`--border-radius-full` for pill shape, `--ui-text-micro` + uppercase + wide letter-spacing for chip feel.

## Customisation

### Larger card titles

```css
.blog-card__title {
  font-size: var(--content-h3);         /* 18px — promote to content tier */
}
```

For extra-prominent blog cards, you can absolutely promote titles to a content-semantic size — the three-tier UI chrome rule is about *chrome-specific* emphasis. Cards that are content-first (hero posts on a landing page) can legitimately use content tokens.

### Featured post layout

```css
.blog-card--featured {
  grid-column: 1 / -1;                  /* span full width */
  padding: var(--spacing-2xl);
  background: var(--color-brand-primary);
  color: var(--color-bg-primary);       /* inverted text */
}

.blog-card--featured .blog-card__title {
  font-size: var(--content-h2);
  color: var(--color-bg-primary);
}
```

## See also

- [Markdown Styles](./02_markdown-styles.md) — the `.blog-post__body` inherits these
- [Typography](../04_tokens/03_typography.md) — the tokens all these sizes come from
- [Blog Content Type](../../18_blogs/01_overview.md) — the content side
