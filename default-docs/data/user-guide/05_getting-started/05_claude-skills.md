---
title: The agent-ks Plugin
description: The skills, the CLI and the slash commands that teach an AI agent to work in an agent-knowledge-system project. Install, update, and where it lives on disk.
---

# The agent-ks Plugin

The framework ships a plugin, `agent-ks`. It teaches an AI agent the project's conventions, so you do not explain them every session. Claude Code and Codex both read it. It bundles:

- **Ten skills.** Each triggers on its own domain. Three of them are also slash commands.
- **A CLI skill** for the separately installed Rust binary, `agent-ks`. Every operation has built-in help.
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

Install the [native toolkit](./10_native-toolkit.md) separately, then run this from the folder containing `config/`:

```
agent-ks issue list --priority high
```

If the command is not found, check `command -v agent-ks` and ensure the toolkit install directory is on `PATH`. Reloading the plugin does not install the binary.

Codex, OpenCode, Hermes and a skills-only install without a marketplace: the plugin's [README](../../../../plugins/agent-ks/README.md) covers each.

## The skills

| Skill | Owns | Triggers on |
|---|---|---|
| `agent-ks-config` | Setup and configuration: a new project from the starter template, a new top-level section, `site.yaml`, `navbar.yaml`, `footer.yaml`, `.env`, path aliases, themes, layout styles and custom layouts, custom pages, format migrations. One full reference per topic, because this work is rare | any setup or config question; `/agent-ks-config` |
| `agent-ks-docs` | Pages inside a docs section: `NN_` prefixes, folder `settings.json`, frontmatter, links, callouts, diagrams, diagram and artifact pages, images, moving pages | any file under a docs section of `data/` |
| `agent-ks-blog` | Blog posts: the dated filename, frontmatter, a post's assets, the index | any file under `data/blog/` |
| `agent-ks-issues` | The issue tracker: anatomy, the creation rules, the lifecycle, subtasks, plans, agent memory, searching | the tracker under `data/todo/`; audit, refactor, loop, discuss against an issue |
| `agent-ks-issue-logs` | Agent logs: when a run earns one and who decides, the six kinds, the file set of each | opening, continuing or reviewing a log |
| `agent-ks-qna` | Scoping by question and answer: the seven things a work order must answer, story mode for a dictated brief, interview mode in rounds, playback before writing. Fills the subtask's own sections with the reason behind each decision | defining a subtask or a plan stage; "let me explain", "scope this", a long story |
| `agent-ks-artifacts` | Self-contained HTML artifacts: reports, dashboards, data visualizations, design systems, served at `/artifacts` | build or design an artifact, chart or dashboard |
| `agent-ks-cli` | Toolkit installation, config selection, command discovery, bounded search and issue context, exit codes, the file templates | whenever a command is needed |
| `agent-ks-quick-idea-note` | Capture an idea into the issue dump | `/agent-ks-quick-idea-note [idea]` |
| `agent-ks-index-check` | Check an index against the files it names; reports only | `/agent-ks-index-check [path]` |

Every skill states its source of truth. The engine and the CLI win for anything they implement: statuses, kinds, templates, commands, flags, what renders. This user guide wins on convention the code does not enforce. When a skill disagrees with either, the agent follows the source, fixes the skill, and says so.

## Slash commands

| Command | Use it for |
|---|---|
| `/agent-ks-config` | **Bootstrap a new docs project from zero.** Asks the scope (whole repo or a subfolder), the site name, title, description and repo URL. Copies the starter template, patches `CLAUDE.md`, and explains how to launch with `agent-ks start`. Details: [Setup and the Starter Template](./06_init-and-template.md) |
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

Then install the toolkit and run `agent-ks start` from the chosen project root. It clones the framework if needed.

## The CLI

The Rust binary is installed independently of the plugin. See [native toolkit installation](./10_native-toolkit.md). Run it from any project folder containing `config/`, or select a config with `--config-dir` or `AGENTKS_CONFIG_FOLDER`. Bare `agent-ks` prints an overview.

| Group | Verbs |
|---|---|
| `issue` | `list`, `show`, `tree`, `context`, `subtasks`, `agent-logs`, `set-state`, `add-comment`, `new-subtask`, `new-plan`, `new-stage`, `new-agent-log`, `new-round`, `review-queue` |
| `check` | `config`, `section <folder>`, `blog`, `issues`, `link-form`, `legacy-tags`, `skill-links` |
| `doc`, `blog` | `list`, `show`, `search` |
| `git` | `updated`, `changed --since`, `log`, `commit --scope` (guarded, never pushes) |
| `theme` | `tokens` |
| standalone | `find <regex>`, `move <from> <to>`, `img <files>`, `resolve-context`, `overview`, `start`, `update`, `init`, `help` |

`agent-ks help` lists everything. `agent-ks help <group> <verb>` shows one command's flags. `--help` works on every command. Read commands support `--json`; use `start --dry-run --json` to inspect a launch. Exit codes: `0` ok, `1` no result or a handled error, `2` usage. The contract lives in the `agent-ks-cli` skill; do not guess a flag.

## Updates

The toolkit has its own `agent-ks-cli-vX.Y.Z` GitHub releases. The plugin uses independent `agent-ks-plugin-vX.Y.Z` metadata releases and marketplace updates. Use `agent-ks update` to update the CLI immediately. The installed shell hook silently updates with a five-hour cooldown; pinned installations pause automatic updates. The following commands update the plugin’s skills only.

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
├── agents/                    ← agent-ks-index-checker (Claude-only)
└── skills/
    ├── agent-ks-config/       SKILL.md · references/01_new-project … 08_migrations · assets/template
    ├── agent-ks-docs/         SKILL.md · references/writing, docs-layout, images
    ├── agent-ks-blog/         SKILL.md
    ├── agent-ks-issues/       SKILL.md · references/01 … 10
    ├── agent-ks-issue-logs/   SKILL.md · references/kinds
    ├── agent-ks-qna/          SKILL.md · references/question-bank, writing-rules
    ├── agent-ks-artifacts/    SKILL.md · references · scripts
    ├── agent-ks-cli/          SKILL.md · references · templates (embedded in the Rust build)
    ├── agent-ks-quick-idea-note/
    └── agent-ks-index-check/
```

Each scope's `settings.json` holds one boolean:

```json
{ "enabledPlugins": { "agent-ks@sids-plugin-marketplace": true } }
```

The cache versus per-scope registration: [plugin storage and scope](../../dev-docs/25_plugins/02_storage-and-scope.md).

## Why ten skills

One skill per domain, and a domain is a set of tasks that share conventions and a trigger vocabulary. Scoping by Q&A is its own skill because it runs before the tracker work, in conversation, and both the subtask and the plan reference it. Docs pages, blog posts, the tracker and site configuration each have their own. Configuration is split out because it is rare, one-time work that deserves full references rather than a lean page. Agent logs are split from the tracker because they have their own decision, when a run earns one, and their own shapes. The CLI is its own skill so every other skill can point at one contract instead of repeating it.

## See also

- [Installation](./02_installation.md) — the full project install
- [Setup and the Starter Template](./06_init-and-template.md) — what `/agent-ks-config` copies and substitutes
- Dev-docs on [plugins](../../dev-docs/25_plugins/01_overview.md) — how plugins are built
