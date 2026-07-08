---
title: Overview
description: AI-native knowledge + task system with a built-in issues tracker for solo builders and small teams.
---

# Overview

A knowledge + task system built for **the new world of software** — where one person, or a handful, ships alongside an AI agent instead of a PM, a scrum master, and a quarterly roadmap.

## Purpose

This is two things stitched together, intentionally:

1. **A memory system for AI.** The whole framework is shaped so Claude — or any coding agent — can read, write, and navigate your docs as its long-term memory of the project. Conventions, decisions, architecture, past bugs. Predictable folder layout, `NN_` numeric ordering, machine-readable frontmatter, and a built-in live editor mean an agent can pick up context on a cold start and keep adding to it as the work moves.
2. **An issues tracker designed for 1-person unicorns and 1–5-person teams.** No sprints, no planning poker, no ceremony. Each issue is a folder in your repo with subtasks, notes, and an agent-log — all markdown, all human-readable, all AI-writable. The tracker *is* the workflow.

Together they support the working model that's actually emerging: **AI + small team development.** One person (or a small group) with an agent replaces what used to need a full team. Docs that the agent reads, issues that the agent writes to — no overhead, full context every turn.

## Separation of Concerns

Your content sits at *your* project root. The framework ships as a single subfolder (`documentation-template/`) that contains all of its own files — code, bundled docs, `.env`, the `start` wrapper, plugins. You only edit what's at your project root.

```
your-docs-folder/                  # YOUR project root
├── config/                        # ← YOU EDIT — site/navbar/footer YAML
├── data/                          # ← YOU EDIT — docs · blog · issues · custom pages
├── assets/                        # ← YOU EDIT — logos, images
├── themes/                        # ← YOU EDIT — custom themes (optional)
│
└── documentation-template/        # the framework — clone or git submodule, self-contained
    ├── .env                       #   CONFIG_DIR=../config (reaches UP to YOUR config/)
    ├── start                      #   ./start dev | build | preview
    ├── astro-doc-code/            #   framework source — don't touch
    ├── default-docs/              #   framework's bundled content — don't touch
    │   ├── config/                #     bundled site config (used in dogfood mode only)
    │   ├── data/                  #     bundled content — including the user-guide
    │   │   ├── user-guide/        #     you're reading right now + dev-docs
    │   │   ├── dev-docs/
    │   │   └── …
    │   ├── assets/                #     bundled placeholder branding
    │   └── themes/                #     bundled themes (default available out of the box)
    └── plugins/                   #   framework's bundled plugins (skill + CLI tools)
```

**`default-docs/` is the framework's content, not yours.** It ships *inside* the framework folder so the bundled user-guide / dev-docs / themes / placeholder branding are available out of the box — your `site.yaml` references them via `@root/default-docs/...` (e.g. the `User Guide` nav item points at `@default-docs/user-guide`). When you ran `init`, the scaffold for *your* content (`config/`, `data/`, `assets/`, `themes/`) was placed at the project root *next to* (not inside) the framework folder.

### What's in `default-docs/`?

`default-docs/` serves three purposes for the framework — none of which involve the consumer editing it:

1. **Documentation of the framework itself** — the `user-guide` you're reading right now and the `dev-docs` (architecture, internals) live here. Updating them is part of releasing the framework.
2. **Dogfood / testbed platform** — when working *on the framework*, devs run the site against `default-docs/` as the active config to exercise every layout, content type, and edge case. New features land here first.
3. **Bundled defaults shipped to consumers** — the `init` template, the default themes, sample blog/issues/pages, and placeholder branding all live under `default-docs/` so consumers can reference them via `@root/default-docs/...` (e.g. include the framework's user-guide as a nav section in their own site, or extend a bundled theme).

So `default-docs/` is *the framework's own docs/test/template directory*, packaged with the install. Treat it as read-only from the consumer side.

### Two modes the framework supports

| Mode | Who uses it | `.env` `CONFIG_DIR` | What you edit |
|---|---|---|---|
| **Consumer** | Anyone using the framework to publish their own docs | `../config` (reaches up from framework folder to your project root) | `config/`, `data/`, `assets/`, `themes/` at your project root |
| **Dogfood / framework-dev** | People working on the framework itself | `./default-docs/config` (the bundled config) | `default-docs/config/`, `default-docs/data/`, etc. — i.e. the bundled docs |

The framework code is identical in both modes; only `CONFIG_DIR` and where the active content lives differ.

## Key Features

| Feature | Description |
|---------|-------------|
| **Zero Config Routing** | Folder structure = URL structure |
| **Content Types** | Docs, blogs, issues, custom pages — each with its own layout family |
| **Issues Tracker** | Folder-per-issue, subtasks + notes + agent-log, AI-writable end-to-end |
| **Live Editor** | In-browser multi-user editing over Yjs CRDT, real-time preview |
| **Modular Layouts** | Pick a style per content type; override with your own |
| **Theme System** | YAML token contract — primitive + semantic tiers, no invented names |
| **Auto Sidebar** | Generated from file positions via `NN_` prefixes |

## How It Works

1. **Define pages** in `config/site.yaml`.
2. **Write content** in `data/` as Markdown files — or let an agent do it.
3. **Customize theme** in `themes/` (optional).
4. **Build** and deploy anywhere.

## Quick Example

Create a doc at `data/docs/getting-started/01_hello.md`:

```md
---
title: Hello World
description: My first doc
---

# Hello World

Welcome to my documentation!
```

It automatically appears at `/docs/getting-started/hello` in the sidebar.

## What's Next?

1. **[Installation](/user-guide/getting-started/installation)** — set up your project
2. **[Configuration](/user-guide/configuration/overview)** — configure your site
3. **[Data Structure](/user-guide/getting-started/data-structure)** — understand your `data/` layout (docs sections, blog, issues, pages)
