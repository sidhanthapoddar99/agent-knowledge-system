# agent-ks

The plugin for the [agent-knowledge-system](https://github.com/sidhanthapoddar99/agent-knowledge-system) framework. It teaches an AI agent to set up and configure a project, write docs and blog posts, and run the folder-per-issue tracker. It also covers HTML artifacts and the `agent-ks` CLI. Every command is a skill folder under `skills/`. Claude Code and Codex both read skill folders. The CLI runs on bun.

## Install for Claude Code

The plugin ships through [sids-plugin-marketplace](https://github.com/sidhanthapoddar99/sids-plugin-marketplace):

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install agent-ks@sids-plugin-marketplace
/reload-plugins
```

Claude Code adds the plugin's `bin/` to `PATH` at session start. So `agent-ks` is on `PATH` at once. Try:

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

Claude Code puts `bin/` on `PATH` by itself. Every other agent needs one line in the shell profile, pointing at a checkout of the framework repo:

```bash
export PATH="$PATH:/path/to/agent-knowledge-system/plugins/agent-ks/bin"
```

Install [bun](https://bun.sh) if it is missing. The CLI requires bun and refuses to run on node. Check with `agent-ks help`.

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

One entrypoint, `agent-ks`. Every operation is `agent-ks <group> <verb>`. The groups: `issue` (tracker), `check` (validators), `doc` and `blog` (content), `git` (content history), `theme` (tokens). Three verbs stand alone: `find`, `move` and `img`. `agent-ks help` lists every command. `agent-ks help <command>` shows its flags. `--json` gives machine output. The code lives in `skills/agent-ks-cli/scripts/`. `bin/agent-ks` (bash) and `bin/agent-ks.cmd` (Windows) are shims that run it with bun. [The cli skill](./skills/agent-ks-cli/SKILL.md) holds the contract and the exit codes.

## Requirements

- bun on `PATH`.
- A project shaped for the framework: the `agent-knowledge-system/` framework folder, with `CONFIG_DIR` in its `.env` pointing at the project's `config/`.

## License

MIT. See [LICENSE](./LICENSE).
