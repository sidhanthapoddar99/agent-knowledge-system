---
title: "The Rust CLI: agentks commands"
---

The command-line tool is the same binary as the engine, renamed from `agent-ks` to **`agentks`**. It keeps every content command today's toolkit has: queries, the tracker writers, validators, `move`, `find`, `img`, the git helpers and theme tokens. It gains the commands a single machine-wide install needs: running servers for any project (`start`, `stop`, `ps`, `logs`), creating a project from a template (`init --template`), publishing (`build`), migrating content (`migrate`), managing libraries (`install`, `library`, as an interactive TUI and as plain commands), managing the machine cache (`cache status`, `cache clean <root>`), the compiled CSS (`theme css`, `theme eject`) and opening the hosted docs (`docs`). Every command runs on the shared core, so a rule the CLI checks is the rule the site renders. The conventions stay as they are today: one JSON document on stdout with `--json`, diagnostics on stderr, and exit codes 0, 1 and 2. A command that deletes files outside the project asks first.

# 03 References

- [The agentks rename and new commands](../../brainstorm/01_initial-discussion/08_cli-rename-and-commands.md) — the decisions and the first command list.
- [CSS and theming](../../brainstorm/01_initial-discussion/10_css-and-theming.md), [libraries](../../brainstorm/02_future-stages/09_libraries-and-dependencies.md), [the docs command](../../brainstorm/02_future-stages/08_agentks-docs-command.md), [Phase 3 publishing](../../brainstorm/02_future-stages/07_phase-3-publishing.md), [versioning](../../brainstorm/01_initial-discussion/12_versioning-and-forced-migrations.md), [the home and build cache](../../brainstorm/01_initial-discussion/07_agentks-home-and-build-cache.md).
- [The Rust engine](./03_rust-engine.md) — the core every command calls. [Project config](./02_project-config.md) — how a command finds the project. [Machine home](./06_machine-home-and-build-cache.md) — what `cache` manages.
- [Library system](../04_ecosystem/01_library-system.md), [templates and init](../04_ecosystem/04_templates-and-init.md), [AI plugins and skills](../04_ecosystem/02_ai-plugins-and-skills.md), [publishing (SSG)](../05_delivery/02_publishing-ssg.md), [versioning and migrations](../05_delivery/03_versioning-and-migrations.md), [distribution and install](../05_delivery/04_distribution-and-install.md).
- Today's CLI: [the source](../../../../../../agent-ks-cli/src), [the command manifest](../../../../../../agent-ks-cli/src/manifest.json), [the viewer lifecycle](../../../../../../agent-ks-cli/src/viewer.rs), [the updater](../../../../../../agent-ks-cli/src/update.rs) and [the toolkit README](../../../../../../agent-ks-cli/README.md).
- [2026-04-26-project-rebrand](../../../2026-04-26-project-rebrand/issue.md) — the rename that locked `agent-ks`.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the installer and the binary are named `agentks`. The rename covers everything the user sees: binary, installer, home folder, plugins and skills.
- Decided (sidhantha, 2026-09-29): server commands such as `agentks ps` stay part of the CLI.
- Decided (sidhantha, 2026-09-29): the CLI prints the compiled CSS of the installed version, so an agent can see and override it.
- Decided (sidhantha, 2026-09-30): `agentks docs` opens agentks.neuralabs.org/docs. It ships when the site is live.
- Decided (sidhantha, 2026-09-30): `agentks init --template <id or url> <path>` creates a project; the template defaults to `agentks-default` and the path to `docs`.
- Decided (sidhantha, 2026-09-30): `agentks library` is an interactive TUI and a set of plain commands. The TUI is a convenience; every action has a plain command.
- Decided (sidhantha, 2026-09-30): `agentks install` pre-installs the locked libraries; starting agentks installs missing ones itself.
- Decided (sidhantha, 2026-09-30): cache cleanup is started by the user, is given a root folder, scans it for every project, and never runs on a schedule.
- Decided (sidhantha, 2026-09-30): `agentks build` builds the static site, on its own or inside Docker.
- Proposed (claude, 2026-09-30): today's shell-setup `init` becomes `agentks shell-init`, so `init` can create projects.
- Proposed (claude, 2026-09-30): maintainer-only commands leave the shipped binary (section 06).

# 05 Notes & Analysis

## 01 Conventions

| Rule | Detail |
|---|---|
| Project selection | `--config-dir PATH` > `AGENTKS_CONFIG_FOLDER` > `./config`. `help` and `--version` work without a project |
| Output | `--json` writes exactly one JSON document to stdout. Human output otherwise. Diagnostics always go to stderr |
| Exit codes | `0` success; `1` no result, a runtime error or validation errors; `2` invalid usage |
| Unknown flags | An error, never ignored, so a query is never silently broadened |
| Discovery | `agentks help`, `agentks help <group> <command>`, `agentks help --json` for the whole catalog from one manifest |
| Deleting outside the project | Shows a report first and needs `--yes` or a typed confirmation. Skills tell agents to show the report and wait |
| Network | Only `install`, `library`, `init`, `migrate`, `update`, `docs` and `build` touch the network. Content commands never do |
| Speed | Content commands start in milliseconds, with no JavaScript runtime and no update check |

## 02 Server and project commands

| Command | Job |
|---|---|
| `agentks` | The project overview: sections and issue counts |
| `agentks start [--detach] [--port N] [--open]` | Check the version gate, install missing locked libraries, build the index and serve the project. Ctrl-C stops a server started here |
| `agentks stop [--project PATH \| --all]` | Stop the server for this project, another project, or every server on the machine |
| `agentks ps [--json]` | Every agentks server on the machine: project, port, process id, uptime |
| `agentks logs [--follow]` | This project's server log |
| `agentks doctor` | Check config, the version gate, the lock against the cache, and the runtimes that `build` and `migrate` need. Reports only |
| `agentks resolve-context` | The selected project root, config and content folders |

`start` no longer clones a framework checkout. The engine and the client are inside the binary.

## 03 Create, publish, migrate, update

| Command | Job |
|---|---|
| `agentks init [--template ID\|URL] [PATH]` | Create a project from a template. Defaults: `agentks-default` and `docs`. Refuses a folder that already has `config/` |
| `agentks build [--out DIR] [--base-path /docs]` | Write the static site. Installs exactly the commits in `dep.lock`; a missing lock is an error naming `agentks install`. Needs Bun or Node |
| `agentks migrate [--dry-run] [--yes]` | Bring the content to this binary's version. Refuses a dirty git tree, shows a dry run first, downloads the scripts for the version range from the official repository at the binary's release tag, runs them in order, re-checks, and reports what is left. Also checks every locked library's engine range. Needs Python (through `uv`) or Bun, depending on the scripts' language |
| `agentks update [--check \| --status]` | Update the binary from the latest release; show cached state; check without installing |
| `agentks shell-init` | Print the shell set-up for the PATH and silent automatic updates (today's `init`) |
| `agentks docs [PAGE]` | Open agentks.neuralabs.org/docs, or one page of it. Offline, print the URL and say it could not be reached |

## 04 Library and cache commands

| Command | Job |
|---|---|
| `agentks install [--update [ALIAS]]` | Install every locked commit missing from the cache. `--update` moves `branch` and latest entries to their newest commit and prints old → new |
| `agentks library` | With no arguments, in a terminal: the TUI. It shows the catalog, what this project uses and what the machine has cached; one key installs. Without a terminal it prints `library list` |
| `agentks library add NAME\|OWNER/REPO\|URL [--path P] [--tag T \| --commit C \| --branch B] [--as ALIAS]` | Add an entry to `dep.yaml`, resolve it, install it, and print its source and manifest summary |
| `agentks library remove ALIAS` | Remove the entry and its lock record. Cached files stay until a cleanup |
| `agentks library list` | The project's libraries: alias, source, pinned commit, version, element count |
| `agentks library show ALIAS` | One library's manifest: every element with its description and tags |
| `agentks library find WORDS` | Elements across the project's libraries whose name, description or tags match |
| `agentks library search WORDS` | Entries in the catalog (`library.json`) that match |
| `agentks check libraries` | Validate the manifests of the project's libraries and every `alias:element` a video or artifact page uses |
| `agentks cache status` | Sizes of the build cache and the library cache. Changes nothing |
| `agentks cache clean ROOT... [--yes]` | Scan the roots for projects, keep what their locks need, report, then remove the rest |
| `agentks cache reset` | Remove this project's build cache only. It is rebuilt on the next start (claude, proposed name) |

All of them take `--json` except the TUI.

## 05 Content commands, carried over

These keep their current behaviour, renamed only:

| Group | Commands |
|---|---|
| Queries | `overview`, `find`, `doc list \| show \| search`, `blog list \| show \| search` |
| Tracker | `issue list \| show \| tree \| context \| subtasks \| agent-logs \| review-queue`, and the writers `issue set-state \| add-comment \| new-subtask \| new-plan \| new-stage \| new-agent-log \| new-round` (`new-iteration` stays an alias) |
| Validation | `check config \| section \| blog \| issues \| link-form`, plus the new `check libraries` |
| Files | `move` (link-aware move or rename; `--dry-run` first), `img` (image optimisation) |
| Git | `git updated \| changed \| log`, and the guarded `git commit`, which stages and commits one content path and never pushes |
| Theme | `theme tokens`, and the new `theme css` (the compiled CSS and the layout hooks of this version) and `theme eject [NAME]` (copy it into `config/themes/<name>/` to edit) |

The validators and the renderer now share code, so a finding from `check` is exactly what the page shows ([the Rust engine](./03_rust-engine.md)).

## 06 What leaves the binary (claude, proposed)

| Command today | Where it goes | Why |
|---|---|---|
| `init` (shell set-up) | `shell-init` | `init` now creates projects |
| `check legacy-tags` | The detect step of the migration script that retired the syntax | A format change belongs to its migration |
| `check skill-links` | A development script in the main repository | Only maintainers of the skills need it. It is state 1 tooling |
| `start`'s framework clone, `./start build`, `./start clean`, `./start update` | Gone, or replaced by `build`, `cache reset` and `update` | There is no framework checkout |

The rule behind this is the three-states rule: a command that needs the agentks source or a dev server is state 1 tooling and stays in the repository ([repositories and layout](../05_delivery/01_repositories-and-layout.md)).

## 07 Runtimes and tools each command needs

| Needs | Commands |
|---|---|
| Nothing | Every content, tracker, validation, theme, library-query and server command |
| Network | `install`, `library add` and the TUI's install, `init` with a remote template, `migrate`, `update`, `build` when libraries are missing, `docs` |
| Git (the `git` program) | The `git` commands only. Libraries are fetched through a Rust git library, so they need no `git` program |
| Bun or Node | `build` |
| `uv` (Python) or Bun | `migrate`, by the language the scripts use |
| ImageMagick | `img` |

A missing runtime is an error that names what to install. The binary never bundles one.

## 08 The rename

| Before | After |
|---|---|
| `agent-ks` binary and installer | `agentks` |
| `AGENTKS_CONFIG_FOLDER` | unchanged |
| `agent-ks-dev` (the working-tree binary, through mise) | A second name kept for state 1, so maintainers can run the release and the working tree side by side ([development workflow](../05_delivery/05_development-workflow-and-testing.md)) |
| The `agent-ks` plugin and its `agent-ks-*` skills | The `agentks` plugin and its skills ([AI plugins and skills](../04_ecosystem/02_ai-plugins-and-skills.md)) |
| Update state in the XDG state folder | `~/.agentks/` ([machine home](./06_machine-home-and-build-cache.md)) |

It all ships in 1.0.0. `agentks` has no `agent-ks` alias, because a second name for the same thing is what the rename removes.

## 09 Open

- `agentksx` extension commands are a later stage and are not part of this surface ([extensions](../04_ecosystem/03_extensions.md)).
- Whether cache clearing also gets a button in the dev toolkit ([open question 04](../01_overview/05_open-questions-and-risks.md)).
- Agent hooks and an `agentks ask` retrieval command are a later-stage idea.
