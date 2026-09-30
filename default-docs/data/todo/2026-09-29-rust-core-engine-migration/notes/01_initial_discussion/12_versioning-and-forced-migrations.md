---
title: "Versioning and forced migrations"
---

Migrations are **forced**. The engine supports current content only. A user who does not want to migrate installs the older version and keeps using it, and we suggest **mise** for pinning a version per project. The migration release is a breaking change and should be numbered **1.0.0**. The migration code itself is **not built into the binary**: the scripts live in git and `agentks migrate` downloads the ones it needs, so the binary stays lean.

# 03 References

- [dev-docs: versioning overview](../../../../dev-docs/30_versioning/01_overview.md) and [migrations](../../../../dev-docs/30_versioning/04_migrations.md) — today's version gate and migration discipline.
- [One install](./05_single-install-tool-engine-frontend.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): forced migrations. Users migrate, or download and use an older version.
- Decided (sidhantha, 2026-09-29): recommend mise to pin an older version per project.
- Decided (sidhantha, 2026-09-30): the official repository's address is built into the binary, and migration scripts are downloaded only from it. No hashes of the scripts are stored.
- Decided (sidhantha, 2026-09-30): the first Rust release is 1.0.0.
- Decided (sidhantha, 2026-09-30): two kinds of migration — docs migrations run by users, library migrations done by library owners. Every library states the engine versions it is built for.
- Decided (sidhantha, 2026-09-30): migration scripts are not shipped in the binary. They live in git, in Python or JavaScript (to be chosen), and are downloaded when a migration needs them. The binary stays lean.
- Decided (sidhantha, 2026-09-29): publishers stay on the last 0.x release until the Phase 3 static export ships, because 1.0.0 has no publishing ([Phase 3](../02_future-stages/07_phase-3-publishing.md)).

# 05 Notes & Analysis

## 01 Why mise fits

mise can install a specific release straight from GitHub. A project that wants to stay behind pins it in its own `mise.toml`. We do not need to build a version manager.

## 02 Migrations are scripts fetched from git

Today migrations are Python scripts in `agent-ks-engine/migration/`, named `<to-version>_<statement>.py`, each with detect, dry-run, migrate and re-detect steps. That stays. The scripts move to the new repository, next to the engine that owns the format (proposed: `apps/agentks-engine/migrations/`), and they are **not compiled into the binary**.

**Two kinds of migration**, in two parts of that folder:

| Part | Migrates | Run by |
|---|---|---|
| `docs/` | A project's own content: pages, config, tracker | The user, through `agentks migrate` |
| `library/` | A library's files and manifest, for a breaking engine release | The library's owner, before publishing a new version with a new `engine` range |

A library's user never migrates the library; they update its pin ([libraries](../02_future-stages/09_libraries-and-dependencies.md)).

What the binary keeps (claude, proposed):

- **The version gate.** The engine still refuses content outside its supported range and names the command that fixes it. The gate is small and must never depend on a download.
- **`agentks migrate`, as a thin runner.** It reads the content's version and its own, picks the scripts in that range, downloads them from the official repository, whose address is built into the binary, at the binary's own release tag, and runs them in order with the safety rails below.

What it costs (claude):

- **A runtime on the user's machine.** Python or a JavaScript runtime must be present when a migration runs. Migrations are rare, once per breaking release, so the runner checks for the runtime and prints how to get it rather than bundling one. With Python, `uv run` can run a single-file script together with its dependencies; with JavaScript, `bun` can. Today's scripts are Python, so Python means no rewrite.
- **Trust.** These scripts rewrite the user's files. They come only from the official repository built into the binary, at the tag of the installed binary, so a user never points `agentks migrate` at another source. No separate hash list is kept.
- **Offline.** A machine without network cannot migrate. The gate's error says so and names what to download.

The prior audit warned that restarting at 1.0.0 leaves every existing project below the version floor. Forced migrations answer that only if `agentks migrate` covers **every 0.x format**, from the oldest supported content version up. The 1.0.0 migration also creates the files 1.0.0 requires, such as an empty `config/dep.yaml` ([libraries](../02_future-stages/09_libraries-and-dependencies.md)).

## 03 Safety rails (claude, proposed)

A forced migration that corrupts content is the worst failure in this design. So `agentks migrate`:

- refuses to run on a git tree with uncommitted changes;
- always shows a dry run first;
- re-checks after running and reports anything left.

## 04 The version number

**Decided: 1.0.0.** This release changes the binary name, the config layout and removes custom layouts, so it breaks existing projects, and a new major version is the usual number for that.

## 05 Release streams

Today there are three independent releases: engine, plugin and CLI. In the new setup ([the repositories](../02_future-stages/12_repositories-and-three-states.md)):

| Stream | What ships | From |
|---|---|---|
| **The installer** | One compressed download: the binary, with the engine and the built client inside | `neuralabshq/agent-knowledge-system` releases |
| The plugins | The two AI plugins in `plugins/`, versioned in their own manifests | Installed through the Neuralabs marketplace |
| The default library | Its own version series, tagged in its repository | `neuralabshq/agent-knowledge-system-library` |

The installer is the only thing agentks publishes as a release. There is no Docker image. The homepage and the docs are deployed, not released.
