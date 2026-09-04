---
title: The agent-ks Plugin
description: The skills, the CLI and the slash commands that teach an AI agent to work in an agent-knowledge-system project. Install, update, and where it lives on disk.
---

# The agent-ks Plugin

The framework ships a plugin, `agent-ks`. It teaches an AI agent the project's conventions, so you do not explain them every session. Claude Code and Codex both read it. It bundles:

- **Nine skills.** Each triggers on its own domain. Three of them are also slash commands.
- **One CLI on `PATH`**, `agent-ks`. Every operation is `agent-ks <group> <verb>`. `agent-ks help` lists them all.
- **One agent**, `agent-ks-index-checker`, Claude-only. It checks an index against the files it names and reports without editing.

The plugin is distributed through [`sids-plugin-marketplace`](https://github.com/sidhanthapoddar99/sids-plugin-marketplace).

## Install

Three commands in Claude Code. The first two are one-time; the third refreshes the cache.

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install agent-ks@sids-plugin-marketplace
/reload-plugins
```

> [!note] Local install while developing
> When you iterate on the plugin itself, point the marketplace at a local clone of `sids-plugin-marketplace`:
> ```
> /plugin marketplace add /absolute/path/to/sids-plugin-marketplace
> ```
> A plain path. `file://` URLs are rejected.

Verify with one command. It should list issues from your tracker:

```
agent-ks issue list --priority high
```

If the command is not found, run `/reload-plugins` and check `which agent-ks`.

Codex, OpenCode, Hermes and a skills-only install without a marketplace: the plugin's [README](../../../../plugins/agent-ks/README.md) covers each.

## The skills

| Skill | Owns | Triggers on |
|---|---|---|
| `agent-ks-config` | Setup and configuration: a new project from the starter template, a new top-level section, `site.yaml`, `navbar.yaml`, `footer.yaml`, `.env`, path aliases, themes, layout styles and custom layouts, custom pages, format migrations. One full reference per topic, because this work is rare | any setup or config question; `/agent-ks-config` |
| `agent-ks-docs` | Pages inside a docs section: `NN_` prefixes, folder `settings.json`, frontmatter, links, callouts, diagrams, diagram and artifact pages, images, moving pages | any file under a docs section of `data/` |
| `agent-ks-blog` | Blog posts: the dated filename, frontmatter, a post's assets, the index | any file under `data/blog/` |
| `agent-ks-issues` | The issue tracker: anatomy, the creation rules, the lifecycle, subtasks, plans, agent memory, searching | the tracker under `data/todo/`; audit, refactor, loop, discuss against an issue |
| `agent-ks-issue-logs` | Agent logs: when a run earns one and who decides, the six kinds, the file set of each | opening, continuing or reviewing a log |
| `agent-ks-artifacts` | Self-contained HTML artifacts: reports, dashboards, data visualizations, design systems, served at `/artifacts` | build or design an artifact, chart or dashboard |
| `agent-ks-cli` | The CLI contract, every command and flag, exit codes, the file templates | whenever a command is needed |
| `agent-ks-quick-idea-note` | Capture an idea into the issue dump | `/agent-ks-quick-idea-note [idea]` |
| `agent-ks-index-check` | Check an index against the files it names; reports only | `/agent-ks-index-check [path]` |

Every skill states its source of truth: the user guide you are reading wins over the skill. When they disagree, the agent follows the guide, fixes the skill, and says so.

## Slash commands

| Command | Use it for |
|---|---|
| `/agent-ks-config` | **Bootstrap a new docs project from zero.** Asks the scope (whole repo or a subfolder), the site name, title, description and repo URL. Copies the starter template, patches `CLAUDE.md`, and prints the framework-clone command. Details: [Setup and the Starter Template](./06_init-and-template.md) |
| `/agent-ks-config section <name>` | **Add a top-level section.** Validates the name, creates `data/<name>/settings.json` and `01_overview.md`, and appends the `pages:` entry to `site.yaml` when you agree |
| `/agent-ks-quick-idea-note [idea]` | Write a half-formed idea into the issue dump, with no folder ceremony |
| `/agent-ks-index-check [path]` | Report where an index and the files it points at disagree |

First-time flow in a fresh directory:

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install agent-ks@sids-plugin-marketplace
/reload-plugins
/agent-ks-config
```

Then follow the printed instructions: clone the framework, write `.env`, run `./start`.

## The CLI

Claude Code adds the plugin's `bin/` to `PATH` at session start. Other agents add it to the shell profile; the plugin README shows the line. The command is `agent-ks`, and every operation is `agent-ks <group> <verb> [flags]`.

| Group | Verbs |
|---|---|
| `issue` | `list`, `show`, `subtasks`, `agent-logs`, `set-state`, `add-comment`, `new-subtask`, `new-plan`, `new-stage`, `new-agent-log`, `new-round`, `review-queue` |
| `check` | `config`, `section <folder>`, `blog`, `issues`, `link-form`, `content-links`, `legacy-tags`, `skill-links` |
| `doc`, `blog` | `list`, `show`, `search` |
| `git` | `updated`, `changed --since`, `log`, `commit --scope` (guarded, never pushes) |
| `theme` | `tokens` |
| standalone | `find <regex>`, `move <from> <to>`, `img <files>`, `resolve-context`, `help` |

`agent-ks help` lists everything. `agent-ks help <group> <verb>` shows one command's flags. `--help` and `--json` work everywhere. Exit codes: `0` ok, `1` no result or a handled error, `2` usage. The contract lives in the `agent-ks-cli` skill; do not guess a flag.

## Updates

```
/plugin update agent-ks@sids-plugin-marketplace
/reload-plugins
```

`/plugin update` alone updates everything installed. The new version lands in `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`; older versions stay until cleaned up.

## Where the plugin lives on disk

Plugin files are cached once at user level, whatever scope enables them:

```
~/.claude/plugins/cache/sids-plugin-marketplace/agent-ks/<version>/
├── .claude-plugin/plugin.json
├── .codex-plugin/plugin.json
├── README.md
├── bin/                       ← agent-ks, on PATH at session start
├── agents/                    ← agent-ks-index-checker (Claude-only)
└── skills/
    ├── agent-ks-config/       SKILL.md · references/01_new-project … 08_migrations · assets/template
    ├── agent-ks-docs/         SKILL.md · references/writing, docs-layout, images
    ├── agent-ks-blog/         SKILL.md
    ├── agent-ks-issues/       SKILL.md · references/01 … 10
    ├── agent-ks-issue-logs/   SKILL.md
    ├── agent-ks-artifacts/    SKILL.md · references · scripts
    ├── agent-ks-cli/          SKILL.md · references · scripts (the CLI) · templates
    ├── agent-ks-quick-idea-note/
    └── agent-ks-index-check/
```

Each scope's `settings.json` holds one boolean:

```json
{ "enabledPlugins": { "agent-ks@sids-plugin-marketplace": true } }
```

The cache versus per-scope registration: [plugin storage and scope](../../dev-docs/25_plugins/02_storage-and-scope.md).

## Why nine skills

One skill per domain, and a domain is a set of tasks that share conventions and a trigger vocabulary. Docs pages, blog posts, the tracker and site configuration each have their own. Configuration is split out because it is rare, one-time work that deserves full references rather than a lean page. Agent logs are split from the tracker because they have their own decision, when a run earns one, and their own shapes. The CLI is its own skill so every other skill can point at one contract instead of repeating it.

## See also

- [Installation](./02_installation.md) — the full project install
- [Setup and the Starter Template](./06_init-and-template.md) — what `/agent-ks-config` copies and substitutes
- Dev-docs on [plugins](../../dev-docs/25_plugins/01_overview.md) — how plugins are built
