---
title: Plugin Structure
description: The folder shape, plugin.json manifest, and capability folders
---

# Plugin Structure

Every plugin is a folder with a manifest and at least one capability folder. The shape is fixed; what's inside is up to you.

## The full folder shape

This is taken straight from a working plugin (`documentation-guide`):

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          ← MANIFEST (required)
├── README.md                 ← human-readable; shown in /plugin UI
├── LICENSE                   ← required for distribution; "TBD" placeholder is fine while iterating
├── bin/                      ← AUTO-ADDED TO $PATH at session start
│   ├── docs-guide            ← single dispatcher shim (→ scripts/cli.mjs)
│   └── docs-guide.cmd        ← Windows twin
├── skills/                   ← per-skill folders
│   └── <skill-name>/
│       ├── SKILL.md          ← frontmatter + body
│       ├── references/       ← progressive-disclosure files cited from SKILL.md
│       └── scripts/          ← bundled scripts (.mjs, .py, .sh)
├── commands/                 ← slash commands
│   └── <command-name>.md
├── agents/                   ← subagent configs
│   └── <agent-name>.md
├── hooks/                    ← runtime hooks (or declared in hooks.json)
└── .mcp.json                 ← MCP server registrations
```

Capability folders only need to exist if you have something in them. A plugin shipping just one skill has only `skills/`; a plugin shipping just a hook has only `hooks/`.

## The manifest — `.claude-plugin/plugin.json`

The minimum:

```json
{
  "name": "my-plugin",
  "description": "One-paragraph TL;DR — used in /plugin UI",
  "version": "0.1.0",
  "author": { "name": "Your Name" },
  "homepage": "https://github.com/you/repo",
  "repository": "https://github.com/you/repo"
}
```

### Field reference

| Field | Required | Purpose |
|---|---|---|
| `name` | yes | Plugin identifier; appears in `enabledPlugins`, in marketplace install commands |
| `version` | yes | Semantic version; controls cache folder name and `/plugin update` behaviour |
| `description` | recommended | Information-dense paragraph shown in the `/plugin` browser. Also useful for the model when reasoning about which plugin's tools/skills to use. |
| `author.name` | recommended | Maintainer attribution |
| `author.email` | optional | Contact |
| `homepage` | optional | URL — typically the repo or a documentation site |
| `repository` | optional | Source repo URL |
| `license` | optional | SPDX identifier; once you've picked one |
| `keywords` | optional | Array of search hints for the marketplace browser |

Keep the description rich. It's the user's first read in the plugin browser, and a good description meaningfully reduces "what does this plugin do?" friction.

## Capability folders

### `skills/<name>/`

One folder per skill. Inside:

- `SKILL.md` — required, with YAML frontmatter (`name`, `description`) and the skill body
- `references/` — optional; markdown files the skill body cites and the model reads on demand
- `scripts/` — optional; bundled scripts the skill or commands invoke

A plugin can ship multiple skills — each lives in its own subfolder.

### `commands/<name>.md`

Each markdown file is one slash command. The filename (minus `.md`) becomes the command name, e.g. `commands/docs-init.md` → `/docs-init`.

### `agents/<name>.md`

Each markdown file is one subagent. The filename becomes the subagent type the main agent uses with the `Agent` tool.

### `hooks/`

Either a `hooks/` folder with scripts, or hooks declared inline in `settings.json`-style config. The exact structure depends on the Claude Code release; refer to the official hook docs for current conventions.

### `.mcp.json`

Standard MCP server registration:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/mcp-server.js"]
    }
  }
}
```

`${CLAUDE_PLUGIN_ROOT}` resolves to the plugin's installed cache folder.

### `bin/`

Executable shell scripts. Each plugin's `bin/` is auto-added to `$PATH`. See [Bin Wrappers](./04_bin-wrappers.md) for the pattern and template.

## README and LICENSE

`README.md` is shown in the `/plugin` UI when users browse the marketplace. It should cover:

- One-paragraph "what is this plugin"
- Install command(s)
- Quick example or two
- Inventory of what's inside (which skills, commands, wrappers)
- Requirements / compatibility

`LICENSE` is required if you intend to distribute publicly. A `TBD` placeholder works while iterating, but pick a real license before tagging a 1.0.

## Anti-patterns

- **Don't put everything in `scripts/` and ignore `bin/`** — the `bin/` PATH augmentation is how the model gets cheap access to bundled tooling. See [Bin Wrappers](./04_bin-wrappers.md).
- **Don't write `${CLAUDE_PLUGIN_ROOT}` inside `SKILL.md` bodies** — it doesn't expand for normal tool-call shells. Only commands, hooks, and `allowed-tools` frontmatter get template substitution.
- **Don't ship one giant skill that covers everything** — split by domain. Use the skill body as a triage table; put the depth in `references/<topic>.md` files. The model loads the body when triggered, then reads only the references it needs.
- **Don't ship a plugin just to share one skill** — drop the SKILL.md into `~/.claude/skills/` instead. Plugins shine when there are multiple capabilities or multiple consumers.

## See also

- **[Capabilities](./03_capabilities.md)** — what each capability type does and how to write one
- **[Bin Wrappers](./04_bin-wrappers.md)** — the `bin/` PATH pattern, deeper
- **[Versioning and Publishing](./06_versioning-and-publishing.md)** — what `version` actually controls
