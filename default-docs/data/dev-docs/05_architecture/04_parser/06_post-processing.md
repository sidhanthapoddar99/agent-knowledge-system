---
title: "Step 2.3: Post-processing"
description: Postprocessors that enhance HTML output after rendering
sidebar_position: 6
---

# Post-processing

**Folder:** `src/parsers/postprocessors/`

Postprocessors run **after** HTML rendering to enhance the output.

## Role in the Pipeline

```
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
 ┌─────────────────┐      ┌─────────────────┐     ┌──────────────────┐
 │  PREPROCESSORS  │      │    RENDERERS    │     │ POSTPROCESSORS   │
 │                 │ ──>  │                 │ ──> │ <── YOU ARE HERE │
 │                 │      │                 │     │ • heading-ids    │
 │                 │      │                 │     │ • internal-links │
 │                 │      │                 │     │ • external-links │
 └─────────────────┘      └─────────────────┘     └──────────────────┘
```

## Postprocessor Files

| File | Purpose |
|------|---------|
| `heading-ids.ts` | Adds IDs to headings for anchor links |
| `internal-links.ts` | Rewrites relative links to match generated slugs |
| `external-links.ts` | Adds security attributes to external links |
| `index.ts` | Module exports |

## Available Postprocessors

### Heading IDs

Automatically adds IDs to headings for anchor links:

```html
<!-- Input -->
<h2>Getting Started</h2>

<!-- Output -->
<h2 id="getting-started">Getting Started</h2>
```

This enables:
- Direct linking to sections via `#getting-started`
- Table of contents generation
- In-page navigation

**Usage:**

```typescript
import { headingIdsPostprocessor, createHeadingIdsPostprocessor } from '@parsers/postprocessors';

// Use default
pipeline.addPostprocessor(headingIdsPostprocessor);

// Or create with options
const customHeadingIds = createHeadingIdsPostprocessor({
  prefix: 'section-',  // Add prefix to all IDs
});
```

### Internal Links

Rewrites relative markdown links to match the generated URL slugs by stripping `NN_` position prefixes and `.md`/`.mdx` file extensions:

```html
<!-- Input -->
<a href="./02_consensus-mechanism.md">Consensus</a>
<a href="../03_advanced/01_setup.md#config">Setup</a>

<!-- Output -->
<a href="./consensus-mechanism">Consensus</a>
<a href="../advanced/setup#config">Setup</a>
```

**What it does:**

| Transform | Before | After |
|-----------|--------|-------|
| Strip `.md`/`.mdx` extension | `./guide.md` | `./guide` |
| Strip `NN_` prefix | `./02_getting-started` | `./getting-started` |
| Strip `/index` suffix | `./section/index` | `./section` |
| Preserve fragments | `./02_guide.md#setup` | `./guide#setup` |
| Skip absolute URLs | `https://example.com` | *(unchanged)* |
| Skip root-relative | `/docs/guide` | *(unchanged)* |

**Content-type behavior:**
- **Docs:** Strips both `NN_` prefixes and extensions
- **Blog:** Only strips `.md`/`.mdx` extensions (no `NN_` prefixes)

**Usage:**

```typescript
import { internalLinksPostprocessor } from '@parsers/postprocessors';

pipeline.addPostprocessor(internalLinksPostprocessor);
```

### External Links

Adds security attributes to external links:

```html
<!-- Input -->
<a href="https://example.com">Link</a>

<!-- Output -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a>
```

**Security Attributes:**

| Attribute | Purpose |
|-----------|---------|
| `target="_blank"` | Opens in new tab |
| `rel="noopener"` | Prevents `window.opener` access |
| `rel="noreferrer"` | Prevents referrer header |

**Usage:**

```typescript
import { externalLinksPostprocessor, createExternalLinksPostprocessor } from '@parsers/postprocessors';

// Use default
pipeline.addPostprocessor(externalLinksPostprocessor);

// Or create with options
const customExternalLinks = createExternalLinksPostprocessor({
  excludeDomains: ['example.com'],  // Don't mark as external
});
```

## Custom Postprocessors

Create custom postprocessors by implementing the `Processor` interface:

```typescript
import type { Processor, ProcessContext } from '@parsers/types';

const myPostprocessor: Processor = {
  name: 'my-postprocessor',
  async process(html: string, context: ProcessContext): Promise<string> {
    // Transform HTML here
    return transformedHtml;
  }
};

// Add to pipeline
pipeline.addPostprocessor(myPostprocessor);
```

### Example: Add Copy Buttons to Code Blocks

```typescript
const copyButtonPostprocessor: Processor = {
  name: 'copy-buttons',
  async process(html) {
    return html.replace(
      /<pre><code/g,
      '<pre class="has-copy-button"><button class="copy-btn">Copy</button><code'
    );
  }
};
```

### Example: Lazy Load Images

```typescript
const lazyImagePostprocessor: Processor = {
  name: 'lazy-images',
  async process(html) {
    return html.replace(
      /<img /g,
      '<img loading="lazy" '
    );
  }
};
```

## Processing Order

Postprocessors run in the order they are added:

```typescript
pipeline
  .addPostprocessor(headingIdsPostprocessor)    // 1st — add IDs to headings
  .addPostprocessor(internalLinksPostprocessor) // 2nd — rewrite relative links
  .addPostprocessor(externalLinksPostprocessor) // 3rd — add security attrs
```

Order matters when processors depend on each other's output.

## Error Handling

### Missing Position Prefix

```
[DOCS ERROR] Files missing required NN_ position prefix:
  - overview.md
  - installation.md

Docs files must be named with a 2–5 digit position prefix.
Examples:
  01_getting-started.md
  02_installation.md
```

### File Not Found

```
[PARSER ERROR] Content file not found: /path/to/missing.md
  Code: FILE_NOT_FOUND
```

### Directory Not Found

```
[PARSER ERROR] Content directory not found: /path/to/missing/
  Code: DIR_NOT_FOUND
```
