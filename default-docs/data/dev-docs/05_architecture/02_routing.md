---
title: Routing System
description: How URLs map to content and layouts
---

# Routing System

The framework uses a single dynamic route to handle all pages, with layout resolution based on page configuration.

## Single Entry Point

All routes flow through `src/pages/[...slug].astro`:

```
/                           → slug = undefined (home)
/docs                       → slug = ["docs"]
/docs/getting-started       → slug = ["docs", "getting-started"]
/docs/getting-started/intro → slug = ["docs", "getting-started", "intro"]
/blog                       → slug = ["blog"]
/blog/hello-world           → slug = ["blog", "hello-world"]
```

## Route Resolution Flow

```
┌──────────────────────────────────────────────────────────────┐
│                  URL: /docs/getting-started/overview         │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 1: Match Page Config                                   │
│  ─────────────────────────                                   │
│  pages.docs.base_url: "/docs" ✓                              │
│  Remaining path: getting-started/overview                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 2: Select Parser                                       │
│  ────────────────────                                        │
│  Content type: docs → DocsParser                             │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 3: Resolve Content Path                                │
│  ────────────────────────────                                │
│  data/docs/getting-started/NN_overview.md                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 4: Parse Content                                       │
│  ─────────────────────                                       │
│  Preprocessors → Render → Postprocessors                     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 5: Resolve Layout                                      │
│  ──────────────────────                                      │
│  @docs/default → layouts/docs/default/                       │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 6: Render                                              │
│  ─────────────────                                           │
│  Layout.astro with content, sidebar, pagination              │
└──────────────────────────────────────────────────────────────┘
```

## Page Configuration

Define pages in `site.yaml`:

```yaml
pages:
  # Documentation
  docs:
    type: docs
    base_url: "/docs"
    data: "@data/docs"
    layout: "@docs/default"

  # Blog
  blog:
    type: blog
    base_url: "/blog"
    data: "@data/blog"
    layout: "@blogs/default"

  # Home page
  home:
    type: custom
    base_url: "/"
    data: "@data/pages/home.yaml"
    layout: "@custom/home"

  # About page
  about:
    type: custom
    base_url: "/about"
    data: "@data/pages/about.yaml"
    layout: "@custom/info"
```

## URL Structure

### Documentation URLs

```
File:  data/docs/getting-started/01_overview.md
URL:   /docs/getting-started/overview
       └─┬─┘ └───────┬───────┘ └───┬───┘
     base_url    folder      clean slug
```

The `01_` prefix is stripped from the URL, used only for ordering.

### Blog URLs

```
File:  data/blog/2024-01-15-hello-world.md
URL:   /blog/hello-world
       └─┬─┘ └─────┬─────┘
     base_url  clean slug (date stripped)
```

### Custom Page URLs

```
Config: base_url: "/about"
URL:    /about
```

Custom pages use exact URL matching.

## Layout Resolution

Layout aliases map to filesystem paths:

### Documentation Layouts

```
@docs/default
  ↓
src/layouts/docs/default/Layout.astro
```

### Blog Layouts

```
@blogs/default
  ↓
src/layouts/blogs/default/IndexLayout.astro  (for /blog)
src/layouts/blogs/default/PostLayout.astro   (for /blog/*)
```

### Custom Page Layouts

```
@custom/home
  ↓
src/layouts/custom/home/Layout.astro
```

### Layout Validation

Missing layouts trigger build errors:

```
[CONFIG ERROR] Docs layout "nonexistent" does not exist.
  Page: docs
  Config: @docs/nonexistent
  Expected: src/layouts/docs/nonexistent/Layout.astro
  Available: default, compact
```

## Static Path Generation

At build time, `getStaticPaths()` generates all routes:

```typescript
export async function getStaticPaths() {
  const paths = [];
  const pages = await getPages();

  for (const [name, config] of Object.entries(pages)) {
    switch (config.type) {
      case 'docs':
        // Load all docs and create path for each
        const docs = await loadContent(config.data, 'docs');
        for (const doc of docs) {
          paths.push({
            params: { slug: buildSlug(config.base_url, doc.slug) },
            props: { page: name, content: doc }
          });
        }
        break;

      case 'blog':
        // Blog index
        paths.push({
          params: { slug: config.base_url.split('/').filter(Boolean) },
          props: { page: name, isIndex: true }
        });
        // Individual posts
        const posts = await loadContent(config.data, 'blog');
        for (const post of posts) {
          paths.push({
            params: { slug: buildSlug(config.base_url, post.slug) },
            props: { page: name, content: post }
          });
        }
        break;

      case 'custom':
        // Single custom page
        paths.push({
          params: { slug: config.base_url.split('/').filter(Boolean) },
          props: { page: name }
        });
        break;
    }
  }

  return paths;
}
```

## The Reserved Artifact Route

Most URLs flow through `[...slug].astro`, but first-class **artifacts** need
their raw HTML served verbatim — the in-content embed points an `<iframe>`
`src` at it, and the "open full page" button links to it. That is a dedicated
serving route: `src/pages/artifacts/[...path].ts`, which answers
`/artifacts/<path-relative-to-its-content-root>` with the artifact file's bytes.

It is a near-clone of `src/pages/content-assets/[...path].ts` (the route that
serves colocated images and downloads) — identical symlink-proof containment,
ETag/`304` revalidation, and dev-`no-cache` / prod-`public, max-age=31536000`
caching — with two deliberate divergences:

1. **`.html`-only surface.** `getStaticPaths` (`artifacts/[...path].ts:74`) and
   the `GET` guard (`:89`) enumerate/accept only `.html` files (`isArtifact`,
   `:48`), so the route's surface is exactly the artifacts — not every colocated
   file the content-assets route serves.
2. **Scoped `text/html`.** `GET` sets `Content-Type: text/html; charset=utf-8`
   **locally** (`:129`) and does **not** add `.html` to the shared
   `src/pages/lib/mime.ts` map. Adding it there would make *every* colocated
   `.html` anywhere in content — docs, blog, the issue tracker — an executable,
   first-party HTML document on the site origin. Scoping the MIME to this one
   route keeps that origin-trust decision explicit and contained: only files an
   author deliberately placed as artifact pages become executable. (Artifacts
   run **unsandboxed as first-party content** by design — same trust as a
   layout; the trade-off is deliberated in the issue's brainstorm, Thread D.)

### Route priority and the catch-all

A **static route segment beats the `[...slug]` catch-all** — Astro matches
`/artifacts/foo` to `artifacts/[...path].ts` before `[...slug].astro` ever sees
it, exactly as `content-assets/` wins today. Two constraints follow:

- The folder **can't be `_`-prefixed** (Astro drops `_`-dirs from routing).
- In dev/SSR the `[...slug]` matcher must still never *try* to render
  `/artifacts/...` as a page, so `route-match.ts` lists `artifacts` in
  `isInternalSlug` (`:58`) — alongside `api/`, `editor`, and now `artifacts` /
  `artifacts/…`. (`assets` and `content-assets` were a latent hole there; the
  guard below closes the config-side of it.)

### Cache-buster handshake

The embed appends `?v=<mtimeMs>` to the iframe `src` (mirroring the diagram
sidecar). The route **ignores the query for content**, but the changing `?v=`
paired with ETag revalidation invalidates correctly in dev, and the year-long
prod `max-age` paired with the changing query invalidates on static hosts (which
ignore the query for file lookup but re-request when it changes). The
"open full page" link strips the `?v=` so the shared URL stays clean.

### Site-theme injection

A third divergence from the content-assets clone: the route reads the artifact's
sidecar theme mode (`readArtifactThemeMode`, `loaders/artifact-pages.ts`) and,
when it is **`"site"`**, rewrites the served HTML to inherit the host theme. It
injects the active resolved theme CSS — `getThemeCSS(getTheme())`, the *same*
merged stylesheet `BaseLayout` gives the docs chrome — plus a small attribute-only
dark-mode init script, at the **start of `<head>`**, so **both** the embed iframe
and the full-page view resolve `var(--color-*)` / semantic tokens and follow
light/dark. `theme: "self"` (or no sidecar) is served **byte-for-byte** — the
"served body === disk" contract holds for self mode only.

Two details:

- **Insertion point is the start of `<head>`, not before `</head>`.** An artifact's
  own content can contain a literal `</head>` (a code sample, a prose reference);
  matching the opening `<head>` tag — once, near the top — is robust against that,
  and theme-first ordering lets the artifact's own rules still win the cascade.
- **Cache interplay.** The self-mode ETag stays `"<size>-<mtimeMs>"`. The site-mode
  variant ETag is a **content hash of the injected body** (`sha1`, truncated), so it
  varies with the file, the active theme (a `site.yaml` theme change — or an edited
  theme CSS file — leaves the file's mtime untouched, so a size/mtime tag would miss
  it), and a `self`↔`site` sidecar flip. Paired with the `?v=` handshake, a theme
  change busts the embed and full-page copies correctly.

Mode resolution is attribute-only, mirroring the chrome: the full-page init reads
`localStorage.theme` then `prefers-color-scheme` and stamps `data-theme="dark"` only
for dark (no site CSS reads `prefers-color-scheme`); in the embed, `scripts/artifacts.ts`
additionally propagates the parent site's attribute in. Authoring guidance for the
two modes — and `agent-ks theme tokens --json` to print the live variable→value
map — is in the `agent-ks-artifacts` skill.

No alias is registered for this route: a serving route is neither a layout nor a
`paths:` key, so `loaders/alias.ts` and `RESERVED_KEYS` in `loaders/paths.ts`
need no `@artifacts` entry.

The loader side (how an `.html` file becomes a page and gets its `data-src`) is
in [Data Loading Engine](/dev-docs/architecture/data-loading#artifact-pages-the-same-seam-a-second-time);
the client renderer and theme handshake are in
[Artifacts Script](/dev-docs/scripts/artifacts).

## Reserved Base URLs

Because `/artifacts` (and `/assets`, `/content-assets`, `/api`, `/editor`) are
claimed by built-in routes, **no `pages.<name>.base_url` may normalize to one of
them** — a section that did would be silently shadowed by the higher-priority
static route, its pages unreachable with no error. `validateRoutes()`
(`config.ts:389`) turns that into a hard config-load failure.

```typescript
export const RESERVED_BASE_URLS =
  ['artifacts', 'assets', 'content-assets', 'api', 'editor'] as const;
```

`validateRoutes()` is called from `loadSiteConfig()` (`config.ts:223-228`) and
its errors are **thrown**, not collected — the same hard-stop discipline as the
missing-theme throw and the version gate, and it runs *before* the config is
cached or reaches the router. The same function also catches overlapping routes
(one `base_url` a path-prefix of another). `RESERVED_BASE_URLS` is exported as
the single source of truth; the user-guide limitation and the skills quote the
identical list. Consumer-facing view: user-guide
`10_configuration/03_site/08_page.md`.

## Index Pages

### Documentation Index

`/docs` behavior:
1. If `index.md` exists in `data/docs/`, render it
2. Otherwise, redirect to first doc in first section

### Blog Index

`/blog` renders `IndexLayout.astro` showing all posts:

```
/blog         → IndexLayout.astro (list of posts)
/blog/my-post → PostLayout.astro (single post)
```

### Section Index

Folder index files (`index.md`) are optional:
- If present: Renders as the section landing page
- If absent: Section shows as non-clickable header in sidebar

## Content Type Routing

| Type | URL Pattern | Content Source | Parser |
|------|-------------|----------------|--------|
| `docs` | `/base/*/**` | Folder of `.md` files | DocsParser |
| `blog` | `/base/*` | Folder of dated `.md` files | BlogParser |
| `custom` | `/base` (exact) | Single YAML/JSON file | - |

## Alias Resolution

Path aliases are resolved at build time:

| Alias | Resolves To |
|-------|-------------|
| `@data/` | `default-docs/data/` |
| `@assets/` | `default-docs/assets/` |
| `@config/` | `default-docs/config/` |
| `@docs/` | `src/layouts/docs/` |
| `@blogs/` | `src/layouts/blogs/` |
| `@custom/` | `src/layouts/custom/` |

## Props Passed to Layouts

### Documentation Layout

```typescript
interface DocsLayoutProps {
  content: LoadedContent;     // Current page content
  sidebar: SidebarItem[];     // Navigation tree
  pagination: {
    prev?: { title: string; slug: string };
    next?: { title: string; slug: string };
  };
  settings: ContentSettings;  // Folder settings
}
```

### Blog Layout

```typescript
// Index
interface BlogIndexProps {
  posts: LoadedContent[];     // All blog posts
  settings: ContentSettings;
}

// Post
interface BlogPostProps {
  content: LoadedContent;     // Current post
  settings: ContentSettings;
}
```

### Custom Layout

```typescript
interface CustomLayoutProps {
  data: Record<string, unknown>;  // YAML/JSON data
}
```

## 404 Handling

Unmatched routes use Astro's default 404.

Create `src/pages/404.astro` for custom 404 page:

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
---

<BaseLayout title="Page Not Found">
  <h1>404 - Page Not Found</h1>
  <p>The page you're looking for doesn't exist.</p>
  <a href="/">Go home</a>
</BaseLayout>
```

## Dynamic Imports

Layouts are loaded using Vite's `import.meta.glob`:

```typescript
const layouts = import.meta.glob('/src/layouts/**/*.astro');

async function getLayout(alias: string) {
  const path = resolveLayoutAlias(alias);
  const loader = layouts[path];

  if (!loader) {
    throw new Error(`Layout not found: ${alias}`);
  }

  return (await loader()).default;
}
```

This enables:
- Build-time validation of all layouts
- Tree-shaking of unused layouts
- Type-safe layout props
