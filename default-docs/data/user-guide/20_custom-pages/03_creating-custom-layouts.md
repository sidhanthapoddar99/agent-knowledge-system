---
title: Creating Custom Layouts
description: Writing your own custom layout — the loadFile pattern, schema discipline, theme consumption, shipping via @ext-layouts
sidebar_position: 3
---

# Creating Custom Layouts

When the three built-in custom layouts (`home`, `info`, `countdown`) don't fit the shape of your page, write your own. A custom layout is a single Astro component that reads a YAML file and renders whatever structure your page needs.

This page covers: **the minimum viable custom layout**, **the `loadFile` pattern**, **theme-token consumption**, and **shipping via `LAYOUT_EXT_DIR`** so your layout lives outside `src/`.

## The minimum viable custom layout

A custom layout is exactly one file: `Layout.astro`. Here's the smallest possible example:

```astro
---
// src/layouts/custom/hello/Layout.astro
import { loadFile } from '@loaders/data';

interface Props {
  dataPath: string;
}

const { dataPath } = Astro.props;

let pageData: { title?: string; message?: string } = {};

try {
  const content = await loadFile(dataPath);
  pageData = content.data as typeof pageData;
} catch (error) {
  console.error('Error loading hello page data:', error);
}

const title = pageData.title || 'Hello';
const message = pageData.message || 'World';
---

<section class="hello-page">
  <h1>{title}</h1>
  <p>{message}</p>
</section>

<style>
  .hello-page {
    padding: var(--spacing-xl);
    text-align: center;
  }

  h1 {
    font-size: var(--display-md);
    color: var(--color-text-primary);
  }

  p {
    font-size: var(--content-body);
    color: var(--color-text-secondary);
    margin-top: var(--spacing-md);
  }
</style>
```

That's a complete layout — load YAML, render a heading and paragraph, styled via theme tokens.

YAML file:

```yaml
# data/pages/hello.yaml
title: "Hello from custom layout"
message: "This was rendered by our own layout, reading this YAML."
```

`site.yaml`:

```yaml
pages:
  hello:
    base_url: "/hello"
    type: custom
    layout: "@custom/hello"
    data: "@data/pages/hello.yaml"
```

## The `loadFile` pattern

Every custom layout follows the same load pattern:

```astro
---
import { loadFile } from '@loaders/data';

interface Props {
  dataPath: string;
}

const { dataPath } = Astro.props;

let pageData: MySchema = {} as MySchema;

try {
  const content = await loadFile(dataPath);
  pageData = content.data as MySchema;
} catch (error) {
  console.error('Error loading page data:', error);
}
---
```

### Why the try/catch

If the YAML is malformed or missing, the dev server shouldn't crash. The layout logs an error, renders with empty/default values, and the page still loads — useful for debugging.

### What `loadFile` returns

```typescript
{
  data: unknown;        // parsed YAML
  absolutePath: string; // resolved file path
  mtime: number;        // modification time (for caching)
}
```

Most layouts only need `content.data`. The other fields are for cache invalidation inside the loader.

### Declaring your schema

The `Props` interface on the layout doesn't declare the YAML schema — it just declares `dataPath`. The YAML shape is declared separately, as a type assertion:

```typescript
interface PageData {
  title?: string;
  sections?: { heading: string; body: string }[];
  footer?: string;
}

const pageData = content.data as PageData;
```

This is a **runtime assertion** — TypeScript doesn't verify YAML content at build time. The layout must tolerate missing fields gracefully.

## Schema discipline

Since the framework doesn't validate custom-page YAML, **the layout IS the schema**. Be strict with yourself:

### Document the schema clearly

Every custom layout should declare, in a top-of-file comment:

```astro
---
/**
 * Hello Layout — displays a title + message.
 *
 * Expected YAML schema:
 *   title: string   (optional, default: "Hello")
 *   message: string (optional, default: "World")
 */
---
```

Without this, future you (or a teammate) won't know what the YAML should contain.

### Default every field

Fields should default when missing. Never crash on absent YAML keys:

```astro
---
const title = pageData.title || 'Hello';
const message = pageData.message || 'World';
const footerText = pageData.footer?.text || '';
---
```

Missing optional fields should render gracefully, not appear as "undefined" or throw errors.

### Validate unusual inputs

If your layout accepts a URL, email, date, or other structured value, validate it:

```astro
---
let targetDate: Date;
try {
  targetDate = pageData.targetDate ? new Date(pageData.targetDate) : new Date();
  if (isNaN(targetDate.getTime())) throw new Error('Invalid date');
} catch {
  console.error('Invalid targetDate in YAML, using now()');
  targetDate = new Date();
}
---
```

Fail soft, log the problem, keep the page rendering.

## Consuming theme tokens

**Never hardcode colours, font sizes, or spacing** in a custom layout. The whole framework depends on this discipline — see [Rules for Layout Authors](/user-guide/themes/rules-for-layout-authors).

```astro
<style>
  /* ✅ every value via theme tokens */
  .my-layout {
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    padding: var(--spacing-xl);
    border-radius: var(--border-radius-md);
  }

  .my-layout h1 {
    font-size: var(--display-md);
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .my-layout__card {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-default);
    box-shadow: var(--shadow-sm);
    transition: box-shadow var(--transition-fast);
  }

  .my-layout__card:hover {
    box-shadow: var(--shadow-md);
  }
</style>
```

Full token list: [The Theme Contract](/user-guide/themes/the-theme-contract).

### Display vs UI tokens

For marketing / landing surfaces (hero titles, countdown digits), use **display tokens** — they're sized specifically for poster-style text:

- `--display-sm` (~30px)
- `--display-md` (~36px)
- `--display-lg` (~48px)

For everything else (buttons, cards, labels), use **UI chrome tokens**:

- `--ui-text-micro` (badges, fine print)
- `--ui-text-body` (default + card titles, with `font-weight: 600`)
- `--ui-text-title` (page titles)

And for rendered prose (if you embed markdown), use **content tokens**:

- `--content-body`, `--content-h1` through `--content-h6`, `--content-code`

Picking the right token tier matters. See [Typography](/user-guide/themes/tokens/typography).

## Where to put your layout

### Inside `src/` — for framework-maintained layouts

```
src/layouts/custom/<style-name>/
└── Layout.astro
```

This requires modifying the framework repo. Reserved for layouts that ship with the framework.

### Via `LAYOUT_EXT_DIR` — for user-shipped layouts

**The recommended path** for custom layouts specific to your project:

```
layouts/custom/<style-name>/
└── Layout.astro
```

`layouts/` lives at your project root (sibling of `config/` and `data/`). Set `LAYOUT_EXT_DIR=../layouts` in `.env` (the path is relative to the framework folder where `.env` lives — `../layouts` reaches up to your project root). The layout is immediately available at `@custom/<style-name>` in `site.yaml`.

Full setup: [Custom Layout Styles](/user-guide/layout-system/custom-layout-styles).

### Import rules when outside `src/`

Extension-directory layouts can't use relative imports to reach `src/`. Use aliases:

```astro
---
// ✅ use @loaders alias
import { loadFile } from '@loaders/data';

// ❌ would fail — relative path outside Vite's scope
// import { loadFile } from '../../src/loaders/data';
---
```

Available aliases: `@layouts/`, `@loaders/`, `@parsers/`, `@styles/`, `@modules/`, `@hooks/`, `@ext-layouts/`.

Relative imports **inside** your layout folder work fine:

```astro
---
import HeroSection from './HeroSection.astro';
import { formatDate } from './util.ts';
---
```

## Splitting large layouts

A real-world custom layout often grows past a single file. Standard pattern:

```
layouts/custom/dashboard/
├── Layout.astro            main entry (loads data, composes parts)
├── parts/
│   ├── Header.astro        hero / title block
│   ├── Metrics.astro       stats cards
│   ├── Activity.astro      activity feed
│   └── Footer.astro        dashboard footer
├── client.ts               interactivity (if any)
└── types.ts                TypeScript types for the YAML schema
```

Import parts relatively: `import Header from './parts/Header.astro';`. Pass data from the main `Layout.astro` down into parts as Astro props.

For complex layouts, see the built-in `@issues/default` layout — it uses the same `parts/` pattern and is a good reference implementation.

## Loading remote data

If your layout needs external data (API, database), do the fetch inside the layout's frontmatter:

```astro
---
import { loadFile } from '@loaders/data';

const { dataPath } = Astro.props;
const pageData = (await loadFile(dataPath)).data;

// Fetch remote data at build time
const response = await fetch(pageData.apiEndpoint);
const apiData = await response.json();
---
```

Astro evaluates frontmatter at build time (or SSR time in dev) — the fetch runs on the server, not the client. Output HTML contains the resolved data.

For data that changes at runtime, write client-side JS in a `<script>` block that fetches after page load.

## Client-side interactivity

For layouts that need runtime JS (timers, filters, toggles), use Astro's `<script>` tag:

```astro
<section id="my-widget" data-config={JSON.stringify(pageData.config)}>
  <!-- widget HTML -->
</section>

<script>
  const el = document.getElementById('my-widget');
  const config = JSON.parse(el?.dataset.config || '{}');
  // wire up behaviour
</script>
```

Pass data to the client via a `data-*` attribute or a `<script type="application/json">` block — never via `define:vars`, which breaks when the script imports other modules.

The `@custom/countdown` layout uses this pattern — worth reading as a reference.

## Shipping a custom layout as a package

Once a layout is stable, you can distribute it:

1. Publish the folder (git repo, npm package, tarball)
2. Consumer clones/installs into their `LAYOUT_EXT_DIR`
3. Consumer references it in `site.yaml` via `@custom/<your-name>`

The consumer needs:
- The layout folder
- Matching YAML file(s) in `data/pages/`
- A `pages:` entry in `site.yaml`

Clear README + example YAML in the layout folder goes a long way.

## Testing a custom layout

Minimum verification before shipping:

- [ ] Renders correctly with **all fields present** (happy path)
- [ ] Renders correctly with **only required fields** (minimal YAML)
- [ ] Doesn't crash with **missing optional fields**
- [ ] Doesn't crash on **malformed YAML** (try/catch handles it)
- [ ] **Light + dark mode** both look right
- [ ] **Grep the layout CSS** for hardcoded colours / sizes — should be zero
- [ ] **Multiple themes** render correctly (swap `theme:` in `site.yaml`, verify)

## See also

- [Using Built-in Layouts](./using-built-in-layouts) — study `home`, `info`, `countdown` as references
- [Layout System / Custom Layout Styles](/user-guide/layout-system/custom-layout-styles) — the `LAYOUT_EXT_DIR` + `@ext-layouts` mechanism
- [Themes / Rules for Layout Authors](/user-guide/themes/rules-for-layout-authors) — the no-hardcoded-values discipline
- [Themes / Tokens](/user-guide/themes/tokens/overview) — what tokens to consume, which to avoid
