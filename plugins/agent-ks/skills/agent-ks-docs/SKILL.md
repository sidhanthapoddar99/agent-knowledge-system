---
name: agent-ks-docs
description: Use this skill for pages inside a docs section of an agent-knowledge-system project: markdown pages, NN_ prefixes, a folder's settings.json, frontmatter, links, callouts, diagrams, diagram and artifact pages, images, and moving or renaming a page. Trigger it for any file under a docs section of data/, and for a question about how a docs section is built. Not for a blog post (agent-ks-blog), the tracker under data/todo/ (agent-ks-issues), site config, a new section, themes or layouts (agent-ks-config), or building an HTML artifact (agent-ks-artifacts).
---

# Documentation skill

Docs pages only: how a docs section is laid out, and how a page inside it is written.

**Source of truth.** The bundled user guide at `@root/default-docs/data/user-guide/` wins over this skill. `@root` is the framework folder. When the two disagree, follow the guide, update the skill, and tell the user.

**Two modes, one code path.** Consumer mode: the framework is a subfolder of the user's project. Dogfood mode: the framework repo is the project, and content lives under `default-docs/`. The CLI resolves the real `data/` path from `CONFIG_DIR` in `.env`. The tree and the config: [the config skill](../agent-ks-config/SKILL.md).

## Triage

Read only the file the task needs. A cross-cutting task reads more than one.

| Task | Read |
|---|---|
| Write markdown: frontmatter, links, callouts, diagrams, assets, embeds | [writing.md](./references/writing.md) |
| A docs section: prefixes, `settings.json`, diagram and artifact pages, `move` | [docs-layout.md](./references/docs-layout.md) |
| Shrink an image before a commit | [images.md](./references/images.md) |
| Any `agent-ks` command or flag | [cli-toolkit.md](../agent-ks-cli/references/cli-toolkit.md) |
| A blog post | [the blog skill](../agent-ks-blog/SKILL.md) |
| Files under `data/todo/` or any issue tracker | [the issues skill](../agent-ks-issues/SKILL.md) |
| A new section, `site.yaml`, a route, a theme, a layout, a version-gate error | [the config skill](../agent-ks-config/SKILL.md) |
| Build an HTML artifact | [the artifacts skill](../agent-ks-artifacts/SKILL.md) |

## Read `data/README.md` first

`data/README.md` maps each top-level `data/` folder to its purpose and route. Read it first on every task; create it if it is missing.

## Never

| Never | Do instead |
|---|---|
| Write a site-absolute link (`/x`) or a backticked document path | A relative markdown link with a name: [writing.md](./references/writing.md#linking) |
| Skip the `NN_` prefix, a folder's `settings.json`, or a page's `title` | [docs-layout.md](./references/docs-layout.md#folder-structure) |
| Number siblings 01, 02, 03 | Gap-spaced prefixes, so an insert needs no renumber: [docs-layout.md](./references/docs-layout.md#gap-numbering) |
| Search content with `Grep` | `agent-ks find <regex>` |
| Rename or move with `mv` | `agent-ks move <from> <to>`. It rewrites every link |
| Commit a raw screenshot | `agent-ks img` first: [images.md](./references/images.md) |
| Put a page's image in the site `assets/` folder | An `assets/` folder beside the page |
| Write MDX | Plain markdown with GFM extensions |
| Rewrite an existing file with `Write`, or reorder JSON keys | `Edit` in place |
| Edit `site.yaml` to add a section | Route it to [the config skill](../agent-ks-config/SKILL.md) |

## The CLI

One entrypoint on `PATH`: `agent-ks <group> <verb> [flags]`. `agent-ks help` lists every command; `agent-ks help <group> <verb>` shows one command's flags. Do not guess a flag. The contract, exit codes and the git-worktree note: [the cli skill](../agent-ks-cli/SKILL.md).

## Subagents

For a bulk read of ten or more files, hand a Haiku subagent the list and the question. Ask for a report under 200 words. Patterns: [09_operations.md](../agent-ks-issues/references/09_operations.md).

## Keep the skill current

If this skill is wrong, update it and tell the user; do not work around it. Keep the user guide's skill catalogue page (`05_getting-started/05_claude-skills.md`) in step.
