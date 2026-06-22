---
title: "Step 1: Content Type Parser"
description: Entry point parsers that orchestrate the entire processing flow
sidebar_position: 2
---

# Content Type Parser

**Folder:** `src/parsers/content-types/`

Content type parsers are the **entry point** for the parser system. They orchestrate the entire flow and provide context for processing.

## Role in the Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CONTENT-TYPES  <── YOU ARE HERE                 │
│                    DocsParser / BlogParser                              │
│         (Orchestrates the entire flow, provides context)                │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
                          ProcessingPipeline
```

## Available Parsers

### DocsParser

Handles documentation with position-based ordering.

**File:** `src/parsers/content-types/docs.ts`

```typescript
import { DocsParser } from '@parsers/content-types';

const parser = new DocsParser();

// Filename parsing
parser.parseFilename('01_overview');
// → { position: 1, cleanName: 'overview' }

// Asset resolution (relative to file)
parser.getAssetPath('/docs/guide/intro.md', './assets/diagram.png');
// → /docs/guide/assets/diagram.png
```

**Docs Naming Convention:**

```
01_overview.md     → position: 1, slug: "overview"
02_installation.md → position: 2, slug: "installation"
10_advanced.md     → position: 10, slug: "advanced"
```

### BlogParser

Handles blog posts with date-based naming.

**File:** `src/parsers/content-types/blog.ts`

```typescript
import { BlogParser } from '@parsers/content-types';

const parser = new BlogParser();

// Filename parsing
parser.parseFilename('2024-01-15-hello-world');
// → { date: '2024-01-15', slug: 'hello-world' }

// Asset resolution (central assets folder)
parser.getAssetPath('/blog/2024-01-15-hello-world.md', 'cover.jpg');
// → /blog/assets/2024-01-15-hello-world/cover.jpg
```

**Blog Naming Convention:**

```
2024-01-15-hello-world.md → date: "2024-01-15", slug: "hello-world"
2024-02-20-my-journey.md  → date: "2024-02-20", slug: "my-journey"
```

## Key Differences

| Feature | DocsParser | BlogParser |
|---------|------------|------------|
| Naming | `NN_name.md` (position prefix) | `YYYY-MM-DD-slug.md` (date prefix) |
| Ordering | By position number | By date |
| Assets | Relative to file | Central `assets/<slug>/` folder |
| Structure | Nested directories | Flat structure |

## Frontmatter Schema

### Docs Frontmatter

```yaml
---
title: Page Title           # Required
description: SEO description
sidebar_label: Sidebar Text  # Override sidebar display
sidebar_position: 1         # Override NN_ position
draft: false                # Hide in production
tags: [guide, tutorial]
---
```

### Blog Frontmatter

```yaml
---
title: Post Title           # Required
description: Post summary
date: 2024-01-15           # Override filename date
author: John Doe
tags: [news, update]
draft: false
image: cover.jpg           # Featured image
---
```

## Creating Custom Parsers

Extend `BaseContentParser` for custom content types:

```typescript
import { BaseContentParser } from '@parsers/core';
import type { FrontmatterSchema, ParsedDocsFilename } from '@parsers/types';

class CustomParser extends BaseContentParser {
  constructor() {
    super('page');

    // Configure pipeline with processors
    this.pipeline
      .addPreprocessor(myPreprocessor)
      .addPostprocessor(myPostprocessor);
  }

  parseFilename(filename: string): ParsedDocsFilename {
    // Custom filename parsing logic
    return { position: null, cleanName: filename };
  }

  getAssetPath(filePath: string, assetPath: string): string {
    // Custom asset resolution
    return path.resolve(path.dirname(filePath), assetPath);
  }

  getFrontmatterSchema(): FrontmatterSchema {
    return {
      required: ['title'],
      optional: ['description', 'layout'],
    };
  }

  generateSlug(relativePath: string): string {
    // Custom slug generation
    return relativePath.replace(/\.md$/, '');
  }
}
```

## Parser Factory

Get a parser by content type:

```typescript
import { getParser, createParser } from '@parsers';

// Get parser for docs
const docsParser = getParser('docs');

// Get parser for blog
const blogParser = getParser('blog');

// 'page' type uses DocsParser internally
const pageParser = getParser('page');
```
