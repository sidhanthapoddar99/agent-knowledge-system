---
title: "Versioning, the version gate and migrations"
---

agentks has one version, x.y.z, carried by the binary; the first Rust release is **1.0.0**, shipped when Phases 1 and 2 are done. Content states the engine version it targets, and the engine refuses content outside its supported range. That check, the **version gate**, lives in the binary and never depends on a download. Migrations are **forced**: the engine supports current content only, and a user who does not want to migrate pins an older version per project with mise. There are **two kinds of migration**. Users run **docs migrations** on their own content through `agentks migrate`. Library owners run **library migrations** on their library and publish a new version; a library's users only move its pin. The migration scripts are **not built into the binary**. They live in the main repository under `apps/agentks-engine/migrations/{docs,library}`, and `agentks migrate` downloads the ones it needs from the official repository, at the installed binary's own release tag. No hash list is kept. Running a script needs a runtime on the machine (uv for Python or bun for JavaScript), which the runner checks for and never bundles.

# 03 References

- [Project config](../02_engine/02_project-config.md) — where content declares its version.
- [Rust CLI](../02_engine/05_rust-cli.md) — `agentks migrate` among the other commands.
- [Library system](../04_ecosystem/01_library-system.md) — a library's `engine` range, and pins.
- [Distribution and install](./04_distribution-and-install.md) — the installer, the updater and pinning with mise.
- [Repositories and layout](./01_repositories-and-layout.md) — where the scripts live.
- [Brainstorm: versioning and forced migrations](../../brainstorm/01_initial-discussion/12_versioning-and-forced-migrations.md)
- Today's gate: [engine-version.ts](../../../../../../agent-ks-engine/src/loaders/engine-version.ts); today's scripts: [the migration README](../../../../../../agent-ks-engine/migration/README.md); today's discipline: [dev-docs 30_versioning](../../../../dev-docs/30_versioning/01_overview.md) and [migrations](../../../../dev-docs/30_versioning/04_migrations.md).
- Today's release streams: [RELEASING.md](../../../../../../RELEASING.md).

# 04 Decisions

- Decided (claude, under sidhantha's delegation, 2026-09-30): migration scripts are Python, run with `uv run` as single-file scripts with inline dependencies. Today's scripts are Python, so they port without a rewrite.

- Decided (sidhantha, 2026-09-29): migrations are forced. Users migrate, or install and keep using an older version.
- Decided (sidhantha, 2026-09-29): mise is the recommended way to pin an older version per project.
- Decided (sidhantha, 2026-09-29): publishers stay on the last 0.x release until Phase 3 ships.
- Decided (sidhantha, 2026-09-30): the first Rust release is 1.0.0. It ships after Phases 1 and 2.
- Decided (sidhantha, 2026-09-30): the migration scripts are not shipped in the binary. They live in git and are downloaded when a migration needs them.
- Decided (sidhantha, 2026-09-30): the official repository's address is built into the binary; scripts come only from it. No hashes of the scripts are stored.
- Decided (sidhantha, 2026-09-30): two kinds of migration — docs migrations run by users, library migrations done by library owners. Every library states the engine versions it is built for.
- Decided (sidhantha, 2026-09-30): the only release is the compressed installer. The plugins and the default library version on their own.
- Proposed (claude, 2026-09-30), not yet agreed: the gate and runner details in sections 02 to 05; the safety rails in section 06; the script contract in section 04.

# 05 Notes & Analysis

## 01 Version numbers

| Thing | Version | Where it is written |
|---|---|---|
| The binary (engine, CLI, client, static renderer) | x.y.z, one number for all of them | The Rust package version; the tag is `vX.Y.Z` on the main repository |
| A project's content | The engine version it targets | `config/site.yaml → engine_version` |
| A library | Its own x.y.z series | `manifest.json → version` and the library repository's tags |
| A library's needs | A range of engine versions | `manifest.json → engine`, for example `>=1.0.0 <2.0.0` |
| The two AI plugins | Their own x.y.z | Each plugin's manifest |

Today's position rule carries over: x marks beta (0) against production, y moves for major upgrades, z for small additions and fixes. 1.0.0 is the first production release. It breaks every existing project: the binary is renamed, the config layout changes and custom layouts go. Later breaking releases move x again.

The engine and the client ship in one binary, so they share one version. Today's three release streams (engine, plugin, CLI) collapse: the engine and CLI become one, and only the installer is released ([distribution](./04_distribution-and-install.md)).

## 02 The version gate

The binary carries two numbers:

| Constant | Means |
|---|---|
| `ENGINE_VERSION` | This binary's version |
| `MIN_CONTENT_VERSION` | The oldest content version that still works without migrating. It moves only on breaking changes |

On every start, build and content command, the engine reads `engine_version` from `site.yaml` (missing means `0.0.0`) and checks it against `[MIN_CONTENT_VERSION, ENGINE_VERSION]`.

| Content version | Result |
|---|---|
| Inside the range | Runs |
| Below the floor | Stops. The error names both versions and says `agentks migrate` |
| Above the engine | Stops. The error says the project needs a newer agentks and names `agentks update`, or the mise pin the project asked for |

The gate is small and has no network path. It must work offline and on a machine that has never run a migration.

## 03 `agentks migrate`

`agentks migrate` is a thin runner. It does not contain migration logic.

```
agentks migrate [--dry-run] [--yes] [--json]
  1. read      content version X (site.yaml), engine version Y (the binary)
  2. guard     refuse on a git tree with uncommitted changes
  3. fetch     list apps/agentks-engine/migrations/docs/ at tag vY on the main
               repository; download every script with a version in (X, Y]
  4. runtime   check that the scripts' runtime is present; if not, print how
               to install it and stop
  5. detect    run every script's detect step; show what each would change
  6. dry run   show the full dry run and ask to continue (--yes skips the ask)
  7. migrate   run the scripts in version order
  8. verify    re-run every detect step; anything left is an error
  9. check     read every pinned library's engine range; list all mismatches
 10. bump      set engine_version to Y in site.yaml, as the last step
```

- **Scripts come only from the official repository**, at the tag of the installed binary. A user can never point `agentks migrate` at another source. Git and HTTPS protect the download; no separate hash list is kept.
- **Downloaded scripts are cached** under `~/.agentks/migrations/<version>/`, so re-running after a fix does not download again.
- **Offline** is an error that says a network connection is needed once, for the download.
- **Covering every 0.x format.** The 1.0.0 scripts must bring any content from the oldest supported 0.x version up to 1.0.0. That includes creating what 1.0.0 requires: an empty `config/dep.yaml`, `.env` moved into `config/`, `CONFIG_DIR` removed, custom layouts replaced by a built-in style or an artifact.

## 04 The script contract

Today's contract carries over from [the migration README](../../../../../../agent-ks-engine/migration/README.md), with a new home.

```
apps/agentks-engine/migrations/
  docs/
    1.0.0_config-folder-and-env.<ext>
    1.0.0_dep-yaml.<ext>
    1.0.0_custom-layouts.<ext>
    …
  library/
    2.0.0_<statement>.<ext>
```

| Rule | Detail |
|---|---|
| Name | `<to-version>_<statement>`. The version is the engine version the script brings content to. Version order is execution order |
| Sharing a version | Allowed, but scripts that share one must not depend on each other; each walks the tree itself |
| A version must be real | Only versions the engine is actually released at |
| One file, four steps | `detect` (where, with file and line), `dry-run`, `migrate` (idempotent), `verify` (re-detect finds zero) |
| Self-contained | One file. Any dependencies are declared inside it, so `uv run` or `bun` can run it alone |
| Covers syntax too | A release that retires markup owes a script, because old markup misrenders silently instead of failing |
| Machine-readable | `--json` output from every step, so the runner shows one combined report |

The runner calls `<runtime> <script> detect|dry-run|migrate|verify --root <project>`.

## 05 Library migrations

| | Docs migration | Library migration |
|---|---|---|
| Changes | A project's pages, config and tracker | A library's files and `manifest.json` |
| Run by | The project's user, through `agentks migrate` | The library's owner, through `agentks migrate --library <folder>` (proposed) |
| Scripts in | `migrations/docs/` | `migrations/library/` |
| Ends with | `engine_version` bumped in `site.yaml` | A new library version tagged, with a new `engine` range in its manifest |

A library's users never migrate it. Libraries sit read-only in the machine cache. When a user's engine is outside a pinned library's range, agentks stops, names the library and its range, and suggests `agentks install --update` or pinning the older engine with mise ([library system](../04_ecosystem/01_library-system.md)).

## 06 Safety rails

A forced migration that corrupts content is the worst failure in this design, so the runner:

- refuses to run on a git tree with uncommitted changes, so every change can be reviewed and undone with git;
- always shows a dry run before changing anything;
- re-runs every detect step afterwards and reports anything left as an error;
- bumps `engine_version` last, never first, so a half-finished migration is still caught by the gate.

## 07 Pinning an older version with mise

A project that does not want to migrate pins the binary in its own `mise.toml`:

```toml
[tools]
"github:neuralabshq/agent-knowledge-system" = "1.3.2"
```

Inside that folder, `agentks` is 1.3.2; everywhere else it is the installed release. Publishers use the same mechanism to stay on the last 0.x release until Phase 3 ships (0.x lives in this repository, so its pin names this repository). agentks builds no version manager of its own.

## 08 Maintainer checklist for a format change

1. Bump `ENGINE_VERSION`.
2. Add the scripts under `migrations/docs/` (and `migrations/library/` if library files change).
3. Raise `MIN_CONTENT_VERSION` only if old content breaks or misrenders without the migration.
4. Try the chain on agentks's own `docs/` and on the tracker fixture first.
5. Say what changed, and what to run, in the release note.

## 09 Open

- The script language: Python (today's scripts, no rewrite, run with `uv run`) or JavaScript (run with `bun`, the same runtime `agentks build` needs). See [open questions and risks](../01_overview/05_open-questions-and-risks.md).
