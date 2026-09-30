---
title: "The project folder"
description: "What each file and folder in an agentks project is for, what you commit, and what agentks keeps outside the project."
---

This page is a map of a project: which files you edit, which files agentks writes, what to commit, and what lives outside the project.

## A project is a folder that holds config/

Every agentks project has a `config/` folder. The folder that holds it is the **project root**. agentks finds a project by its `config/` folder, and everything else is placed by the files inside it. A project holds only your files: no program code and no per-project install. The one `agentks` binary on your machine serves every project.

Here is a project as `agentks init` might create it. Your template decides the folder names. This one keeps its sections under `data/`:

```
docs/                         the project root
├── config/
│   ├── site.yaml             the site's name, its sections, theme and port
│   ├── navbar.yaml           the top navigation bar
│   ├── footer.yaml           the footer
│   ├── dep.yaml              the libraries the project uses, even when none
│   ├── dep.lock              the exact library versions, written by agentks
│   ├── .env.example          documents the local overrides
│   └── .env                  your local overrides; optional, never committed
├── data/
│   ├── guide/                a docs section
│   ├── blog/                 a blog section
│   └── todo/                 an issue tracker section
├── assets/                   the logo and favicon that site.yaml names
├── Dockerfile                a starting point for publishing the site
└── .gitignore
```

## The config folder

| File | Holds | Written by | Commit it |
|---|---|---|---|
| `site.yaml` | Site identity, content version, sections, theme, logo, port | You | Yes |
| `navbar.yaml` | Navbar style and links | You | Yes |
| `footer.yaml` | Footer style, link columns, copyright | You | Yes |
| `dep.yaml` | The libraries the project uses. Required, even as `libraries: {}` | You, or `agentks library add` | Yes |
| `dep.lock` | The exact commit of every git library | agentks only | Yes |
| `.env.example` | Every key `.env` may set, documented | You | Yes |
| `.env` | Local overrides, such as the port | You | No |

`site.yaml`, `navbar.yaml`, `footer.yaml` and `dep.yaml` must all exist. A missing one stops agentks with an error that names the file and what to put in it. [Configuration](../35_configuration/01_overview.md) documents every key.

## Sections

A **section** is one part of the site: a set of docs, a blog, an issue tracker or a custom page. Each entry under `pages:` in `site.yaml` declares one section: its type, its address on the site, and the folder that holds its files. So a section's folder can have any name and sit anywhere inside the project.

| Type | Its folder holds | Learn more |
|---|---|---|
| `docs` | A tree of pages ordered by `NN_` prefixes, with a `settings.json` in every folder | [Docs](../15_docs/01_overview.md) |
| `blog` | Posts named `YYYY-MM-DD-<slug>.md` | [Blog](../20_blog/01_overview.md) |
| `issues` | One folder per issue | [The issue tracker](../30_issue-tracker/01_overview.md) |
| `custom` | One YAML file that feeds a built-in page, such as a home page | [Custom pages](../25_custom-pages/01_overview.md) |

[Sections](../35_configuration/10_sections.md) shows how to add one.

## Assets

A page's own images, diagrams and data files go in an `assets/` folder **beside that page**, at any depth. They move with the page, and the page links to them with a relative path that is true on disk. [Writing content](../10_writing-content/01_overview.md) covers this.

The project-level `assets/` folder in the example holds only the files the config names, such as the logo and the favicon.

## What agentks keeps outside the project

agentks keeps its working files in one folder per machine, `~/.agentks/`, called the **machine home**: rendered pages it has cached, the libraries it has downloaded, the records of running servers, and the port it picked for each project. None of it belongs in git, and none of it is content. Deleting it costs only time: agentks rebuilds or downloads it again. [The machine home and cleanup](./30_machine-home.md) explains it.

## What to commit

Commit everything in the project except these:

| Do not commit | Why |
|---|---|
| `config/.env` | It holds settings for your machine only |
| `dist/` | `agentks build` writes the static site there. It is output, not source |

The default template's `.gitignore` already lists both. Commit `config/dep.lock`, even though agentks writes it: it is what makes every machine install the same library versions.

## Several projects

Each project is independent. It has its own `config/`, its own sections and its own port. You can run several at once, and `agentks ps` lists them all. See [Run the local server](./20_local-server.md).

## Next

[Run the local server](./20_local-server.md).
