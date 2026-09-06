---
title: Native Agent KS Toolkit
description: Install the standalone CLI, select a project, search content and start the viewer.
---

# Native Agent KS Toolkit

`agent-ks` is a standalone Rust binary for navigating and maintaining a knowledge project. Install the [plugin](./05_claude-skills.md) for agent instructions and the toolkit for commands. They have independent releases.

## Install

On Linux, macOS or WSL:

```bash
curl -fsSL https://raw.githubusercontent.com/sidhanthapoddar99/agent-knowledge-system/main/agent-ks-cli/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
agent-ks --version
```

The installer downloads the newest stable `agent-ks-vX.Y.Z` GitHub release and verifies its checksum and executable version. It configures your shell for silent automatic updates, with a five-hour cooldown. Use `agent-ks update` to update immediately. Use `sh -s -- --version 0.1.0` at the end of the pipeline to pin a release. A published CLI release is required; source builds are described in the [toolkit README](../../../../agent-ks-cli/README.md).

For native Windows, download the Windows ZIP and `SHA256SUMS` from the matching CLI release, verify the checksum, extract `agent-ks.exe`, and add its directory to PATH.

## Automatic and manual updates

The installer adds an update hook to your Bash, Zsh or Fish startup file. When a shell starts, it checks for and installs a newer CLI silently, at most once every five hours. Running ordinary commands does not check for updates.

```bash
agent-ks update                   # install now
agent-ks update --check --json     # check only, bypass cooldown
agent-ks update --status --json    # cached status, no network
agent-ks update --disable
agent-ks update --enable
```

Pinned installations do not auto-update. Use `agent-ks update --unpin` to resume following releases. To pin a version, run `agent-ks update --pin 0.1.0`, then `agent-ks update` to install it. The installer’s `--version` option also pins the installation.

For a manual installation, run `agent-ks init powershell` on Windows or `agent-ks init bash`, `init zsh` or `init fish` on Unix. Add the printed code to your shell’s startup file once; PowerShell uses `$PROFILE`. `--no-shell-setup` on the installer skips automatic profile edits.

Updates verify the download checksum and executable version before replacement. Offline shells keep working. `update --status` shows any cached failure. Engine and plugin updates have separate releases; they do not duplicate an unchanged CLI binary.

## Choose the project

```bash
cd my-documentation
agent-ks
```

The folder can have any name. It must contain `config/`. Bare `agent-ks` shows configured sections, file counts and issue status totals. A missing config folder produces an error.

For a different config directory:

```bash
agent-ks --config-dir ./settings
# Or set it for this shell session:
export AGENTKS_CONFIG_FOLDER="$PWD/settings"
agent-ks resolve-context --json
```

Selection order is the flag, then the environment variable, then `./config` from the current directory. The config directory's parent is the project root. There is no upward directory search. The `paths` and `pages` in your site configuration determine where content lives.

## Find useful context quickly

```bash
agent-ks find 'release notes' --fixed-strings --context 2 --limit 20 --json
agent-ks find 'migration|upgrade' --type docs,issues --paths-only
agent-ks issue list --priority high,urgent --json
agent-ks issue list --search 'search' --status all --json
agent-ks issue tree 2026-09-06-cli --depth 3 --limit 100 --json
agent-ks issue context 2026-09-06-cli --max-chars 6000 --limit 20 --json
agent-ks issue agent-logs 2026-09-06-cli --last 5 --json
```

Replace the example issue ID with one from `issue list`. `tree` shows the folder structure with metadata. `context` gathers the issue body, plans, active subtasks and recent logs for a quick handover. Use limits to control output. Issue lists hide closed statuses by default; `--status all` includes them.

Search defaults to a case-insensitive Rust regular expression. `--fixed-strings` treats punctuation literally. `--context N` includes nearby lines; `--limit N` bounds results. Lookaround and backreferences are unsupported. Use `--case-sensitive` when case matters.

## Start the site

After [scaffolding your config and content](./06_init-and-template.md):

```bash
agent-ks start --dry-run --json
agent-ks start
agent-ks start --detach
agent-ks start status
agent-ks start stop
```

`start` clones a missing framework into `agent-knowledge-system/` under the project and launches its existing viewer. It passes the selected config to that process without changing `.env`. `--framework-dir` selects an existing checkout; `--framework-ref` pins a new clone. The viewer needs Node.js or Bun and cloning needs Git. Content commands run without either runtime.

## Discover commands

```bash
agent-ks --help
agent-ks issue --help
agent-ks issue new-round --help
agent-ks help --json
```

Help works without config. Every command documents its arguments and flags. Exit codes are `0` for success, `1` for an empty query or runtime/validation error, and `2` for incorrect usage. JSON goes to stdout and diagnostics to stderr. Validators return success for warnings alone.

The toolkit also scaffolds plans, stages, subtasks and logs; changes statuses; rewrites links when moving pages; reads theme tokens; and validates content. `img` needs ImageMagick, and Git commands need Git. See the [CLI reference](../../../../plugins/agent-ks/skills/agent-ks-cli/references/cli-toolkit.md) for their contracts.
