---
title: "agentks migrate: the migration runner"
status: open
---

When a user upgrades across a breaking version, the version gate stops their project and names `agentks migrate`. This leaf builds that command: a thin runner that downloads the migration scripts for the version range from the official repository, at the installed binary's own release tag, checks their runtime is present, shows what each would change, runs them in order, verifies nothing is left, checks every pinned library's engine range, and bumps `engine_version` last. The runner holds no migration logic; the scripts do.

# 01 To Do
- [ ] **Command.** `agentks migrate [--dry-run] [--yes] [--json]` and, for library owners, `agentks migrate --library <folder>` ([140/40](./40_library-migrations.md)).
- [ ] **Steps**, each reported:
    1. **Read** the content version X (`site.yaml → engine_version`, missing = `0.0.0`) and the engine version Y.
    2. **Guard.** Refuse on a git tree with uncommitted changes, naming `git status`. Refuse when X > Y (needs `agentks update`). Nothing to do when X = Y.
    3. **Fetch.** Get `apps/agentks-engine/migrations/docs/` at tag `vY` from the main repository. Take every script whose version V satisfies X < V ≤ Y. Cache under `~/.agentks/migrations/<Y>/`; reuse the cache on re-runs.
    4. **Runtime.** Check the scripts' runtime is present (`uv` for Python or `bun` for JavaScript). If missing, print how to install it and stop. Never bundle or download a runtime.
    5. **Detect.** Run every script's `detect` step; collect file-and-line hits.
    6. **Dry run.** Run every `dry-run`; show the combined report; ask to continue (`--yes` skips the ask; without a terminal and without `--yes`, stop after the dry run).
    7. **Migrate.** Run the scripts in version order (ties in file-name order).
    8. **Verify.** Re-run every `verify`/`detect`; anything left is an error listing the hits.
    9. **Libraries.** Read every pinned library's `engine` range from its cached manifest; list every mismatch at once, with the fix.
    10. **Bump** `engine_version` to Y in `site.yaml` as the last step, preserving the file's comments and formatting.
- [ ] **Fetching.** Use the same Rust git code as libraries ([120/20](../120_libraries/20_fetch-and-resolve.md)): a shallow fetch of the tag, then read the tree. The repository address is the one official constant shared with the catalog and updater.
- [ ] **Script call contract.** `<runtime> <script> detect|dry-run|migrate|verify --root <project> --json`. Parse each step's JSON; a script that exits non-zero or prints invalid JSON stops the run with its stderr shown.
- [ ] **`--json`** output: one document with every step's result.
- [ ] **Offline**: an error saying a network connection is needed once, for the download (unless the cache for Y is present).
- [ ] **Tests.** A fixture repository with tagged script sets; fixture projects at several versions; test the guard (dirty tree), the range selection, ordering, dry-run-only mode, verify failure, the final bump, and that a failure before step 10 leaves `engine_version` unchanged.

## Guardrails
- Scripts come only from the official repository at the binary's tag. No flag or environment variable points `migrate` at another source (a test-only override is compiled out of release builds).
- No hash list.
- `engine_version` is bumped last, never first.

## Done when
- On a fixture project at 0.3.10, `agentks migrate --yes` runs the 1.0.0 chain from a local test tag, verifies clean, bumps to 1.0.0, and `agentks start` then passes the gate.
- On a dirty tree it refuses without touching anything.

# 02 Status and Result
Open. Not started.

## Result
None yet.

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

# 05 Notes & Analysis
## Watch out
- The main repository is private until the launch. Before then, `migrate` needs the machine's git credentials; after the launch it needs none. Test both.
- Windows: run scripts through the runtime binary explicitly (`uv run script.py`), never rely on shebangs.
