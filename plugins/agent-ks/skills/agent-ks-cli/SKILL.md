---
name: agent-ks-cli
description: Run any `agent-ks` command in an agent-knowledge-system project. One entrypoint, `agent-ks <group> <verb> [flags]`, for listing and searching issues, moving or renaming a page so every link follows, optimising images before a commit, scaffolding subtasks, plans, agent logs and rounds, committing one content path, reading theme tokens, and running the validators. Load it before you run any `agent-ks` command, when one fails or exits 2, when you would otherwise invent a flag, and when you are adding a new command to the toolkit. It holds the contract, the exit codes and the git-worktree note.
---

# The `agent-ks` CLI

One command on PATH: `agent-ks <group> <verb> [flags]`. It needs `bun`. Only `img` needs more: the ImageMagick CLI.

## The contract

| Rule | What it means |
|---|---|
| `--help` or `-h` | Usage to stdout, exit 0, on every command and on bare `agent-ks` |
| `--json` | One JSON document on stdout and nothing else, on every command that returns data |
| Unknown flag | Exit 2 with the valid flags listed, so a misspelled filter never widens a result. The six `check` verbs other than `issues` ignore it and carry on, so read their output rather than their exit code. `move` and `img` reject it and exit 1 instead of 2 |
| stdout | Data and human output |
| stderr | Errors, warnings, tips |

Exit codes:

| Code | Meaning |
|---|---|
| 0 | Success. For a query: found. For a validator: clean |
| 1 | No result, or a handled runtime error. For a validator: problems found. Also a missing argument in the `issue` verbs, `check section` and `move` |
| 2 | Usage error: an unknown flag, or a missing argument in `doc`, `blog`, `git` and `find` |
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
| `issue` | `list` `show` `subtasks` `agent-logs` `review-queue` `set-state` `add-comment` `new-subtask` `new-plan` `new-stage` `new-agent-log` `new-round` | the tracker: read, write, scaffold |
| `check` | `issues` `section` `blog` `config` `link-form` `legacy-tags` `skill-links` | every validator splits its findings: errors exit 1, warnings exit 0. Read the counts, not the exit code |
| `doc` | `list` `show` `search` | docs pages |
| `blog` | `list` `show` `search` | blog posts |
| `git` | `updated` `changed` `log` `commit` | git-derived content metadata |
| `theme` | `tokens` | the active theme's variables |

Every command and flag: [cli-toolkit.md](./references/cli-toolkit.md).

## Templates

[templates/](./templates/) holds one skeleton per file type. The scaffolders write from them. A scaffolder is an `agent-ks` verb that writes a new file from a template. `check issues --template` reads the same files. Each scaffolder names its template in [cli-toolkit.md](./references/cli-toolkit.md). `note.md` has no scaffolder. Copy it by hand.

## Rules

| Never | Do instead |
|---|---|
| Search the tracker with `Grep` | `agent-ks issue list` or `agent-ks find`. `Grep` reads text only, so it cannot see status, vocabulary or subtask counts, which live in `settings.json` |
| Rename or move with `mv` | `agent-ks move`. It rewrites every link |
| Invent a flag | `agent-ks help <group> <verb>` |
| Write a subtask, stage, plan, log or round by hand | the scaffolder. It writes the template |

## Where the content is

The commands read `CONFIG_DIR` from `.env` to find the content root. `agent-ks resolve-context` prints what they found. Inside a git worktree, the `.env` search stops at the worktree root. So before any command that writes, write a `.env` in the worktree, or pass `--tracker` or a path.

## For authors

A new command must honour the contract, in any language: [contract.md](./references/contract.md).
