---
title: Claude Code Plugin
description: AI-powered skill, CLI wrappers, and slash commands for working with documentation-template via Claude Code.
---

# Claude Code Plugin

This template ships its own **Claude Code plugin** — `documentation-guide` — that teaches Claude how to work inside this project without you having to explain the conventions every time. It bundles:

- **2 skills** — `documentation-guide` (triages every docs/issue/blog/config task to a domain-specific reference) and `doc-agent` (a thin execution-time skill for recording an agent's run in the tracker)
- **28 CLI commands** auto-added to `$PATH` — issue tracker, validators, docs/blog content, git metadata, and cross-content search (each works as `docs <group> <verb>` or a flat `docs-*` alias)
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
docs-list --priority high
```

You should see issues from your tracker. If the command isn't found, run `/reload-plugins` and check `which docs-list`.

## Skill — `documentation-guide`

The skill triages every docs task to one of five domain references. The model loads only the reference it needs, so the skill stays cheap regardless of how detailed the references get.

| Reference | Covers |
|---|---|
| `references/writing.md` | Markdown basics, frontmatter, custom tags, asset embedding |
| `references/layouts/docs-layout.md` | Docs folder structure, `NN_` prefixes, per-folder `settings.json`, sidebar generation |
| `references/layouts/blog-layout.md` | Blog file naming (`YYYY-MM-DD-<slug>.md`), tags, index behaviour |
| `references/layouts/issues/` (entry `00_overview.md`) | Issue tracker — folder-per-item, vocabulary, 4-state lifecycle, AI rules; split into focused files (overview, content types, tools, examples) |
| `references/settings-layout.md` | `site.yaml`, `navbar.yaml`, `footer.yaml`, `.env`, path aliases, themes |

The skill triggers automatically whenever you work on docs in a project that uses this framework (i.e. one where the `documentation-template/` folder is present, or you're inside it). You don't have to invoke it explicitly.

## Skill — `doc-agent`

A second, deliberately thin skill with a **different trigger surface**, covering **how to use a tracked issue's `agent-log/`**. `documentation-guide` fires on "I'm authoring docs"; `doc-agent` fires on the execution verbs themselves — **audit this**, **refactor this**, run a **loop** / ultracode / autonomous iteration, or **"let's discuss this point"** — plus maintaining issue-scoped **agent memory**. That's exactly the moment the broad skill won't trigger on its own, which is why the agent-log workspace (its whole point being resumability) would otherwise go unused when it matters most.

It carries the common case inline (the trigger verbs, the `agent-log/` activity structure across loops/audits/refactors, agent-memory as always-on, and the rule that **discussion is saved only when the user explicitly asks** — the skill may *offer* to save a dense discussion but never auto-saves) and defers depth to `documentation-guide`'s `references/layouts/issues/24_agent-logs.md`. Audiences and triggers differ — doc author vs autonomous executor — so the two skills don't double-fire confusingly.

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

## CLI commands — 28 on `$PATH`

Claude Code adds the plugin's `bin/` folder to your `$PATH` automatically. Each command can be typed bare — no path knowledge required.

**Two equivalent forms.** Every command works as a `docs <group> <verb>` subcommand *and* as a flat `docs-*` alias (the alias prefix avoids colliding with other plugins). `docs issue list` ≡ `docs-list`; `docs git updated` ≡ `docs-git-updated`.

**Discover with `docs help`.** Rather than memorising names: `docs help` lists everything grouped, `docs help <command>` shows one command's flags, `docs help --json` dumps the manifest. The contract is uniform — every command supports `--help`/`-h` (→ stdout, exit 0) and `--json` wherever it returns data; exit codes are `0` ok / `1` no-result-or-handled-error / `2` usage.

### General / cross-content (5)

| Command (alias) | What it does |
|---|---|
| `docs help` (`docs-help`) | List commands, show flags, or dump the manifest (`--json`) |
| `docs find` (`docs-find`) | Schema-agnostic regex search across **all** content at once (docs+blog+issues+config); `--meta` / `--path` / `--type` / `--count` |
| `docs move` (`docs-move`) | Link-aware move / rename of doc pages or folders |
| `docs img` (`docs-img`) | Optimize images / screenshots so git stays small |
| `docs resolve-context` (`docs-resolve-context`) | Emit the `.env`-derived content/config/data dirs (for non-JS scripts) |

### Issue tracker (8) — `docs issue …`

| Command | What it does |
|---|---|
| `docs-list` | Multi-field filter + free-text regex search over the tracker — drop-in replacement for `grep`/`find` on `data/todo/`. Scope with `--path` / `--meta` / `--count` |
| `docs-show <issue-id>` | One issue's metadata + subtask summary + comment & agent-log heads |
| `docs-subtasks <issue-id>` | List subtasks for one issue (or `--all` for cross-issue) |
| `docs-agent-logs <issue-id>` | Last N agent-log entries for an issue |
| `docs-set-state` | Update issue or subtask state |
| `docs-add-comment` | Append a comment with auto-incremented prefix |
| `docs-add-agent-log` | Append an agent-log entry with auto-incremented iteration |
| `docs-review-queue` | Items awaiting review (status=review issues + open issues with review subtasks) |

### Validators (5) — `docs check …`

Exit `0` clean / `1` on errors found — handy in pre-commit / CI. All support `--json`.

| Command | What it does |
|---|---|
| `docs-check-blog` | Validate the blog folder — `YYYY-MM-DD-<slug>.md` naming, frontmatter `title:`, no nested folders |
| `docs-check-config` | Validate `site.yaml` / `navbar.yaml` / `footer.yaml` — required keys, page structure, alias resolution |
| `docs-check-section <folder>` | Validate any docs section — `NN_` prefix discipline, `settings.json` presence, frontmatter `title:`, prefix collisions |
| `docs-check-issues` | Validate the issue tracker — schema, vocabulary, subtask states (use this on `data/todo/`, not `docs-check-section`) |
| `docs-check-skill-links` | Maintainer tool: verify relative links between the skill's `.md` files resolve |

### Docs + blog content (6) — `docs doc …` / `docs blog …`

| Command | What it does |
|---|---|
| `docs-doc-list` / `docs-doc-show` / `docs-doc-search` | List / inspect / regex-search sidebar doc pages (optional `[section]`) |
| `docs-blog-list` / `docs-blog-show` / `docs-blog-search` | List / inspect / regex-search blog posts (newest first) |

### Git-derived content metadata (4) — `docs git …`

| Command | What it does |
|---|---|
| `docs-git-updated <path>` | Last-commit date/author/subject for any issue/doc/post |
| `docs-git-changed --since <ref>` | Content changed under `data/` since a ref (review sweeps) |
| `docs-git-log <path>` | Commit history of one content folder/file |
| `docs-git-commit --scope <path> --message <msg>` | **Guarded** stage + commit of only that path; never pushes (`--dry-run` previews) |

Pass `--help` to any command for the full flag list, or run `docs help`.

## When to reach for what

You almost always describe the task in natural language and let the skill route it. The wrappers and slash commands are for explicit, verifiable operations — searches, validations, scaffolding, state updates.

| Task | Tool |
|---|---|
| Write a new doc page | Skill triggers automatically; just edit |
| Add / change frontmatter | Skill triggers automatically |
| Bootstrap a new docs project | `/docs-init` |
| Add a new top-level section | `/docs-add-section` |
| Discover what commands/flags exist | `docs help` (`docs help <cmd>`, `docs help --json`) |
| Find issues by priority / status / search | `docs-list` |
| Find a string across **all** content types | `docs find` |
| Inspect one issue | `docs-show` |
| Update an issue or subtask state | `docs-set-state` |
| Add a comment to an issue | `docs-add-comment` |
| Validate site config before commit | `docs-check-config` |
| Validate a docs section before commit | `docs-check-section <folder>` |
| Validate the issue tracker before commit | `docs-check-issues` |
| When was this issue/doc last touched | `docs-git-updated <path>` |

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
    └── documentation-guide/
        ├── SKILL.md
        ├── references/   ← 5 domain reference files
        └── scripts/      ← bundled .mjs implementations
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

## Why one skill, not five?

Earlier drafts split this into separate skills (`docs-guide`, `docs-settings`, `blog`, `issues`, `writing`). Validation testing across 22 agent runs showed the umbrella skill is **30% faster** in real-world multi-task usage with **100% correctness**, because the per-task loading cost amortises across the conversation. The single-skill design also removes the cognitive overhead of picking which skill to invoke.

If a future release adds something genuinely orthogonal (custom themes, custom Astro components), it may ship as its own skill — the catalogue above is kept in sync with whatever is actually installed.

## See also

- [Installation](./02_installation.md) — full project install (clone + dependencies + run dev)
- Dev-docs section on [plugins](/dev-docs/plugins/overview) — for the architecture of plugins themselves (how they work, how to author one)
