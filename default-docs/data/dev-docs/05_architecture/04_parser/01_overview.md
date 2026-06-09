---
title: Parser Overview
description: Introduction to the modular parser system architecture
sidebar_position: 1
---

# Parser System

The parser system (`src/parsers/`) is a modular architecture for processing markdown content through configurable pipelines.

> **Everything in this pipeline runs on the backend — never in the browser.** All four stages (preprocess → render → postprocess → transform) execute in Node, either at **build time** for production (`output: 'static'`, emitting finished HTML files to disk) or at **SSR request time** in the dev server (`output: 'server'`). The browser only ever receives the already-rendered HTML string. Client-side scripts (diagrams, lightbox, code-copy, sidebar persistence, the live editor) merely *enhance* that delivered markup — they never parse markdown. So `href` rewriting, syntax highlighting, heading IDs, and custom-tag expansion are all settled server-side before a single byte reaches the client.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CONTENT-TYPES                                   │
│                    DocsParser / BlogParser                              │
│         (Orchestrates the entire flow, provides context)                │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              CORE                                       │
│                     ProcessingPipeline                                  │
│              (Manages the sequential execution)                         │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  PREPROCESSORS  │     │    RENDERERS    │     │ POSTPROCESSORS  │
│                 │ ──▶ │                 │ ──▶ │                 │
│ • code-protect  │     │ • marked.ts     │     │ • heading-ids   │
│ • asset-embed   │     │  (MD → HTML)    │     │ • internal-links│
│                 │     │  + Shiki HL     │     │ • external-links│
│                 │     │  + Diagrams     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │  TRANSFORMERS   │
                                              │                 │
                                              │ • callout       │
                                              │ • tabs          │
                                              │ • collapsible   │
                                              │ (Custom tags)   │
                                              └─────────────────┘
```

## File Structure

```
src/parsers/
├── index.ts                    # Main exports + parser factory
├── types.ts                    # Type definitions
│
├── core/                       # Pipeline orchestration
│   ├── index.ts
│   ├── pipeline.ts             # ProcessingPipeline class
│   └── base-parser.ts          # BaseContentParser abstract class
│
├── content-types/              # Content-specific parsers
│   ├── index.ts
│   ├── docs.ts                 # DocsParser (XX_ prefix)
│   ├── blog.ts                 # BlogParser (date prefix)
│   └── issues.ts               # IssuesParser (issue folders; used by loaders/issues.ts)
│
├── preprocessors/              # Before rendering
│   ├── index.ts
│   ├── code-protect.ts         # Protect code blocks
│   └── asset-embed.ts          # [[path]] embedding
│
├── renderers/                  # Markdown → HTML
│   ├── index.ts
│   └── marked.ts               # Marked + Shiki syntax highlighting + diagram handling
│
├── postprocessors/             # After rendering
│   ├── index.ts
│   ├── heading-ids.ts          # Add IDs to headings
│   ├── internal-links.ts       # Rewrite relative links (strip XX_ prefixes, .md extensions)
│   ├── issue-body-links.ts     # Issues only: re-root issue.md links for the detail-URL collapse
│   ├── issue-asset-src.ts      # Issues only: relative <img src> → absolute /issue-assets/… URLs
│   └── external-links.ts       # Security attrs for external links
│
└── transformers/               # Custom tag transformation
    ├── index.ts
    └── registry.ts             # TagTransformerRegistry class
```

## The 6 Components

| # | Folder | Role | When |
|---|--------|------|------|
| 1 | `core/` | Pipeline orchestration + BaseContentParser | Controls flow |
| 2 | `preprocessors/` | Transform raw markdown | Before rendering |
| 3 | `transformers/` | Custom tag → HTML (`<callout>`, `<tabs>`) | After rendering (as postprocessor) |
| 4 | `renderers/` | Markdown → HTML (Marked + Shiki highlighting + diagram containers) | Middle stage |
| 5 | `postprocessors/` | Enhance HTML (IDs, internal link rewriting, external link attrs) | After rendering |
| 6 | `content-types/` | DocsParser/BlogParser (filename parsing, asset paths) | Entry point |

## Key Insight

**Transformers are actually postprocessors** - the `TagTransformerRegistry` has a `createProcessor()` method that wraps itself as a `Processor` to be added to the pipeline's postprocessor chain.

## Processing Flow

The flow in `base-parser.ts`:

```typescript
await this.renderReady; // Ensure Shiki highlighter is initialized
const content = await this.pipeline.process(rawContent, context, this.renderFn!);
```

Which executes in `pipeline.ts`:

1. `preprocess()` → runs all preprocessors sequentially
2. `render()` → converts markdown to HTML
3. `postprocess()` → runs all postprocessors + transformers

## Data Loader Integration

The data loader (`src/loaders/data.ts`) uses the parser system:

```typescript
import { loadContent } from '@loaders/data';

// Load docs with DocsParser
const docs = await loadContent('docs', 'docs', {
  pattern: '**/*.{md,mdx}',
  sort: 'position',
  requirePositionPrefix: true,
});

// Load blog with BlogParser
const posts = await loadContent('blog', 'blog', {
  pattern: '*.md',
  sort: 'date',
  order: 'desc',
});
```

### LoadContent Options

| Option | Type | Description |
|--------|------|-------------|
| `pattern` | `string` | Glob pattern for files |
| `sort` | `'position' \| 'date' \| 'title'` | Sort method |
| `order` | `'asc' \| 'desc'` | Sort direction |
| `includeDrafts` | `boolean` | Include draft content |
| `requirePositionPrefix` | `boolean` | Enforce `XX_` prefix (docs) |

### Return Type

```typescript
interface LoadedContent {
  id: string;           // Unique identifier
  slug: string;         // URL path
  content: string;      // Rendered HTML
  data: {
    title: string;
    description?: string;
    sidebar_position?: number;
    date?: string;
    tags?: string[];
    draft?: boolean;
  };
  filePath: string;
  relativePath: string;
  fileType: 'md' | 'mdx';
}
```

## Caching

Content is cached during production builds:

- **Development**: No caching, files re-parsed on each request
- **Production**: Content cached after first parse

Cache invalidation happens automatically when files change during development.
