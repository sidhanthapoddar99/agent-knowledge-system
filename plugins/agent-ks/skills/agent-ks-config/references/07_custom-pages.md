# Custom pages

A custom page is one YAML file rendered by one layout. The YAML lives in `data/pages/`, flat, one file per page, named after its URL. The `pages:` entry has `type: custom` and points `data:` at the file. The user guide section is `@root/default-docs/data/user-guide/20_custom-pages/`.

```yaml
pages:
  home:    { base_url: "/",        type: custom, layout: "@custom/home",      data: "@data/pages/home.yaml" }
  about:   { base_url: "/about",   type: custom, layout: "@custom/info",      data: "@data/pages/about.yaml" }
  launch:  { base_url: "/launch",  type: custom, layout: "@custom/countdown", data: "@data/pages/launch.yaml" }
```

Three layouts ship. Each has its own schema. They are not styles of one layout. The framework does not validate the YAML. So the layout is the schema, and a key the layout does not read renders nothing.

## `@custom/home`

A landing page: a hero block and a features grid.

```yaml
hero:
  title: "Modern Documentation"          # required
  subtitle: "Build docs with Astro."     # optional
  cta:          { label: "Get Started", href: "/docs/getting-started" }   # optional
  secondaryCta: { label: "GitHub", href: "https://github.com/user/repo" } # optional
features:                                # optional; omit for a hero-only page
  - { title: "Fast", description: "Ships no JavaScript by default.", icon: "⚡" }
  - { title: "Simple", description: "YAML config, no setup.", icon: "⚙️" }
  - { title: "Themed", description: "Light and dark from one theme.", icon: "🎨" }
```

`icon` is any string: an emoji, a unicode glyph, inline SVG. The grid is three columns on desktop, so three or six features look right. Four wrap, and the second row looks uneven. The `href` values are URLs, as in the navbar.

## `@custom/info`

A title and a description, for a one-shot page such as About or Contact.

```yaml
title: "About"                                                   # optional; defaults to "Page"
description: "Learn more about this documentation framework."    # optional
```

It renders nothing else. An About page that grows sections becomes a docs section instead. A page that needs prose, a form or a diagram needs its own layout. See below.

## `@custom/countdown`

A full-screen timer to a date.

```yaml
title: "v2 Launch Event"                 # optional; defaults to "Countdown"
subtitle: "We're shipping something big."
targetDate: "2026-12-01T18:00:00Z"       # ISO 8601; default 2026-03-01T00:00:00
amount: "50% off"                        # optional; the highlight line above the timer
note: "For the first 100 signups only."  # optional; italic, muted, below the timer
```

A bare timestamp counts in the visitor's local time. Add `Z` or an offset for one moment worldwide. After the target date every unit shows `0`. Switch the page to another layout then.

## Write a custom layout

When the three do not fit, write one. The minimum is a single `Layout.astro` that loads the YAML and renders it.

```astro
---
/**
 * Hello layout. Expected YAML:
 *   title: string    (optional, default "Hello")
 *   message: string  (optional, default "World")
 */
import { loadFile } from '@loaders/data';
interface Props { dataPath: string }
const { dataPath } = Astro.props;

let page: { title?: string; message?: string } = {};
try {
  page = (await loadFile(dataPath)).data as typeof page;
} catch (error) {
  console.error('hello: cannot load page data', error);
}
const title = page.title || 'Hello';
const message = page.message || 'World';
---
<section class="hello">
  <h1>{title}</h1>
  <p>{message}</p>
</section>
<style>
  .hello { padding: var(--spacing-xl); text-align: center; }
  h1 { font-size: var(--display-md); color: var(--color-text-primary); }
  p  { font-size: var(--content-body); color: var(--color-text-secondary); margin-top: var(--spacing-md); }
</style>
```

| Rule | Why |
|---|---|
| Document the schema in a comment at the top | Nothing else records what the YAML must hold |
| Default every field, and wrap the load in `try` | A missing key or a bad file must log and render, not crash the dev server |
| Validate a date, URL or number you read | `new Date(x)` on junk gives `Invalid Date` and renders `NaN` |
| Use display tokens for poster text, UI tokens for chrome, content tokens for prose | The full rule set: [06_layouts.md](./06_layouts.md#rules-for-layout-css) |
| Pass data to client script through a `data-*` attribute or a JSON `<script>` tag | `define:vars` breaks when the script imports a module. The countdown layout shows the pattern |

`loadFile` returns a `LoadedContent`. Use `data` for the YAML and `filePath` for the source path. A fetch of remote data goes in the frontmatter and runs at build time. Data that changes after load needs client script.

### Where it lives

Put it under `LAYOUT_EXT_DIR`, at `layouts/custom/<style>/Layout.astro`. Reference it as `@custom/<style>`. Setup, import aliases and the restart rule: [06_layouts.md](./06_layouts.md#custom-layout-styles). The folder `src/layouts/custom/` is for layouts that ship with the framework only.

A layout that grows splits into parts:

```
layouts/custom/dashboard/
├── Layout.astro        loads data, composes the parts
├── parts/              Header.astro, Metrics.astro, …
├── client.ts           interactivity, if any
└── types.ts            the YAML schema as a type
```

### Before you ship it

- It renders with every field, with only the required ones, and with none.
- It survives a malformed YAML file.
- It looks right in light and dark mode, and under a second theme.
- A grep of its CSS finds no hex colour and no raw size.
- A README and an example YAML sit in the folder when it is shared. The consumer needs the folder, a YAML file in `data/pages/` and a `pages:` entry.
