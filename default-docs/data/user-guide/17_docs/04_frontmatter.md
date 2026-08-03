---
title: Docs Frontmatter
description: Configure page metadata with frontmatter for docs
sidebar_position: 4
---

# Docs Frontmatter

Every documentation `.md` file should include frontmatter at the top. Frontmatter is YAML metadata enclosed in triple dashes.

## Basic Structure

```yaml
---
title: Page Title
description: Brief description for SEO
---

# Page Title

Content starts here...
```

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Page title (appears in sidebar and browser tab) |

## Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `description` | `string` | `""` | SEO meta description |
| `sidebar_label` | `string` | `title` | Override text shown in sidebar |
| `draft` | `boolean` | `false` | Hide page in production builds |
| `tags` | `string[]` | `[]` | Tags for search indexing |

## Field Details

### `title` (Required)

The main title for the page.

```yaml
---
title: Getting Started with the API
---
```

- Displayed in browser tab
- Used in sidebar navigation
- Used in search results

### `description`

A brief description for SEO and previews.

```yaml
---
title: Authentication Guide
description: Learn how to authenticate API requests using tokens and API keys
---
```

- Appears in search engine results
- Used in link previews (Open Graph)
- Keep under 160 characters for best SEO

### `sidebar_label`

Override the sidebar text without changing the page title.

```yaml
---
title: Comprehensive Guide to Authentication and Authorization
sidebar_label: Auth Guide
---
```

- Useful when page titles are long
- Keeps sidebar clean and scannable

### `draft`

Mark a page as draft to hide it in production.

```yaml
---
title: Upcoming Feature
draft: true
---
```

- Page is visible in development
- Page is hidden in production builds
- Useful for work-in-progress documentation

See [Drafts](../15_writing-content/05_drafts.md) for full details on how drafts behave across all content types.

### `tags`

Add tags for search indexing and categorization.

```yaml
---
title: REST API Endpoints
tags:
  - api
  - rest
  - endpoints
---
```

- Improves search discoverability
- Can be used for filtering
- Use lowercase, hyphenated tags

## Complete Example

```yaml
---
title: User Authentication
description: Complete guide to implementing user authentication with JWT tokens
sidebar_label: Authentication
draft: false
tags:
  - auth
  - jwt
  - security
---

# User Authentication

This guide covers implementing secure user authentication...
```

## Common Mistakes

### Missing Dashes

Frontmatter must be enclosed in triple dashes:

```yaml
---
title: Correct
---
```

Not:

```yaml
title: Wrong (no dashes)
```

### Incorrect YAML Syntax

Watch out for colons in values:

```yaml
# Wrong - unquoted colon
---
title: API: Getting Started
---

# Correct - quoted string
---
title: "API: Getting Started"
---
```

### Title vs H1 Mismatch

Keep your frontmatter title and H1 heading consistent:

```yaml
---
title: Installation Guide
---

# Installation Guide

Content...
```
