---
title: Navbar Configuration
description: Configure the navigation bar in navbar.yaml
sidebar_position: 5
---

# Navbar Configuration

The `navbar.yaml` file configures your site's top navigation bar style and items.

## Location

```
config/navbar.yaml
```

## Structure

```yaml
# Navbar layout style
layout: "@navbar/default"

# Note: Logo configuration has moved to site.yaml

items:
  - label: "Home"
    href: "/"

  - label: "Docs"
    href: "/docs"

  - label: "Blog"
    href: "/blog"
```

## Layout Styles

Specify which navbar style to use:

```yaml
layout: "@navbar/default"
```

### Available Styles

| Style | Alias | Description |
|-------|-------|-------------|
| **Default** | `@navbar/default` | Full-featured navbar with dropdowns, mobile menu, theme toggle |
| **Minimal** | `@navbar/minimal` | Simple flat navbar with basic links and theme toggle |

### Style Resolution

The layout alias resolves to the component file:
- `@navbar/default` → `src/layouts/navbar/default/index.astro`
- `@navbar/minimal` → `src/layouts/navbar/minimal/index.astro`

### Dev Toolbar Switching

In development mode, you can switch navbar styles without editing config files using the dev toolbar's layout-switcher app.

## Logo Configuration

Logo and favicon configuration has moved to `site.yaml`. See [Logo Configuration](./03_site/07_logo.md) for details.

```yaml
# In site.yaml (not navbar.yaml)
logo:
  src: "@assets/logo.svg"
  alt: "Docs"
  theme:
    dark: "logo-dark.svg"
    light: "logo-light.svg"
  favicon: "@assets/favicon.png"
```

## Navigation Items

### Simple Links

```yaml
items:
  - label: "Home"
    href: "/"

  - label: "Docs"
    href: "/docs"

  - label: "Blog"
    href: "/blog"

  - label: "About"
    href: "/about"
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | `string` | Yes | Display text |
| `href` | `string` | Yes* | Link destination |
| `items` | `array` | No | Dropdown items (replaces `href`) |

### Dropdown Menus

Create dropdown menus with nested `items`:

```yaml
items:
  - label: "Docs"
    items:
      - label: "Layouts"
        href: "/docs/layouts"
      - label: "Components"
        href: "/docs/components"

  - label: "Resources"
    items:
      - label: "Blog"
        href: "/blog"
      - label: "GitHub"
        href: "https://github.com/user/repo"
```

When `items` is present, `href` is ignored (the parent becomes a dropdown trigger).

### External Links

External links (starting with `http`) automatically:
- Open in a new tab
- Have `rel="noopener noreferrer"`

```yaml
items:
  - label: "GitHub"
    href: "https://github.com/user/repo"
```

## TypeScript Interface

```typescript
interface NavItem {
  label: string;
  href?: string;
  items?: NavItem[];
}

interface NavbarConfig {
  layout?: string;  // Layout alias (e.g., "@navbar/default")
  items: NavItem[];
}
```

## Loading in Code

```typescript
import { loadNavbarConfig, getSiteLogo, getNavbarLayout } from '@loaders/config';

const navbar = loadNavbarConfig();
const { items } = navbar;

// Get the configured navbar layout
const navbarLayout = getNavbarLayout(); // Returns "@navbar/default" by default

// Logo is now loaded separately from site config
const logo = getSiteLogo();
```

## Default Values

If `navbar.yaml` is missing or `layout` is not specified:

```typescript
{
  layout: '@navbar/default',  // Default navbar style
  items: [],
}
```

## Complete Example

```yaml
# navbar.yaml

# Layout style: @navbar/default (full-featured) or @navbar/minimal (simple)
layout: "@navbar/default"

items:
  - label: "Home"
    href: "/"

  - label: "Docs"
    href: "/docs"

  - label: "Resources"
    items:
      - label: "Layouts"
        href: "/docs/layouts"
      - label: "Components"
        href: "/docs/components"

  - label: "Blog"
    href: "/blog"

  - label: "About"
    href: "/about"

  - label: "GitHub"
    href: "https://github.com/user/repo"
```

## Creating Custom Navbar Styles

To create a new navbar style:

1. Create a folder: `src/layouts/navbar/my-style/`
2. Add `index.astro` with your navbar design
3. Reference it in config: `layout: "@navbar/my-style"`

The component receives navbar items via the config loader. See existing styles for implementation patterns.

## Migration Note

If you're upgrading from a previous version, move your logo configuration from `navbar.yaml` to `site.yaml`:

**Before (navbar.yaml):**
```yaml
logo:
  src: "/logo.svg"
  alt: "Docs"

items:
  # ...
```

**After (site.yaml):**
```yaml
site:
  name: "My Docs"
  # ...

logo:
  src: "@assets/logo.svg"
  alt: "Docs"
  theme:
    dark: "logo-dark.svg"
    light: "logo-light.svg"
  favicon: "@assets/favicon.png"
```

**After (navbar.yaml):**
```yaml
items:
  # ...
```
