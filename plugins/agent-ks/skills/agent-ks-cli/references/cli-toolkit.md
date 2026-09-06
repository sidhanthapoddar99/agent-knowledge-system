# `agent-ks` command reference

Every command is `agent-ks <group> <verb> [flags]`, or a top-level `agent-ks <verb>` for General commands. Every command takes `--help`. Every command takes `--json`; live `start` uses it only with `--dry-run`. Every `issue` command takes `--tracker <path>` for another tracker. `--name <value>` takes a value. `--name` alone is a switch. The contract and the exit codes are in [SKILL.md](../SKILL.md).



`agent-ks update` installs the latest CLI release. `update --help` documents manual checks, cached status, pins and disabling updates. `agent-ks init <bash|zsh|fish|powershell>` prints a shell-startup hook for silent automatic updates with a five-hour cooldown. The installer manages that hook on Unix; ordinary commands never check for updates. See [installation and updates](./installation.md#updating-the-toolkit).

## Navigation and viewer

| Command | Does | Flags |
|---|---|---|
| `overview` (or bare `agent-ks`) | Configured sections, content paths, file counts and issue status counts | `--json` |
| `issue tree <id>` | File inventory with paths, titles, statuses and byte sizes | `--depth <N>` default 5 · `--limit <N>` default 200 · `--tracker <path>` |
| `issue context <id>` | Bounded issue body, metadata, active plan, active subtasks, recent logs and memory pointer | `--max-chars <N>` default 4000 · `--last <N>` default 3 · `--limit <N>` default 200 · `--tracker <path>` |
| `start [command]` | Clone the framework when missing and launch/manage the viewer | `--framework-dir <path>` · `--framework-ref <tag>` for a new clone · `--detach` · `--dry-run` · `--json` with dry-run |

Every command accepts `--config-dir`; normal use omits it. Config selection and installer usage live in [installation.md](./installation.md). Explicit limits of zero return zero results. `issue tree` and `issue context` report truncation. Search uses Rust regex syntax; literal matching avoids regex interpretation.

## General

| Command | Does | Flags |
|---|---|---|
| `help [command]` | List every command, or show one command's flags. `--json` dumps the manifest | |
| `resolve-context` | Print the selected project root, config dir and data dir | |
| `find <regex>` | Search docs, blog, issues and config for a string | `--meta` structured layer only · `--path` match the path text · `--type <docs,blog,issues,config>` · `--count` · `--paths-only` · `--case-sensitive` · `--fixed-strings` · `--context <N>` · `--limit <N>` |
| `move <from> <to>` | Move or rename a file or folder. It rewrites every link to it and inside it. The scan scope is the selected project root. Both `<from>` and `<to>` must sit inside that scope, or the command exits 1 | `--dry-run` · `--no-git` (accepted; moves use the filesystem) · `--root <dir>` widens or replaces the scope. Both paths must then sit inside `<dir>` |
| `img <path…>` | Optimise images before a commit. It needs the ImageMagick CLI, `magick` or `convert`. It requires ImageMagick | the table below |

### `img` flags

| Flag | Does |
|---|---|
| `--dpr <N>` · `--scale <%>` · `--max-dim <px>` · `--width <px>` · `--height <px>` | Resize: divide by N (undo a retina capture), scale, clamp, exact size. Never upscales |
| `--trim` · `--gray` | Crop a uniform border; grayscale |
| `--format <fmt>` (`-f`) · `--quality <N>` (`-q`) · `--lossless` | `webp`, `avif`, `png` or `jpg`; lossy quality, default 80; lossless webp or png |
| `--colors <N>` · `--depth <N>` · `--dither <mode>` | Palette reduction; helps PNG, hurts lossy formats |
| `--strip` · `--no-strip` | Drop or keep metadata; stripped by default |
| `--target-size <SIZE>` | Step the quality down until each file fits, e.g. `100KB` |
| `--out <dir>` · `--in-place` · `--backup <dir>` · `--no-backup` | Where the result goes; in place by default, with a backup |
| `--rewrite-links` · `--links-root <dir>` | Rewrite `![](…)` links when the extension changes |
| `--recursive` (`-r`) · `--dry-run` · `--quiet` | Walk folders; preview; less output |

## Issue tracker: `agent-ks issue …`

| Command | Does | Flags |
|---|---|---|
| `list` | Filter and search the tracker. Default scope: every status except `done`, `dropped`, `superseded` | the table below |
| `show <id>` | One issue: metadata, subtasks, comments, agent logs | `--full` bodies |
| `subtasks <id>` | Subtasks of one issue, or of every issue with `--all` | `--all` · `--status <vals>` (`--state` alias; `all` widens) · `--flat` · `--quiet-tips` |
| `agent-logs <id>` | The last N agent logs: status, index, files | `--last <N>` default 3 · `--full` |
| `review-queue` | Issues in `review` or `input-needed`, plus active issues with such a subtask | |
| `set-state <id> <status>` | Set an issue status, or a subtask status with `--subtask` | `--subtask <num, slug or path>` |
| `add-comment <id>` | Append a comment from `templates/comment.md` | `--author <name>` required · `--body <md>` required · `--date <YYYY-MM-DD>` · `--slug <slug>` |
| `new-subtask <id>` | Write `subtasks/NN_<name>.md` from `templates/subtask.md` | `--name <slug>` required unless `--index` · `--title <text>` · `--group <a/b>` · `--overview <text>` the lead paragraph · `--index` the group index leaf `00_` |
| `new-plan <id>` | Open `plans/NN_<name>/` with `settings.json` and `overview.md` from `templates/plan-overview.md` | `--name <slug>` required · `--title <text>` · `--status <state>` · `--overview <text>` · `--prefix <NN>` |
| `new-stage <id>` | Add `NN_<name>.md` to a plan from `templates/plan-stage.md`, gap-spaced by ten | `--plan <folder>` required, the plan folder under `plans/` · `--name <slug>` required · `--title <text>` · `--outcome <text>` · `--notes <text>` · `--who <name>` · `--status <state>` · `--after <NN>` midpoint of the gap · `--prefix <NN>` · `--subtask <a,b>` |
| `new-agent-log <id>` | Scaffold `agent-log/NNN_<kind>_<name>/` with `settings.json` and `00_index.md` from `templates/log-index-<kind>.md`, or `log-index.md` for a custom kind | `--kind <code>` required, the kind codes are owned by [agent-ks-issue-logs](../../agent-ks-issue-logs/SKILL.md) · `--name <slug>` required · `--group <a/b>` a folder, or a log folder for a child log (numbered from 120) · `--prefix <NNN>` · `--goal <text>` the lead line · `--for <a,b>` the subtasks it serves |
| `new-round <id>` | Add a round file flat in a log from `templates/log-round.md`, and list it under `## Files` in `00_index.md` | `--log <path>` required, relative to `agent-log/` · `--name <slug>` required · `--title <text>` · `--report` · `--round <N>` · `--goal <text>` · `--inputs <a,b>` · `--agent <name>` |
| `new-iteration <id>` | Alias of `new-round`, same flags | |

`--subtask` on `new-stage` and `--for` on `new-agent-log` take a number, a slug, a clean name such as `top-layer-tests`, or a path. Each value becomes one plain link. The link text is the subtask title. A value that matches no subtask, or more than one, is an error. Then nothing is written.

`--inputs` on `new-round` takes paths relative to the log, the issue or the tracker. Each becomes a link under `## Links` with the file title as text. A missing path is an error.

A round file's prefix ends in 0: `10_`, `20_`, `30_`. `--report` writes the next `N1` to `N9` file inside the current round. Two conditions must hold, and each failure is an error. The round file must exist first, so open the round without `--report`. A round holds at most nine reports, so after nine open the next round. When the log has no `00_index.md`, `new-round` still writes the file. The human output prints a notice. `--json` carries `indexUpdated: false` instead. Then add the file line to the index by hand.

One worked line per scaffolder:

```bash
agent-ks issue add-comment 2026-04-19-docs-phase-2 --author sid --body "the audit round is done"
agent-ks issue new-subtask 2026-04-19-docs-phase-2 --name skills-v2 --title "Cut the skills by domain"
agent-ks issue new-plan 2026-04-19-docs-phase-2 --name skills-v2 --title "Skills v2"
agent-ks issue new-stage 2026-04-19-docs-phase-2 --plan 10_skills-v2 --name audit --title "Audit the ten skills"
agent-ks issue new-agent-log 2026-04-19-docs-phase-2 --kind au --name skill-review --goal "audit the ten skills" --for 29
agent-ks issue new-round 2026-04-19-docs-phase-2 --log 040_au_skill-review --name kickoff --goal "brief the reviewers"
```

These lines are six independent examples, not one sequence. The `--log` value is the folder that `new-agent-log` printed, not a fixed number. `new-agent-log` takes the next gap-spaced prefix in that issue.

### `list` flags

| Flag | Does |
|---|---|
| `--status <vals>` | `open,blocked,in-progress,input-needed,review,done,dropped,superseded`; `all` widens to every status |
| `--include-closed` | Widen the default scope to the closed statuses (`--include-cancelled` alias) |
| `--priority <vals>` · `--component <vals>` · `--label <vals>` · `--type <vals>` | Vocabulary filters; OR within a flag, AND across flags |
| `--assignee <names>` | Names, `assigned` or `unassigned` |
| `--created-after <DATE>` · `--created-before <DATE>` | From the folder date prefix |
| `--has-open-subtasks` · `--has-review-subtasks` · `--has-closed-subtasks` · `--subtasks-min <N>` · `--subtasks-max <N>` | Subtask category and count filters |
| `--search <regex>` · `--search-fields <list>` | Regex search over issue files; fields `body,settings,comments,subtasks,notes,agent-log`, default all |
| `--scope <subpath>` · `--path <regex>` · `--meta <regex>` | Search one subfolder; match the path text; match frontmatter and JSON |
| `--case-sensitive` · `--invert-match` · `--fixed-strings` · `--context <N>` | Regex options |
| `--count` · `--limit <N>` · `--paths-only` | Output shape |
| `--quiet-tips` | Silence the stderr tips |

## Validators: `agent-ks check …`

Every validator splits its findings in two. An error exits 1. A warning exits 0. So read the counts, not the exit code. A run can print hundreds of warnings and still exit 0.

| Command | Checks | Flags |
|---|---|---|
| `issues` | The tracker: vocabulary, folder names, statuses, anatomy folders, plans, agent logs. A stage `subtasks:` entry that is not exactly one resolving link is an error. In a log, only values are checked. A status must be a run status. The folder shape is guidance, not a check | `--template` · `--quiet` or `--no-warnings` hide the warnings · `--verbose` also list the canonical keys behind an unknown-key warning · `--strict` promote the unknown-key warnings to errors · `--tracker <path>` |
| `section <folder>` | A docs section: `NN_` prefixes, `settings.json`, frontmatter `title`, prefix collisions | |
| `blog` | `YYYY-MM-DD-<slug>.md` names, `title`, no nested folders | |
| `config` | `site.yaml`, `navbar.yaml`, `footer.yaml`: required keys, pages, alias resolution | |
| `link-form [root]` | Every internal link is relative and names a file on disk. It needs no build. `[root]` defaults to the content root's `data/`. Give `[root]` a folder that holds links. A folder with no links fails with "the link matcher is not working". That guard exists to catch a broken matcher on a whole-tree run | |
| `legacy-tags [root]` | Custom-tag markup the renderer does not parse (`:::callout`, `<callout>`, `<tabs>`, `<collapsible>`) and its native replacement. `[root]` defaults to the content root's `data/` | |
| `skill-links <skill-dir>` | Check relative Markdown links in the explicit skill directory; the result names its root | |

`check issues --template` checks the five `#` headings of `templates/*.md` on subtasks, stages and plan overviews. A file in a finished status must hold a result in `# 02 Status and Result`. A subtask's `## Agent log` must be `none` or one link that resolves. A `## Questions` entry needs status `input-needed`. Root settings `"template": true` turns the check on.

## Docs and blog: `agent-ks doc …`, `agent-ks blog …`

| Command | Does | Flags |
|---|---|---|
| `doc list [section]` | Sidebar doc pages: path, section, title | |
| `doc show <name or path>` | One page's metadata and frontmatter | |
| `doc search <regex> [section]` | Regex search over doc pages | `--count` · `--case-sensitive` · `--fixed-strings` · `--context <N>` · `--limit <N>` · `--paths-only` |
| `blog list` | Posts, newest first: date, slug, title | |
| `blog show <slug or date>` | One post's metadata and frontmatter | |
| `blog search <regex>` | Regex search over posts | `--count` · `--case-sensitive` · `--fixed-strings` · `--context <N>` · `--limit <N>` · `--paths-only` |

## Git metadata: `agent-ks git …`

| Command | Does | Flags |
|---|---|---|
| `updated <path>` | Last commit date, author and subject of a content path | |
| `changed --since <ref>` | Content changed under `data/` since a ref | `--since <ref>` required · `--type <docs,blog,issues>` |
| `log <path>` | Commit history of one folder or file | `--limit <N>` default 20 |
| `commit --scope <path> --message <msg>` | Stage and commit only that path. Never pushes | `--scope <path>` required · `--message <msg>` (`-m`) required · `--dry-run` |

## Theme: `agent-ks theme tokens [name]`

It prints the active theme's CSS variables, or a named theme's, for light and dark. `--json` gives `{ theme, light, dark }`.
