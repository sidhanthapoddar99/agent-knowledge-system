---
title: Ecosystem Mental Model
description: How plugins fit into the broader Claude Code ecosystem — what the model sees, what the runtime sees
---

# Ecosystem Mental Model

Before writing a plugin, internalise this: **the model never sees "the plugin"**. It sees the unpacked capabilities the plugin happens to ship — skills, commands, subagents, tools registered by MCP servers. The plugin folder, the manifest, the marketplace metadata — none of that exists in the model's reasoning. It's all bundling.

Why this matters: it changes how you write your plugin. You're not writing for the plugin system; you're writing for the capabilities the plugin contains.

## What the model actually sees

After plugin installation, when a Claude Code session starts:

1. **Skill metadata** is loaded into context (~50-100 words per skill). The model sees `skill-name + description` and decides whether to trigger.
2. **Slash command metadata** is loaded similarly — the model knows the command exists and what it does. The user can fire it directly.
3. **Subagent metadata** is in the system prompt's available-agents list. The model can spawn them via the `Agent` tool.
4. **MCP tools** appear in the model's tool list as `mcp__<server>__<tool>`. From the model's perspective, they're just tools.
5. **CLI wrappers in `bin/`** are added to `$PATH`. The model uses them via the `Bash` tool, same as any system command.
6. **Hooks** never appear to the model — they fire in the runtime, before/after tool calls.

There is no concept of "this skill belongs to plugin X." The skill name might be prefixed with the plugin namespace (`agent-ks:agent-ks-docs`) for collision avoidance, but the model treats the prefix as part of the name, not as a structural relationship.

## What the runtime sees

The runtime (Claude Code itself, not the model) knows about plugins as units. It uses them for:

- **Loading**: scan `~/.claude/plugins/cache/`, read each plugin's `plugin.json`, load enabled plugins per scope's `settings.json`
- **Updating**: `/plugin update` re-fetches from the marketplace
- **Disabling/enabling**: flip the `enabledPlugins` boolean in a scope's `settings.json`
- **PATH augmentation**: every installed plugin's `bin/` folder is added to the bash `$PATH` at session start

The runtime is also what enforces the plugin's `allowed-tools` lists, hook matchers, and other configuration that lives in the plugin's metadata.

## Plugin = packaging, capabilities = behaviour

| Layer | Sees plugins as units? | Sees capabilities? |
|---|---|---|
| **Marketplace UI** (`/plugin`) | Yes | No (browses by plugin name + description) |
| **Runtime / Claude Code** | Yes | Yes (loads them, manages PATH, fires hooks) |
| **Model / Claude** | No | Yes (skills, commands, tools, agents) |

This split is why you can hand-author a skill at user scope (`~/.claude/skills/<name>/SKILL.md`) and the model treats it identically to a plugin-shipped skill. The plugin system doesn't add new capability types — it just makes those capabilities easier to distribute.

## When to package as a plugin vs hand-author

| Situation | Hand-author at user/project scope | Package as a plugin |
|---|---|---|
| One skill, one project | ✅ | overkill |
| Personal command for your own workflow | ✅ | overkill |
| Convention shared across 3+ projects | ⚠️ painful to keep in sync | ✅ |
| Need updates pushed to consumers | ❌ no mechanism | ✅ `/plugin update` |
| Need discoverability for others | ❌ | ✅ marketplaces |
| Need versioning / multiple versions in cache | ❌ | ✅ |

The decision usually surfaces the second time you copy the same SKILL.md into a new project. That's the signal to package.

## What capabilities can a plugin combine?

Any subset of these:

- **Skill** — markdown the model reads when triggered. See [Capabilities](./03_capabilities.md).
- **Slash command** — templated prompt fired by `/<name>`. See [Capabilities](./03_capabilities.md).
- **Subagent** — specialised Claude config the main agent can spawn. See [Capabilities](./03_capabilities.md).
- **Hook** — runtime-fired shell command on lifecycle events. See [Capabilities](./03_capabilities.md).
- **MCP server** — separate process exposing tools. See [Capabilities](./03_capabilities.md).
- **CLI wrappers** — executable scripts auto-added to `$PATH`. See [Bin Wrappers](./04_bin-wrappers.md).

A plugin can ship one of these, all of them, or any combination. There's no requirement.

## Building one yourself

The packaging-vs-capabilities split shows up in the dev loop too. While iterating, `claude --plugin-dir <path-to-plugin>` loads a plugin folder directly from disk for the session — no marketplace, no install. The model still sees only the capabilities; the runtime treats the on-disk folder as if it were cached. See [Testing and Benchmarking](./05_testing-and-benchmarking.md) for the full flow.

If you'd rather not hand-author the manifest and folder layout, install the `plugin-dev` skill from the official marketplace:

```
/plugin install plugin-dev@claude-plugins-official
```

It's a guided scaffolder for plugin structure. Optional, but a faster start than writing `.claude-plugin/plugin.json` from scratch.

## A note on naming and collision

When the same name appears in multiple sources (a hand-authored project skill plus a plugin-shipped skill of the same name), the runtime de-duplicates and the user sees one — but it's not always obvious *which* one. Best practice: prefix everything in your plugin with the plugin's namespace (`docs-list`, `docs-show`, ... rather than `list`, `show`, ...). Same for skill names, command names, and subagent names.

## See also

- **[Plugin Structure](./02_plugin-structure.md)** — folder layout and the manifest
- **[Capabilities](./03_capabilities.md)** — deep dive on each capability type
- **[Bin Wrappers](./04_bin-wrappers.md)** — the `bin/` pattern in detail
