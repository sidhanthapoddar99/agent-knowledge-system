---
title: "Getting started"
description: "What agentks is, and the shortest path from nothing to a running project."
---

This section takes you from nothing to a running agentks project in a few minutes. You install one program, create a project, open it in your browser and connect an AI agent to it.

## What agentks is

agentks is a local tool for writing and reading documentation that AI agents and people share. It turns a folder of plain files into a site you can browse: docs, an issue tracker, blog posts, custom pages, diagrams, HTML artifacts and video artifacts.

It is **one program per machine**, called `agentks`. That one binary holds the command-line tool, the engine that reads your files, and the local server that shows them in a browser. One install serves every project on the machine.

**The files are the product.** A project is an ordinary folder of markdown, YAML and JSON. It opens cleanly in Obsidian, in any editor, with `grep` or with `cat`. The site is one way to read those files. Nothing in a page is written for the site's sake: links are relative paths that are true on disk.

**An AI agent writes most of the content.** You read it, review it and make small edits. So the commands matter as much as the site: an agent searches, checks, creates and moves content through `agentks` commands, and a plugin of skills teaches it the conventions.

```mermaid
[[./assets/how-agentks-fits.mmd]]
```

## The short version

On Linux or macOS:

```sh
curl -fsSL https://agentks.neuralabs.org/install.sh | sh
agentks init
cd docs
agentks start
```

The first line installs `agentks`. `agentks init` creates a project in a new folder called `docs`. `agentks start` serves it and prints the address to open, such as `http://localhost:20412/`. The pages below explain each step and what you can change.

## The pages in this section

| Page | What you get |
|---|---|
| [Install and update agentks](./05_install.md) | The binary on your PATH, automatic updates, and how to pin a version or turn updates off |
| [Create your first project](./10_first-project.md) | A new project from a template with `agentks init` |
| [The project folder](./15_project-folder.md) | What each file and folder in a project is for, and what to commit |
| [Run the local server](./20_local-server.md) | `agentks start`, `stop`, `ps` and `logs`, and how ports work |
| [Use agentks with AI agents](./25_using-with-ai.md) | The agentks plugin, its skills, and the commands an agent uses |
| [The machine home and cleanup](./30_machine-home.md) | What agentks keeps in `~/.agentks/`, and how to free space |

## Where to go next

Once the project runs, these sections teach the daily work:

- [Writing content](../10_writing-content/01_overview.md): pages, links, embeds, images and diagrams.
- [The issue tracker](../30_issue-tracker/01_overview.md): issues, subtasks, plans and agent logs, one folder per issue.
- [Configuration](../35_configuration/01_overview.md): every file in `config/`.
- [Editing and sharing](../50_editing-and-sharing/01_overview.md): changing a page in the browser, and letting someone else in.
- [The CLI reference](../65_cli-reference/01_overview.md): every command and flag.
