---
title: Claude Code Plugin
description: AI-powered skill, CLI wrappers, and slash commands for working with documentation-template via Claude Code.
---

# Claude Code Plugin

This template ships its own **Claude Code plugin** — `documentation-guide` — that teaches Claude how to work inside this project without you having to explain the conventions every time. It bundles:

- **1 skill** that triages every docs/issue/blog/config task to a domain-specific reference
- **11 CLI wrappers** auto-added to `$PATH` for the issue tracker and validators
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
| `references/layouts/issue-layout.md` | Issue tracker — folder-per-item, vocabulary, 4-state lifecycle, AI rules |
| `references/settings-layout.md` | `site.yaml`, `navbar.yaml`, `footer.yaml`, `.env`, path aliases, themes |

The skill triggers automatically whenever you work on docs in a project that uses this framework (i.e. one where the `documentation-template/` folder is present, or you're inside it). You don't have to invoke it explicitly.

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

## CLI wrappers — 11 commands on `$PATH`

Claude Code adds the plugin's `bin/` folder to your `$PATH` automatically. Each wrapper is a single command you can type bare — no path knowledge required.

### Issue tracker (8)

| Command | What it does |
|---|---|
| `docs-list` | Multi-field filter + free-text regex search over the tracker — drop-in replacement for `grep`/`find` on `data/todo/` |
| `docs-show <issue-id>` | One issue's metadata + subtask summary + comment & agent-log heads |
| `docs-subtasks <issue-id>` | List subtasks for one issue (or `--all` for cross-issue) |
| `docs-agent-logs <issue-id>` | Last N agent-log entries for an issue |
| `docs-set-state` | Update issue or subtask state |
| `docs-add-comment` | Append a comment with auto-incremented prefix |
| `docs-add-agent-log` | Append an agent-log entry with auto-incremented iteration |
| `docs-review-queue` | Items awaiting review (status=review issues + open issues with review subtasks) |

### Validators (3)

Exit `0` clean / `1` on errors found — handy in pre-commit / CI.

| Command | What it does |
|---|---|
| `docs-check-blog` | Validate the blog folder — `YYYY-MM-DD-<slug>.md` naming, frontmatter `title:`, no nested folders |
| `docs-check-config` | Validate `site.yaml` / `navbar.yaml` / `footer.yaml` — required keys, page structure, alias resolution |
| `docs-check-section <folder>` | Validate any docs section — `NN_` prefix discipline, `settings.json` presence, frontmatter `title:`, prefix collisions |

Pass `--help` to any wrapper for the full flag list.

## When to reach for what

You almost always describe the task in natural language and let the skill route it. The wrappers and slash commands are for explicit, verifiable operations — searches, validations, scaffolding, state updates.

| Task | Tool |
|---|---|
| Write a new doc page | Skill triggers automatically; just edit |
| Add / change frontmatter | Skill triggers automatically |
| Bootstrap a new docs project | `/docs-init` |
| Add a new top-level section | `/docs-add-section` |
| Find issues by priority / status / search | `docs-list` |
| Inspect one issue | `docs-show` |
| Update an issue or subtask state | `docs-set-state` |
| Add a comment to an issue | `docs-add-comment` |
| Validate site config before commit | `docs-check-config` |
| Validate a docs section before commit | `docs-check-section <folder>` |

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
