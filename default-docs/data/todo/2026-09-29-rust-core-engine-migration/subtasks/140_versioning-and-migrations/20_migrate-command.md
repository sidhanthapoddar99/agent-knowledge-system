---
title: "agentks migrate: the migration runner"
status: in-progress
---

When a user upgrades across a breaking version, the version gate stops their project and names `agentks migrate`. This leaf builds that command: a thin runner that downloads the migration scripts for the version range from the official repository, at the installed binary's own release tag, checks their runtime is present, shows what each would change, runs them in order, verifies nothing is left, checks every pinned library's engine range, and bumps `engine_version` last. The runner holds no migration logic; the scripts do.

# 01 To Do
- [ ] **Command.** `agentks migrate [--dry-run] [--yes] [--json]` and, for library owners, `agentks migrate --library <folder>` ([140/40](./40_library-migrations.md)).
- [x] **Steps**, each reported (the runner, in `agentks-migrate`; step 9 is left to the caller, see Result):
    1. **Read** the content version X (`site.yaml → engine_version`, missing = `0.0.0`) and the engine version Y.
    2. **Guard.** Refuse on a git tree with uncommitted changes, naming `git status`. Refuse when X > Y (needs `agentks update`). Nothing to do when X = Y.
    3. **Fetch.** Get `apps/agentks-engine/migrations/docs/` at tag `vY` from the main repository. Take every script whose version V satisfies X < V ≤ Y. Cache under `~/.agentks/migrations/<Y>/`; reuse the cache on re-runs.
    4. **Runtime.** Check that `uv` is present, because the scripts are Python. If it is missing, print how to install it and stop. Never bundle or download it.
    5. **Detect.** Run every script's `detect` step; collect file-and-line hits.
    6. **Dry run.** Run every `dry-run`; show the combined report; ask to continue (`--yes` skips the ask; without a terminal and without `--yes`, stop after the dry run).
    7. **Migrate.** Run the scripts in version order (ties in file-name order).
    8. **Verify.** Run every script's `verify`. Anything left, or a blocking `manual` item, is an error listing them.
    9. **Libraries.** Read every pinned library's `engine` range from its cached manifest; list every mismatch at once, with the fix.
    10. **Bump** `engine_version` to Y in `site.yaml` as the last step, preserving the file's comments and formatting.
- [x] **Fetching.** Use the same Rust git code as libraries ([120/20](../120_libraries/20_fetch-and-resolve.md)): a shallow fetch of the tag, then read the tree. The repository address is the one official constant shared with the catalog and updater.
- [ ] **Script call contract.** `uv run <script> detect|dry-run|migrate|verify --root <project> --json`. Parse each step's JSON document.
    - [x] The script side: the contract is written in `apps/agentks-engine/migrations/README.md` and the eight 0.x scripts follow it (see Result).
    - [x] The runner side: exit 1 from `verify` means "not clean", not a crash: show the JSON's `hits` and blocking `manual` items. Exit 2 (bad arguments, or the script cannot tell which folders are content), any other non-zero exit, and invalid JSON are failures: stop the run and show the script's stderr.
- [ ] **`--json`** output: one document with every step's result.
- [x] **Offline**: an error saying a network connection is needed once, for the download (unless the cache for Y is present).
- [ ] **Tests.** A fixture repository with tagged script sets; fixture projects at several versions; test the guard (dirty tree), the range selection, ordering, dry-run-only mode, verify failure, the final bump, and that a failure before step 10 leaves `engine_version` unchanged.

## Guardrails
- Scripts come only from the official repository at the binary's tag. No flag or environment variable points `migrate` at another source (a test-only override is compiled out of release builds).
- No hash list.
- `engine_version` is bumped last, never first.

## Done when
- On a fixture project at 0.3.10, `agentks migrate --yes` runs the 1.0.0 chain from a local test tag, verifies clean, bumps to 1.0.0, and `agentks start` then passes the gate.
- On a dirty tree it refuses without touching anything.

# 02 Status and Result
In progress. The Rust runner is built and tested; the CLI command, step 9 (pinned libraries) and the end-to-end "Done when" run are left.

## Result
- **Script contract**, on the main repository's `main` branch, in `apps/agentks-engine/migrations/README.md`: name `<to-version>_<statement>.py`; one file with PEP 723 inline dependencies, run by `uv run`; steps `detect`, `locate` (human view of detect), `dry-run` (= `migrate --dry-run`), `migrate`, `verify`; `--root <project>` is the folder holding `config/site.yaml`; exit 0 = step ran (and, for `verify`, nothing left), 1 = `verify` found something left or blocking, 2 = bad arguments or unreadable scope.
- **JSON shape** (one document per call): `script`, `to_version`, `step`, `root`, `scope {content, trackers}`, `hits[]`, `changes[]`, `manual[]`, `clean`. Each item is `{file, line, kind, detail, blocking}`; `file` is relative to `--root`. `manual` items with `blocking: true` keep `verify` failing until a person acts; the rest are reports for the combined output.
- **Evidence:** the eight 0.x scripts in `apps/agentks-engine/migrations/docs/` implement it; `uv run apps/agentks-engine/migrations/tests/test_docs_chain.py` runs the chain through every step in about 1.6 s.
- **Runner**, in the main repository's `apps/agentks-engine/crates/migrate/` (branch `wave2/git-migrate`): `run` reads the version with `agentks_config::read_content_version`, then `src/pipeline.rs` runs the steps. Guard order: content newer than the engine is `ContentNewer`; equal is nothing to do; then the project must be in git (`NotVersioned`, new) with a clean tree (`DirtyTree`; untracked files count).
- **Fetch** (`src/scripts.rs`): a release build lists the official repository's refs, takes tag `v<engine>`, shallow-fetches that commit with `agentks-git`, and renames `apps/agentks-engine/migrations/` into `~/.agentks/migrations/<engine>/`, so the cache is whole or absent and re-runs reuse it. No network is `Offline(version)`; a missing tag is `MissingRelease` (new). A development build reads the checkout's own `migrations/` folder.
- **Call** (`src/invoke.rs`): `uv run --quiet --script <script> <step> --root <project> --json`; a missing `uv` is `RuntimeMissing` with the install hint. Script names that do not parse are `BadScriptName` (new), never skipped.
- **Bump** (`src/site_yaml.rs`): edits the one top-level `engine_version:` line in place (quotes, comment and line ending kept), adds it after the leading comments when missing, refuses a duplicate or a non-scalar value, and writes atomically.
- **Report:** `MigrateReport.preview` (new) is the combined dry-run text given to `Confirm`; `ScriptOutcome` gained `changes` and `manual`.
- **Tests:** `cargo test -p agentks-migrate`, 16 tests, under 1 s: range and order (ties by file name), decline and `--dry-run` change nothing, dirty and unversioned trees refused untouched, a leftover after migrating stops before the bump, a crash and invalid JSON stop with stderr, the version guard, a missing runtime, fetch at a tag from a local fixture repository then reuse offline, and one real `0.1.0` script through `uv` (verify fails, migrate, verify passes).
- **Left:** the CLI command, its `Confirm` and `--json` (in `crates/cli`); step 9, because reading pins needs `agentks-library`, a crate in the same layer, so the CLI fills `library_mismatches`; `--library` (140/40, returns `NotImplemented`); the "Done when" run, which needs the config reader and the 1.0.0 scripts from other tracks.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, the migrate crate and the CLI under `apps/agentks-engine/`.

**Read first**
- [Versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md), sections 03 (the runner), 04 (the script contract), 06 (safety rails).
- [Library system](../../notes/04_ecosystem/01_library-system.md), section 15 (engine compatibility).
- [Machine home and build cache](../../notes/02_engine/06_machine-home-and-build-cache.md) — `~/.agentks/migrations/<version>/`.
- Today's scripts and contract: [migration README](../../../../../../agent-ks-engine/migration/README.md); [authoring migrations](../../../../dev-docs/30_versioning/05_authoring-migrations.md).

**Depends on:** [140/10](./10_version-and-release-stream.md), [120/20 fetch](../120_libraries/20_fetch-and-resolve.md), [020/60 gate](../020_content-contract/60_engine-version-gate.md).
**Unblocks:** [140/30 docs migration](./30_docs-migration-0x-to-1.md), [140/40 library migrations](./40_library-migrations.md).

# 04 Decisions
- Decided (claude, under sidhantha's delegation, 2026-09-30): migration scripts are Python, run with `uv run` as single-file scripts with inline dependencies. Today's eight scripts are Python, so they port without a rewrite.
- Decided (sidhantha, 2026-09-30): scripts are not shipped in the binary; they are downloaded from the official repository at the binary's tag; no hashes are stored ([versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md)).
- Decided (claude, 2026-09-30): the runner fetches scripts with the same git code as libraries (a shallow fetch of the tag), so there is one download path to secure and test.
- Decided (claude, 2026-09-30): scripts find content from `--root/config/site.yaml`, not from a path the runner computes, so the runner passes only the project folder and each script's scope matches what the 0.x engine read.
- Decided (claude, 2026-09-30): `verify` exits 1 when something is left; every other step exits 0 when it ran, whatever it found. The runner reads findings from the JSON, and a non-zero exit from any other step is a real failure.
- Decided (claude, 2026-09-30): a `manual` list with a `blocking` flag carries what a script cannot do alone (paste-in settings edits, refused links) and what it only reports (custom colours to move to CSS, retired agent-log shapes). This keeps the old scripts' human-facing reports without making every report stop the run.
- Decided (claude, 2026-09-30): `locate` stays as a fifth step for people running a script by hand; the runner never needs it.
- Decided (claude, 2026-10-01): a development build (`debug_assertions`) reads the checkout's own `migrations/` folder, and a release build only ever fetches from the official repository at its tag, because this lets maintainers try unreleased scripts with no flag or environment variable that could point a release elsewhere. Tests reach the fetch path through an internal source value.
- Decided (claude, 2026-10-01): a project outside git is refused like a dirty one, because the safety rail is that every change can be reviewed and undone with git.
- Decided (claude, 2026-10-01): the version guard runs before the clean-tree guard, so content already at the engine's version reports nothing to do even on a dirty tree.
- Decided (claude, 2026-10-01): the fetched migrations folder is built in a scratch folder beside the cache and renamed into place, because then a half-finished download can never be read as a cache hit.
- Decided (claude, 2026-10-01): `engine_version` is set by editing its one line, because a YAML round trip would lose the file's comments and formatting.
- Decided (claude, 2026-10-01): a `verify` that reports not clean but lists nothing still fails the run, so a script cannot pass by accident.

# 05 Notes & Analysis
## Watch out
- The main repository is private until the launch. Before then, `migrate` needs the machine's git credentials; after the launch it needs none. Test both.
- Windows: run scripts through the runtime binary explicitly (`uv run script.py`), never rely on shebangs.
- The combined dry run is a preview, not a promise: a later script's `detect` and `dry-run` see today's tree, not what earlier scripts will write. Say so in the dry-run report, and rely on the `verify` pass after `migrate`.
- `verify` runs every script in the range again after all migrations. A script's `verify` must stay true after later scripts have run; the 0.x chain passes that in the test.
