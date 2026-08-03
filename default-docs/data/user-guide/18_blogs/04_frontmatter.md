---
title: Blog Frontmatter
description: Configure blog post metadata with frontmatter
sidebar_position: 4
---

# Blog Frontmatter

Every blog post should include frontmatter at the top with metadata about the post.

## Basic Structure

```yaml
---
title: My Blog Post Title
description: A brief summary of the post
date: 2024-01-15
---

Your post content here...
```

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Post title |
| `date` | `string` | Publication date (YYYY-MM-DD) |

## Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `description` | `string` | `""` | Summary for cards and SEO |
| `author` | `string` | - | Author name |
| `author_image` | `string` | - | Author avatar URL |
| `author_bio` | `string` | - | Short author bio |
| `tags` | `string[]` | `[]` | Categorization tags |
| `image` | `string` | - | Cover image URL |
| `draft` | `boolean` | `false` | Hide in production |

## Field Details

### `title`

The post title displayed in the blog index and as the page heading.

```yaml
---
title: Getting Started with TypeScript
---
```

### `date`

Publication date in `YYYY-MM-DD` format. Overrides the filename date.

```yaml
---
date: 2024-02-15
---
```

- Used for sorting (newest first)
- Displayed on the post

### `description`

Brief summary shown in blog cards and search results.

```yaml
---
description: Learn the fundamentals of TypeScript in this beginner-friendly guide
---
```

- Keep under 160 characters
- Should entice readers to click
- Used for SEO meta description

### `author`

Author name for multi-author blogs.

```yaml
---
author: Jane Smith
author_image: /images/authors/jane.jpg
author_bio: "Senior Engineer at Acme Corp"
---
```

### `tags`

Categorization tags for filtering and organization.

```yaml
---
tags:
  - tutorial
  - typescript
  - beginner
---
```

- Use lowercase
- Use hyphens for multi-word tags
- Be consistent across posts

### `image`

Cover image displayed in the blog index and as the post header.

```yaml
---
image: /images/blog/typescript-cover.jpg
---
```

**Image guidelines:**
- Recommended size: 1200x630px (social sharing)
- Place in your `assets/` folder (served at `/assets/…` — see [Path Aliases](../05_getting-started/03_aliases.md))
- Use descriptive filenames

### `draft`

Hide the post in production builds.

```yaml
---
draft: true
---
```

- Visible in development
- Hidden in production
- Won't appear in the blog index

See [Drafts](../15_writing-content/05_drafts.md) for full details on how drafts behave across all content types.

## Complete Example

```yaml
---
title: Building a REST API with Node.js
description: Learn how to create a production-ready REST API using Express and TypeScript
date: 2024-02-15
author: Alex Johnson
author_image: /images/authors/alex.jpg
tags:
  - nodejs
  - api
  - typescript
  - tutorial
image: /images/blog/rest-api-cover.jpg
draft: false
---

# Building a REST API with Node.js

REST APIs power most modern web applications...
```

## Common Mistakes

### Missing Date

The `date` field is required for proper sorting:

```yaml
# Wrong - missing date
---
title: My Post
---

# Correct
---
title: My Post
date: 2024-01-15
---
```

### Invalid Date Format

Use `YYYY-MM-DD` format:

```yaml
# Wrong formats
date: 01/15/2024
date: January 15, 2024
date: 15-01-2024

# Correct format
date: 2024-01-15
```

### Inconsistent Tags

Use the same tag format throughout:

```yaml
# Inconsistent - avoid
tags: [TypeScript, type-script, TYPESCRIPT]

# Consistent - good
tags: [typescript]
```
