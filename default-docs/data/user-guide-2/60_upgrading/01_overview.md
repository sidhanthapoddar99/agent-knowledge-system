---
title: "Upgrading"
description: "Move a project from agent-ks 0.x to agentks 1.0, or from one agentks release to the next."
---

This section moves a project to a newer agentks. There are two cases:

- **From agent-ks 0.x to agentks 1.0.** A one-time move. The program changes its name and its install, the project layout changes, and `agentks migrate` converts your content and config. Start with [Upgrade a project from agent-ks 0.x](./05_from-agent-ks-0x.md).
- **From one agentks 1.x release to the next.** Usually nothing to do. When a release changes the content format, the version gate tells you and `agentks migrate` makes the change. See [Upgrading between 1.x releases](./25_within-1x.md).

This section is the one place in these docs that describes agent-ks 0.x. Every other page describes agentks as it is now.

## What changes from agent-ks 0.x, in one screen

| | agent-ks 0.x | agentks 1.0 |
|---|---|---|
| The program | `agent-ks`, plus a framework folder cloned into each project, with its own `node_modules` | One `agentks` binary per machine. Projects carry no framework code |
| Starting the site | `./start`, which needed Bun or Node | `agentks start`, which needs nothing else |
| Finding the config | `CONFIG_DIR` in the framework folder's `.env` | The project's `config/` folder, found from where you run the command |
| `.env` | At the framework root, with `CONFIG_DIR`, `PORT` and `HOST` | Optional, inside `config/`, and it may only override the port |
| Libraries | None | `config/dep.yaml`, required even when empty |
| Custom layouts | Your own layout folders | Gone. Built-in layouts only, styled with CSS |
| The AI plugin | `agent-ks`, with `agent-ks-*` skills | `agentks`, with `agentks-*` skills, from the Neuralabs marketplace |
| The issue tracker | Folder per issue | The same anatomy, unchanged |

[What changes, setting by setting](./10_what-changes.md) has the full list, and [Command changes](./15_command-changes.md) maps every old command to its new form.

## The move at a glance

```mermaid
[[./assets/upgrade-steps.mmd]]
```

1. **Check whether you publish.** If you publish your site with agent-ks 0.x, read [Staying on agent-ks 0.x](./20_staying-on-0x.md) first.
2. **Install agentks** once on the machine. `agent-ks` and `agentks` are different commands, so both can stay installed while you move projects over.
3. **In each project**, commit everything, run `agentks migrate --dry-run` to see the changes, then `agentks migrate` to make them.
4. **Do what the report leaves for you**, such as choosing a built-in layout for a section that had a custom one.
5. **Check the result** with the `agentks check` commands and `agentks start`.
6. **Clean up**: remove the old framework folder, and swap the `agent-ks` plugin for the `agentks` plugin.

## Why the move is forced

agentks supports current content only. It does not read old formats side by side with new ones, because a format it half understands shows wrong pages with no error. So a 0.x project stops at the version gate until you migrate it. If you are not ready, keep using agent-ks 0.x for that project; nothing makes you move before you choose to.

## Safety

`agentks migrate` is built so that a migration cannot quietly damage content:

- It refuses to run on a project that is not in git, or that has uncommitted changes, so you can review every change and undo it with git.
- It always shows a dry run before it changes anything, and asks before it goes on.
- It checks every change afterwards, and reports anything left as an error.
- It raises `engine_version` last. A migration that stops halfway leaves the old version in place, so the version gate still catches the project.
