---
title: "Library migrations, run by library owners"
status: open
---

When a breaking engine release changes something a library file depends on (an artifact's contract, a manifest field, a cue format), the library's owner, not its users, migrates the library and tags a new version with a new `engine` range. Users only move their pin with `agentks install --update`. This leaf adds `agentks migrate --library <folder>` and the `migrations/library/` half of the scripts folder, with the same runner and safety rails as docs migrations.

# 01 To Do
- [ ] **Runner flag.** `agentks migrate --library <folder> [--to X.Y.Z] [--dry-run] [--yes] [--json]`:
    - [ ] Read the library's `manifest.json`; the current `engine` range gives the from-version (its lower bound); the target is the binary's version unless `--to` names an older released one.
    - [ ] Fetch `apps/agentks-engine/migrations/library/` at the target tag; run the same detect → dry run → migrate → verify steps as [140/20](./20_migrate-command.md).
    - [ ] Last step: update `engine` in `manifest.json` to a range starting at the target (for example `>=2.0.0 <3.0.0`) and suggest the next library version (a major bump). Do not tag; tagging is the owner's act.
    - [ ] Refuse on a dirty git tree, like docs migrations.
- [ ] **Folder and naming.** `migrations/library/<to-version>_<statement>.py`, under the same contract as docs scripts ([versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md), section 04). 1.0.0 needs none (libraries start at 1.0.0). The folder and its README, with an empty chain, exist at `apps/agentks-engine/migrations/library/`, so the path exists at the 1.0.0 tag.
    - [ ] **A library shared block.** Library scripts carry their own shared block, which reads the library's `manifest.json` instead of `config/site.yaml`. The first library script defines it, and later library scripts copy it.
- [ ] **User-side messages.** When a user's engine is outside a pinned library's range, the error (built in [120/30](../120_libraries/30_manifest-and-catalog.md)) names the library, its range and this version, and suggests `agentks install --update` or a mise pin. Check the wording covers both directions (library too old, engine too old).
- [ ] **Tests.** A fixture library at `engine: ">=1.0.0 <2.0.0"`, a fake `2.0.0` script, and a local test tag; verify the manifest range is rewritten and nothing else changes outside the script's hits.
- [ ] **Docs.** The library authoring guide section ([120/90](../120_libraries/90_library-authoring-guide.md)) and the library-development plugin ([130/20](../130_ai-plugins/20_library-dev-plugin.md)) describe this flow.

## Guardrails
- Users never migrate a library; libraries sit read-only in the machine cache. `--library` refuses a folder inside `~/.agentks/libraries/`.
- Same safety rails as docs migrations.

## Done when
- `agentks migrate --library ./fixture-lib --yes` against the fake 2.0.0 script updates the files and the manifest range, and `agentks check libraries` in a 2.x test project accepts it.
- Pointing `--library` at a cached library folder is refused with a clear message.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, the migrate crate and `apps/agentks-engine/migrations/library/`.

**Read first**
- [Versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md), section 05.
- [Library system](../../notes/04_ecosystem/01_library-system.md), section 15.

**Depends on:** [140/20 migrate command](./20_migrate-command.md), [120/30 manifest](../120_libraries/30_manifest-and-catalog.md).
**Unblocks:** [120/90 authoring guide](../120_libraries/90_library-authoring-guide.md), [130/20 library-development plugin](../130_ai-plugins/20_library-dev-plugin.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): library migrations are done by the library's owner, who publishes a new version ([library system](../../notes/04_ecosystem/01_library-system.md)).
- Proposed (claude, 2026-09-30): the `--library <folder>` flag on `agentks migrate` ([versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md)); build it as proposed unless sidhantha changes it.

# 05 Notes & Analysis
## Watch out
- A range like `^1` in a manifest has no single lower bound to migrate "from" when it is written oddly; parse with `semver` and, when the lower bound is unclear, require `--from`. Never guess.
