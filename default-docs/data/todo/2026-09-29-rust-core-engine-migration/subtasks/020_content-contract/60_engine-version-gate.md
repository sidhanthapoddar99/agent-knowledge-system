---
title: "Engine version gate — content outside the supported range never starts"
status: open
---

Content declares the format version it targets in `site.yaml → engine_version`. The engine supports a range: from a floor (the oldest content it reads unmigrated) up to its own version. Content outside that range is a hard error before anything is served, with a message that names the fix. Today's gate lives in [engine-version.ts](../../../../../../agent-ks-engine/src/loaders/engine-version.ts); this leaf moves it into the Rust core, where the server and every content-reading CLI command share it.

# 01 To Do
- [ ] **Two constants in `agentks-config`**: `ENGINE_VERSION` (from the crate version, one source) and `MIN_CONTENT_VERSION`. 1.0.0's floor is 1.0.0: every 0.x project migrates once.
- [ ] **The check**, run by config loading on `agentks start`, `agentks build` and every CLI command that reads content: parse `engine_version` as x.y.z (missing means `0.0.0`); content below the floor or above the engine is a fatal error.
- [ ] **The message** names the content version, the supported range, and both fixes: `agentks migrate` for content below the floor ([140/20](../140_versioning-and-migrations/20_migrate-command.md)), `agentks update` for content above the engine, and pinning an older release with mise for users who stay on 0.x ([140/70](../140_versioning-and-migrations/70_mise-pinning.md)).
- [ ] **Commands that must work outside the range**: `help`, `--version`, `update`, `migrate`, `docs`, `init`. Each is tested against an out-of-range fixture.
- [ ] **The version scheme** stated by position, carried from today's comment: X is reserved (0 beta, 1 production), Y moves for major upgrades, Z for small additions and fixes. The floor moves only on breaking changes.
- [ ] **Tests**: below the floor, at the floor, at the engine, above the engine, missing, malformed (`"1.0"`, `"v1.0.0"`): each gives the expected outcome and message.

## Guardrails
- The gate lives in the binary and never depends on a download. Only migration scripts are downloaded.
- Never bump `engine_version` in a project past the gate without running the migration chain (today's AGENTS.md rule, carried).

## Done when
- Each test case above passes.
- `agentks start` on a 0.x project (for example this repository's `default-docs/`) stops before binding a port, printing the migration message.
- `agentks migrate --help` and `agentks --version` work on that same project.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** crate `agentks-config`.
- **Read first:** [02/02 Project config](../../notes/02_engine/02_project-config.md) section 08; [05/03 Versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md); today's [engine-version.ts](../../../../../../agent-ks-engine/src/loaders/engine-version.ts) and its version-scheme comment; the dev-docs pages [version gate](../../../../dev-docs/30_versioning/02_version-gate.md) and [minimum version](../../../../dev-docs/30_versioning/03_minimum-version.md).
- **Depends on:** [20](./20_config-folder.md).
- **Unblocks:** [140/00 versioning and migrations](../140_versioning-and-migrations/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): forced migrations; older versions pinned with mise.
- Decided (sidhantha, 2026-09-30): 1.0.0 ships after Phases 1 and 2; its floor is 1.0.0 ([05/03](../../notes/05_delivery/03_versioning-and-migrations.md)).

# 05 Notes & Analysis
## Watch out
- Keep `ENGINE_VERSION` derived from `CARGO_PKG_VERSION` of one crate, so the binary's `--version`, the gate and the release tag cannot disagree.
