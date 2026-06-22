---
name: documentation-guide
description: Use this skill for ANY work in a documentation-template project — writing markdown, working with the issue tracker (issues, subtasks, comments, agent-logs), creating blog posts, editing docs pages, configuring site.yaml / navbar.yaml / footer.yaml / .env, and anything touching files under the project's `data/` folder. The skill triages the task to a domain-specific reference file (writing, docs-layout, blog-layout, issues, settings-layout). TRIGGER eagerly — documentation work in this project almost always benefits from this skill. Use it whenever the user mentions docs, frontmatter, settings.json, the todo / issues tracker, blog posts, the data folder, content types, themes, or any file under the project's content folders. SKIP only for pure framework source-code work under `astro-doc-code/src/` that doesn't touch any documentation file.
---

# Documentation skill

Operating manual for working in an Astro-based documentation-template project. The project's content + config live under the user's `data/` and `config/` folders and render through Astro layouts shipped inside the `documentation-template/` framework folder. The framework's *own* bundled docs (the canonical user-guide for the framework itself) live at `documentation-template/default-docs/data/user-guide/` — read those when this skill is unclear.

> **Two modes.** *Consumer mode* (the default) — the framework is a subfolder of the user's project (`<project>/documentation-template/`) and the user's content lives at the project root (`config/`, `data/`, `assets/`, `themes/` next to the framework folder). *Dogfood mode* — the framework repo *is* the project; content lives under `default-docs/`. The scripts derive the actual location from `.env` (`CONFIG_DIR`), so this skill describes paths relative to **the user's content folders** and the underlying scripts handle both modes. Where this skill says `data/`, the script resolves to `<project>/data/` (consumer) or `<framework>/default-docs/data/` (dogfood).

> **Companion skill — `doc-agent`.** This plugin also ships a thin `doc-agent` skill with a *different trigger surface*: it covers **how to use an issue's `agent-log/`** and fires on the execution verbs — **audit / refactor / loop** (or any autonomous run), plus **agent-memory** (always) and **discussion** (explicit-save-only). This skill (`documentation-guide`) is the broad author/maintain manual; `doc-agent` is the narrow execution-time nudge that points back here. If you're running/recording work in `agent-log/`, that's `doc-agent`'s job; depth still lives in `references/layouts/issues/24_agent-logs.md`.

## Triage — which reference file to read

Pick the reference file that matches the task. Read **only the one(s) you need** — they're independent and self-contained.

| If the task involves… | Domain | Read |
|---|---|---|
| Writing markdown, frontmatter, custom tags, asset embedding (across any content type) | writing | `references/writing.md` |
| Files under `data/<sidebar-driven-section>/` (e.g. `user-guide/`, `dev-docs/`) | docs-layout | `references/layouts/docs-layout.md` |
| Files under `data/blog/` (flat `YYYY-MM-DD-<slug>.md`) | blog-layout | `references/layouts/blog-layout.md` |
| Files under `data/todo/` or any issue tracker (folder-per-item, `settings.json`, subtasks, comments, agent-logs) | issues | `references/layouts/issues/00_overview.md` (entry; drill into one sibling) |
| `site.yaml` / `navbar.yaml` / `footer.yaml` / `.env` / paths / themes / project setup | settings-layout | `references/settings-layout.md` |
| Optimizing / shrinking images or screenshots before committing (resize, grayscale, webp/avif, strip) | images | `references/images.md` |

Cross-cutting tasks read multiple references. Example: *"add a new docs section and write its first page"* → read `settings-layout.md` (registering the section) **and** `writing.md` (writing the page).

**Format migrations / legacy content** → see `references/doc-migration.md`. Reach for it when any of these surface: the user **explicitly asks to migrate / convert / upgrade** content to a new format; a **build error or validator warning points at a legacy, deprecated, old-format, or unknown frontmatter field** (e.g. a removed field still present in `.md` files); or the user asks to **"check legacy" / "does X need migrating?" / "is this the old format?"**. Keywords: *migrate, migration, legacy, deprecated, old format, convert content, upgrade format, backfill field, bulk frontmatter rewrite*. Migrations rewrite content in place — **always run the detect pass and confirm with the user before applying** (except when they explicitly asked to run it).

## Project orientation

**Consumer mode** (default) — the user's project root, with the framework as a subfolder:

```
<your-project>/                   ← user's project root
├── config/                       ← site.yaml, navbar.yaml, footer.yaml
├── data/                         ← all content (docs, blog, issues, custom)
│   ├── user-guide/               ← (your own user-guide, if any)
│   ├── blog/                     ← blog posts
│   ├── todo/                     ← issue tracker (folder-per-item)
│   └── README.md                 ← MAP of every top-level data folder (read first)
├── assets/                       ← static assets served at /assets/
├── themes/                       ← optional custom themes
├── layouts/                      ← optional custom layouts (with LAYOUT_EXT_DIR set)
└── documentation-template/       ← FRAMEWORK FOLDER — don't edit
    ├── start                     ← bash wrapper: `./start [dev|build|preview|<script>]`
    ├── .env                      ← CONFIG_DIR=../config (consumer) or ./default-docs/config (dogfood)
    ├── astro-doc-code/           ← framework code (src/, package.json, astro.config.mjs)
    │   └── src/layouts/          ← per-content-type layouts (docs, blog, issues, custom)
    ├── default-docs/             ← framework's bundled content (its own user-guide / dev-docs / themes / template)
    └── plugins/                  ← repo-local plugins (e.g. documentation-guide)
```

**Dogfood mode** — the framework repo *is* the project; the structure above collapses (no outer wrapper). Content lives under `documentation-template/default-docs/` and `CONFIG_DIR=./default-docs/config`. Same code path either way; only `CONFIG_DIR` differs.

**The most important rule:** the framework's bundled user-guide at `documentation-template/default-docs/data/user-guide/` is the **canonical source of truth** for everything this skill describes. When this skill is unclear, ambiguous, or stale, the user-guide wins. Each reference file points to its corresponding user-guide section.

## Read `data/README.md` first

Every project should have a `data/README.md` that maps the data layout — what each top-level folder contains, its purpose, and how it's served. **Read it at the start of any task** to learn the project's content shape. The framework supports `user-guide/`, `dev-docs/`, `blog/`, `todo/`, `pages/` out of the box, but a project may add custom ones (e.g. an `internal-knowledge-base/`, a separate `meeting-notes/`, etc.).

If `data/README.md` doesn't exist, **create one** before doing the requested task — the skill is far more useful when this map exists, and the cost is low. When you add or remove a top-level folder under `data/`, **update the README in the same change** so future agents (and humans) don't drift.

## Universal conventions

These apply across all domains. Reference files don't repeat them — they assume you know.

- **`NN_` prefix** — folders and files inside `data/<docs-section>/` use a numeric prefix for ordering, sorted by value so widths coexist (`05_`, `010_`, `110_`). Width is 2–5 digits, used as a tier: **`NN_` is the convention** (use it almost always); **`NNN_` only when there's a special requirement** — a section with many entries that needs the headroom, or grouping via the leading digit; **`NNNN_`/`NNNNN_` are very rare** — reach for them only when the user explicitly demands it or a case is genuinely exceptional. Never 1 digit or 6+. Gap-space them to leave room to insert. The **issue tracker** uses the same grammar but treats **both `NN_` and `NNN_` as conventional** — subtasks (files *and* grouping folders) reach for 3-digit freely (grouping via the leading digit, or many items), and `NN_`/`NNN_` are good *optional* conventions for `agent-log/` (CLI writes `NNN_`) and `notes/`; blog posts use no prefix. Full rules: `references/layouts/docs-layout.md` (docs) and `references/layouts/issues/23_subtasks.md` (tracker numbering).
- **`settings.json`** — every docs folder has one (sidebar label, position). Issue trackers have a root `settings.json` declaring vocabulary. Issues have a per-issue `settings.json` for metadata.
- **Frontmatter `title`** — required on every markdown file. Astro builds will fail without it.
- **Theme variables only** — when editing CSS in layouts, consume declared theme variables (see `astro-doc-code/src/styles/theme.yaml → required_variables`). Never hardcode colours, fonts, or invent variable names.
- **Edit, don't rewrite** — prefer `Edit` over `Write` for existing files. Surgical regex replaces preserve formatting and key order in JSON.
- **`./start` is the entrypoint** — from the repo root, `./start` (preflight: detect bun/npm → install if needed → sanity build → dev), or `./start dev | build | preview` to skip preflight and forward to that script. Inside `astro-doc-code/`, `bun run dev` / `bun run build` / `bun run preview` still work directly. For helper scripts and any Node CLI tool, prefer `bun` if available, fall back to `npm` / `node`.
- **Never commit raw screenshots** — images bloat git history, which caps repo size (~1–2 GB *with* every version kept). Run `docs-img` on any image you add under `data/` (undo capture-DPR, grayscale, re-encode to webp, strip metadata) so figures stay ≈ 60–100 KB instead of MBs. See `references/images.md`.

## Helper CLI — use `docs-guide`

> [!IMPORTANT]
> This plugin ships a single command-line entrypoint, **`docs-guide`**, on `PATH` (added automatically on install). Every operation is a subcommand: **`docs-guide <group> <verb> [flags]`** — e.g. `docs-guide issue list`, `docs-guide find <regex>`, `docs-guide check issues`, `docs-guide git updated <path>`.
>
> - **Discover, don't guess:** `docs-guide help` lists everything grouped · `docs-guide help <group> <verb>` shows one command's flags · `docs-guide help --json` dumps the manifest.
> - **Uniform contract:** every command takes `--help`/`-h` (→ stdout, exit 0) and `--json` where it returns data; exit codes `0` ok · `1` no-result/handled-error · `2` usage.
> - **Full command + option reference:** [`references/cli-toolkit.md`](references/cli-toolkit.md) — every group, command, and flag.
>
> **Legacy `docs-<name>` scripts are retired.** Earlier versions exposed flat binaries (`docs-list`, `docs-check-blog`, …); everything is now `docs-guide <group> <verb>`. If you encounter old `docs-<name>` invocations in a project's `CLAUDE.md`, agent memory, or scripts, **update them to the `docs-guide` form (and remove the stale references)** as you go.

**Searching the tracker — use `docs-guide issue list` (or `docs-guide find`), not the `Grep` tool.** Any "find / locate / grep / search" verb against `data/todo/` routes to `docs-guide issue list`, which understands the schema (vocabulary, subtask states, frontmatter) and composes structural filters with regex search in one call. For a string anywhere across **all** content types at once, use `docs-guide find`. `Grep` only sees text. See `references/layouts/issues/41_searching.md` and the full toolkit reference above.

## Slash commands — bootstrap & section scaffolding

The plugin ships two slash commands for project-level scaffolding:

| Command | What it does |
|---|---|
| `/docs-init` | Bootstrap a new documentation-template project from zero — interactive: scope (whole repo vs subfolder) → site name/title/description → first section name → writes `config/`, `data/`, starter page, README, patches `CLAUDE.md` at the repo root. Prints the framework-clone command at the end. |
| `/docs-add-section [name]` | Add a new top-level docs section under `data/`. Auto-computes next `NN_` prefix, creates `settings.json` + `01_overview.md`, optionally registers in `config/site.yaml`'s `pages:` block. |

When the user says "set up a new docs project", "scaffold a new site", "add a new section / area / handbook", route to these commands rather than hand-authoring.

## When to spawn a subagent

For bulk file reads (10+ files), spawn a Haiku subagent via the Task/Agent tool to summarise rather than loading every file into the main context. Pattern: give the subagent the file list + the question, ask for a tight report (under 200 words).

The reference files (especially `layouts/issues/41_searching.md`) document concrete subagent patterns for their domain.

## When to update this skill

This skill mirrors the framework's bundled user-guide. If you discover the skill is wrong or out of date relative to the user-guide, **update the skill** rather than working around it — and tell the user. The skill catalogue page (`@root/default-docs/data/user-guide/05_getting-started/05_claude-skills.md` — i.e. inside the framework folder) is the user-facing index of installed skills; keep it in sync.
