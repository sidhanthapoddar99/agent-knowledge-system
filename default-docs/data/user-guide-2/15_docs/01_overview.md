---
title: "Docs sections"
description: "A docs section is a folder tree of numbered pages. agentks builds the sidebar, the URLs, the outline and the previous and next links from it."
---

# Docs sections

A docs section is a folder of pages, arranged in numbered subfolders. You write the pages. agentks builds everything around them from the folder tree: the sidebar, each page's URL, the outline of its headings, the previous and next links, and the breadcrumbs. This section explains how to lay out a docs section and what each file in it does.

A project can have several docs sections, for example a user guide and a developer guide. Each one is a folder with its own URL.

## A docs section on disk

```
data/guide/                         the section root
├── settings.json                   optional here
├── 05_getting-started/
│   ├── settings.json               { "label": "Getting Started" }
│   ├── 01_overview.md
│   ├── 05_install.md
│   └── assets/
│       └── installer.png
├── 10_concepts/
│   ├── settings.json
│   ├── 05_links.md
│   ├── 10_architecture.mmd         a diagram page
│   └── 20_q3-dashboard.html        an artifact page
└── 15_reference/
    ├── settings.json
    └── 05_commands.md
```

With the section's base URL set to `/guide`, `05_getting-started/05_install.md` is served at `/guide/getting-started/install`.

## The four rules

1. **Every file and folder has an `NN_` prefix**, which sets its order. `assets/` folders and a few special files are the exceptions.
2. **Every folder below the section root has a `settings.json`** with a `label`, its name in the sidebar.
3. **Every page has a `title`** in its frontmatter.
4. **A page's files go in an `assets/` folder beside it.** Nothing under `assets/` appears in the sidebar.

`agentks check section` checks all four:

```bash
agentks check section data/guide
```

## Add a docs section to a project

A section is an entry under `pages:` in `config/site.yaml`, with the type `docs`:

```yaml
pages:
  guide:
    base_url: "/guide"
    type: docs
    layout: "@docs/default"
    data: "@data/guide"
```

The folder must exist before agentks starts. `layout` picks one of the built-in docs layouts: `@docs/default`, with a sidebar, or `@docs/compact`, without one. The [configuration section](../35_configuration/01_overview.md) explains every key of a `pages:` entry.

## Pages you can put in a docs section

| Kind | File | What it is |
|---|---|---|
| Markdown page | `NN_name.md` | A page of text |
| Diagram page | `NN_name.mmd`, `.mermaid`, `.dot`, `.gv`, `.excalidraw`, `.drawio` | A diagram that fills the page |
| Artifact page | `NN_name.html` | A self-contained HTML page, shown in a frame |

The writing rules for all three, such as links, embeds, assets, diagram pages and artifact pages, are the same in every content type. They live in the [writing content](../10_writing-content/01_overview.md) section. The pages here cover only what is special to docs sections.

## In this section

| Page | What it covers |
|---|---|
| [Structure and URLs](./05_structure-and-urls.md) | Folder shape, prefixes, how each page gets its URL, ordering, `index.md` |
| [Folder settings](./10_folder-settings.md) | Every field of a folder's `settings.json` |
| [Frontmatter](./15_frontmatter.md) | Every frontmatter field of a docs page |
| [What a docs page shows](./20_what-a-page-shows.md) | The sidebar, the outline, previous and next, breadcrumbs, the two layouts |
| [Check, search and move](./25_check-search-and-move.md) | The commands that keep a docs section in order |
