# Layouts

A layout renders one content type. A style is one variant of it. `site.yaml` picks a style per page with `layout: "@<type>/<style>"`. The user guide section is `@root/default-docs/data/user-guide/16_layout-system/`.

Before you write a layout, check that a theme change does not do the job. Colours, fonts, spacing and the look of the navbar are theme work: [05_themes.md](./05_themes.md). A layout is for a different page structure: a board, a gallery, a dashboard.

## What ships

| Alias | Structure |
|---|---|
| `@docs/default` | Three columns: sidebar, body, outline. The right choice for a tree with depth |
| `@docs/compact` | Two columns: body and outline, no sidebar. For a flat section or an embedded one |
| `@blog/default` | A card grid index; narrow prose posts with tags and date |
| `@issues/default` | A filter bar, state tabs and a sortable list; a three-column detail page |
| `@custom/home`, `@custom/info`, `@custom/countdown` | One layout per page intent, each with its own YAML schema: [07_custom-pages.md](./07_custom-pages.md) |
| `@navbar/default`, `@navbar/minimal` | Full navbar with dropdowns; logo and toggle only |
| `@footer/default`, `@footer/minimal` | Column grid with a bottom bar; one line |

Switch by editing the `layout` value and saving. The dev server hot-reloads. One docs tree has one layout. To give a subfolder another style, mount it as its own `pages:` entry with its own `data:` path. In dev, the toolbar's layout switcher previews a style without writing config.

## Custom layout styles

You can ship a style without editing the framework. It lives in an extension folder. It resolves at the same `@<type>/<style>` alias. It overrides a built-in style of the same name.

### Setup

1. Create `layouts/` at the project root, beside `config/` and `data/`.
2. In the framework's `.env` set `LAYOUT_EXT_DIR=../layouts`. The path is relative to the framework folder. Absolute paths work.
3. Mirror `src/layouts/`: one folder per type, one per style, with the exact file names below.
4. Reference it in `site.yaml`: `layout: "@docs/kanban"`.
5. Restart: `./start stop`, then `./start --detach`. A new folder needs a restart. Edits inside an existing folder hot-reload.

```
layouts/
├── docs/kanban/Layout.astro
├── blogs/magazine/IndexLayout.astro  PostLayout.astro
├── issues/board/IndexLayout.astro  DetailLayout.astro  SubDocLayout.astro
├── custom/gallery/Layout.astro
├── navbar/inline/index.astro
└── footer/sparse/index.astro
```

| Type folder | Required files |
|---|---|
| `docs`, `custom` | `Layout.astro` |
| `blogs` | `IndexLayout.astro`, `PostLayout.astro` |
| `issues` | `IndexLayout.astro`, `DetailLayout.astro`, `SubDocLayout.astro` |
| `navbar`, `footer` | `index.astro` |

Note that the folder is `blogs`, with an `s`, while the alias is `@blog/…`. When `LAYOUT_EXT_DIR` is unset, only the built-in styles load, at no cost.

### Override a built-in

A folder named like a built-in, `layouts/docs/default/Layout.astro`, replaces it for every page that names `@docs/default`. Copy the built-in source from `@root/astro-doc-code/src/layouts/docs/default/`, then change it. From then on the project owns that layout. Framework updates do not reach it. Do this only when the change cannot be done in CSS.

### Imports

An extension layout sits outside `src/`, so a relative path into the framework does not resolve. Use the aliases.

| Alias | Resolves to | Use for |
|---|---|---|
| `@layouts/` | `src/layouts/` | Reuse a built-in part: `import Body from '@layouts/docs/default/Body.astro'` |
| `@loaders/` | `src/loaders/` | `loadContent`, `loadFile`, `loadIssues` |
| `@parsers/`, `@styles/`, `@modules/`, `@hooks/` | framework internals | Rarely |
| `@ext-layouts/` | `LAYOUT_EXT_DIR` | One extension layout importing another |

Relative imports inside the same style folder work: `import Card from './parts/Card.astro'`.

### What a layout receives

| Layout | Props |
|---|---|
| Docs | `title`, `description?`, `content` (rendered HTML), `headings`, `dataPath`, `baseUrl`, `currentSlug`. The layout loads the tree for the sidebar |
| Blog index | `dataPath`, `baseUrl`. Call `loadContent(dataPath)` for the posts |
| Blog post | `title`, `description?`, `content`, `date`, `author?`, `tags?`. Pre-rendered |
| Issues index | `dataPath`, `baseUrl`. `loadIssues(dataPath)` gives issues and the vocabulary |
| Issues detail | `issue`, `vocabulary`, `baseUrl`. The issue arrives loaded; there is no `dataPath` to load from |
| Issues sub-doc | `issue`, `vocabulary`, `baseUrl`, `subDoc`. `subDoc.kind` names the section, and `subDoc[kind]` is its entry |
| Custom | `dataPath`, `baseUrl`. `loadFile(dataPath)` gives the YAML; no schema enforcement |
| Navbar, footer | The config and the items |

The exact shapes are in the matching `@root/astro-doc-code/src/layouts/<type>/default/*.astro`. Read that file before you write yours.

### Conventions

- Keep any `.astro` or `.ts` file under about 400 lines. Split into `parts/` and one `client.ts`.
- Pass server data to client script through a `<script type="application/json">` tag or a `data-*` attribute, never through `define:vars`. `define:vars` breaks when the script imports a module.
- Elements created at runtime with `innerHTML` miss Astro's scoped attribute. Wrap their styles in `:global(.class)`.
- `BaseLayout.astro` cannot be replaced. It injects the theme CSS. An extension layout renders inside it.

## Rules for layout CSS

Every visual value is a theme variable. Use no hex, `rgb()`, `hsl()`, raw `px` or `rem` in font size, padding, margin, gap, radius, shadow, width, height, and no `ms` in a transition. If you break the rule, the value stays fixed across theme switches and dark mode, while the page still renders.

| Instead of | Write |
|---|---|
| `color: #1a1a1a` | `color: var(--color-text-primary)` |
| `font-size: 14px`, or `var(--font-size-sm)` | `font-size: var(--ui-text-body)` for chrome; `var(--content-body)` for prose |
| a bigger card title | `var(--ui-text-body)` plus `font-weight: 600`. Weight and colour carry hierarchy, not a fourth size |
| `padding: 8px 16px` | `padding: var(--spacing-sm) var(--spacing-md)` |
| `transition: background 0.2s` | `transition: background var(--transition-fast)` |
| `var(--color-accent, #7aa2f7)` | `var(--color-brand-primary)`. Never invent a name; propose it in the contract instead |

There are three exceptions. `@media` breakpoints take literal pixels, because a CSS variable does not resolve inside a media query. Use the scale in `@root/astro-doc-code/src/styles/breakpoints.css`. The scale is `480`, `640`, `768`, `1024`, `1280`, `1536`, `1920` and `2560`. `640`, `768` and `1024` cover most rules. `em` is fine for a size relative to the parent text. Resets are plain CSS.

To check a layout, do three things. Grep its CSS for `#[0-9a-f]{3,8}`, `rgba?\(` and `font-size:\s*[0-9]`. Swap `theme:` in `site.yaml` and reload. Toggle dark mode and walk every page type.
