---
name: agent-ks-cli
description: The `agent-ks` command line for an agent-knowledge-system project. One entrypoint, `agent-ks <group> <verb> [flags]`, for every read, write, scaffold and check. Load it before you run any `agent-ks` command, when a command fails, or when you need a flag. It holds the contract, the exit codes, the command groups, the worktree note, and links to the command reference, the author contract and the templates.
---

# The `agent-ks` CLI

One command on PATH: `agent-ks <group> <verb> [flags]`. It needs `bun` and nothing else.

## The contract

| Rule | What it means |
|---|---|
| `--help` or `-h` | Usage to stdout, exit 0, on every command and on bare `agent-ks` |
| `--json` | One JSON document on stdout and nothing else, on every command that returns data |
| Unknown flag | Exit 2 with the valid flags listed. A misspelled filter never widens a result |
| stdout | Data and human output |
| stderr | Errors, warnings, tips |

Exit codes:

| Code | Meaning |
|---|---|
| 0 | Success. For a query: found. For a validator: clean |
| 1 | No result, or a handled runtime error. For a validator: problems found |
| 2 | Usage error: a missing argument or an unknown flag |
| 127 | The command's interpreter is not on PATH |

## Discover, do not memorise

| Command | Shows |
|---|---|
| `agent-ks help` | every command, grouped |
| `agent-ks help <group> <verb>` | one command's flags. A verb that lives in one group resolves alone: `agent-ks help new-round` |
| `agent-ks help --json` | the whole manifest, for machines |
| `agent-ks --version` | the plugin version and the tree it ran from |

## The groups

| Group | Verbs | Use |
|---|---|---|
| (none) | `help` `resolve-context` `find` `move` `img` | search all content, link-aware move, image optimisation |
| `issue` | `list` `show` `subtasks` `agent-logs` `review-queue` `set-state` `add-comment` `add-agent-log` `new-subtask` `new-plan` `new-stage` `new-agent-log` `new-round` | the tracker: read, write, scaffold |
| `check` | `issues` `section` `blog` `config` `link-form` `links` `legacy-tags` `skill-links` | validators; exit 1 on a problem |
| `doc` | `list` `show` `search` | docs pages |
| `blog` | `list` `show` `search` | blog posts |
| `git` | `updated` `changed` `log` `commit` | git-derived content metadata |
| `theme` | `tokens` | the active theme's variables |

Every command and flag: [cli-toolkit.md](./references/cli-toolkit.md).

## Templates

[templates/](./templates/) holds one skeleton per file type. The scaffolders write from them. `check issues --template` reads the same files. Each scaffolder names its template in [cli-toolkit.md](./references/cli-toolkit.md). `note.md` has no scaffolder; copy it by hand.

## Rules

| Never | Do instead |
|---|---|
| Search the tracker with `Grep` | `agent-ks issue list` or `agent-ks find` |
| Rename or move with `mv` | `agent-ks move`; it rewrites every link |
| Invent a flag | `agent-ks help <group> <verb>` |
| Write a subtask, stage, plan, log or round by hand | the scaffolder; it writes the template |
| Quote a `check skill-links` pass without the tree name | read the `[repo source tree]` or `[installed plugin]` banner first |

## Where the content is

The commands read `.env` (`CONFIG_DIR`) to find the content root. `agent-ks resolve-context` prints what they found. Inside a git worktree the `.env` search stops at the worktree root. Write a worktree-local `.env`, or pass `--tracker` or a path, before any command that writes.

## For authors

A new command must honour the contract, in any language: [contract.md](./references/contract.md).
