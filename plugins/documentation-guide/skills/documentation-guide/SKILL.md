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

## Helper scripts — 28 CLI commands on PATH

This plugin ships 28 CLI commands in its `bin/` folder, which Claude Code adds to `PATH` automatically when the plugin is installed. Just type the command — no path needed.

**Two equivalent forms.** Every command works as a `docs <group> <verb>` subcommand *and* as a flat `docs-*` alias (the alias prefix avoids colliding with other plugins' binaries). `docs issue list` ≡ `docs-list`; `docs git updated` ≡ `docs-git-updated`. Top-level verbs (`docs find`, `docs move`, `docs img`) have no group.

**Discover with `docs help` — don't guess.** `docs help` lists every command grouped; `docs help <command>` shows one command's flags; `docs help --json` dumps the whole manifest. The contract is uniform across **all** commands: `--help`/`-h` → stdout, exit 0; `--json` wherever data is returned; exit codes `0` ok · `1` no-result/handled-error · `2` usage. The spec is `scripts/CONTRACT.md`; the single source of truth for the surface is `scripts/_manifest.mjs`.

**General / cross-content (5):**

| Command (alias) | What it does |
|---|---|
| `docs help` (`docs-help`) | List commands, show one command's flags, or dump the manifest (`--json`) |
| `docs find` (`docs-find`) | Schema-agnostic regex search across **all** content (docs+blog+issues+config) in one call — `--meta` (structured layer only), `--path`, `--type docs,blog,issues,config`, `--count`, `--paths-only`. Complements the per-type, schema-aware `*-search` commands |
| `docs move` (`docs-move`) | Link-aware move / rename (see "Content ops" detail below) |
| `docs img` (`docs-img`) | Optimize images / screenshots (see "Images" detail below) |
| `docs resolve-context` (`docs-resolve-context`) | Emit the `.env`-derived content/config/data dirs (`KEY=value` or `--json`) — lets non-JS scripts skip re-implementing `.env` discovery |

**Issue tracker (8) — `docs issue …`:**

| Command | What it does |
|---|---|
| `docs-list` | Multi-field filter + free-text regex search over the tracker. Scope with `--path` (match path text) / `--meta` (frontmatter + JSON only) / `--count` |
| `docs-show` | One issue's metadata + subtask summary + comment & agent-log heads (`--full` for bodies) |
| `docs-subtasks` | List subtasks for one issue, or across all (`--all`) |
| `docs-agent-logs` | Last N agent-log entries for an issue |
| `docs-set-state` | Update issue or subtask state |
| `docs-add-comment` | Append a comment with auto-incremented prefix |
| `docs-add-agent-log` | Append an agent-log entry with auto-incremented iteration |
| `docs-review-queue` | Items awaiting review (status=review issues + open issues with review subtasks) |

**Validators (5) — `docs check …` (exit `0` clean / `1` errors; all support `--json`):**

| Command | What it does |
|---|---|
| `docs-check-blog` | Validate the blog folder — `YYYY-MM-DD-<slug>.md` naming, frontmatter `title:`, no nested folders. Resolves the blog path from `.env` (`<content-root>/blog/`); pass an explicit folder to override. See `references/layouts/blog-layout.md`. |
| `docs-check-config` | Validate `site.yaml` / `navbar.yaml` / `footer.yaml` — required keys, `pages:` structure, `data:` path resolution, footer `page:` references. Resolves the config dir from `.env`; pass an explicit folder to override. See `references/settings-layout.md`. |
| `docs-check-section` | Validate a docs section — `NN_` prefix discipline, `settings.json` presence, frontmatter `title:`, prefix collisions. Required arg: section folder (e.g. `data/user-guide`). See `references/layouts/docs-layout.md`. |
| `docs-check-issues` | Validate the **issue tracker** — schema, vocabulary, subtask states, multi-component hint-warnings. Use this on `data/todo/`, not `docs-check-section`. See `references/layouts/issues/00_overview.md`. |
| `docs-check-skill-links` | Maintainer tool: verify relative links between this skill's `.md` files resolve. |

**Docs + blog content (6) — `docs doc …` / `docs blog …`:**

| Command | What it does |
|---|---|
| `docs-doc-list` / `docs-doc-show` / `docs-doc-search` | List / inspect (frontmatter) / regex-search sidebar doc pages; `list` and `search` take an optional `[section]`. The schema-aware peer of `docs find` for the docs content type. |
| `docs-blog-list` / `docs-blog-show` / `docs-blog-search` | List (newest first) / inspect / regex-search blog posts. |

**Git-derived content metadata (4) — `docs git …`:**

| Command | What it does |
|---|---|
| `docs-git-updated <path>` | Last-commit date/author/subject for any issue/doc/post (the same git history the tracker derives `updated` from). |
| `docs-git-changed --since <ref>` | Content changed under `data/` since a ref — for review sweeps. `--type docs,blog,issues` narrows scope. |
| `docs-git-log <issue\|path>` | Commit history of one content folder/file (`--limit N`). |
| `docs-git-commit --scope <path> --message <msg>` | **Guarded**: stages + commits **only** that path with the given message. Never pushes; commit stays explicit; `--dry-run` shows the scoped change set. |

**Content ops detail — `docs-move`:** move / rename a docs `.md` file or folder **link-aware** — rewrites every Markdown link that pointed at the moved path (inbound) and every relative link inside the moved files that pointed elsewhere (outbound) — including link **text** that mirrors the path — so nothing breaks or goes stale. Whenever you move or rename anything under `data/`, reach for `docs-move <from> <to>` instead of `mv` / `git mv`. `--dry-run` previews; uses `git mv` inside a work tree to preserve history. See `references/layouts/docs-layout.md`.

**Images detail — `docs-img`:** optimize images so git stays small — `--dpr N` (undo retina capture, the biggest free win), `--scale`/`--max-dim`/`--trim`, `--gray`, re-encode `--format webp\|avif\|png\|jpg` at `--quality`, `--strip`, and `--target-size 100KB` (steps quality until each file fits). In-place with an automatic backup (or `--out DIR`); `--rewrite-links` fixes `![](…)` when the extension changes; `--report` prints before/after sizes. Needs ImageMagick; it **only optimizes, never captures**. `--dry-run` previews. See `references/images.md`.

Each command internally uses `bun` if available, falls back to `node`. Always reach for `docs help` to discover commands and flags rather than guessing.

**Searching the tracker — use `docs-list --search` (or `docs find`), not the `Grep` tool.** Any "find / locate / grep / search" verb against `data/todo/` (or any tracker folder) should route to `docs-list`, which understands the schema (vocabulary, subtask states, frontmatter), composes structural filters with regex search in one call, and returns exact paths + line numbers. For a string anywhere across **all** content types at once, use `docs find`. `Grep` only sees text. See `references/layouts/issues/41_searching.md` for the synonym list and examples.

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
