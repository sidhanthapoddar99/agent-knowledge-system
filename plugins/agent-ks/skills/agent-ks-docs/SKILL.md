---
name: agent-ks-docs
description: Use this skill for content and config work in an agent-knowledge-system project outside the issue tracker: markdown pages, blog posts, docs sections, frontmatter, settings.json, site.yaml, navbar.yaml, footer.yaml, .env, themes, images, and format migrations. Trigger it for any file under the project's data/ folder except the tracker; for data/todo/ use agent-ks-issues. For an HTML artifact use agent-ks-artifacts. Skip it only for framework source code that touches no documentation file.
---

# Documentation skill

**Source of truth.** The bundled user guide at `@root/default-docs/data/user-guide/` wins over this skill. `@root` is the framework folder. When the two disagree, follow the guide, update the skill, and tell the user.

**Two modes, one code path.** Consumer mode: the framework is a subfolder of the user's project. Dogfood mode: the framework repo is the project, and content lives under `default-docs/`. The CLI resolves the real `data/` path from `CONFIG_DIR` in `.env`. The tree: [settings-layout.md](./references/settings-layout.md#project-structure).

## Triage

Read only the file the task needs. A cross-cutting task reads more than one.

| Task | Read |
|---|---|
| Write markdown: frontmatter, links, callouts, diagrams, assets, embeds | [writing.md](./references/writing.md) |
| A docs section: prefixes, `settings.json`, diagram and artifact pages | [docs-layout.md](./references/docs-layout.md) |
| A blog post | [docs-layout.md, Blog](./references/docs-layout.md#blog) |
| Config files, `.env`, aliases, themes, project setup | [settings-layout.md](./references/settings-layout.md) |
| Shrink an image before a commit | [images.md](./references/images.md) |
| A version-gate error or a legacy-field warning | [doc-migration.md](./references/doc-migration.md) |
| Any `agent-ks` command or flag | [cli-toolkit.md](../agent-ks-cli/references/cli-toolkit.md) |
| Files under `data/todo/` or any issue tracker | [the issues skill](../agent-ks-issues/SKILL.md) |
| Build an HTML artifact | [the artifacts skill](../agent-ks-artifacts/SKILL.md) |

## Read `data/README.md` first

`data/README.md` maps each top-level `data/` folder to its purpose and route. Read it first on every task; create it if it is missing. Update it when you add or remove a top-level folder.

## Never

| Never | Do instead |
|---|---|
| Write a site-absolute link (`/x`) or a backticked document path | A relative markdown link with a name: [writing.md](./references/writing.md#linking) |
| Skip the `NN_` prefix, a folder's `settings.json`, or a page's `title` | [docs-layout.md](./references/docs-layout.md#folder-structure) |
| Search content with `Grep` | `agent-ks find <regex>` |
| Rename or move with `mv` | `agent-ks move <from> <to>` |
| Commit a raw screenshot | `agent-ks img` first: [images.md](./references/images.md) |
| Apply a migration without a detect pass and the user's go-ahead | [doc-migration.md](./references/doc-migration.md) |
| Bump `engine_version` past the gate | Run the migration chain first |
| Hardcode a colour, font or spacing in layout CSS | The variables in `theme.yaml → required_variables` |
| Write MDX | Plain markdown with GFM extensions |
| Rewrite an existing file with `Write`, or reorder JSON keys | `Edit` in place |

## The CLI

One entrypoint on `PATH`: `agent-ks <group> <verb> [flags]`. `agent-ks help` lists every command; `agent-ks help <group> <verb>` shows one command's flags. Do not guess a flag. The contract, exit codes and the git-worktree note: [the cli skill](../agent-ks-cli/SKILL.md).

`./start` at the framework root runs the dev server; its other verbs are `build`, `preview` and `doctor`.

## Command skills

Route "set up a new project" to [agent-ks-init](../agent-ks-init/SKILL.md) and "add a section" to [agent-ks-add-section](../agent-ks-add-section/SKILL.md). Do not author these by hand.

## Subagents

For a bulk read of ten or more files, hand a Haiku subagent the list and the question. Ask for a report under 200 words. Patterns: [09_operations.md](../agent-ks-issues/references/09_operations.md).

## Keep the skill current

If this skill is wrong, update it and tell the user; do not work around it. Keep the user guide's skill catalogue page (`05_getting-started/05_claude-skills.md`) in step.
