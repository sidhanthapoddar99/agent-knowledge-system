---
name: agent-ks-cli
description: Use the standalone agent-ks Rust CLI to navigate, search, validate and edit an agent-knowledge-system project. Covers toolkit installation, project context, issue briefs and file trees, issue/doc/blog queries, plans and log scaffolders, link-aware moves, image optimization, theme tokens, git metadata and starting the viewer. Load before running agent-ks, when a command fails, or when adding a command. The CLI has an independent GitHub release and requires no JavaScript runtime for content operations.
---

# The agent-ks toolkit

Run `agent-ks` from the folder containing `config/` to see the project overview. The folder can have any name. Installation and configuration selection are in [installation.md](./references/installation.md).

## Find the right file before reading bodies

Use the smallest query that answers the question, because a tracker can hold thousands of files.

```bash
agent-ks                            # sections and issue counts
agent-ks issue list --status all --search 'release' --json
agent-ks issue context 2026-09-06-cli --last 2 --max-chars 2000 --json
agent-ks issue tree 2026-09-06-cli --depth 3 --limit 80 --json
agent-ks find 'CONFIG_DIR' --fixed-strings --context 2 --limit 20 --json
```

`issue context` supplies metadata, a bounded issue body, the active plan, active subtasks, recent logs and the memory index path. Check its truncation fields before treating the result as complete. `issue tree` supplies file paths, titles, statuses and sizes. Open the returned paths when you need full bodies.

`issue list` defaults to active issues. Use `--status all` when searching for prior decisions or completed work, because closed issues remain useful history. Combine vocabulary filters with `--search`, `--meta`, or `--path` to narrow the result. `find` searches configured content sections and config, including JSONC and diagram/artifact source files. Search patterns use Rust regex syntax; use `--fixed-strings` for literal punctuation.

## Discover commands

| Command | Returns |
|---|---|
| `agent-ks --help` | The command catalog, config precedence, dependencies and exit codes |
| `agent-ks issue --help` | Commands in one group |
| `agent-ks issue new-stage --help` | Required arguments, every flag and an example |
| `agent-ks help issue new-stage --json` | One command's machine-readable definition |
| `agent-ks help --json` | The full catalog |
| `agent-ks resolve-context --json` | The selected project, config and data paths |
| `agent-ks --version` | The binary's independent version |

Use command help for exact flags, because the binary's catalog describes the installed version. The [command reference](./references/cli-toolkit.md) gives workflows and file conventions.

## Write through the file-aware commands

Use `issue new-subtask`, `new-plan`, `new-stage`, `new-agent-log`, `new-round`, and `add-comment` to create their file types. They embed the [templates](./templates/) and reject collisions, so numbering and structure stay consistent. Fill the resulting document with the task's details. `new-iteration` is an alias of `new-round`.

Use `issue set-state` for issue or subtask status changes. It preserves surrounding formatting and JSONC comments. Use `move --dry-run` before a move to inspect the file and link edits; `move` carries page sidecars and rewrites relative Markdown references while preserving code examples. The command does not stage a Git index.

Use `check issues --template` for tracker shape and template findings. Use `check config`, `check section <folder>`, and `check link-form` for other authored content. Validators report errors and warnings separately; warnings alone exit successfully.

## Update the toolkit

Run `agent-ks update` for an immediate CLI update. `update --status --json` reads cached update state; `update --check --json` checks GitHub without installing. The installer adds silent shell-startup updates with a five-hour cooldown. Ordinary commands do not check for updates, so content operations keep their startup speed. Pinning, disabling and manual shell setup are in [installation.md](./references/installation.md#updating-the-toolkit).

## Start the viewer

Run `agent-ks start --detach` when the task needs a running viewer, because a foreground server holds the terminal. `agent-ks start status` reports it; `agent-ks start stop` stops it. A missing framework checkout is cloned into the project by `start`. Node.js or Bun runs the viewer. Reading and editing content with the toolkit needs neither.

## Output and decisions

Prefer `--json` when processing results, because it writes one JSON document on stdout. Diagnostics go to stderr. Exit codes are 0 for success, 1 for no results/runtime failure/validation errors, and 2 for invalid usage. Unknown flags fail instead of broadening a query.

Choose filters, result limits and read-only navigation without asking. Record material validation failures and any truncated evidence in the task's findings, because later work depends on what was actually checked. Ask only when an unresolved project choice or an action outside the user's authorization prevents progress. An ambiguous subtask selector needs a more precise path before a writer can run.

## Develop the toolkit

The Rust source lives in the framework repository's `agent-ks-cli/`. The plugin ships the skills and templates. The binary is installed independently from GitHub Releases. The contributor contract is [contract.md](./references/contract.md).
