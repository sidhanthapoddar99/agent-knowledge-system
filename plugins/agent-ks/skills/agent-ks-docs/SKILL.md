---
name: agent-ks-docs
description: Use this skill for ANY non-tracker content work in an agent-knowledge-system project — writing markdown, creating blog posts, editing docs pages, configuring site.yaml / navbar.yaml / footer.yaml / .env, themes, image optimization, and anything touching files under the project's `data/` folder EXCEPT the issue tracker. The skill triages the task to a domain-specific reference file (writing, docs-layout, blog-layout, settings-layout, images). TRIGGER eagerly — documentation work in this project almost always benefits from this skill. Use it whenever the user mentions docs, frontmatter, settings.json, blog posts, the data folder, content types, or themes. For the issue tracker (data/todo/ — issues, subtasks, comments, brainstorms, agent-logs, the dump) use the agent-ks-issues skill instead. SKIP only for pure framework source-code work under `astro-doc-code/src/` that doesn't touch any documentation file.
---

# Documentation skill

Operating manual for content and config work in an agent-knowledge-system project. Content lives under the project's `data/` and `config/` folders and renders through Astro layouts shipped in the `agent-knowledge-system/` framework folder.

**Canonical source of truth:** the framework's bundled user-guide at `agent-knowledge-system/default-docs/data/user-guide/`. When this skill is unclear or stale, the user-guide wins, and the skill should then be updated (tell the user).

**Two modes, one code path.** *Consumer mode* — the framework is a subfolder of the user's project and content sits at the project root. *Dogfood mode* — the framework repo is the project and content lives under `default-docs/`. The scripts read `.env` (`CONFIG_DIR`) to find the content, so this skill says `data/` and the script resolves it. The full tree is in [settings-layout.md §1](./references/settings-layout.md#1-project-structure).

**Sibling skills.** `agent-ks-issues` owns the whole issue tracker: issues, subtasks, comments, brainstorms, notes, plans, agent logs, agent memory, the vocabulary, the dump, and the execution verbs (audit / refactor / loop / discuss) against a tracked issue. `agent-ks-artifacts` owns building HTML artifacts. Load those for that work; this skill covers everything else.

## Triage — which reference file to read

Read **only the one(s) you need**. They are independent.

| If the task involves… | Read |
|---|---|
| Writing markdown, frontmatter, **links**, callouts, diagrams, assets, `[[path]]` embedding — any content type | [`references/writing.md`](./references/writing.md) |
| Files under `data/<sidebar-driven-section>/` (`user-guide/`, `dev-docs/`, …): prefixes, `settings.json`, diagram and artifact pages, `agent-ks move` | [`references/layouts/docs-layout.md`](./references/layouts/docs-layout.md) |
| Files under `data/blog/` (flat `YYYY-MM-DD-<slug>.md`) | [`references/layouts/blog-layout.md`](./references/layouts/blog-layout.md) |
| `site.yaml` / `navbar.yaml` / `footer.yaml` / `.env` / paths / themes / project setup | [`references/settings-layout.md`](./references/settings-layout.md) |
| Shrinking images or screenshots before committing | [`references/images.md`](./references/images.md) |
| Every `agent-ks` command and flag | [`references/cli-toolkit.md`](./references/cli-toolkit.md) |
| Migrating content to a new format; a build error or validator warning naming a legacy field; "does X need migrating?" | [`references/doc-migration.md`](./references/doc-migration.md) |
| Files under `data/todo/` or any issue tracker | **the `agent-ks-issues` skill** |
| Building an HTML artifact (report, dashboard, data-viz, design system) | **the `agent-ks-artifacts` skill** |

Cross-cutting tasks read more than one. *"Add a docs section and write its first page"* → `settings-layout.md` (register the section) and `writing.md` (write the page).

**Artifact pages in a docs section.** An `NN_`-prefixed `.html` file is a first-class page with an optional `.meta.json` sidecar. Placement and the sidecar: `docs-layout.md`. Building the HTML: the `agent-ks-artifacts` skill.

**Migrations rewrite content in place.** Always run the detect pass and confirm with the user before applying, unless they explicitly asked to run it. Never bump `engine_version` past the gate without running the chain. Details: `doc-migration.md`.

## Read `data/README.md` first

Every project should have a `data/README.md` mapping the data layout: what each top-level folder holds and how it is served. **Read it at the start of any task.** If it does not exist, create one before the requested task. When you add or remove a top-level folder under `data/`, update the README in the same change.

## Universal conventions

Reference files assume these.

- **`NN_` ordering prefix** on docs folders and files. 2–5 digits, sorted by numeric value, gap-spaced. `NN_` is the convention; wider only on a real need. Blog uses no prefix; the tracker is looser (see `agent-ks-issues`). Full rules: [docs-layout.md](./references/layouts/docs-layout.md).
- **`settings.json`** in every docs folder (label, position). May be `settings.jsonc` (comments + trailing commas); `.jsonc` wins when both exist.
- **Links are relative, and a link, never a backticked path or a leading `/`.** Assets included. This is the project's load-bearing principle, not a style. The rule, the reasons and the ordering label: [writing.md → Linking](./references/writing.md#linking).
- **Frontmatter `title`** on every markdown file.
- **Theme variables only** in layout CSS. Consume `astro-doc-code/src/styles/theme.yaml → required_variables`; never hardcode colours or invent names.
- **Edit, don't rewrite.** Prefer `Edit` over `Write` for existing files; keep JSON key order.
- **`./start` is the entrypoint** at the framework root: `./start` runs the dev server; `./start build | preview | doctor` for the rest. Inside `astro-doc-code/`, `bun run dev | build | preview` work directly.
- **Never commit a raw screenshot.** Run `agent-ks img` first. See [images.md](./references/images.md).

## The CLI — `agent-ks`

> [!IMPORTANT]
> One entrypoint on `PATH`: **`agent-ks <group> <verb> [flags]`** — e.g. `agent-ks find <regex>`, `agent-ks check section <dir>`, `agent-ks move <from> <to>`.
>
> - **Discover, don't guess:** `agent-ks help` lists everything · `agent-ks help <group> <verb>` shows one command's flags · `agent-ks help --json` dumps the manifest.
> - **Uniform contract:** `--help` everywhere; `--json` where a command returns data; exit codes `0` ok · `1` no-result or handled error · `2` usage.
> - **Every command and flag:** [`cli-toolkit.md`](./references/cli-toolkit.md).
> - **Inside a git worktree** the `.env` search stops at the worktree root. Write a worktree-local `.env` or pass explicit paths before any command that writes.

**Search content with `agent-ks find`, not the `Grep` tool.** It searches every content type at once. Tracker search (`agent-ks issue list`) is the `agent-ks-issues` skill's.

## Slash commands

| Command | What it does |
|---|---|
| `/agent-ks-init` | Bootstrap a new project from zero: scope, site name, first section; writes `config/`, `data/`, a starter page, README, and patches `CLAUDE.md`. |
| `/agent-ks-add-section [name]` | Add a top-level docs section under `data/`: next `NN_` prefix, `settings.json`, `01_overview.md`, optional `site.yaml` registration. |

When the user says "set up a new docs project" or "add a new section / handbook", route to these rather than hand-authoring. The two tracker commands (`/agent-ks-quick-idea-note`, `/agent-ks-fast-index-check`) are documented in the `agent-ks-issues` skill.

## Subagents

For bulk reads (10+ files), hand the file list and the question to a Haiku subagent and ask for a report under 200 words. Patterns: the `agent-ks-issues` skill's `41_searching.md`.

## When to update this skill

This skill mirrors the bundled user-guide. If it is wrong or out of date, **update the skill** rather than working around it, and tell the user. Keep the skill catalogue page (`@root/default-docs/data/user-guide/05_getting-started/05_claude-skills.md`) in sync.
