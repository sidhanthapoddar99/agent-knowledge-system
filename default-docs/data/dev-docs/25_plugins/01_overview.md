---
title: Plugins Overview
description: What a Claude Code plugin is, what it can ship, and why plugins exist
---

# Plugins Overview

A **Claude Code plugin** is a bundle of capabilities you can install into Claude Code with one command. The plugin itself is just packaging — what it actually delivers are skills, slash commands, subagents, hooks, MCP servers, and CLI wrappers. The model never reasons about "the plugin" as a unit; it sees the unpacked capabilities directly.

## What a plugin can ship

A plugin folder may contain any combination of:

| Capability | What it is | Folder |
|---|---|---|
| **Skill** | Markdown the model reads when triggered (project conventions, domain knowledge) | `skills/<name>/SKILL.md` |
| **Slash command** | Templated prompt invoked by `/<name>` | `commands/<name>.md` |
| **Subagent** | Specialised Claude config the main agent can spawn | `agents/<name>.md` |
| **Hook** | Shell command the runtime fires on lifecycle events | `hooks/` (or `hooks` in `settings.json`) |
| **MCP server** | Separate process exposing tools, resources, prompts | `.mcp.json` |
| **CLI wrappers** | Executable shell scripts auto-added to `$PATH` | `bin/` |

A plugin can ship just one of these or all of them. The folders only exist if there's something inside.

## The mental model

Plugins solve **distribution problems**, not capability problems. Every capability above can be hand-authored at user or project scope without any plugin. Plugins exist so you can:

- Install once with `/plugin install <name>@<marketplace>` instead of hand-copying files
- Push updates to consumers via `/plugin update`
- Discover capabilities through marketplaces
- Trust an author + marketplace combination instead of trusting individual files
- Carry version metadata; multiple versions can coexist in the cache

Without plugins, every team would be reinventing the same skills/commands and hand-syncing them across projects. Plugins are the package manager for Claude Code capabilities.

> [!note]
> The model sees `documentation-guide:agent-ks-docs` and `claude-md-management:revise-claude-md` in its skill list — the prefix before the colon is the plugin namespace. This is purely for collision avoidance; the model doesn't reason about "documentation-guide the plugin." It reasons about the skill's description and decides whether to trigger.

## Where plugins fit in the broader extensions ecosystem

Claude Code has six extension surfaces. Five are capabilities; the sixth is the bundle:

```
PLUGIN  ─── packages any subset of ───►  Skill · Command · Hook · MCP · Subagent
```

If you want to ship one skill to one machine, you don't need a plugin — drop the SKILL.md into `~/.claude/skills/` and you're done. If you want to ship that skill plus three commands plus a hook to twenty teammates, that's what a plugin is for.

## Building plugins and skills

For development iteration, the `--plugin-dir` flag loads any plugin folder directly from disk for the session — no marketplace registration, no install, no cache copy:

```
claude --plugin-dir ./path/to/your-plugin
```

If a plugin with the same name is already installed, this shadows it for the session. See [Testing and Benchmarking](./05_creating-plugins/05_testing-and-benchmarking.md) for the full iteration flow.

### Two official plugins worth installing once

Anthropic ships two plugins on the official marketplace (`claude-plugins-official`) that anyone authoring extensions should treat as must-haves. They're independent — install whichever match what you're building, once, and they're available across every project on this machine.

| Plugin | What it covers | Install |
|---|---|---|
| `plugin-dev` | Building plugins end-to-end — 7 expert skills covering hooks, MCP integration, commands, agents (subagents), best practices, AI-assisted creation and validation | `/plugin install plugin-dev@claude-plugins-official` |
| `skill-creator` | Building, improving, and benchmarking skills — includes an eval framework with variance analysis (the same skill the [Testing and Benchmarking](./05_creating-plugins/05_testing-and-benchmarking.md) page points at) | `/plugin install skill-creator@claude-plugins-official` |

> [!note]
> Need to scaffold a single subagent without going through `plugin-dev`? Claude Code's built-in `/agents` command opens a guided creation flow — no install required.

Both plugins are optional — you can hand-author every capability without them. They just shorten the loop.

## What's in this section

- **[Storage and Scope](./02_storage-and-scope.md)** — where plugin files live, the boolean-per-scope model, why multi-scope enables don't duplicate
- **[Installation](./03_installation.md)** — installing via marketplace vs hand-authoring capabilities directly; the five accepted marketplace source formats
- **[Marketplaces](./04_marketplaces.md)** — what a marketplace is, how to host one
- **[Creating Plugins](./05_creating-plugins/01_ecosystem-mental-model.md)** — deep dive on building your own
- **[Uninstalling](./06_uninstalling.md)** — removing plugins and marketplaces, and why the cache survives (matters for clean-install testing)
