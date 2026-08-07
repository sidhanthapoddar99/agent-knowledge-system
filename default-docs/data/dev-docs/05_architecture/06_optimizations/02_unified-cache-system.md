---
title: Unified Cache System
description: Performance optimization with unified caching and selective invalidation
---

# Unified Cache System

## Overview

The framework uses a unified cache manager that provides:
- **Single cache system** for content, sidebar, theme, settings, and config
- **Dependency invalidation** — an entry is dropped when any file it was built from changes
- **Selective invalidation** based on file type (no unnecessary cache clears)
- **HMR integration** with automatic cache invalidation on file changes
- **No hash computation overhead** - trusts HMR for change detection

### Why there are two invalidation mechanisms

They answer different questions and neither subsumes the other.

**By file type** asks *what kind of file just changed, and which caches could that affect?* A `.md` edit clears content and sidebar wholesale, because one markdown file changes the sidebar entries, pagination and neighbour links of pages that never reference it. Tracking that fan-out precisely would cost more than clearing it.

**By dependency** asks *which entries were built from this exact file?* This is the only mechanism that can catch a changed file which is not itself a page:

- a theme stylesheet, which produces the CSS every page links
- a file spliced into a page by a `[[path]]` embed

For those, the consuming page's own mtime never moves. Nothing in the type switch can help, because the type switch keys off the changed file — and an embedded `.svg` is an `asset`, a type that deliberately clears nothing since assets normally go straight to the browser.

**The failure mode is silence.** An entry that omits a real dependency serves the previous bytes, a manual reload does not fix it, and nothing on the page says so — you edit a diagram, refresh, see the old picture, and conclude your edit was wrong. So the dev log reports the two counts separately:

```
[cache] File changed (theme): themes/full-width/element.css
[cache] Invalidated: theme (1 by dependency)
```

A dependency edit that invalidates nothing looks exactly like one with no dependents, which is why the count is printed rather than inferred.

---

## Performance

| Metric | First Request | Cached | Improvement |
|--------|---------------|--------|-------------|
| **Page load** | ~150-200ms | **~4-8ms** | 97% faster |
| **Config loading** | ~5-8ms | **<0.1ms** | 99% faster |
| **Sidebar build** | ~10-15ms | **~1ms** | 90% faster |
| **Theme CSS** | ~5-10ms | **~0.5ms** | 95% faster |
| **Settings load** | ~2-3ms | **~0.1ms** | 97% faster |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    UNIFIED CACHE MANAGER                                    │
│                    src/loaders/cache-manager.ts                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│   │  Config  │ │ Content  │ │ Sidebar  │ │  Theme   │ │ Settings │         │
│   │  Cache   │ │  Cache   │ │  Cache   │ │  Cache   │ │  Cache   │         │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘         │
│        │             │            │             │            │              │
│        └─────────────┴────────────┴─────────────┴────────────┘              │
│                                    │                                        │
│                                    ▼                                        │
│                         ┌─────────────────┐                                 │
│                         │  globalThis     │  Persists across requests       │
│                         │  shared state   │  in dev server                  │
│                         └─────────────────┘                                 │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   SELECTIVE INVALIDATION (on HMR file change)                               │
│                                                                             │
│   File Type        │  Caches Invalidated                                    │
│   ─────────────────┼────────────────────────────────────                    │
│   .md/.mdx         │  content + sidebar                                     │
│   settings.json    │  sidebar + settings                                    │
│   theme.yaml/.css  │  theme + combined CSS                                  │
│   site.yaml        │  config + theme                                        │
│   navbar/footer    │  config only                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Cache Types

### 0. Config Cache

Caches parsed YAML configuration to avoid repeated disk reads and YAML parsing.

```typescript
// Keys: 'site', 'navbar', 'footer'
// Value: SiteConfig | NavbarConfig | FooterConfig

// site.yaml is called ~5 times per request (slug resolver,
// BaseLayout, getTheme, getFavicon, etc.)
// navbar.yaml and footer.yaml ~2 times each
// Without caching: 9 YAML disk reads + parses per request
// With caching: 1 Map lookup per call
```

The site config cache also stores `resolvedThemePaths` alongside the config object, since `loadSiteConfig()` has a side effect of setting this module-level variable (used by `getThemePaths()` for theme directory scanning).

### 1. Content Cache

Caches parsed markdown content with headings.

```typescript
// Key: ${dataPath}:${pattern}:${contentType}:${sort}:${order}
// Value: LoadedContent[]

interface LoadedContent {
  slug: string;
  content: string;      // Rendered HTML
  headings: Heading[];  // Extracted for TOC/outline
  data: ContentData;    // Frontmatter
  filePath: string;
  relativePath: string;
}
```

### 2. Sidebar Cache

Caches the sidebar tree structure.

```typescript
// Key: ${dataPath}:${basePath}
// Value: SidebarNode[]

type SidebarNode = SidebarItem | SidebarSection;
```

### 3. Theme Cache

Caches theme configuration and combined CSS.

```typescript
// Key: themeRef (e.g., "@theme/minimal")
// Value: ThemeConfig

interface ThemeConfig {
  name: string;
  path: string;
  manifest: ThemeManifest;
  css: string;         // Individual theme CSS
  isDefault: boolean;
}

// Combined CSS cache (with inheritance resolved)
// Stored separately for getThemeCSS() results
```

### 4. Settings Cache

Caches content directory settings.

```typescript
// Key: absolutePath to settings.json directory
// Value: ContentSettings

interface ContentSettings {
  sidebar: { collapsed, collapsible, sort, depth };
  outline: { enabled, levels, title };
  pagination: { enabled, showPrevNext };
}
```

---

## HMR Integration

The dev toolbar integration watches all configured directories:

```typescript
// src/dev-tools/integration.ts

// Paths from site.yaml paths: section (resolved at config load time)
const watchPaths = {
  data: paths.data,      // Content files
  config: paths.config,  // site.yaml, navbar.yaml, footer.yaml
  assets: paths.assets,  // Images, logos
  themes: paths.themes,  // Theme CSS and manifests
};

// Events handled
server.watcher.on('add', onFileAdd);     // New files
server.watcher.on('unlink', onFileDelete); // Deleted files
handleHotUpdate({ file });                 // Modified files
```

### File Type Detection

```typescript
function detectFileType(filePath: string): FileType {
  const basename = path.basename(filePath);

  if (basename === 'settings.json') return 'settings';
  if (basename === 'site.yaml') return 'config';
  if (basename === 'theme.yaml') return 'theme';
  if (ext === '.md' || ext === '.mdx') return 'content';
  if (ext === '.css' && inThemesDir) return 'theme';

  return 'unknown';
}
```

---

## Files Structure

```
src/
├── loaders/
│   ├── cache-manager.ts   ← Unified cache with selective invalidation
│   ├── cache.ts           ← Error/warning collection only
│   ├── config.ts          ← Config loading (uses cache-manager)
│   ├── data.ts            ← Content loading (uses cache-manager)
│   └── theme.ts           ← Theme loading (uses cache-manager)
│
├── hooks/
│   └── useSidebar.ts      ← Sidebar building (uses cache-manager)
│
└── dev-toolbar/
    └── integration.ts     ← HMR watcher, calls cache invalidation
```

---

## Usage

### Cache is Automatic

No manual cache management needed. The system:
1. Checks cache on every load
2. Returns cached data if available
3. Loads from disk on cache miss
4. Stores in cache for next request
5. Invalidates via HMR when files change

### API

```typescript
import cacheManager from '@loaders/cache-manager';

// Get cached data (returns null on miss)
const data = cacheManager.getCached<T>('content', key);

// Set cache entry
cacheManager.setCache('content', key, data, dependencies);

// Clear specific cache
cacheManager.clearCache('sidebar');

// Get statistics
const stats = cacheManager.getCacheStats();
// { caches: { content: { size, stats }, ... }, fileRegistry, watchPaths }
```

---

## Error/Warning Collection

Errors and warnings are collected separately from content caching:

```typescript
// src/loaders/cache.ts

import { addError, addWarning, getAllIssues } from '@loaders/cache';

// Collect errors during parsing
addError({
  file: 'docs/example.md',
  type: 'asset-missing',
  message: 'File not found: ./assets/image.png',
  suggestion: 'Create the file or update the path',
});

// Get all issues for dev toolbar
const { errors, warnings } = getAllIssues();
```

### Error Types

| Type | Description |
|------|-------------|
| `asset-missing` | Referenced file not found |
| `frontmatter` | Invalid frontmatter syntax |
| `syntax` | Markdown parsing error |
| `config` | Configuration issue |
| `theme-not-found` | Theme directory missing |
| `theme-invalid-manifest` | Invalid theme.yaml |

---

## Trade-offs

### Pros
- **97% faster** subsequent page loads
- **Selective invalidation** - only affected caches cleared
- **No hash computation** - trusts HMR, no MD5 overhead
- **Unified architecture** - single cache manager
- **Theme CSS cached** - includes inheritance resolution

### Cons
- Increased memory usage (all caches in memory)
- First request still cold (must load from disk)
- Requires dev server restart if cache corrupts (rare)
