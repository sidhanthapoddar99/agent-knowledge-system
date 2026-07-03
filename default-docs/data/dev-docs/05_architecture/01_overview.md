---
title: Architecture Overview
description: Understanding the core architecture of the documentation framework
sidebar_position: 1
---

# Architecture Overview

This documentation framework is built on a modular architecture with five distinct layers: User Space, Loaders, Parser, Layout, and Render.

## System Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           1. USER SPACE                                 │
│   Config (YAML)    │   Data (MD/MDX)   │   Themes   │   Assets          │
│   site.yaml        │   docs/           │   CSS      │   images/         │
│   navbar.yaml      │   blog/           │            │   code/           │
│   footer.yaml      │   pages/          │            │                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         2. LOADERS LAYER                                │
│   paths.ts         │   config.ts      │   data.ts    │   alias.ts       │
│   (env vars)       │   (YAML load)    │   (content)  │   (@ resolve)    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          3. PARSER LAYER                                │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │        Preprocessors  →  Renderer  →  Postprocessors             │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │         Content-Type Parsers (DocsParser, BlogParser)            │  │
│   └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          4. LAYOUT LAYER                                │
│   Layout Resolution    │   Components         │   Navbar/Footer         │
│   @docs/default → path │   Sidebar, Outline   │   Variants              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          5. RENDER LAYER                                │
│   [...slug].astro      │   BaseLayout.astro   │   Static HTML Output    │
│   (route handler)      │   (HTML shell)       │                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Layer Overview

| Layer | Location | Purpose |
|-------|----------|---------|
| **User Space** | `default-docs/` | User-editable config, content, and assets |
| **Loaders** | `src/loaders/` | Bridges user space to internal systems |
| **Parser** | `src/parsers/` | Transforms markdown to HTML |
| **Layout** | `src/layouts/` | Page structure and components |
| **Render** | `src/pages/` | Route handling and final output |

## Request Flow

When a user visits `/docs/getting-started/overview`:

```mermaid
[[./assets/request-flow.mermaid]]
```

### Flow Steps Explained

| Step | Action | Layer |
|------|--------|-------|
| **1** | Browser requests URL | Browser |
| **2** | Route matched by `[...slug].astro` | Render |
| **3-7** | Load site config, navbar, footer from YAML | Loaders → User Space |
| **8-9** | Resolve `@data/docs` alias to path | Loaders |
| **10-11** | Load markdown files, select parser | Loaders → Parser |
| **12-13** | Run pipeline: preprocessors embed assets | Parser → User Space |
| **14** | Pipeline completes: renderer + postprocessors | Parser |
| **15-16** | Resolve `@docs/default` to Layout component | Layout |
| **17-18** | Compose BaseLayout with navbar, content, footer | Render + Layout |
| **19-20** | Return static HTML to browser | Output → Browser |

## Layer Details

### 1. User Space (`default-docs/`)

User-editable files external to the application code:

| Directory | Contents |
|-----------|----------|
| `config/` | `site.yaml`, `navbar.yaml`, `footer.yaml` |
| `data/docs/` | Documentation markdown files |
| `data/blog/` | Blog post markdown files |
| `data/pages/` | Custom page YAML files |
| `assets/` | Images, code snippets, static files |

### 2. Loaders Layer (`src/loaders/`)

Bridge between user space and internal systems:

| Module | Purpose |
|--------|---------|
| `paths.ts` | Reads `.env`, resolves absolute paths |
| `config.ts` | Loads and validates YAML configuration |
| `data.ts` | Orchestrates content loading with caching |
| `alias.ts` | Resolves `@docs/`, `@data/`, `@blog/` prefixes |

```typescript
// Example: How loaders connect
import { loadSiteConfig } from '@loaders/config';
import { loadContent } from '@loaders/data';
import { resolveAliasPath } from '@loaders/alias';

const config = loadSiteConfig();                    // Load site.yaml
const dataPath = resolveAliasPath('@data/docs');    // Resolve alias
const content = await loadContent(dataPath, 'docs'); // Load content
```

### 3. Parser Layer (`src/parsers/`)

Transforms markdown content through a configurable pipeline:

| Component | Purpose |
|-----------|---------|
| `core/` | Pipeline orchestration, BaseParser class |
| `preprocessors/` | Asset embedding (`[[path]]`), code protection |
| `renderers/` | Markdown to HTML (Marked + Shiki + diagrams) |
| `postprocessors/` | Heading IDs, internal/external link rewriting |
| `content-types/` | DocsParser, BlogParser (naming conventions) |

See [Parser System](/docs/architecture/parser/overview) for details.

### 4. Layout Layer (`src/layouts/`)

Page structure and reusable components:

| Directory | Contents |
|-----------|----------|
| `docs/*/` | Documentation page layouts (each variant owns its components) |
| `blogs/*/` | Blog index and post layouts |
| `custom/*/` | Custom page layouts |
| `navbar/*/` | Navbar component variants |
| `footer/*/` | Footer component variants |

Layout resolution:
```
@docs/default     →  src/layouts/docs/default/Layout.astro
@blog/default     →  src/layouts/blogs/default/{Index,Post}Layout.astro
@custom/home      →  src/layouts/custom/home/Layout.astro
```

### 5. Render Layer (`src/pages/`)

Final route handling and HTML generation:

| Component | Purpose |
|-----------|----------|
| `[...slug].astro` | Single catch-all route handler |
| `getStaticPaths()` | Generates all routes at build time |
| `BaseLayout.astro` | HTML shell with head, slots, global styles |

## Directory Structure

```
src/
├── loaders/           # Layer 2: Data and config loading
│   ├── paths.ts       # Environment and path resolution
│   ├── config.ts      # YAML configuration loading
│   ├── data.ts        # Content loading orchestration
│   └── alias.ts       # @ prefix resolution
│
├── parsers/           # Layer 3: Content transformation
│   ├── core/          # Pipeline and base parser
│   ├── preprocessors/ # Asset embedding
│   ├── renderers/     # Markdown rendering
│   ├── postprocessors/# Heading IDs, links
│   └── content-types/ # Docs/Blog parsers
│
├── layouts/           # Layer 4: Page structure
│   ├── BaseLayout.astro
│   ├── docs/          # Documentation layouts
│   ├── blogs/         # Blog layouts
│   ├── custom/        # Custom page layouts
│   ├── navbar/        # Navbar variants
│   └── footer/        # Footer variants
│
├── pages/             # Layer 5: Route handling
│   └── [...slug].astro
│
└── hooks/             # Shared state hooks
    ├── useSidebar.ts
    ├── useNavigation.ts
    └── useTheme.ts
```

## Core Principles

### 1. Separation of Concerns

Each layer has a single responsibility:
- **User Space**: Content and configuration
- **Loaders**: Data access and resolution
- **Parser**: Content transformation
- **Layout**: Visual structure
- **Render**: Route handling

### 2. Convention Over Configuration

File structure determines behavior:
- `NN_name.md` → Position-based ordering
- `YYYY-MM-DD-slug.md` → Date-based ordering
- `settings.json` → Folder configuration

### 3. Fail Fast with Clear Errors

```
[CONFIG ERROR] Docs layout "doc_style99" does not exist.
  Page: docs
  Config: @docs/doc_style99
  Expected: src/layouts/docs/doc_style99/Layout.astro
  Available: default, compact
```

### 4. Zero Runtime Configuration

All configuration resolves at build time:
- No client-side config loading
- No runtime environment checks
- Fully static output
