# agent-ks

The plugin for the [agent-knowledge-system](https://github.com/sidhanthapoddar99/agent-knowledge-system) framework. It teaches an AI agent to set up and configure a project, write docs and blog posts, and run the folder-per-issue tracker. It also covers HTML artifacts and the `agent-ks` CLI. Every command is a skill folder under `skills/`. Claude Code and Codex both read skill folders. The CLI is a separately installed Rust binary.

## Install for Claude Code

The plugin ships through [sids-plugin-marketplace](https://github.com/sidhanthapoddar99/sids-plugin-marketplace):

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install agent-ks@sids-plugin-marketplace
/reload-plugins
```

Install the standalone toolkit as described below, then run these commands from the directory containing `config/`:

```
agent-ks help
agent-ks issue list --priority high
agent-ks check config
```

## Install for Codex

Codex 0.149 or later installs the plugin from the same marketplace. Codex reads `.codex-plugin/plugin.json` in this folder:

```bash
codex plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
codex plugin add agent-ks@sids-plugin-marketplace
```

Codex lists the skills with the prefix `agent-ks:`. Then put the CLI on `PATH`. See [The CLI on PATH](#the-cli-on-path).

## Install the skills only, no plugin, no marketplace

The [skills CLI](https://github.com/vercel-labs/skills) copies skill folders from a git repo straight into the skills folder of each agent. It knows Claude Code, Codex, OpenCode, Hermes and more. One command, pick the agents and skills when it asks:

```bash
npx skills add sidhanthapoddar99/agent-knowledge-system -g
```

Or with no questions, every skill into every agent it finds:

```bash
npx skills add sidhanthapoddar99/agent-knowledge-system -g --all
```

`npx skills add sidhanthapoddar99/agent-knowledge-system --list` shows the skill names. `--skill <name>` picks some. `-a <agent>` picks agents. Drop `-g` to install into the current project only. `npx skills update` pulls new versions.

This installs the skills alone. The CLI is not on `PATH` yet. See [The CLI on PATH](#the-cli-on-path).

**Claude Code, one session, from a checkout.** Load the plugin folder with a flag. No install at all:

```bash
claude --plugin-dir /path/to/agent-knowledge-system/plugins/agent-ks
```

## Install for OpenCode, Hermes and other agents

Every skill is a plain folder with a `SKILL.md`. Any agent that reads the skill format can use them. Clone the framework repo once, then link the `skills/` folder into the place your agent scans:

| Agent | Skill folder it scans |
|---|---|
| OpenCode | `.agents/skills/` in the project, or `~/.config/opencode/skills/` for all projects |
| Hermes Agent | `~/.hermes/skills/` |
| Other | the agent's own skills folder, one sub-folder per skill |

```bash
git clone https://github.com/sidhanthapoddar99/agent-knowledge-system.git
ln -s "$PWD/agent-knowledge-system/plugins/agent-ks/skills/"* ~/.config/opencode/skills/   # OpenCode
ln -s "$PWD/agent-knowledge-system/plugins/agent-ks/skills/"* ~/.hermes/skills/            # Hermes
```

Restart the agent, or start a new session, so it finds the new skills. Then put the CLI on `PATH`.

The `agents/` folder is Claude-only. Elsewhere, [the index-check skill](./skills/agent-ks-index-check/SKILL.md) runs the check by hand.

## The CLI on PATH

Install the standalone Rust binary once per workstation:

```bash
curl -fsSL https://raw.githubusercontent.com/sidhanthapoddar99/agent-knowledge-system/main/agent-ks-cli/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
agent-ks --help
```

The installer selects a versioned GitHub CLI release and verifies its checksum. See [installation](./skills/agent-ks-cli/references/installation.md) for Windows, pinned versions, config selection and viewer dependencies. The plugin's installation directory is independent of the executable.

## The skills

| Skill | Use | Invoke |
|---|---|---|
| [agent-ks-cli](./skills/agent-ks-cli/SKILL.md) | the CLI contract, every command and flag, the file templates | loads when a command is needed |
| [agent-ks-config](./skills/agent-ks-config/SKILL.md) | setup and configuration: a new project from the starter template, a new section, `site.yaml`, navbar and footer, themes, layouts, custom pages, migrations | triggers on config work; `/agent-ks-config`, `/agent-ks-config section <name>` |
| [agent-ks-docs](./skills/agent-ks-docs/SKILL.md) | pages inside a docs section: prefixes, folder settings, frontmatter, links, diagrams, images | triggers on docs work |
| [agent-ks-blog](./skills/agent-ks-blog/SKILL.md) | blog posts: names, frontmatter, assets, the index | triggers on blog work |
| [agent-ks-issues](./skills/agent-ks-issues/SKILL.md) | the issue tracker: issues, subtasks, plans, agent memory | triggers on tracker work |
| [agent-ks-issue-logs](./skills/agent-ks-issue-logs/SKILL.md) | agent logs: when a run earns one, the six kinds, the shape of each | triggers on agent-log work |
| [agent-ks-qna](./skills/agent-ks-qna/SKILL.md) | scope a subtask or a stage by question and answer: the why, done-when, guardrails, decisions with reasons, so a long run never stops to ask | triggers when a subtask or plan is being defined, or a story is told |
| [agent-ks-artifacts](./skills/agent-ks-artifacts/SKILL.md) | self-contained HTML artifacts: reports, dashboards, data visualizations, design systems | triggers on artifact work |
| [agent-ks-quick-idea-note](./skills/agent-ks-quick-idea-note/SKILL.md) | capture an idea into the issue dump | `/agent-ks-quick-idea-note [idea]` |
| [agent-ks-index-check](./skills/agent-ks-index-check/SKILL.md) | check an index against the files it names; reports only | `/agent-ks-index-check [path]` |

The Claude-only agent `agent-ks-index-checker`, in [agents/](./agents/agent-ks-index-checker.md), is a shim. It reads the index-check skill and follows it.

## The CLI

One entrypoint, `agent-ks`. Bare invocation shows the project overview. `issue context` provides a bounded brief; `issue tree` lists files; `find` searches content and config. The existing issue, check, doc, blog, git and theme groups cover authoring and inspection. `start` manages the viewer. Use `agent-ks help --json` for the catalog or any command's `--help` for flags and examples.

The native source lives in the framework repository's `agent-ks-cli/`. The plugin supplies the [CLI skill](./skills/agent-ks-cli/SKILL.md) and its templates, which the binary embeds at build time.

## Release independently

The plugin version is declared in both `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`; the two values must agree. Each version also has a standalone note under [`release-notes/`](./release-notes/). After those files are committed on `main`, the repository owner tags the commit as `agent-ks-plugin-vX.Y.Z`.

The [plugin tag workflow](../../.github/workflows/agent-ks-plugin-release.yml) validates the tag, both manifests, the note, the full commit SHA, and the exact `plugins/agent-ks/` Git tree ID. It then advances `plugin-latest` with numeric non-regression and race protection. It creates no GitHub release page or archive; plugin installation remains a marketplace operation.

## Requirements

- Install the `agent-ks` binary on PATH.
- Run from a directory containing `config/`, or select config through `--config-dir` or `AGENTKS_CONFIG_FOLDER`.
- Git commands require Git. Image optimization requires ImageMagick. The viewer requires Node.js or Bun.

## License

MIT. See [LICENSE](./LICENSE).
