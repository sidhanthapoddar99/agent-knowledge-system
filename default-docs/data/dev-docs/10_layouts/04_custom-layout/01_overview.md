---
title: Custom Layouts Overview
description: Understanding custom layouts for landing pages and special content
---

# Custom Layouts

Custom layouts handle arbitrary page structures that don't fit the docs or blog patterns. They're ideal for landing pages, about pages, contact forms, and other unique content.

## Key Differences

Unlike docs and blog layouts:

| Feature | Docs/Blog | Custom |
|---------|-----------|--------|
| Content source | Markdown files | YAML files |
| Structure | Standardized | Flexible |
| Data shape | Fixed frontmatter | Custom schema |
| Multiple files | Yes | Single file per page |

## Available Layouts

| Layout | Purpose | Best For |
|--------|---------|----------|
| `home` | Landing page | Homepage with hero and features |
| `info` | Simple content | About, contact, legal pages |

## Visual Structure

### home (Landing Page)

```
┌──────────────────────────────────────────────────────────────────┐
│                           Navbar                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                         HERO SECTION                             │
│                                                                  │
│                    Welcome to Our Product                        │
│                 The best solution for your needs                 │
│                                                                  │
│               [Get Started]    [Learn More]                      │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│     │     🚀       │  │     🧩      │  │     ⚡       │         │
│     │    Fast      │  │   Modular    │  │    Simple    │         │
│     │  Lightning   │  │  Pick your   │  │  Easy to     │         │
│     │   quick      │  │   layout     │  │   use        │         │
│     └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                           Footer                                 │
└──────────────────────────────────────────────────────────────────┘
```

### info (Simple Content)

```
┌──────────────────────────────────────────────────────────────────┐
│                           Navbar                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   About Us                                                       │
│                                                                  │
│   We are a team of developers passionate about creating          │
│   great documentation experiences.                               │
│                                                                  │
│   Our mission is to make documentation easy and beautiful.       │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                           Footer                                  │
└──────────────────────────────────────────────────────────────────┘
```

## File Location

```
src/layouts/custom/
├── home/                      # Landing page — owns its own components
│   ├── Layout.astro
│   ├── Hero.astro
│   └── Features.astro
├── info/                      # Simple content page
│   ├── Layout.astro
│   └── Content.astro
└── countdown/                 # Countdown timer (self-contained)
    └── Layout.astro
```

Custom layouts define their styles using scoped `<style>` blocks within each component. Styles use theme CSS variables (e.g., `var(--color-bg-primary)`, `var(--spacing-md)`) for consistency. Each component is self-contained — no external CSS files are needed.

## Routing

Custom layouts are used when:

1. Page type is `custom` in `site.yaml`
2. URL matches the `base_url`

```yaml
# site.yaml
pages:
  home:
    base_url: "/"
    type: custom                  # ← Triggers custom layout
    layout: "@custom/home"
    data: "@data/pages/home.yaml"

  about:
    base_url: "/about"
    type: custom
    layout: "@custom/info"
    data: "@data/pages/about.yaml"
```

**URL patterns:**
- `/` → home layout with home.yaml data
- `/about` → info layout with about.yaml data

## Content Organization

Custom pages use YAML files instead of markdown:

```
data/pages/
├── home.yaml       # Homepage data
├── about.yaml      # About page data
└── contact.yaml    # Contact page data
```

### Example: home.yaml

```yaml
hero:
  title: "Build Beautiful Docs"
  subtitle: "A modern documentation framework powered by Astro"
  cta:
    label: "Get Started"
    href: "/docs"
  secondaryCta:
    label: "View on GitHub"
    href: "https://github.com/..."

features:
  - icon: "🚀"
    title: "Fast"
    description: "Built on Astro for lightning-fast static sites"
  - icon: "🧩"
    title: "Modular"
    description: "Pick and choose layouts that fit your needs"
  - icon: "⚡"
    title: "Simple"
    description: "YAML configuration, no code required"
```

### Example: about.yaml

```yaml
title: "About Us"
description: |
  We are a team of developers passionate about creating
  great documentation experiences.

  Our mission is to make documentation easy and beautiful.
```

## Features

### Flexible Data Schema

Each layout defines its own expected data shape:

```typescript
// home layout expects:
interface HomeData {
  hero?: {
    title: string;
    subtitle?: string;
    cta?: { label: string; href: string };
  };
  features?: Array<{
    icon?: string;
    title: string;
    description: string;
  }>;
}

// info layout expects:
interface InfoData {
  title?: string;
  description?: string;
}
```

### Component-Based

Custom layouts compose from reusable sections:

```astro
<div class="home">
  {hero && <Hero hero={hero} />}
  {features && <Features features={features} />}
</div>
```

### Single File Per Page

Unlike docs (folder of files) or blog (multiple posts), each custom page is:
- One YAML file
- One URL
- Self-contained data

## When to Use Custom Layouts

| Use Case | Layout |
|----------|--------|
| Homepage/landing | `home` |
| About page | `info` |
| Contact page | `info` (with form component) |
| Pricing page | Custom (create new) |
| 404 page | `info` |
| Legal pages | `info` |

## Creating New Custom Layouts

Custom layouts are the most flexible — you define:
1. What YAML data shape you expect
2. What components you include in the folder
3. How everything is arranged and styled

See [Creating Custom Layouts](./04_creating.md) for a step-by-step guide.
