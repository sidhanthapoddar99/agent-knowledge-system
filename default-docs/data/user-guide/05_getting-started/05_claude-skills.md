---
title: Claude Code Plugin
description: AI-powered skills, CLI toolkit, and slash commands for working with agent-knowledge-system via Claude Code.
---

# Claude Code Plugin

This template ships its own **Claude Code plugin** — `agent-ks` — that teaches Claude how to work inside this project without you having to explain the conventions every time. It bundles:

- **3 skills** — `agent-ks-docs` (triages every docs/blog/config/writing task to a domain-specific reference), `agent-ks-issues` (the complete, self-contained issue-tracker skill — anatomy, rules, agent-logs, agent-memory, and the execution verbs), and `agent-ks-artifacts` (building self-contained HTML artifacts — reports, dashboards, data viz, design systems — served at `/artifacts`)
- **28 CLI commands** auto-added to `$PATH` — issue tracker, validators, docs/blog content, git metadata, and cross-content search (one `agent-ks` entrypoint; every operation is a `agent-ks <group> <verb>` subcommand)
- **3 slash commands** (`/agent-ks-init`, `/agent-ks-add-section`, `/agent-ks-quick-idea-note`)

You install it from a marketplace once and Claude Code picks it up across every project on your machine. The plugin is distributed via [`sids-plugin-marketplace`](https://github.com/sidhanthapoddar99/sids-plugin-marketplace).

## Install

Three commands. The first two are one-time per marketplace and per project; the third refreshes the cache.

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install agent-ks@sids-plugin-marketplace
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
agent-ks issue list --priority high
```

You should see issues from your tracker. If the command isn't found, run `/reload-plugins` and check `which agent-ks`.

## Skill — `agent-ks-docs`

The skill triages every non-tracker docs task to one of five domain references. The model loads only the reference it needs, so the skill stays cheap regardless of how detailed the references get.

| Reference | Covers |
|---|---|
| `references/writing.md` | Markdown basics, frontmatter, callouts, asset embedding |
| `references/layouts/docs-layout.md` | Docs folder structure, `NN_` prefixes, per-folder `settings.json`, sidebar generation |
| `references/layouts/blog-layout.md` | Blog file naming (`YYYY-MM-DD-<slug>.md`), tags, index behaviour |
| `references/settings-layout.md` | `site.yaml`, `navbar.yaml`, `footer.yaml`, `.env`, path aliases, themes |
| `references/images.md` | Image optimization before committing |

The skill triggers automatically whenever you work on docs in a project that uses this framework (i.e. one where the `agent-knowledge-system/` folder is present, or you're inside it). You don't have to invoke it explicitly. For the issue tracker it hands off to `agent-ks-issues`; for building HTML artifacts, to `agent-ks-artifacts`.

## Skill — `agent-ks-issues`

The **self-contained issue-tracker skill** — everything about working a tracker lives here, so tracker tasks never bounce between skills. It owns the full anatomy (`brainstorm/`, `notes/`, `subtasks/`, `agent-log/` activity folders, `agent-memory/`, flat `comments/`, `glossary.md`), the **creation threshold rules** (when a thought earns a full issue vs a subtask vs a brainstorm entry vs a dump entry), the lifecycle + AI rules, schema-aware searching, and its own tracker-flavoured writing reference (~20 focused reference files; the model loads only what the task needs).

It has a **dual trigger surface**: the tracker nouns (issue, subtask, comment, backlog, vocabulary…) *and* the execution verbs — **audit this**, **refactor this**, run a **loop** / ultracode / autonomous iteration, or **"let's discuss this point"** against a tracked issue. On the execution side it records activity folders in `agent-log/`, keeps issue-scoped **agent-memory** always-on, and saves discussion **only when you explicitly ask** (it may offer when a discussion turns dense, but never auto-saves).

## Skill — `agent-ks-artifacts`

The **artifact skill** — building self-contained HTML artifacts (reports, dashboards, data visualizations, design systems / brand guidelines, variation sets comparing design options) as `NN_`-prefixed `.html` pages served at `/artifacts`, with an optional `.meta.json` sidecar. It covers treatment calibration, the two theme modes (`site` injection vs `self` dual-theme), the dataviz procedure with a bundled palette validator, and the pre-publish verify gate. It triggers whenever you ask Claude to build or design an artifact, a chart, a dashboard, or a design system for the project.

## Slash commands

Two commands ship inside the plugin for project-level scaffolding:

| Command | Use it for |
|---|---|
| `/agent-ks-init` | **Bootstrap a new docs project from zero.** Walks you through scope (whole repo vs subfolder), site name/title/description, and the first section name. Writes `config/`, `data/`, the starter page, and patches `CLAUDE.md` at the repo root. Prints the framework-clone command at the end. |
| `/agent-ks-add-section [name]` | **Add a new top-level section** to an existing docs project. Validates the name, creates `data/<name>/settings.json` + `01_overview.md`, and (optionally) appends a `pages:` entry to `config/site.yaml`. |

Typical first-time flow in a fresh directory:

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install agent-ks@sids-plugin-marketplace
/reload-plugins
/agent-ks-init
```

Then follow the printed instructions to clone the framework engine and run `./start` from the repo root.

## CLI commands — one `agent-ks` entrypoint

Claude Code adds the plugin's `bin/` folder to your `$PATH` automatically. There's a single command — **`agent-ks`** — and every operation is a subcommand: **`agent-ks <group> <verb> [flags]`** (e.g. `agent-ks issue list`, `agent-ks find <regex>`). The name is prefix-namespaced so it never collides with other tools on `PATH`.

**Discover with `agent-ks help`.** Rather than memorising names: `agent-ks help` lists everything grouped, `agent-ks help <command>` shows one command's flags, `agent-ks help --json` dumps the manifest. The contract is uniform — every command supports `--help`/`-h` (→ stdout, exit 0) and `--json` wherever it returns data; exit codes are `0` ok / `1` no-result-or-handled-error / `2` usage.

### General / cross-content (5)

| Command | What it does |
|---|---|
| `agent-ks help` | List commands, show flags, or dump the manifest (`--json`) |
| `agent-ks find` | Schema-agnostic regex search across **all** content at once (docs+blog+issues+config); `--meta` / `--path` / `--type` / `--count` |
| `agent-ks move` | Link-aware move / rename of doc pages or folders |
| `agent-ks img` | Optimize images / screenshots so git stays small |
| `agent-ks resolve-context` | Emit the `.env`-derived content/config/data dirs (for non-JS scripts) |

### Issue tracker (8) — `agent-ks issue …`

| Command | What it does |
|---|---|
| `agent-ks issue list` | Multi-field filter + free-text regex search over the tracker — drop-in replacement for `grep`/`find` on `data/todo/`. Scope with `--path` / `--meta` / `--count` |
| `agent-ks issue show <issue-id>` | One issue's metadata + subtask summary + comment & agent-log heads |
| `agent-ks issue subtasks <issue-id>` | List subtasks for one issue (or `--all` for cross-issue) |
| `agent-ks issue agent-logs <issue-id>` | Last N agent-log entries for an issue |
| `agent-ks issue set-state` | Update issue or subtask state |
| `agent-ks issue add-comment` | Append a comment with auto-incremented prefix |
| `agent-ks issue add-agent-log` | Append an agent-log entry with auto-incremented iteration |
| `agent-ks issue review-queue` | Items awaiting review (status=review issues + open issues with review subtasks) |

### Validators (5) — `agent-ks check …`

Exit `0` clean / `1` on errors found — handy in pre-commit / CI. All support `--json`.

| Command | What it does |
|---|---|
| `agent-ks check blog` | Validate the blog folder — `YYYY-MM-DD-<slug>.md` naming, frontmatter `title:`, no nested folders |
| `agent-ks check config` | Validate `site.yaml` / `navbar.yaml` / `footer.yaml` — required keys, page structure, alias resolution |
| `agent-ks check section <folder>` | Validate any docs section — `NN_` prefix discipline, `settings.json` presence, frontmatter `title:`, prefix collisions |
| `agent-ks check issues` | Validate the issue tracker — schema, vocabulary, subtask states (use this on `data/todo/`, not `agent-ks check section`) |
| `agent-ks check skill-links` | Maintainer tool: verify relative links between the skill's `.md` files resolve |

### Docs + blog content (6) — `agent-ks doc …` / `agent-ks blog …`

| Command | What it does |
|---|---|
| `agent-ks doc list` / `agent-ks doc show` / `agent-ks doc search` | List / inspect / regex-search sidebar doc pages (optional `[section]`) |
| `agent-ks blog list` / `agent-ks blog show` / `agent-ks blog search` | List / inspect / regex-search blog posts (newest first) |

### Git-derived content metadata (4) — `agent-ks git …`

| Command | What it does |
|---|---|
| `agent-ks git updated <path>` | Last-commit date/author/subject for any issue/doc/post |
| `agent-ks git changed --since <ref>` | Content changed under `data/` since a ref (review sweeps) |
| `agent-ks git log <path>` | Commit history of one content folder/file |
| `agent-ks git commit --scope <path> --message <msg>` | **Guarded** stage + commit of only that path; never pushes (`--dry-run` previews) |

Pass `--help` to any command for the full flag list, or run `agent-ks help`.

## When to reach for what

You almost always describe the task in natural language and let the skill route it. The wrappers and slash commands are for explicit, verifiable operations — searches, validations, scaffolding, state updates.

| Task | Tool |
|---|---|
| Write a new doc page | Skill triggers automatically; just edit |
| Add / change frontmatter | Skill triggers automatically |
| Bootstrap a new docs project | `/agent-ks-init` |
| Add a new top-level section | `/agent-ks-add-section` |
| Discover what commands/flags exist | `agent-ks help` (`agent-ks help <cmd>`, `agent-ks help --json`) |
| Find issues by priority / status / search | `agent-ks issue list` |
| Find a string across **all** content types | `agent-ks find` |
| Inspect one issue | `agent-ks issue show` |
| Update an issue or subtask state | `agent-ks issue set-state` |
| Add a comment to an issue | `agent-ks issue add-comment` |
| Validate site config before commit | `agent-ks check config` |
| Validate a docs section before commit | `agent-ks check section <folder>` |
| Validate the issue tracker before commit | `agent-ks check issues` |
| When was this issue/doc last touched | `agent-ks git updated <path>` |

## Updates

Pull the latest plugin version from the marketplace:

```
/plugin update agent-ks@sids-plugin-marketplace
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
~/.claude/plugins/cache/sids-plugin-marketplace/agent-ks/<version>/
├── .claude-plugin/plugin.json
├── README.md
├── bin/                  ← auto-added to $PATH at session start
├── commands/             ← /agent-ks-init, /agent-ks-add-section
└── skills/
    ├── agent-ks-docs/
    │   ├── SKILL.md
    │   ├── references/   ← 5 domain reference files
    │   └── scripts/      ← bundled .mjs implementations (the agent-ks CLI)
    ├── agent-ks-issues/
    │   ├── SKILL.md
    │   └── references/   ← ~20 issue-tracker reference files
    └── agent-ks-artifacts/
        ├── SKILL.md
        ├── references/   ← authoring + dataviz reference files
        └── scripts/      ← bundled palette validator
```

What differs across scopes is just a boolean entry in each scope's `settings.json`:

```json
{
  "enabledPlugins": {
    "agent-ks@sids-plugin-marketplace": true
  }
}
```

For a deep dive on the cache vs. the per-scope registration, see the dev-docs page on [plugin storage and scope](/dev-docs/plugins/storage-and-scope).

## Why three skills, not one or five?

Splitting by domain only pays when the domain is genuinely self-contained. Validation testing across 22 agent runs showed an umbrella skill is **30% faster** in real-world multi-task usage with **100% correctness**, because docs / blog / settings / writing tasks compose constantly and share the same conventions — splitting them duplicates the preamble and bloats the always-in-context description budget. So `agent-ks-docs` stays one umbrella.

Two domains earned extraction. The **issue tracker** is the highest-frequency, most nuanced, most self-contained surface — a complete structure of its own — and it needs a *second trigger surface* (the execution verbs: audit / refactor / loop / discuss) that a docs-flavoured description can't carry. `agent-ks-issues` owns both surfaces and is deliberately self-contained, including its own writing reference (skills load one at a time; a little duplication beats mid-task skill-hopping, guarded by sync notes). **Artifact authoring** is genuinely orthogonal craft — HTML/design/dataviz discipline rather than markdown conventions — with its own trigger vocabulary (build, design, chart, dashboard); `agent-ks-artifacts` carries it.

If a future release adds something else genuinely orthogonal (custom themes, custom Astro components), it may ship as its own skill — the catalogue above is kept in sync with whatever is actually installed.

## See also

- [Installation](./02_installation.md) — full project install (clone + dependencies + run dev)
- Dev-docs section on [plugins](/dev-docs/plugins/overview) — for the architecture of plugins themselves (how they work, how to author one)
