---
title: Custom Layout Styles
description: Ship your own layout style without editing src/ — LAYOUT_EXT_DIR, the @ext-layouts alias, import rules, merge behaviour
sidebar_position: 3
---

# Custom Layout Styles

The framework supports shipping your own layout styles **without modifying `src/`**. Drop a folder into a user-configured extension directory, set one env variable, and the new style is available at the same `@<type>/<style>` alias used by built-ins — with override-by-name semantics.

This page covers: what to set up, how to write a layout that plays nicely, the import rules that apply outside `src/`, and merge behaviour against built-ins.

For the authoring deep-dive (`parts/` splitting pattern, client-side JS conventions, `:global()` CSS scoping gotcha), see the dev-docs.

## When to write a custom layout

Before you reach for this, exhaust simpler options:

| Symptom | Probably fixed by |
|---|---|
| "I want different colours / fonts / spacing" | [Theme override](/user-guide/themes/creating-themes/quick-start) |
| "I want the navbar to look different" | Theme's `navbar.css` override |
| "I want a simpler docs layout (no sidebar)" | `layout: "@docs/compact"` — already ships |
| "I want a different blog card style" | Theme override of blog CSS |
| **"I want a completely different page structure (Kanban, gallery, dashboard)"** | **Write a custom layout** |

Custom layouts are for **structural changes** — changing what components render, not how existing components are styled. If you're only adjusting CSS, stay in the theme layer.

## Setup — `LAYOUT_EXT_DIR`

### 1. Create an extension directory

Typical location: `layouts/` at your project root (sibling of `config/`, `data/`, `assets/`, `themes/`). Name doesn't matter — `LAYOUT_EXT_DIR` tells the framework where to look.

```bash
mkdir -p layouts
```

### 2. Set `LAYOUT_EXT_DIR` in `.env`

`.env` lives inside the framework folder (`agent-knowledge-system/`), so the path is relative to *that*. In consumer mode `../layouts` reaches up to your project root:

```env
# .env (inside agent-knowledge-system/)
LAYOUT_EXT_DIR=../layouts
```

Absolute paths work too. Astro reads this at startup and wires the `@ext-layouts` Vite alias to point at it.

### 3. Mirror the `src/layouts/` structure

The extension directory's layout mirrors `src/layouts/`:

```
layouts/
├── docs/
│   └── kanban/                      ← new docs style "kanban"
│       └── Layout.astro
├── blogs/
│   └── magazine/                    ← new blog style "magazine"
│       ├── IndexLayout.astro
│       └── PostLayout.astro
├── issues/
│   └── board/                       ← new issues style "board"
│       ├── IndexLayout.astro
│       └── DetailLayout.astro
├── custom/
│   └── gallery/                     ← new custom style "gallery"
│       └── Layout.astro
├── navbar/
│   └── inline/
│       └── index.astro
└── footer/
    └── sparse/
        └── index.astro
```

Every category supports extension — docs, blogs, issues, custom, navbar, footer.

### 4. Reference the new style in `site.yaml`

Same alias format as built-ins:

```yaml
pages:
  docs:
    layout: "@docs/kanban"       # ← extension style, same alias shape
```

### 5. Restart the dev server

**Required whenever you add or remove a layout folder.** Vite's `import.meta.glob()` evaluates at module load — it doesn't watch for new folders under a glob.

Editing files inside an existing folder works fine with HMR. Only folder adds/removes require a restart.

## Fallback when `LAYOUT_EXT_DIR` isn't set

If `.env` doesn't set `LAYOUT_EXT_DIR`, the `@ext-layouts` alias resolves to `src/layouts/_ext-stub/` — an intentionally empty directory. The globs find nothing there, no extension layouts load, and only built-ins are available.

**Zero performance overhead** when the extension feature is unused. You don't need to "disable" it — just don't set the env var.

## Merge behaviour — override-by-name

Built-in layouts register first, then extension layouts. The registry is a `Map` keyed by style name, so the later write wins:

| Scenario | Result |
|---|---|
| Extension has a new style name (e.g. `@docs/kanban`) | Added alongside built-in styles |
| Extension has the same name as a built-in (e.g. `@docs/default`) | **Extension overrides built-in** |
| `LAYOUT_EXT_DIR` unset | Only built-in styles |
| Extension folder empty | Only built-in styles |

### Overriding a built-in

To override the built-in default docs layout entirely:

```
layouts/docs/default/Layout.astro
```

That folder's `Layout.astro` now renders every `type: docs` page configured with `layout: "@docs/default"`. The built-in at `src/layouts/docs/default/` is ignored for that style name.

Common use: start from the built-in source (copy it), drop into your extension dir, modify to taste. You then own the layout — built-in upgrades don't flow through.

**Most projects don't need this.** If you want to tweak styling, override the theme. Only replace a built-in layout when the structural changes can't be expressed in CSS.

## Writing a layout — what to know

### Layout file naming

Conventions enforced by the registry's globs:

| Category | Required file(s) |
|---|---|
| `docs` | `Layout.astro` |
| `custom` | `Layout.astro` |
| `blogs` | `IndexLayout.astro` + `PostLayout.astro` |
| `issues` | `IndexLayout.astro` + `DetailLayout.astro` (plus optional `SubDocLayout.astro` once sub-doc URLs land) |
| `navbar` | `index.astro` |
| `footer` | `index.astro` |

Extension layouts must match these names — the glob looks for the exact filenames.

### Import rules — no relative imports to `src/`

Extension layouts live **outside `src/`**, so `../../some-component` paths won't work — relative imports can't cross the project-root boundary through `node_modules` the way Vite bundles.

**Use Vite aliases for everything:**

```astro
---
// ❌ doesn't work — relative path from your layouts/ to the framework's src/
// import Body from '../../src/layouts/docs/default/Body.astro';

// ✅ use the @layouts alias
import Body from '@layouts/docs/default/Body.astro';
import Outline from '@layouts/docs/default/Outline.astro';

// Other useful aliases
import { loadContentWithSettings } from '@loaders/data';
import { loadFile } from '@loaders/data';
---
```

### Available aliases

| Alias | Resolves to | Use for |
|---|---|---|
| `@layouts/` | `src/layouts/` | Reuse built-in sub-components |
| `@loaders/` | `src/loaders/` | Data loading (`loadContent`, `loadFile`, etc.) |
| `@parsers/` | `src/parsers/` | Content parser entry points |
| `@styles/` | `src/styles/` | Built-in theme CSS (for reference) |
| `@modules/`, `@hooks/` | Various | Framework internals |
| `@ext-layouts/` | Your extension dir | Cross-reference between your own extension layouts |

Relative imports **within** the same extension folder work fine — they don't cross the boundary:

```astro
---
// Fine — same folder
import HeroBanner from './HeroBanner.astro';
import { formatDate } from './util.ts';
---
```

### Layout props — what you receive

The route handler passes layout-specific props:

**Docs layout** — `{ title, description?, content, headings, dataPath, baseUrl, currentSlug }`. Current page arrives pre-rendered; layout loads the full tree for the sidebar.

**Blog index layout** — `{ dataPath, baseUrl }`. Layout calls `loadContent(dataPath)` to get all posts.

**Blog post layout** — `{ title, description?, content, date, author?, tags? }`. Everything pre-rendered; no data loading needed.

**Issues index layout** — `{ dataPath, baseUrl }` + tracker vocabulary loaded via `loadIssues(dataPath)`.

**Issues detail layout** — `{ dataPath, baseUrl, currentId }`. Layout loads the single issue + sub-docs.

**Custom layout** — `{ dataPath, baseUrl }`. Layout calls `loadFile(dataPath)` to get YAML. No schema enforcement — layout decides.

**Navbar / footer** — site-wide props (config, navigation items).

For exact prop shapes, read the matching `src/layouts/<type>/default/Layout.astro` source — it's the canonical interface.

## Limitations

- **`BaseLayout.astro` can't be overridden.** It's the root HTML wrapper and handles theme-CSS injection. Extension layouts render *inside* it, not instead of it.
- **Folder additions require restart** (Vite `import.meta.glob` limitation). File edits are HMR.
- **No per-page layout overrides within a single tree.** If you want different layouts for different subfolders of one docs tree, split into two `pages:` entries with different data paths.
- **No schema validation on custom page data.** A custom layout just calls `loadFile(dataPath)` — if the YAML's keys don't match what the layout expects, the layout renders poorly (or crashes). Layouts should document their expected schema clearly.

## Sharing extension layouts

Extension layouts can be distributed as directories, git submodules, or (eventually) npm packages:

```bash
# As a submodule
cd layouts/
git submodule add https://github.com/org/docs-kanban.git docs/kanban
```

The layout appears at `@docs/kanban` and works identically.

## See also

- [Layout System Overview](./overview) — the four content types + alias resolution
- [Switching Layout Styles](./switching-styles) — picking between styles in `site.yaml`
- [Custom Pages](/user-guide/custom-pages/overview) — the custom content type, which uses these same layout patterns for page-specific renderers
- dev-docs / layout-system — `parts/` pattern, client JS conventions, `:global()` gotcha (developer-facing)
