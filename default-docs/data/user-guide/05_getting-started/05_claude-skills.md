---
title: Claude Code Plugin
description: AI-powered skill, CLI wrappers, and slash commands for working with documentation-template via Claude Code.
---

# Claude Code Plugin

This template ships its own **Claude Code plugin** — `documentation-guide` — that teaches Claude how to work inside this project without you having to explain the conventions every time. It bundles:

- **2 skills** — `documentation-guide` (triages every docs/blog/config/writing task to a domain-specific reference) and `doc-issues` (the complete, self-contained issue-tracker skill — anatomy, rules, agent-logs, agent-memory, and the execution verbs)
- **28 CLI commands** auto-added to `$PATH` — issue tracker, validators, docs/blog content, git metadata, and cross-content search (one `docs-guide` entrypoint; every operation is a `docs-guide <group> <verb>` subcommand)
- **2 slash commands** for project-level scaffolding (`/docs-init`, `/docs-add-section`)

You install it from a marketplace once and Claude Code picks it up across every project on your machine. The plugin is distributed via [`sids-plugin-marketplace`](https://github.com/sidhanthapoddar99/sids-plugin-marketplace).

## Install

Three commands. The first two are one-time per marketplace and per project; the third refreshes the cache.

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install documentation-guide@sids-plugin-marketplace
/reload-plugins
```

> [!note] Local install while developing
> If you're iterating on the plugin itself (or testing changes before pushing), point the marketplace at a local clone of `sids-plugin-marketplace` (with your in-progress edits to its `marketplace.json`) instead of the GitHub shorthand:
> ```
> /plugin marketplace add /absolute/path/to/sids-plugin-marketplace
> ```
> Plain absolute or relative path — `file://` URLs are rejected.

After install, verify by running one of the wrappers:

```
docs-guide issue list --priority high
```

You should see issues from your tracker. If the command isn't found, run `/reload-plugins` and check `which docs-guide`.

## Skill — `documentation-guide`

The skill triages every non-tracker docs task to one of five domain references. The model loads only the reference it needs, so the skill stays cheap regardless of how detailed the references get.

| Reference | Covers |
|---|---|
| `references/writing.md` | Markdown basics, frontmatter, custom tags, asset embedding |
| `references/layouts/docs-layout.md` | Docs folder structure, `NN_` prefixes, per-folder `settings.json`, sidebar generation |
| `references/layouts/blog-layout.md` | Blog file naming (`YYYY-MM-DD-<slug>.md`), tags, index behaviour |
| `references/settings-layout.md` | `site.yaml`, `navbar.yaml`, `footer.yaml`, `.env`, path aliases, themes |
| `references/images.md` | Image optimization before committing |

The skill triggers automatically whenever you work on docs in a project that uses this framework (i.e. one where the `documentation-template/` folder is present, or you're inside it). You don't have to invoke it explicitly. For the issue tracker it hands off to `doc-issues`.

## Skill — `doc-issues`

The **self-contained issue-tracker skill** — everything about working a tracker lives here, so tracker tasks never bounce between skills. It owns the full anatomy (`brainstorm/`, `notes/`, `subtasks/`, `agent-log/` activity folders, `agent-memory/`, flat `comments/`, `glossary.md`), the **creation threshold rules** (when a thought earns a full issue vs a subtask vs a brainstorm entry vs a dump entry), the lifecycle + AI rules, schema-aware searching, and its own tracker-flavoured writing reference (~20 focused reference files; the model loads only what the task needs).

It has a **dual trigger surface**: the tracker nouns (issue, subtask, comment, backlog, vocabulary…) *and* the execution verbs — **audit this**, **refactor this**, run a **loop** / ultracode / autonomous iteration, or **"let's discuss this point"** against a tracked issue. On the execution side it records activity folders in `agent-log/`, keeps issue-scoped **agent-memory** always-on, and saves discussion **only when you explicitly ask** (it may offer when a discussion turns dense, but never auto-saves). It absorbed the former thin `doc-agent` skill, whose separate existence was only ever a patch for the verb triggers.

## Slash commands

Two commands ship inside the plugin for project-level scaffolding:

| Command | Use it for |
|---|---|
| `/docs-init` | **Bootstrap a new docs project from zero.** Walks you through scope (whole repo vs subfolder), site name/title/description, and the first section name. Writes `config/`, `data/`, the starter page, and patches `CLAUDE.md` at the repo root. Prints the framework-clone command at the end. |
| `/docs-add-section [name]` | **Add a new top-level section** to an existing docs project. Validates the name, creates `data/<name>/settings.json` + `01_overview.md`, and (optionally) appends a `pages:` entry to `config/site.yaml`. |

Typical first-time flow in a fresh directory:

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install documentation-guide@sids-plugin-marketplace
/reload-plugins
/docs-init
```

Then follow the printed instructions to clone the framework engine and run `./start` from the repo root.

## CLI commands — one `docs-guide` entrypoint

Claude Code adds the plugin's `bin/` folder to your `$PATH` automatically. There's a single command — **`docs-guide`** — and every operation is a subcommand: **`docs-guide <group> <verb> [flags]`** (e.g. `docs-guide issue list`, `docs-guide find <regex>`). The name is prefix-namespaced so it never collides with other tools on `PATH`.

**Discover with `docs-guide help`.** Rather than memorising names: `docs-guide help` lists everything grouped, `docs-guide help <command>` shows one command's flags, `docs-guide help --json` dumps the manifest. The contract is uniform — every command supports `--help`/`-h` (→ stdout, exit 0) and `--json` wherever it returns data; exit codes are `0` ok / `1` no-result-or-handled-error / `2` usage.

### General / cross-content (5)

| Command | What it does |
|---|---|
| `docs-guide help` | List commands, show flags, or dump the manifest (`--json`) |
| `docs-guide find` | Schema-agnostic regex search across **all** content at once (docs+blog+issues+config); `--meta` / `--path` / `--type` / `--count` |
| `docs-guide move` | Link-aware move / rename of doc pages or folders |
| `docs-guide img` | Optimize images / screenshots so git stays small |
| `docs-guide resolve-context` | Emit the `.env`-derived content/config/data dirs (for non-JS scripts) |

### Issue tracker (8) — `docs-guide issue …`

| Command | What it does |
|---|---|
| `docs-guide issue list` | Multi-field filter + free-text regex search over the tracker — drop-in replacement for `grep`/`find` on `data/todo/`. Scope with `--path` / `--meta` / `--count` |
| `docs-guide issue show <issue-id>` | One issue's metadata + subtask summary + comment & agent-log heads |
| `docs-guide issue subtasks <issue-id>` | List subtasks for one issue (or `--all` for cross-issue) |
| `docs-guide issue agent-logs <issue-id>` | Last N agent-log entries for an issue |
| `docs-guide issue set-state` | Update issue or subtask state |
| `docs-guide issue add-comment` | Append a comment with auto-incremented prefix |
| `docs-guide issue add-agent-log` | Append an agent-log entry with auto-incremented iteration |
| `docs-guide issue review-queue` | Items awaiting review (status=review issues + open issues with review subtasks) |

### Validators (5) — `docs-guide check …`

Exit `0` clean / `1` on errors found — handy in pre-commit / CI. All support `--json`.

| Command | What it does |
|---|---|
| `docs-guide check blog` | Validate the blog folder — `YYYY-MM-DD-<slug>.md` naming, frontmatter `title:`, no nested folders |
| `docs-guide check config` | Validate `site.yaml` / `navbar.yaml` / `footer.yaml` — required keys, page structure, alias resolution |
| `docs-guide check section <folder>` | Validate any docs section — `NN_` prefix discipline, `settings.json` presence, frontmatter `title:`, prefix collisions |
| `docs-guide check issues` | Validate the issue tracker — schema, vocabulary, subtask states (use this on `data/todo/`, not `docs-guide check section`) |
| `docs-guide check skill-links` | Maintainer tool: verify relative links between the skill's `.md` files resolve |

### Docs + blog content (6) — `docs-guide doc …` / `docs-guide blog …`

| Command | What it does |
|---|---|
| `docs-guide doc list` / `docs-guide doc show` / `docs-guide doc search` | List / inspect / regex-search sidebar doc pages (optional `[section]`) |
| `docs-guide blog list` / `docs-guide blog show` / `docs-guide blog search` | List / inspect / regex-search blog posts (newest first) |

### Git-derived content metadata (4) — `docs-guide git …`

| Command | What it does |
|---|---|
| `docs-guide git updated <path>` | Last-commit date/author/subject for any issue/doc/post |
| `docs-guide git changed --since <ref>` | Content changed under `data/` since a ref (review sweeps) |
| `docs-guide git log <path>` | Commit history of one content folder/file |
| `docs-guide git commit --scope <path> --message <msg>` | **Guarded** stage + commit of only that path; never pushes (`--dry-run` previews) |

Pass `--help` to any command for the full flag list, or run `docs-guide help`.

## When to reach for what

You almost always describe the task in natural language and let the skill route it. The wrappers and slash commands are for explicit, verifiable operations — searches, validations, scaffolding, state updates.

| Task | Tool |
|---|---|
| Write a new doc page | Skill triggers automatically; just edit |
| Add / change frontmatter | Skill triggers automatically |
| Bootstrap a new docs project | `/docs-init` |
| Add a new top-level section | `/docs-add-section` |
| Discover what commands/flags exist | `docs-guide help` (`docs-guide help <cmd>`, `docs-guide help --json`) |
| Find issues by priority / status / search | `docs-guide issue list` |
| Find a string across **all** content types | `docs-guide find` |
| Inspect one issue | `docs-guide issue show` |
| Update an issue or subtask state | `docs-guide issue set-state` |
| Add a comment to an issue | `docs-guide issue add-comment` |
| Validate site config before commit | `docs-guide check config` |
| Validate a docs section before commit | `docs-guide check section <folder>` |
| Validate the issue tracker before commit | `docs-guide check issues` |
| When was this issue/doc last touched | `docs-guide git updated <path>` |

## Updates

Pull the latest plugin version from the marketplace:

```
/plugin update documentation-guide@sids-plugin-marketplace
/reload-plugins
```

Or update everything you've installed:

```
/plugin update
/reload-plugins
```

`/plugin update` re-fetches the marketplace and downloads the new version into `~/.claude/plugins/cache/<marketplace>/<plugin>/<new-version>/`. Older versions remain in the cache until cleaned up.

## Where the plugin lives on disk

Plugin files are cached **once** at user level, regardless of which scope (user / project / local) enables them:

```
~/.claude/plugins/cache/sids-plugin-marketplace/documentation-guide/<version>/
├── .claude-plugin/plugin.json
├── README.md
├── bin/                  ← auto-added to $PATH at session start
├── commands/             ← /docs-init, /docs-add-section
└── skills/
    ├── documentation-guide/
    │   ├── SKILL.md
    │   ├── references/   ← 5 domain reference files
    │   └── scripts/      ← bundled .mjs implementations (the docs-guide CLI)
    └── doc-issues/
        ├── SKILL.md
        └── references/   ← ~20 issue-tracker reference files
```

What differs across scopes is just a boolean entry in each scope's `settings.json`:

```json
{
  "enabledPlugins": {
    "documentation-guide@sids-plugin-marketplace": true
  }
}
```

For a deep dive on the cache vs. the per-scope registration, see the dev-docs page on [plugin storage and scope](/dev-docs/plugins/storage-and-scope).

## Why two skills, not one or five?

Earlier drafts split this into five per-domain skills (`docs-guide`, `docs-settings`, `blog`, `issues`, `writing`). Validation testing across 22 agent runs showed an umbrella skill is **30% faster** in real-world multi-task usage with **100% correctness**, because docs / blog / settings / writing tasks compose constantly and share the same conventions — splitting them duplicates the preamble and bloats the always-in-context description budget.

The **issue tracker is the one domain that earned extraction** (2026-07): it is the highest-frequency, most nuanced, most self-contained surface — a complete structure of its own — and it needs a *second trigger surface* (the execution verbs: audit / refactor / loop / discuss) that a docs-flavoured description can't carry. `doc-issues` owns both surfaces and is deliberately self-contained, including its own writing reference (skills load one at a time; a little duplication beats mid-task skill-hopping, guarded by sync notes). This also retired the thin `doc-agent` skill, which existed only to patch the verb triggers.

If a future release adds something genuinely orthogonal (custom themes, custom Astro components), it may ship as its own skill — the catalogue above is kept in sync with whatever is actually installed.

## See also

- [Installation](./02_installation.md) — full project install (clone + dependencies + run dev)
- Dev-docs section on [plugins](/dev-docs/plugins/overview) — for the architecture of plugins themselves (how they work, how to author one)
