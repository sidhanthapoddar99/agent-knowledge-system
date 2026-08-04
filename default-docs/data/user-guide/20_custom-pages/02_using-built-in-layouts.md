---
title: Using Built-in Layouts
description: Full schema and examples for @custom/home, @custom/info, and @custom/countdown
sidebar_position: 2
---

# Using Built-in Layouts

Three custom layouts ship with the framework. This page is the reference: YAML schema for each, working example, site.yaml wiring, and notes on the rendered output.

## `@custom/home`

A landing page with a hero block and a features grid. The most common custom layout.

### Schema

```yaml
hero:
  title: string                 # required
  subtitle: string              # optional
  cta:                          # optional — primary call-to-action button
    label: string
    href: string
  secondaryCta:                 # optional — second button
    label: string
    href: string

features:                       # optional — omit for hero-only page
  - title: string               # required per feature
    description: string         # required per feature
    icon: string                # optional — emoji, SVG markup, or unicode char
  # … more features …
```

### Example

```yaml
# data/pages/home.yaml
hero:
  title: "Modern Documentation Framework"
  subtitle: "Build beautiful, fast documentation sites with Astro. Easy to customize, simple to maintain."
  cta:
    label: "Get Started"
    href: "/docs/getting-started"
  secondaryCta:
    label: "View on GitHub"
    href: "https://github.com/user/repo"

features:
  - title: "Lightning Fast"
    description: "Built on Astro for optimal performance. Ships zero JavaScript by default."
    icon: "⚡"

  - title: "Easy Configuration"
    description: "Simple YAML configuration. No complex setup required."
    icon: "⚙️"

  - title: "Beautiful Design"
    description: "Clean, modern design with light and dark mode support."
    icon: "🎨"

  - title: "Fully Customizable"
    description: "Layout packages and CSS variables make customization a breeze."
    icon: "🔧"

  - title: "Auto Sidebar"
    description: "Sidebar automatically generated from your folder structure."
    icon: "📁"
```

### site.yaml

```yaml
pages:
  home:
    base_url: "/"
    type: custom
    layout: "@custom/home"
    data: "@data/pages/home.yaml"
```

### Rendered shape

- **Hero** — title (large display text), subtitle below, CTA buttons underneath
- **Features** — responsive grid (3 columns desktop, 1 on mobile), each card with icon + title + description

Buttons, typography, and card styling all consume theme tokens — the layout reskins automatically with different themes. See [Themes](../25_themes/01_overview.md).

### Tips

- **Skip `features:`** entirely for a hero-only page (useful for minimal landing).
- **Skip `cta:` and `secondaryCta:`** for an informational hero with no action buttons.
- **`icon:`** can be an emoji (`"⚡"`), unicode (`"→"`), or even inline SVG — anything that renders as a string.
- **Feature count** — 3 or 6 (multiples of 3) look best on the desktop grid. 4 features wrap awkwardly.

---

## `@custom/info`

The minimum viable custom layout — a title and description, for simple content pages.

### Schema

```yaml
title: string              # optional — defaults to "Page" if missing
description: string        # optional
```

That's it. The layout renders `title` + `description`.

### Example

```yaml
# data/pages/about.yaml
title: "About"
description: "Learn more about this documentation framework."
```

### site.yaml

```yaml
pages:
  about:
    base_url: "/about"
    type: custom
    layout: "@custom/info"
    data: "@data/pages/about.yaml"
```

### Rendered shape

- Page title (large heading)
- Description paragraph below
- Theme-styled, centred layout

### When to use vs docs

`@custom/info` is for **one-shot standalone pages**. If your About page is going to grow into a multi-section "Company / Team / History / Contact" structure, use docs instead (a `pages: about/` docs tree). `@custom/info` doesn't scale to multi-section content.

### Extending `info` with custom content

The built-in info layout renders `title` + `description` only. If you need more (prose sections, contact forms, embedded diagrams), write a custom layout — see [Creating Custom Layouts](./03_creating-custom-layouts.md). Adding a `content:` field to your YAML won't render unless the layout reads it.

---

## `@custom/countdown`

A full-screen countdown timer to a target date — for event landings, launch banners, sale timers.

### Schema

```yaml
title: string              # optional — defaults to "Countdown"
subtitle: string           # optional
targetDate: string         # optional — ISO timestamp (default: 2026-03-01T00:00:00)
amount: string             # optional — display above timer (e.g. pricing, quantity)
note: string               # optional — italic note below timer
```

### Example

```yaml
# data/pages/launch.yaml
title: "v2 Launch Event"
subtitle: "We're shipping something big."
targetDate: "2026-12-01T18:00:00"
amount: "50% off"
note: "For the first 100 signups only."
```

### site.yaml

```yaml
pages:
  launch:
    base_url: "/launch"
    type: custom
    layout: "@custom/countdown"
    data: "@data/pages/launch.yaml"
```

### Rendered shape

```
┌─────────────────────────────────────┐
│                                     │
│          v2 Launch Event            │  ← title
│   We're shipping something big.     │  ← subtitle
│                                     │
│              50% off                │  ← amount (accent colour)
│                                     │
│  ┌──┐ : ┌──┐ : ┌──┐ : ┌──┐          │
│  │12│   │06│   │34│   │17│          │  ← timer units (days:hours:minutes:seconds)
│  │D │   │H │   │M │   │S │          │
│  └──┘   └──┘   └──┘   └──┘          │
│                                     │
│  For the first 100 signups only.    │  ← note
│                                     │
└─────────────────────────────────────┘
```

The timer updates every frame via `requestAnimationFrame` — smooth, accurate. Once the target passes, all units render `0`.

### Target date formats

`targetDate:` is an ISO-8601 timestamp:

| Example | Parses as |
|---|---|
| `"2026-12-01T18:00:00"` | Dec 1, 2026, 6:00 PM local time |
| `"2026-12-01T18:00:00Z"` | Dec 1, 2026, 6:00 PM UTC |
| `"2026-12-01T18:00:00-05:00"` | Dec 1, 2026, 6:00 PM EST |
| `"2026-12-01"` | Dec 1, 2026, 00:00 local (midnight) |

Use the `Z` suffix or an explicit offset when you want the same countdown across time zones. A bare timestamp uses the visitor's local time.

### Tips

- **`amount:`** is styled prominently — it's for the highlight value (price, discount, quantity). Short strings work best.
- **`note:`** renders italic and muted — fine-print disclaimers, secondary text.
- **Omit everything except `targetDate`** for a pure timer page.
- **After the target** — the display freezes at `0`. Handle the "after" state by switching `site.yaml` to a different page or layout.

---

## Configuring multiple custom pages

A real site often has several custom pages. Declare each as its own `pages:` entry:

```yaml
# site.yaml
pages:
  home:
    base_url: "/"
    type: custom
    layout: "@custom/home"
    data: "@data/pages/home.yaml"

  about:
    base_url: "/about"
    type: custom
    layout: "@custom/info"
    data: "@data/pages/about.yaml"

  contact:
    base_url: "/contact"
    type: custom
    layout: "@custom/info"
    data: "@data/pages/contact.yaml"

  launch:
    base_url: "/launch"
    type: custom
    layout: "@custom/countdown"
    data: "@data/pages/launch.yaml"
```

Each page has its own URL, its own YAML file, and its own layout. They coexist with docs, blog, issues entries in the same `pages:` section.

## File organisation

Custom page YAML files live in `data/pages/` by convention:

```
data/pages/
├── home.yaml
├── about.yaml
├── contact.yaml
├── privacy.yaml
├── launch.yaml
└── 404.yaml
```

Flat directory, one file per page. Named to match the URL slug where possible (easier to find later).

## See also

- [Creating Custom Layouts](./03_creating-custom-layouts.md) — write your own when the three built-ins don't fit
- [Layout System / Switching Styles](../16_layout-system/02_switching-styles.md) — `layout:` field mechanics
- [Page Configuration](../10_configuration/03_site/08_page.md) — full `pages:` entry schema
- [Themes](../25_themes/01_overview.md) — how the countdown's colours, hero display-size, and card styling get themed
