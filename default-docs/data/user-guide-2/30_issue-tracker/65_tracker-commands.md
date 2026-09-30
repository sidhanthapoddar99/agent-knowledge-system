---
title: "Tracker commands"
description: "Every agentks issue command, grouped by job, with an example of each."
---

The `agentks issue` commands read and write the tracker. Each answer names its issue, file and status, and each file they write gets the right number and template. For every flag of your installed version, run `agentks help issue <command>`.

## Conventions

| Rule | Detail |
|---|---|
| The issue id | The issue's folder name, such as `2026-10-01-search-index`. It comes first |
| Another tracker | Every `issue` command, and `check issues`, takes `--tracker <path>` |
| Machine-readable output | `--json` writes one JSON document to standard output. Messages go to standard error |
| Exit codes | `0` success, `1` no result or errors found, `2` a mistake in the command itself |
| Unknown flags | An error, so a typo never widens a query |

## Read

| Command | Returns |
|---|---|
| `agentks` | The project overview: its sections and the issue counts per status |
| `agentks issue list` | Issues filtered by field and searched by pattern. Hides closed issues by default |
| `agentks issue show <id>` | One issue's metadata, with the heads of its subtasks, comments and agent logs. `--full` adds the bodies |
| `agentks issue context <id>` | A brief sized for an agent: the issue body, the active plan, the active subtasks, recent logs and the path of the memory index |
| `agentks issue tree <id>` | Every file in the issue with its title, status and size |
| `agentks issue subtasks <id>` | The issue's subtasks as a tree. `--all` covers every issue |
| `agentks issue agent-logs <id>` | The issue's most recent agent logs |
| `agentks issue review-queue` | Everything that waits for a person |
| `agentks find <pattern>` | A search of every kind of content, closed issues included |

```bash
agentks issue context 2026-10-01-search-index --last 2 --max-chars 2000
agentks issue tree 2026-10-01-search-index --depth 3 --limit 80
agentks issue subtasks --all --status review,input-needed
agentks issue agent-logs 2026-10-01-search-index --last 3
```

`issue context` and `issue tree` cut long output to their limits and say so. Check that before you treat an answer as complete.

### Filtering and searching the list

```bash
agentks issue list --priority high,urgent
agentks issue list --component search --assignee unassigned
agentks issue list --search 'index|indexer' --search-fields body,subtasks
agentks issue list --path 'search' --include-closed
agentks issue list --has-review-subtasks --count
```

| Flag | Does |
|---|---|
| `--status <list>` | Only these statuses |
| `--include-closed` | Also include `done`, `dropped` and `superseded` issues |
| `--priority`, `--component`, `--label` `<list>` | Filter by vocabulary values |
| `--assignee <list>` | Names, or `assigned`, or `unassigned` |
| `--created-after`, `--created-before <date>` | By the date in the folder name |
| `--has-open-subtasks`, `--has-review-subtasks`, `--has-closed-subtasks` | By subtask state |
| `--subtasks-min`, `--subtasks-max <n>` | By subtask count |
| `--search <regex>` | A pattern over the issue's files |
| `--search-fields <list>` | Where to search: `body`, `settings`, `comments`, `subtasks`, `notes`, `agent-log` |
| `--path <regex>` | Match the file and folder names instead of the text |
| `--meta <regex>` | Match only frontmatter and JSON |
| `--scope <subpath>` | Search one folder inside each issue |
| `--fixed-strings`, `--case-sensitive`, `--invert-match`, `--context <n>` | Pattern options |
| `--count`, `--paths-only`, `--limit <n>` | The shape of the output |
| `--quiet-tips` | Leave out the usage tips |

Within one flag, any listed value matches. Across flags, every flag must match.

> [!IMPORTANT]
> `issue list` hides closed issues by default, so an empty answer may still match a closed issue. Add `--include-closed` when you ask whether something exists at all.

## Write

No command creates an issue: you create its folder, `settings.json` and `issue.md` yourself ([Create and work an issue](./70_create-and-work-an-issue.md)). Everything inside an issue has a command.

| Command | Writes |
|---|---|
| `agentks issue set-state <id> <status>` | The issue's status, or a subtask's with `--subtask <number, name or path>`. `done` and `dropped` need a person at a terminal ([Review and close](./75_review-and-close.md)) |
| `agentks issue add-comment <id> --author <name> --body <markdown>` | The next numbered comment |
| `agentks issue new-subtask <id> --name <slug>` | A subtask from the template. `--group`, `--title`, `--overview`, `--index` |
| `agentks issue new-plan <id> --name <slug>` | A plan folder with `settings.json` and `overview.md`. `--title`, `--status`, `--overview`, `--prefix` |
| `agentks issue new-stage <id> --plan <folder> --name <slug>` | A plan stage. `--outcome`, `--notes`, `--who`, `--status`, `--after`, `--prefix`, `--subtask` |
| `agentks issue new-agent-log <id> --kind <code> --name <slug>` | An agent log with `settings.json` and `00_index.md`. `--goal`, `--for`, `--group`, `--prefix` |
| `agentks issue new-round <id> --log <path> --name <slug>` | A round or report file in a log, listed in its index. `--report`, `--round`, `--goal`, `--inputs`, `--agent`. Also called `new-iteration` |

```bash
agentks issue set-state 2026-10-01-search-index in-progress --subtask 010
agentks issue add-comment 2026-10-01-search-index --author sid --body "Scope moved: ranking is its own issue now."
agentks issue new-subtask 2026-10-01-search-index --name result-list --group 020_ui
```

The writers refuse to overwrite an existing file. `set-state` changes only the `status` line and keeps the rest of the file, JSONC comments included. The pages on [subtasks](./40_subtasks.md), [plans](./45_plans-and-stages.md) and [agent logs](./50_agent-logs.md) show each writer in use.

## Check

```bash
agentks check issues
agentks check issues --template --strict
```

`check issues` validates the whole tracker: folder names, settings, the vocabulary, statuses, plans, and the kind codes and statuses of agent logs.

| Flag | Does |
|---|---|
| `--template` | Also check the five template sections of subtasks, stages and plan overviews |
| `--strict` | Turn unknown-key warnings into errors |
| `--quiet` | Print errors only |
| `--verbose` | With each unknown-key warning, list the keys that are allowed |

Errors exit `1`. Warnings alone exit `0`, so read the counts, not only the exit code. Run it after any change larger than one line. `agentks check section` does not check a tracker.

## Move and rename

```bash
agentks move data/todo/2026-10-01-search-index/subtasks/050_styles.md \
  data/todo/2026-10-01-search-index/subtasks/020_ui/030_styles.md --dry-run
```

`agentks move` moves or renames a file or folder and rewrites every link to it and inside it. `--dry-run` shows each change first. `mv` breaks every relative link and reports nothing.

## History

| Command | Returns |
|---|---|
| `agentks git log <id>` | The commit history of an issue |
| `agentks git updated <id>` | The date, author and subject of the last commit to an issue |
| `agentks git commit --scope <path> -m <message>` | Stages and commits only that path. It never pushes |

[The CLI reference](../65_cli-reference/01_overview.md) lists every agentks command.
