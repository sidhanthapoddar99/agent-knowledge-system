---
name: agent-ks-docs
description: Use this skill for pages inside a docs section of an agent-knowledge-system project — markdown pages, NN_ prefixes, a folder's settings.json, frontmatter, relative links, callouts, mermaid, graphviz, excalidraw and draw.io diagram pages, artifact pages, the sidebar and the outline, screenshots and image optimization, and moving or renaming a page or a folder. Trigger it for any file under a docs section of data/, for "add a doc", "write documentation", "fix this link", "shrink these screenshots", and for a question about how a docs section is built. Not for a blog post (agent-ks-blog), the tracker under data/todo/ (agent-ks-issues), site config, a new section, themes or layouts (agent-ks-config), or building the HTML inside an artifact (agent-ks-artifacts).
---

# Documentation skill

**Source of truth.** The engine and the CLI decide anything they implement: commands, flags, field names, what renders. The bundled user guide at `@root/default-docs/data/user-guide/` is the source for a convention only. A convention is a rule the code does not enforce. `@root` is the framework folder. When this skill disagrees with the engine or the CLI, follow the code. Then update the skill and tell the user.

**Finding `data/`.** Run `agent-ks resolve-context` to resolve the configured `data/` path. Config selection is `--config-dir` > `AGENTKS_CONFIG_FOLDER` > `./config` from the current directory; a missing directory errors. See [installation and project selection](../agent-ks-cli/references/installation.md). Never assume `data/` sits at the current directory. `data/README.md` maps each top-level folder to its purpose and route. Read it on a structure task, such as moving a page between sections. The folder tree and the config live in [the config skill](../agent-ks-config/SKILL.md).

## Triage

Read only the file the task needs. A task that spans two rows reads both files.

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

## Never

| Never | Do instead |
|---|---|
| Write a site-absolute link (`/x`) or a backticked document path | A relative markdown link with a name: [writing.md](./references/writing.md#linking) |
| Skip the `NN_` prefix, a folder's `settings.json`, or a page's `title` | [docs-layout.md](./references/docs-layout.md#folder-structure) |
| Number siblings 01, 02, 03 | Gap-spaced prefixes, so an insert needs no renumber: [docs-layout.md](./references/docs-layout.md#gap-numbering) |
| Search content with `Grep` | `agent-ks find <regex>`. It knows the content root and every content type, so it needs no path. Use `Grep` for framework source code only |
| Rename or move with `mv` | `agent-ks move <from> <to>`. It rewrites every link |
| Commit a raw screenshot | Run `agent-ks img` first: [images.md](./references/images.md) |
| Put a page's image in the site `assets/` folder | An `assets/` folder beside the page. The image then moves with the page, and the link to it is correct on disk |
| Write MDX | Plain markdown with GFM extensions. The renderer is `marked`. It does not run components, so a component appears in the page as literal text |
| Rewrite an existing file with `Write`, or reorder JSON keys | `Edit` in place. `Write` replaces the whole file, so it drops every line you did not read back |
| Edit `site.yaml` to add a section | Hand the task to [the config skill](../agent-ks-config/SKILL.md) |

## The CLI

One entrypoint on `PATH`: `agent-ks <group> <verb> [flags]`. `agent-ks help` lists every command. `agent-ks help <group> <verb>` shows one command's flags. Do not guess a flag. Run the help command instead.

After adding or renaming a page, run `agent-ks check section <folder>`. It is the only gate that errors on a missing `title`.

Read a docs section with `agent-ks doc list [section]`. Read one page with `agent-ks doc show <path>`. Search a section's text with `agent-ks doc search <regex> [section]`. Use `agent-ks find <regex>` to search every content type at once. The contract, the exit codes and the project-selection rules live in [the cli skill](../agent-ks-cli/SKILL.md).

## Subagents

For a bulk read of ten or more files, hand a Haiku subagent the list and the question. The brief shape and the report size are in [09_operations.md](../agent-ks-issues/references/09_operations.md#delegate-bulk-reads).

## Keep the skill current

If this skill is wrong, update it and tell the user. Do not work around it. Update the user guide's skill catalogue page (`05_getting-started/05_claude-skills.md`) to match.
