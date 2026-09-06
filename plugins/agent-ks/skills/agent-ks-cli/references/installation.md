# Install and select a project

Install the standalone toolkit once on the workstation. The plugin supplies instructions and templates; installing it does not install the executable.

```bash
curl -fsSL https://raw.githubusercontent.com/sidhanthapoddar99/agent-knowledge-system/main/agent-ks-cli/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
agent-ks --version
agent-ks --help
```

The installer downloads the newest stable `agent-ks-cli-vX.Y.Z` GitHub release for Linux or macOS, verifies its SHA-256 checksum and binary version, and installs it into `~/.local/bin`. It installs PATH and a silent shell-startup updater for Bash, Zsh or Fish. Use `--no-shell-setup` to manage your shell yourself. It needs curl, tar, and `sha256sum` or `shasum`. A published CLI release must exist before downloading.

Pass `--version X.Y.Z` to pin a published version, or `--install-dir PATH` for another destination:

```bash
curl -fsSL https://raw.githubusercontent.com/sidhanthapoddar99/agent-knowledge-system/main/agent-ks-cli/install.sh | sh -s -- --version 0.1.1 --install-dir "$HOME/.local/bin"
```

On native Windows, download `agent-ks-x86_64-pc-windows-msvc.zip` and `SHA256SUMS` from the same CLI release. Verify the archive with `Get-FileHash -Algorithm SHA256`, extract `agent-ks.exe`, and put its directory on PATH. WSL uses the Linux installer.

## Updating the toolkit

```bash
agent-ks update
agent-ks update --check --json
agent-ks update --status --json
agent-ks update --disable
agent-ks update --enable
agent-ks update --pin 0.1.1
agent-ks update --unpin
```

`update` installs the latest stable CLI now. `--check` bypasses the cooldown without installing. `--status` reads cached results and preferences without network access. These commands need no project config.

The installed shell hook calls `agent-ks update --background` once at shell startup. It silently checks and installs updates with a five-hour cooldown shared across shells. Ordinary content commands perform no update checks. Download or verification failures preserve the current CLI; cached errors appear in `--status`.

An installer `--version` pins the chosen release. A pin pauses automatic updates; `update` then installs only the pinned version. Use `--unpin` to follow releases again. `AGENTKS_AUTO_UPDATE=0` disables automatic updates for the session. Source builds inside `agent-ks-cli/` skip automatic updates.

A manually extracted binary needs shell setup: run `agent-ks init bash`, `init zsh`, `init fish` or `init powershell` and put its printed code in the corresponding startup file. On Windows use `$PROFILE`. No per-command or directory-change hook is needed.

GitHub engine and plugin releases do not carry a duplicate unchanged CLI. CLI downloads come only from `agent-ks-cli-vX.Y.Z` releases. The native updater excludes drafts and prereleases, verifies SHA-256 and the executable's version, then replaces the binary. It requests no elevated permissions.

## Configuration selection

| Priority | Source |
|---|---|
| 1 | `--config-dir PATH` before or after the command, before `--` |
| 2 | Session environment variable `AGENTKS_CONFIG_FOLDER` |
| 3 | `./config` from the current working directory |

The selected directory must exist. An empty explicit path is an error. Its parent is the project root. The containing folder's name does not matter. Relative config paths are relative to the working directory; `site.yaml` content paths remain relative to the config directory.

```bash
cd neurasutra-docs
agent-ks
agent-ks find 'routing' --limit 10 --json

# A project whose config directory has a different name:
export AGENTKS_CONFIG_FOLDER="$PWD/site-settings"
agent-ks resolve-context --json

# Override it for one command:
agent-ks --config-dir ../other-docs/config overview --json
```

The toolkit does not search parent directories or load `.env` to choose content. An explicit `--tracker PATH` makes issue commands independent of project config. Commands taking an explicit filesystem scope, such as `check section <folder>`, can also run without config. Help and version discovery work anywhere.

## Viewer dependencies

`agent-ks start` needs Node.js or Bun. Its first launch needs Git if the framework is missing. It clones into `<project>/agent-knowledge-system`, supplies the selected config in the process environment, and invokes the framework's launcher. It does not overwrite `.env`.

```bash
agent-ks start --dry-run --json
agent-ks start --detach
agent-ks start status
agent-ks start stop
```

Use `--framework-dir PATH` to select an existing checkout. `--framework-ref TAG` selects the tag or branch for a new clone. The engine's content-version gate remains authoritative; resolve a mismatch with the [migration protocol](../../agent-ks-config/references/08_migrations.md).

Git commands need Git. `img` needs ImageMagick. Content queries, search, validators, scaffolding, moves and the built-in theme need no external interpreter.
