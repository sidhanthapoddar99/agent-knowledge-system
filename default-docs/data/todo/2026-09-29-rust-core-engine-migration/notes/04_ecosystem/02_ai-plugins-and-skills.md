---
title: "AI plugins and skills"
---

In agentks, a **plugin** always means an AI-agent plugin: a folder of skills (instructions an agent loads when a task matches) for Claude Code, Codex or another agent. It never means a code extension of agentks; those are [extensions](./03_extensions.md). agentks ships **two plugins**, both in the main repository's `plugins/` folder. The first is `agentks`, the usage plugin: today's `agent-ks` skills, renamed and rewritten for the new version. The second is a smaller plugin for people who build and host libraries. Both are installed through the Neuralabs marketplace, `neuralabshq/neuralabs-plugin-marketplace`, which only points at them. The skills treat the binary as the source of truth: they send the agent to `agentks help`, the manifests of the installed libraries, the compiled CSS and the hosted docs, and do not copy them. The new plugins are written before the switch-over, and the marketplace goes live in step 2 of the launch. Hooks for Claude Code and Codex, and a retrieval index for agents, are a later stage.

# 03 References

- [Launch: order, hosting, retiring this repository](../../brainstorm/02_future-stages/10_launch-order-and-hosting.md): the two plugins, the marketplace move, the switch-over.
- [The repositories and three states](../../brainstorm/02_future-stages/12_repositories-and-three-states.md): where `plugins/` lives.
- [Agent hooks and fast retrieval](../../brainstorm/02_future-stages/05_agent-hooks-and-retrieval.md): the later stage.
- [Libraries, dep.yaml and dep.lock](../../brainstorm/02_future-stages/09_libraries-and-dependencies.md), section 07: how the CLI and skills use libraries.
- [CSS and theming](../../brainstorm/01_initial-discussion/10_css-and-theming.md): the CSS command a skill points to.
- [The agentks docs command](../../brainstorm/02_future-stages/08_agentks-docs-command.md): skills link to the hosted docs.
- Today's plugin: [plugins/agent-ks](../../../../../../plugins/agent-ks), with its [Claude Code manifest](../../../../../../plugins/agent-ks/.claude-plugin/plugin.json), its [Codex manifest](../../../../../../plugins/agent-ks/.codex-plugin/plugin.json) and [its skills](../../../../../../plugins/agent-ks/skills).
- Today's bundled issue guide, [guide.ts](../../../../../../agent-ks-engine/src/layouts/issues/default/guide.ts): the engine-side twin of the issues skill.
- Sibling notes: [library system](./01_library-system.md), [Rust CLI](../02_engine/05_rust-cli.md), [theming and layouts](../03_frontend/04_theming-and-layouts.md), [repositories and layout](../05_delivery/01_repositories-and-layout.md), [docs rewrite and launch](../05_delivery/07_docs-rewrite-and-launch.md), [deployment and hosting](../05_delivery/06_deployment-and-hosting.md).
- [2026-04-19-site-wide-search](../../../2026-04-19-site-wide-search/issue.md) and [2026-04-19-knowledge-graph-and-wiki-links](../../../2026-04-19-knowledge-graph-and-wiki-links/issue.md): the search and link graph a retrieval index would share.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the rename covers the plugin and the skills (`agent-ks` becomes `agentks`), so nothing is left ambiguous.
- Decided (sidhantha, 2026-09-29): a skill teaches how to override CSS and points to the CLI command that prints the compiled CSS as its reference.
- Decided (sidhantha, 2026-09-30): **plugin** means an AI-agent plugin with skills, for Claude Code, Codex or another agent. **Library** means a dependency in `dep.yaml`.
- Decided (sidhantha, 2026-09-30): two agentks plugins: one for using agentks, and a smaller, developer-oriented one for building and hosting libraries.
- Decided (sidhantha, 2026-09-30): both plugins live in the main repository's `plugins/` folder. The Claude Code marketplace moves from the personal account to `neuralabshq/neuralabs-plugin-marketplace`, which serves all of Neuralabs. The personal marketplace stays for personal plugins.
- Decided (sidhantha, 2026-09-30): the CLI and the skills use the installed libraries to help agents build better docs.
- Decided (sidhantha, 2026-09-30): until the new docs are fully migrated and usable, this repository's docs and skills stay in use. The skills for the new version are ready before the switch.
- Decided (sidhantha, 2026-09-30): the marketplace goes live in step 2 of the launch, after the engine, client and default library work end to end.
- Decided (sidhantha, 2026-09-29): hooks for Claude Code and Codex, and fast retrieval for agents, are a later stage.
- Decided (claude, 2026-09-30): the library-development plugin's working name is `agentks-library`. The user can rename it.
- Decided (claude, 2026-09-30): skills never copy facts the binary can print. They name the command instead, so a skill cannot go stale against the installed version.

# 05 Notes & Analysis

## 01 Terms

| Term | Meaning |
|---|---|
| **Plugin** | An AI-agent plugin: a folder of skills with a manifest per agent (`.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`) |
| **Skill** | One folder with a `SKILL.md` and optional references. The agent loads it when the task matches its description |
| **Marketplace** | A repository whose manifest lists plugins and where to fetch them. Claude Code installs plugins from it |
| **Library** | A `dep.yaml` dependency. Not a plugin ([library system](./01_library-system.md)) |
| **Extension** | A possible later way to add `agentksx` commands and site scripts. Not a plugin ([extensions](./03_extensions.md)) |

## 02 The two plugins

| Plugin | For | Holds |
|---|---|---|
| `agentks` (usage) | Anyone writing docs, issues, blog posts or artifacts with agentks | Today's ten skills, renamed and rewritten for the new version (section 03) |
| `agentks-library` (working name) | People who build or host libraries and templates | The `manifest.json` format and its checks, a `library.json` entry, testing a library locally through a `path:` entry, tagging x.y.z versions, the engine range, running library migrations for a breaking engine release |

Both are plain skill folders, so Claude Code and Codex read the same files. Each has one manifest per agent, as the plugin has today ([the Claude Code manifest](../../../../../../plugins/agent-ks/.claude-plugin/plugin.json), [the Codex manifest](../../../../../../plugins/agent-ks/.codex-plugin/plugin.json)).

## 03 The usage plugin's skills

Today's skills carry over under the new prefix. Each is rewritten for the new version; none is copied unchanged.

| Today | New | What changes |
|---|---|---|
| `agent-ks-config` | `agentks-config` | No framework folder and no `CONFIG_DIR`: a project is a folder with `config/`. New project through `agentks init --template`. `dep.yaml` and `dep.lock` join the config files. Custom layouts are gone: branding is CSS, starting from `agentks theme css`. Migrations run through `agentks migrate` |
| `agent-ks-docs` | `agentks-docs` | Markdown stays plain: `[text](path)` links and `[[path]]` embeds, both relative. No library names in markdown |
| `agent-ks-blog` | `agentks-blog` | The rename only, unless the blog layout changes |
| `agent-ks-issues` · `agent-ks-issue-logs` · `agent-ks-qna` · `agent-ks-quick-idea-note` · `agent-ks-index-check` | `agentks-…` | The rename, and the CLI's new name in every example. The tracker's anatomy does not change with the engine |
| `agent-ks-artifacts` | `agentks-artifacts` | Runs `agentks library find` before building an icon, a frame or an artifact from scratch. Loads elements through `/_lib/<alias>/<element>`. Knows that library HTML is sandboxed and a library script runs with the artifact's rights |
| `agent-ks-cli` | `agentks-cli` | The new command surface: `library`, `install`, `cache`, `init --template`, `build`, `migrate`, `docs` ([Rust CLI](../02_engine/05_rust-cli.md)) |
| — | a video skill, when video pages ship | How to write a video page, its cues, and how to find elements with `library find` ([video pages](./05_video-pages.md)) |

**Libraries in the skills.** Before building a reusable visual, the artifacts skill and the video skill tell the agent to run `agentks library find <words> --json`, then `agentks library show <alias>`. Reusing an element costs a few tokens. Generating one costs thousands and looks different each time. Adding a library is the config skill's job; it uses `agentks library add` or `agentks library search`, never the TUI, because an agent cannot drive a TUI.

**Skills that delete outside the project.** `agentks cache clean` removes files in `~/.agentks/`. The skills tell the agent to run it only when the user asks, show its report, and wait for the user's yes.

## 04 The binary is the reference, not the skill

A skill describes how to work. It does not hold facts that the installed binary owns, because a plugin and a binary can be on different versions.

| Fact | Where the skill sends the agent |
|---|---|
| Commands and flags | `agentks help <command> --json` |
| The compiled CSS, stable CSS hooks and theme variables | `agentks theme css` and `agentks theme tokens --json` |
| What the project's libraries offer | `agentks library list` · `show` · `find` |
| What the catalog offers | `agentks library search` |
| Whether content is valid | `agentks check …` |
| How a feature works in depth | The hosted docs at agentks.neuralabs.org/docs, one link per page. `agentks docs <page>` opens one |

This replaces today's two workarounds. Today the artifacts skill keeps an inline copy of the theme variables, and the skills link into the bundled user guide in the framework checkout. After the migration there is no framework checkout on the machine, and `agentks theme css` prints the real contract for the installed version.

**The issue guide.** The engine keeps a short issue-anatomy guide that the issues layout shows on every issue ([guide.ts](../../../../../../agent-ks-engine/src/layouts/issues/default/guide.ts) today). It is the plugin-independent twin of the issues skill, so the two stay in step: the skill holds the full manual, the engine holds the map.

## 05 The marketplace

```
neuralabshq/neuralabs-plugin-marketplace/          all of Neuralabs
  .claude-plugin/marketplace.json        lists agentks and agentks-library,
                                         each pointing at the main repository's plugins/<name>

neuralabshq/agent-knowledge-system/
  plugins/
    agentks/                             the usage plugin
    agentks-library/                     the library-development plugin
```

- The marketplace holds no plugin code. Each entry points at a folder of the main repository, so a plugin changes in the same commit as the engine behaviour it describes.
- Each plugin is versioned in its own manifests, independently of the installer and the default library ([versioning and migrations](../05_delivery/03_versioning-and-migrations.md)).
- The personal marketplace keeps personal plugins. At the switch-over, its `agent-ks` entry is removed, so there is only one place to install agentks skills from.
- Codex installs the same folders through its own plugin mechanism.

## 06 When the new plugins ship

- **Step 1** of the launch builds the engine, the client and the default library. The skills are rewritten against the real tool as it takes shape.
- **Step 2** puts the marketplace live with both plugins. The skills now describe the new binary.
- **Until the switch-over**, users of this repository keep today's `agent-ks` plugin, docs and binary. The switch happens at once, when the new docs are complete ([docs rewrite and launch](../05_delivery/07_docs-rewrite-and-launch.md)). Nobody is caught between a new skill and an old binary.

## 07 Later stage: hooks and retrieval

Not part of 1.0. Recorded so the design leaves room for it.

- **Hooks** run at fixed points in an agent's session (session start, a prompt, before and after a tool call, when a run stops). A Rust binary answers in milliseconds, so a hook can check each edit as it happens: run the file checks on an edited content file, block a shell `mv` inside content and point to `agentks move`, inject an issue's context when a prompt names it, and remind the agent to write a log's handover.
- **The logic lives in the binary.** The plugins hold only thin hook definitions that call `agentks`, so Claude Code and Codex share one implementation. Codex's hook support must be checked before designing for both.
- **Retrieval**: a full-text index (tantivy, a Rust search library, is the candidate) and the link graph, built from the build cache and kept current by the file watcher, behind one query command and possibly an MCP server (the standard way agents call external tools). It should be one index shared with the site's own search.

## 08 Open

Tracked in [open questions and risks](../01_overview/05_open-questions-and-risks.md):

- The library-development plugin's final name.
- Which hooks are worth their noise, whether semantic search earns a model download, and how retrieval merges with the site-wide search issue.
