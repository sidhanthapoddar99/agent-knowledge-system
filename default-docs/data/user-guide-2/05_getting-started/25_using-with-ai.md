---
title: "Use agentks with AI agents"
description: "Install the agentks plugin, what its skills teach an agent, and the commands an agent uses to work in a project."
---

agentks is built for work where an AI agent writes most of the content and you read, review and make small edits. This page connects an agent to agentks: you install the **agentks plugin**, and the agent works through `agentks` commands.

## Install the plugin

A **plugin** is a folder of skills for an AI agent. A **skill** is a set of instructions the agent loads when a task matches it, such as writing a docs page or updating an issue. The agentks plugin teaches an agent agentks's conventions, so you do not explain them every session.

In Claude Code, add the Neuralabs marketplace once, then install the plugin:

```
/plugin marketplace add NeuraLabsHQ/neuralabs-plugin-marketplace
/plugin install agentks@neuralabs-plugin-marketplace
```

The skills are plain folders, so Codex reads the same skills through its own plugin mechanism.

The plugin does not install the binary. Install `agentks` itself as [Install and update agentks](./05_install.md) shows, then check that the agent can run it:

```sh
agentks --version
```

## What the skills cover

The agent loads the right skill when a task matches, so you rarely name one.

| Skill | Teaches the agent |
|---|---|
| `agentks-config` | A new project, a new section, every file in `config/`, themes and CSS, migrations |
| `agentks-docs` | Pages in a docs section: prefixes, `settings.json`, frontmatter, links, diagrams, images, moving pages |
| `agentks-blog` | Blog posts: the dated file name, frontmatter, a post's images |
| `agentks-issues` | The issue tracker: issues, subtasks, plans, comments, notes and agent memory |
| `agentks-issue-logs` | Agent logs: when a run earns one, and the kinds of log |
| `agentks-qna` | Scoping a subtask by question and answer before a long, unattended run |
| `agentks-artifacts` | Self-contained HTML artifacts: reports, dashboards, charts, design pages |
| `agentks-cli` | The `agentks` commands, their output and their exit codes |
| `agentks-quick-idea-note` | Parking a half-formed idea in the tracker without ceremony |
| `agentks-index-check` | Checking whether an index, such as a plan, still matches the files it names |

A second, smaller plugin serves people who build and host libraries. See [Libraries](../40_libraries/01_overview.md).

## The CLI is the agent's tool

An agent reads files, not the site. So everything the site shows, and every rule it applies, is also available as a command. The commands and the site share one engine, so a problem that `agentks check` reports is exactly what the page shows.

Some commands an agent runs often:

```sh
agentks issue list --status all --search 'authentication' --json
agentks issue context 2026-09-06-cli --last 2 --max-chars 2000 --json
agentks find 'release process' --fixed-strings --context 2 --limit 20 --json
agentks check section data/guide
agentks check link-form
agentks move data/guide/10_old.md data/guide/20_new.md --dry-run
```

Every command follows the same rules, which is what makes it safe for an agent:

| Rule | Detail |
|---|---|
| Machine-readable output | `--json` writes exactly one JSON document to stdout. Messages and errors go to stderr |
| Exit codes | `0` success. `1` no result, a runtime error or validation errors. `2` invalid usage |
| No guessing | An unknown flag is an error, so a query is never silently widened |
| Self-describing | `agentks help` lists every command. `agentks help issue list --json` describes one |
| Links stay correct | `agentks move` renames a file or folder and rewrites every link to it |
| Commits stay small | `agentks git commit` stages and commits one content path, and never pushes |

## The binary is the reference

The skills describe how to work. They do not copy facts the binary can print, because your plugin and your binary can be on different versions. Instead, a skill sends the agent to the command that answers for the installed version:

| Question | Command |
|---|---|
| Which commands and flags exist? | `agentks help <group> <command> --json` |
| Which CSS classes and theme variables can I override? | `agentks theme css` and `agentks theme tokens --json` |
| What do this project's libraries offer? | `agentks library list`, `agentks library show <alias>`, `agentks library find <words>` |
| Is this content valid? | `agentks check …` |
| How does a feature work? | `agentks docs <page>` opens that page of these docs |

## Where the agent stops and asks you

The skills keep some decisions with you:

- **Closing work.** An agent sets an issue to `review` when it thinks the work is finished. Marking it `done` is your call. See [the issue tracker](../30_issue-tracker/01_overview.md).
- **Deleting outside the project.** `agentks cache clean` removes files from the machine home. An agent runs it only when you ask, shows you its report, and waits for your yes.
- **Commits and pushes.** `agentks git commit` never pushes. Pushing is yours.

## Next

[The machine home and cleanup](./30_machine-home.md).
