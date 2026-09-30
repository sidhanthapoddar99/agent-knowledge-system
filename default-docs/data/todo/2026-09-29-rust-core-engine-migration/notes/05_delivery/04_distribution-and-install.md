---
title: "Distribution, install and update"
---

agentks releases **one thing: a compressed installer** per platform, published on the main repository's GitHub Releases. It holds the `agentks` binary, and the binary carries everything a user needs: the Rust engine and CLI, the built client (the Vite single-page app) and the static renderer for `agentks build`, each embedded and compressed. One install serves every project on the machine, so projects no longer carry a framework folder or `node_modules`. There is **no Docker image**. Users install with a one-line script, fetched either from `agentks.neuralabs.org` (which only redirects to the GitHub release) or from the GitHub release directly, and keep up to date with `agentks update`. A project that must stay on an older version pins it with mise. What the binary does not carry is downloaded when needed: libraries, the narration voice model and the migration scripts. The docs are hosted, not downloaded.

# 03 References

- [Repositories and layout](./01_repositories-and-layout.md) — the repository the installer is released from.
- [Versioning and migrations](./03_versioning-and-migrations.md) — version numbers and pinning.
- [Publishing](./02_publishing-ssg.md) — the static renderer's runtime needs.
- [Machine home and build cache](../02_engine/06_machine-home-and-build-cache.md) — `~/.agentks/`, where downloads land.
- [Rust CLI](../02_engine/05_rust-cli.md) — the command surface.
- [Deployment and hosting](./06_deployment-and-hosting.md) — the install URL on agentks.neuralabs.org.
- [Brainstorm: one install](../../brainstorm/01_initial-discussion/05_single-install-tool-engine-frontend.md) and [the repositories and three states](../../brainstorm/02_future-stages/12_repositories-and-three-states.md).
- Today's installer and updater, which this design keeps: [install.sh](../../../../../../agent-ks-cli/install.sh), [install.ps1](../../../../../../agent-ks-cli/install.ps1), [update.rs](../../../../../../agent-ks-cli/src/update.rs), [the CLI release workflow](../../../../../../.github/workflows/agent-ks-cli-release.yml) and [RELEASING.md](../../../../../../RELEASING.md).

# 04 Decisions

- Decided (sidhantha, 2026-09-29): one global install serves every project on the machine.
- Decided (sidhantha, 2026-09-29): the client ships embedded in the binary.
- Decided (sidhantha, 2026-09-29): libraries are downloaded and cached, never packaged in the binary.
- Decided (sidhantha, 2026-09-29): the installer and the binary are named `agentks`.
- Decided (sidhantha, 2026-09-30): agentks publishes only its installer: the binary with the engine and the built client, compressed.
- Decided (sidhantha, 2026-09-30): no Docker image is published or maintained.
- Decided (sidhantha, 2026-09-30): the install URL can be on agentks.neuralabs.org or a GitHub release. The agentks.neuralabs.org one only passes the request on to the GitHub release.
- Decided (sidhantha, 2026-09-30): the static renderer ships compressed inside the binary, like the client.
- Decided (sidhantha, 2026-09-30): the migration scripts, the voice model and libraries are downloaded when needed, not bundled.
- Proposed (claude, 2026-09-30), not yet agreed: the platform list, the archive names, the updater carry-over and the size budget in sections 02 to 06; the final 0.x release pointing its updater at the new repository.

# 05 Notes & Analysis

## 01 What is inside the binary

| Part | Form inside the binary | Unpacked to |
|---|---|---|
| Rust engine and CLI | Native code | — |
| The client (`apps/agentks-client` build) | Compressed static files | Served from memory by the local server |
| The static renderer (`apps/agentks-ssg` build) | Compressed JavaScript bundle | The build cache for this version, on first `agentks build` |
| The official addresses | Constants | — ([repositories](./01_repositories-and-layout.md)) |
| The version gate | Native code | — |

| Not inside | Comes from | Lands in |
|---|---|---|
| Libraries | Git, pinned by `config/dep.lock` | `~/.agentks/libraries/` |
| Templates | The library repository | Copied into the new project by `agentks init` |
| The voice model | A separate download | `~/.agentks/models/` |
| Migration scripts | The main repository, at the binary's tag | `~/.agentks/migrations/` |
| The docs | Hosted at agentks.neuralabs.org/docs | Nowhere; `agentks docs` opens them |
| Bun or Node | The user installs it, only for `agentks build` and migrations | — |

## 02 The release

| Item | Detail |
|---|---|
| Tag | `vX.Y.Z` on `neuralabshq/agent-knowledge-system`. The single product needs no tag namespace |
| Platforms | Linux x64 and ARM64, macOS Intel and Apple Silicon, Windows x64, as today |
| Assets | One archive per platform (`agentks-<version>-<target>.tar.gz`, `.zip` on Windows), plus `SHA256SUMS` |
| Notes | One release note per version in `apps/agentks-engine/release-notes/`, stating breaking changes and the migration to run |
| Workflow | Runs only on a pushed `vX.Y.Z` tag: format, lint, tests, the end-to-end checks, then release builds on every platform. Publication needs every job green. After publishing, it marks the newest stable version as GitHub's Latest |
| Who tags | The repository owner, after review. Agents prepare the version and the note; they never tag, push or publish |

The client and the static renderer are built in the same workflow run and embedded before the Rust build, so a binary never carries a client from another commit.

## 03 Installing

```sh
# Linux and macOS
curl -fsSL https://agentks.neuralabs.org/install.sh | sh
curl -fsSL https://github.com/neuralabshq/agent-knowledge-system/releases/latest/download/install.sh | sh

# Windows (PowerShell)
irm https://agentks.neuralabs.org/install.ps1 | iex
```

The two URLs are the same file: agentks.neuralabs.org redirects to the GitHub release. GitHub serves the file and its checksums, so the website can never hand out a stale binary.

The installer keeps today's behaviour, renamed:

| Behaviour | Detail |
|---|---|
| Default | The Latest stable release, into `~/.local/bin` (Windows: the user's local programs folder) |
| `--version X.Y.Z` / `AGENTKS_VERSION` | Pins the install and pauses automatic updates |
| `--install-dir` / `AGENTKS_INSTALL_DIR` | Another folder |
| `--no-shell-setup` | Does not touch shell startup files (for CI and Docker) |
| Checks | Checksum, archive layout, the binary's reported version |
| Needs | `curl`, `tar`, `sha256sum` or `shasum`. No sudo, no Rust, no JavaScript runtime |
| Shell setup | Adds the folder to PATH and a silent update hook with a five-hour cooldown |

## 04 Updating

`agentks update` keeps today's updater ([update.rs](../../../../../../agent-ks-cli/src/update.rs)) with the new repository built in.

- `agentks update` installs the newest stable release now. `--check --json` checks without installing; `--status --json` reads the cached state.
- The shell hook runs a silent check at most every five hours. Ordinary commands never check, so they stay fast.
- A download is checked by checksum and by running the new binary's `--version` before it replaces the old one in a single rename.
- A pinned install (`--version`) or `AGENTKS_AUTO_UPDATE=0` turns automatic updates off, as today.
- A development build (a binary under a repository's `data/builds/`) never updates itself.
- Updating across a breaking version is allowed. The version gate then stops each old project and names `agentks migrate`.

## 05 Moving users over from agent-ks

- The final 0.x release of `agent-ks` changes its updater to print a notice naming the new install command, instead of installing the new binary silently. A silent jump would rename the command and break every project at once.
- This repository is archived in place, with a banner pointing to `NeuraLabsHQ/agent-knowledge-system`. Its releases stay downloadable, so old install URLs and links keep working.
- The migration guide says: install `agentks`, run `agentks migrate` in each project, remove the old framework folder.

## 06 Size

The binary grows from a CLI into tool, engine and two embedded bundles. That cost is paid once per machine, not once per project, so a user with ten projects is far smaller in total than today (419 MB of `node_modules` per project, measured before the Astro 7 upgrade). Heavy diagram libraries are part of the client bundle and load only on pages that use them. Measure the binary's size at every release and state it in the release note.

## 07 One install, many projects

- `agentks` finds a project from the folder it runs in: the nearest `config/` with a `dep.yaml`, or `--config-dir`.
- Two projects can run at once on different ports. `agentks ps` lists every running server.
- Each project has its own build cache under `~/.agentks/build-cache/`, keyed by the project's path and the engine version, so two pinned engine versions on one machine never share cached output.
