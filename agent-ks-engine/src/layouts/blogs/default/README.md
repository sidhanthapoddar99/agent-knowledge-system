# blogs/default — Blog Layout (index + post)

Two entry points: `IndexLayout.astro` for the post listing, `PostLayout.astro` for individual posts.

## IndexLayout.astro

### Props (received from route handler)

```typescript
interface Props {
  dataPath: string;        // Absolute path to the blog folder
  postsPerPage?: number;   // Optional limit (default: 10)
}
```

### Data loaded internally

`IndexBody.astro` loads all posts itself:

```typescript
posts = await loadContent(dataPath, 'blog', { sort: 'date', order: 'desc' });
```

The route handler passes only `dataPath` — the layout fetches the post list.

---

## PostLayout.astro

### Props (received from route handler)

```typescript
interface Props {
  title: string;
  description?: string;
  date?: string;
  author?: string;
  tags?: string[];
  content: string;    // Pre-rendered HTML — inject with set:html
}
```

All fields are **pre-extracted by the route handler** from the post's frontmatter and parser pipeline. The layout just renders them.

---

## Components in this folder

| File | Purpose |
|------|---------|
| `IndexLayout.astro` | Entry point for `/blog` — renders post grid |
| `PostLayout.astro` | Entry point for `/blog/{slug}` — renders single post |
| `IndexBody.astro` | Grid container — loads posts and renders PostCard for each |
| `PostBody.astro` | Article with title, metadata (author, date), content, tags |
| `PostCard.astro` | Individual card used in the index grid |

## Visual structure

### Index page (`/blog`)

```
┌──────────────────────────────────────────────────────────────┐
│                          Navbar                              │
├──────────────────────────────────────────────────────────────┤
│   Blog                                                       │
│   Latest posts and updates                                   │
│                                                              │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│   │  Post Title   │  │  Post Title   │  │  Post Title   │   │
│   │  Date         │  │  Date         │  │  Date         │   │
│   │  Description  │  │  Description  │  │  Description  │   │
│   └───────────────┘  └───────────────┘  └───────────────┘   │
├──────────────────────────────────────────────────────────────┤
│                          Footer                              │
└──────────────────────────────────────────────────────────────┘
```

### Post page (`/blog/{slug}`)

```
┌──────────────────────────────────────────────────────────────┐
│                          Navbar                              │
├──────────────────────────────────────────────────────────────┤
│   Post Title                                                 │
│   Author · Date                                              │
│   ─────────────────────────────────────────                  │
│   Content...                                                 │
│   ─────────────────────────────────────────                  │
│   Tags: [tag1] [tag2]                                        │
├──────────────────────────────────────────────────────────────┤
│                          Footer                              │
└──────────────────────────────────────────────────────────────┘
```
