---
title: Installation
description: Two ways to install plugin capabilities — via marketplace, or by hand-authoring at user/project scope
---

# Installation

There are two paths to getting plugin capabilities into Claude Code:

1. **Install via a marketplace** — the supported, updateable path (`/plugin install ...`)
2. **Hand-author at user or project scope** — drop capability files directly into `.claude/skills/`, `.claude/commands/`, etc. without going through the plugin system at all

Both approaches deliver the same model behaviour. The choice is about distribution and lifecycle.

## Method 1 — Marketplace install

This is the standard flow. Two commands per plugin, one one-time setup per marketplace.

### One-time per marketplace

```
/plugin marketplace add <source>
```

The `Add Marketplace` UI accepts five source formats:

| Source | Example | Notes |
|---|---|---|
| GitHub shorthand | `owner/repo` | Resolves to `https://github.com/owner/repo`; the most concise public form |
| SSH Git URL | `git@github.com:owner/repo.git` | For private repos or any host you have SSH access to. Uses your local Git credentials. |
| HTTPS URL pointing at the manifest | `https://example.com/marketplace.json` | Direct link to a hosted `marketplace.json` — useful for self-hosted catalogues that aren't backed by a Git repo |
| Local absolute path | `/home/you/repos/my-framework` | For developing against an in-flight plugin or marketplace |
| Local relative path | `./my-framework` | Same as above, relative to your current working directory |

> [!warning]
> `file://` URLs are **not** accepted, despite seeming obvious. The interactive UI returns `"Invalid marketplace source format. Try: owner/repo, https://..., or ./path"`. Use a plain absolute or relative path instead.

### Per plugin

```
/plugin install <plugin-name>@<marketplace-name>
```

Example:

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install documentation-guide@sids-plugin-marketplace
/reload-plugins
```

The `@<marketplace-name>` suffix disambiguates plugins with the same name shipped from different marketplaces.

### Choosing a scope

`/plugin install` writes the `enabledPlugins` boolean into a `settings.json`. The scope determines which file:

| Scope | Use when… |
|---|---|
| **User** (`~/.claude/settings.json`) | You want this plugin available in every project on this machine |
| **Project** (`<repo>/.claude/settings.json`, committed) | You want everyone who clones the repo to get this plugin auto-enabled (the **dogfood** pattern) |
| **Local** (`<repo>/.claude/settings.local.json`, gitignored) | You want it only in this project, only for you, not for teammates |

Multi-scope enable is harmless — see [Storage and Scope](./02_storage-and-scope.md). The plugin loads once regardless.

## Method 2 — Hand-author at user or project scope

You don't need a plugin to add a skill, slash command, subagent, or hook. You can drop the capability files directly into a scope's `.claude/` folder:

```
~/.claude/                              # user scope (your machine, all projects)
├── skills/<name>/SKILL.md
├── commands/<name>.md
└── agents/<name>.md

<repo>/.claude/                         # project scope (this repo, all team members)
├── skills/<name>/SKILL.md
├── commands/<name>.md
└── agents/<name>.md
```

These get loaded by Claude Code at session start the same way plugin capabilities do. The model sees them in its skill/command list and can trigger them.

### Why this is sometimes the right call

| Scenario | Hand-author | Plugin |
|---|---|---|
| One skill, one project, never sharing | ✅ | overkill |
| Personal slash command for your own workflow | ✅ | overkill |
| Shared across 3+ projects or 2+ people | ⚠️ painful to sync | ✅ |
| Need updates pushed to consumers | ❌ no mechanism | ✅ `/plugin update` |
| Want discoverability via marketplace | ❌ | ✅ |

Hand-authoring is the right answer for one-off capabilities. The moment you find yourself copying the same skill into a second project, that's the signal to package it as a plugin.

### Direct copy of a plugin

If you have a plugin folder and just want to drop it in without going through a marketplace, you can:

1. Copy the plugin's contents (skills, commands, agents) into `~/.claude/` or `<repo>/.claude/`
2. Skip the manifest — `plugin.json` is metadata for the install system, not for runtime loading

This loses you `/plugin update`, version tracking, and the marketplace's discovery surface. It's a one-way fork — fine for prototyping or deeply customising someone else's plugin, but not how you'd ship something to users.

## Verifying an install worked

After installing and `/reload-plugins`:

```bash
# Plugin files in cache
ls ~/.claude/plugins/cache/<marketplace>/<plugin>/

# enabledPlugins boolean in settings
grep enabledPlugins ~/.claude/settings.json
# OR
grep enabledPlugins <repo>/.claude/settings.json     # if installed at project scope

# CLI wrappers (if the plugin ships any) on PATH
which <wrapper-name>
# Should resolve to ~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/bin/<wrapper-name>
```

The `/reload-plugins` output also reports aggregate counts — for example, `Reloaded: 5 plugins · 4 skills · 5 agents · 1 hook · 0 plugin MCP servers · 1 plugin LSP server`. If your plugin's skill/command count is missing from those numbers, the install probably didn't take.

## See also

- **[Marketplaces](./04_marketplaces.md)** — what a marketplace is and how to set one up
- **[Testing and Benchmarking](./05_creating-plugins/05_testing-and-benchmarking.md)** — iterating on a plugin during development
