---
title: "agentks migrate"
description: "The migration runner in crates/migrate: where it gets scripts, the order of its steps, and the safety rails that keep a forced migration from corrupting content."
---

This page explains the runner behind `agentks migrate`. It is a thin runner: it holds no migration logic. The scripts change content. The runner finds the right scripts, runs them in order, checks the result and sets the new `engine_version` last. The code is in `apps/agentks-engine/crates/migrate/`, and the CLI command in `apps/agentks-engine/crates/cli/` calls its `run` function.

```bash
agentks migrate --dry-run --json    # show what would change, change nothing
agentks migrate                     # show the dry run, ask, then migrate
agentks migrate --yes               # migrate without asking
```

## The steps

`run` reads the content version X from `site.yaml` and takes the engine version Y from the binary. Then `Plan::execute` in `apps/agentks-engine/crates/migrate/src/pipeline.rs` runs these steps:

| Step | Does | Stops with |
|---|---|---|
| 1. Guard the version | Content newer than the engine is refused. Content at the engine's version has nothing to do | `ContentNewer` |
| 2. Guard the tree | The project must be in a git repository with no uncommitted changes. Untracked files count as changes | `NotVersioned`, `DirtyTree` |
| 3. Fetch | Get the migrations folder for this release (see below) | `Offline`, `MissingRelease` |
| 4. Select | Every script in `docs/` with X < version ≤ Y, in version order, ties in file-name order | `BadScriptName` |
| 5. Check the runtime | The runtime each selected script needs must be on the path: `uv` for a `.py` script, `bun` for a `.ts` or `.js` script. The runner prints how to install a missing one and never downloads it | `RuntimeMissing` |
| 6. Preview | Run each script's `detect` and `dry-run`, and join them into one report | the script's error |
| 7. Ask | Show the report. `--dry-run` stops here. `--yes` skips the question | — |
| 8. Migrate | Run each script's `migrate`, in order | the script's error |
| 9. Verify | Run each script's `verify`. Anything left, or a blocking manual item, is an error | `Leftover` |
| 10. Bump | Set `engine_version` to Y in `site.yaml` | — |

The version guard runs before the tree guard. So content already at the engine's version reports nothing to do, even on a dirty tree.

The run also checks every pinned library's `engine` range against the new version and lists every mismatch at once, so the user hears about all of them together instead of one per start. The CLI fills this part of the report. Reading pins needs `agentks-library`, which sits in the same layer as `agentks-migrate`, and a crate may not depend sideways. So `run` returns `MigrateReport.library_mismatches` empty, and the CLI adds them.

## Where scripts come from

`Source::for_engine` in `apps/agentks-engine/crates/migrate/src/scripts.rs` decides, and no flag or environment variable can change it.

| Build | Source |
|---|---|
| A release build | The official repository (`OFFICIAL_REPOSITORY` in `agentks-core`), at the tag `v<engine version>`, folder `apps/agentks-engine/migrations/` |
| A development build | The checkout's own `apps/agentks-engine/migrations/` folder, so maintainers can try unreleased scripts |

A release build lists the repository's refs, takes the tag, and fetches that one commit with `agentks-git`, the same code that fetches libraries. It builds the copy in a scratch folder beside `~/.agentks/migrations/<version>/` and renames it into place. So the cache is either whole or absent, and a second run after a fix reuses it offline. With no network, the error says a connection is needed once, for the download. A missing tag is `MissingRelease`.

No list of script hashes is kept. Git checks what it fetches, HTTPS protects the transport, and the address is compiled in.

## Calling a script

`apps/agentks-engine/crates/migrate/src/invoke.rs` runs each step as:

```
uv run --quiet --script <script> <step> --root <project> --json     a .py script
bun run <script> <step> --root <project> --json                     a .ts or .js script
```

The runner picks the runtime from the file's extension. Every script in the chain today is Python. `--root` is the project folder, the one that holds `config/site.yaml`. The runner reads the script's one JSON document from stdout. Exit 1 is allowed only from `verify`, where it means something is left. Any other non-zero exit, or output that is not the expected JSON, stops the run and shows the script's stderr. The [script contract](./15_script-contract.md) defines the steps and the JSON shape.

## The preview

The ask in step 7 shows `MigrateReport.preview`: for each script, the places `detect` found, the changes `dry-run` would make, and the manual items, with blocking ones marked "needs a person".

**A combined preview is not a promise.** Each script reads the project as it is now. A later script cannot see what an earlier one will write. The report says so at its top. The `verify` pass after migrating is the real check.

## The safety rails

A forced migration that corrupts content is the worst failure this design can have, so the runner:

- refuses a project outside git, or with uncommitted changes, so every change can be reviewed and undone with git;
- always previews before it changes anything, and without a terminal and without `--yes` it answers no;
- verifies every script afterwards. A `verify` that says it is not clean but lists nothing still fails, so a script cannot pass by accident;
- sets `engine_version` last, never first. A migration that stops halfway is still caught by the version gate on the next start.

## Setting engine_version

`apps/agentks-engine/crates/migrate/src/site_yaml.rs` edits the one top-level `engine_version:` line in place. It keeps the quotes, the comment and the line ending, and adds the line after the leading comments when it is missing. It refuses a duplicate or a value that is not a plain scalar. It writes the file atomically. It does not load and re-save the YAML, because that would lose the file's comments and formatting.

## Tests

`cargo test -p agentks-migrate` runs in under a second. Fake scripts run under `sh`, and one test runs a real script through `uv`. The tests cover the range and its order, a declined run and `--dry-run` changing nothing, dirty and unversioned trees refused untouched, a leftover stopping the run before the bump, a crash and bad JSON, the version guard, a missing runtime, and a fetch at a tag from a local fixture repository, reused offline.

## Related

- [The script contract](./15_script-contract.md): what every script must do.
- [Library migrations](./20_library-migrations.md): the `--library` mode for library owners.
