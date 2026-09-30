---
title: "Structure and URLs"
description: "How a docs section's folders and file names become its sidebar order and its URLs, and which names need no prefix."
---

# Structure and URLs

In a docs section, the folder tree is the table of contents. The numbers at the start of the names set the order, and the rest of each name becomes part of the URL. This page gives the exact rules, so you can predict where any page appears and at what address.

## Every name needs a prefix

Every file and folder in a docs section starts with an ordering prefix of 2 to 5 digits and `_`: `05_getting-started/`, `10_install.md`. The prefix grammar and gap numbering are explained in [writing content](../10_writing-content/01_overview.md), under names, order and frontmatter.

A few names need no prefix:

| Name | What it is |
|---|---|
| `assets/` | The folder for a page's files. Never in the sidebar |
| `settings.json`, `settings.jsonc` | The folder's settings |
| `NN_name.meta.json`, `.meta.jsonc` | The sidecar of a diagram or artifact page |
| `index.md` | The folder's own page, below |
| Names starting with `.` | Hidden files, which agentks passes over |

A markdown file with no prefix is an error. A diagram or `.html` file with no prefix is only a warning, because it is then simply a file and not a page.

## How a page gets its URL

A page's URL is the section's base URL, then each folder's name and the file's name, with every prefix and the extension removed:

| File (section `data/guide`, base URL `/guide`) | URL |
|---|---|
| `05_getting-started/01_overview.md` | `/guide/getting-started/overview` |
| `05_getting-started/05_install.md` | `/guide/getting-started/install` |
| `10_concepts/10_architecture.mmd` | `/guide/concepts/architecture` |
| `10_concepts/20_q3-dashboard.html` | `/guide/concepts/q3-dashboard` |
| `10_concepts/15_deep/05_detail.md` | `/guide/concepts/deep/detail` |

Two more rules:

- **The section's own URL** leads to its first page. Opening `/guide` shows the first page in sidebar order.
- **An `index.md`** below the section root is the folder's own page. `10_concepts/index.md` is served at `/guide/concepts`, and a link to the folder `10_concepts/` lands on it.

Use lowercase names with hyphens, such as `05_getting-started`. The name is the URL, so a clear, short name gives a clear, short address.

## Order

Siblings sort by the number in their prefix, and folders and pages sort together. So in this folder:

```
10_concepts/
├── 05_links.md
├── 10_architecture.mmd
├── 15_deep/
└── 20_q3-dashboard.html
```

the sidebar shows Links, Architecture, the Deep folder, then Q3 Dashboard. To change the order, renumber with `agentks move`, which keeps the order visible in the file names.

Two siblings with the same number, such as `05_links.md` and `05_paths/`, or `05_` and `005_`, are an error. Give each its own number.

## How deep to nest

You can nest folders as deep as you like, and every page gets a URL. The sidebar draws folders down to five levels. In practice, two or three levels read best.

## Two files that want one URL

A markdown page, a diagram and an artifact with the same name after the prefix, such as `15_flow.md` and `16_flow.mmd`, all want the same URL. agentks keeps one and reports the others: the markdown page wins, then the diagram, then the artifact. The winner shows the collision error. Rename one of the files with `agentks move`.

## Addresses agentks keeps

agentks serves its own files at a few top-level paths: `/api`, `/client`, `/assets`, `/content-assets`, `/artifacts` and `/_lib`. A section cannot use one of them as its base URL, and a page whose URL would fall under one gets no URL and an error. The [configuration section](../35_configuration/01_overview.md) lists the rules for base URLs.

## Renaming and moving

A rename changes a URL, and every link that names the old file. Always rename with `agentks move`, which rewrites those links:

```bash
agentks move data/guide/10_concepts/05_links.md data/guide/10_concepts/07_links.md --dry-run
```

See [check, search and move](./25_check-search-and-move.md).
