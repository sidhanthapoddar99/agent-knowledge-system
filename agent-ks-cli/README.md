# agent-ks

The standalone Rust toolkit for agent-knowledge-system content. The binary embeds the command catalog, scaffold templates, and built-in theme. It runs without the plugin or a JavaScript runtime for reading, searching, scaffolding, moving and validating content.

## Install

Linux and macOS:

```bash
curl -fsSL https://raw.githubusercontent.com/sidhanthapoddar99/agent-knowledge-system/main/agent-ks-cli/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
```

The installer queries GitHub’s official Latest release, validates its stable numbered CLI tag and required assets, then downloads that numbered release.Y.Z` release, then downloads that numbered release and verifies its SHA-256 checksum and executable version before installing atomically. Missing or invalid Latest metadata falls back to the bounded stable release-history lookup. It needs curl, tar, and `sha256sum` or `shasum`. It adds PATH and a silent auto-update hook to your Bash, Zsh or Fish startup file. Use `--no-shell-setup` to manage your shell yourself. The first download requires a published CLI release.

Pin a version or choose another destination:

```bash
curl -fsSL https://raw.githubusercontent.com/sidhanthapoddar99/agent-knowledge-system/main/agent-ks-cli/install.sh | sh -s -- --version 0.1.2 --install-dir "$HOME/.local/bin"
```

On native Windows, download `agent-ks-x86_64-pc-windows-msvc.zip` and `SHA256SUMS` from the matching CLI release. Compare the archive's `Get-FileHash -Algorithm SHA256` output with its checksum entry, extract `agent-ks.exe`, and add its directory to PATH. WSL uses the Linux installer.

## Updates and shell startup

```bash
agent-ks update                   # install the newest stable CLI now
agent-ks update --help
agent-ks update --check --json     # check now without installing
agent-ks update --status --json    # cached status, no network
agent-ks update --disable         # opt out of automatic updates
agent-ks update --enable
agent-ks update --pin 0.1.2        # pin manual updates; pause automatic updates
agent-ks update --unpin
```

The installer configures `agent-ks update --background` at shell startup. It silently checks and installs a newer stable CLI release at most once every **five hours**. It does not prompt or print notifications. Normal content commands do not trigger checks or add network latency. A new CLI version is used by subsequent invocations; a running command keeps its existing executable.

The cooldown and an exclusive process lock prevent repeated checks across multiple shells. Network failures leave the installed CLI in place and are recorded in `update --status`. Downloads require HTTPS, a matching SHA-256 checksum, an archive containing only the expected regular executable, and a matching executable version. Files are staged beside the installed binary for replacement; Windows uses a backup-and-restore swap for a running EXE. Updates never request elevated permissions.

`--version` on the installer pins that installation. `update --pin X.Y.Z` changes the selected version; run `agent-ks update` to install it. `--unpin` resumes following stable releases. `AGENTKS_AUTO_UPDATE=0` disables automatic updates for a session, without disabling manual updates. Preferences and the shared five-hour timestamp live under `~/.local/state/agent-ks` on Unix (`XDG_STATE_HOME` is respected), or `%LOCALAPPDATA%\agent-ks` on Windows. `AGENTKS_UPDATE_DIR` overrides that state directory. Source builds under this crate skip automatic updates so shell initialization cannot overwrite local development work.

For a manual binary installation, run `agent-ks init bash`, `agent-ks init zsh`, `agent-ks init fish`, or `agent-ks init powershell`. Add the printed code to that shell's startup file once. The command prints code; it does not edit the file. On Windows, add the PowerShell output to `$PROFILE` after extracting the EXE. The shell hook runs once at shell initialization, not on each command or directory change.

Engine and plugin versions use tag-only streams and do not attach another copy of the CLI. The installer and updater validate GitHub’s official Latest numbered CLI release; all binaries and checksums still come from that numbered release. They ignore drafts and prereleases, fall back to bounded release-history lookup when Latest metadata is invalid, and compare numeric versions to avoid accidental downgrades. A pin is an explicit exception.

## Choose a project

```bash
cd my-documentation
agent-ks                           # overview; reads ./config
agent-ks issue list
agent-ks issue context 2026-09-06-cli --json
agent-ks find 'release notes' --fixed-strings --context 2 --limit 20 --json
```

The enclosing folder can have any name. Configuration precedence is:

1. `--config-dir PATH`, anywhere before `--`.
2. `AGENTKS_CONFIG_FOLDER=PATH` in the session environment.
3. `./config` in the current working directory.

The config directory must exist. Relative config paths are relative to the current working directory; the config's parent is the project root. Content aliases in `site.yaml` remain relative to the config directory. No ancestor or plugin-installation search is performed. Explicit `--tracker` and command-specific filesystem paths are usable without project config.

```bash
export AGENTKS_CONFIG_FOLDER="$PWD/settings"
agent-ks resolve-context --json
agent-ks --config-dir ./another-project/config overview
```

Help and version discovery do not require config:

```bash
agent-ks --help
agent-ks issue --help
agent-ks issue new-round --help
agent-ks help --json
agent-ks --version
```

Queries use exit 0 for results, 1 for no results or runtime failure, and 2 for invalid usage. Validators use exit 1 for errors; warnings alone exit 0. `--json` writes one document to stdout and diagnostics to stderr. Search uses Rust regex syntax by default; `--fixed-strings` searches literal text. Lookaround and backreferences are unsupported and return usage errors.

## Start the viewer

```bash
agent-ks start --dry-run --json
agent-ks start --detach
agent-ks start status
agent-ks start stop
agent-ks start build
```

A missing framework is cloned into `<project>/agent-knowledge-system`. `--framework-dir PATH` selects another checkout; `--framework-ref TAG` pins a new clone. Existing checkouts are used as they are. The launcher passes the selected config through the environment, without overwriting `.env`. The framework's existing launcher manages dependencies, version checks and server lifecycle. Starting the viewer requires Node.js or Bun; cloning requires Git. Git metadata commands require Git, and `img` requires ImageMagick.

## Develop

```bash
cd agent-ks-cli
cargo test --locked
cargo clippy --locked --all-targets -- -D warnings
cargo build --release --locked
python3 tests/install.py
```

Build outputs live under `releases/`, whose existing `.gitignore` excludes everything except itself. The local executable is `releases/release/agent-ks`. From the repository root, `mise run cli-build` and `mise run cli-test` use these same commands; mise adds the release executable directory to PATH. `agent-ks-dev` selects the local build with the repository's bundled config by default. For noninteractive agent shells, use `mise exec -- agent-ks …`, because mise applies directory PATH changes through interactive shell hooks. This also avoids an older global installation taking precedence.

The command catalog is `src/manifest.json`; `src/args.rs` adds shared flags and renders help. Native modules implement the commands. Templates stay in the CLI skill's `templates/` directory and are compiled into the binary. Tests cover context selection, output contracts, scoped writes, link rewrites, issue navigation and installer failure handling.

## Release independently

1. Update the version in `Cargo.toml` and regenerate `Cargo.lock` with Cargo.
2. Add `release-notes/<version>.md`.
3. Run the development checks above.
4. From the repository root, run `mise run release-check`.
5. After the change is merged, a maintainer tags and pushes `agent-ks-cli-v<version>`.

The [CLI release workflow](../.github/workflows/agent-ks-cli-release.yml) tests and builds Linux x86_64/ARM64 with musl, macOS Intel/Apple Silicon, and Windows x64. It uploads versioned archives plus `SHA256SUMS` to the numbered GitHub release, and marks that numbered release as GitHub's official Latest release. The numbered tag must match Cargo's version. The tag-triggered release workflow runs all checks before publication. Moving aliases have no release pages. Runner labels follow the [GitHub-hosted runner reference](https://docs.github.com/en/actions/reference/runners/github-hosted-runners).

A local build does not publish a GitHub release.
