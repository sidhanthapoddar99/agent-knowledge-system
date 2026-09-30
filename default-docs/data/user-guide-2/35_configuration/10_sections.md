---
title: "Sections"
description: "Declare a section under pages: in site.yaml: its address, its type, its built-in layout and its data, and the rules between sections."
---

A **section** is one part of the site, such as a user guide, a blog or an issue tracker. You declare each one under `pages:` in `config/site.yaml`. This page documents the four fields of a section, the built-in layouts, and the rules agentks checks across sections.

## One section

```yaml
pages:
  guide:                       # the section's name
    base_url: "/guide"         # its address on the site
    type: docs                 # docs, blog, issues or custom
    layout: "@docs/default"    # a built-in layout for that type
    data: "@data/guide"        # its folder, or for custom one YAML file
```

The key under `pages:` is the section's **name**. Other config refers to the section by it, for example a navbar link with `page: guide`. A name cannot contain `/`, `:` or spaces.

All four fields are required:

| Field | Meaning |
|---|---|
| `base_url` | The address the section's pages start with, such as `/guide`. A page at `guide/10_setup/05_install.md` serves under `/guide/…` |
| `type` | What the section holds: `docs`, `blog`, `issues` or `custom` |
| `layout` | Which built-in layout draws it. It must be a layout of the section's type |
| `data` | Where its files are: a folder for `docs`, `blog` and `issues`; one YAML file for `custom`. A path relative to `config/`, or an alias |

## Types

| Type | `data` names | The section shows |
|---|---|---|
| `docs` | A folder of `NN_` pages and folders | Pages with a sidebar and an outline. See [Docs](../15_docs/01_overview.md) |
| `blog` | A folder of `YYYY-MM-DD-<slug>.md` posts | A post index and one page per post. See [Blog](../20_blog/01_overview.md) |
| `issues` | A tracker folder, one folder per issue | The issue index and one page per issue. See [The issue tracker](../30_issue-tracker/01_overview.md) |
| `custom` | One YAML file | A built-in page, such as a home page, filled from the file. See [Custom pages](../25_custom-pages/01_overview.md) |

## Built-in layouts

A layout is the design that draws a section. agentks has a fixed set of built-in layouts, and `layout` must name one of them for the section's type:

| Type | Layouts |
|---|---|
| `docs` | `@docs/default`, `@docs/compact` |
| `blog` | `@blog/default` |
| `issues` | `@issues/default` |
| `custom` | `@custom/home`, `@custom/info`, `@custom/countdown` |

Any other value is an error that lists the layouts you can use. You cannot add your own layout. You change how a layout looks with CSS, in a theme; see [Themes and layouts](../45_themes-and-layouts/01_overview.md). A one-off page with its own design is an HTML artifact page; see [Writing content](../10_writing-content/01_overview.md).

The navbar and the footer have their own layouts, set in their own files. See [Navbar and footer](./20_navbar-and-footer.md).

## Rules for base_url

- It starts with `/` and has no trailing `/`, except the site root, `/`.
- It holds no spaces, `?`, `#` or `\`, and no `.` or `..` segment.
- **Each section has its own.** Two sections with the same `base_url` are an error.
- **No section sits inside another.** `/docs` and `/docs/api` are refused together, because one would hide pages of the other. The root `/` is the exception: a home page at `/` can sit beside any section.
- **Some addresses are reserved.** agentks uses these for itself, so no section may start with them: `/api`, `/client`, `/assets`, `/content-assets`, `/artifacts` and `/_lib`. The file names `/manifest.webmanifest`, `/sw.js` and `/theme.<hash>.css` at the root are reserved too.

## Rules for data

- The folder or file must exist inside the project. A section with no data would show as empty, so a missing one is an error.
- A `docs`, `blog` or `issues` section needs a folder. A `custom` section needs a file. The wrong kind is an error.

## Add a section

1. Create its folder. For a docs section, that is a folder with a `settings.json` and a first page:

   ```
   data/handbook/
   ├── settings.json
   └── 01_overview.md
   ```

2. Declare it in `site.yaml`:

   ```yaml
   pages:
     handbook:
       base_url: "/handbook"
       type: docs
       layout: "@docs/default"
       data: "@data/handbook"
   ```

3. Link to it from the navbar with `page: handbook`, as [Navbar and footer](./20_navbar-and-footer.md) shows.
4. Run `agentks check config` and `agentks check section data/handbook`.

## Rename or move a section

- **A new address.** Change `base_url`. Navbar and footer links that use `page:` follow the change by themselves.
- **A new folder.** Move the folder with `agentks move`, which rewrites every link to it, then change `data`.
