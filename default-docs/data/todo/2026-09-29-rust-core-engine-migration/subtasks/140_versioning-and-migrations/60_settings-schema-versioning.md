---
title: "Settings schema versioning: typed config per version"
status: open
---

A few settings change how agentks behaves in deep ways (the theme, section paths, layout styles), and every config file (`site.yaml`, `navbar.yaml`, `footer.yaml`, `dep.yaml`, the `settings.json` files in content folders and the tracker's vocabulary) has a shape the engine must read correctly. This leaf makes those shapes explicit and versioned: one typed schema per engine version, published so editors and agents can validate against it, strict about unknown keys, and tied to the rule that any schema change ships with a docs migration. Which settings invalidate which caches is [040/20](../040_caching/20_settings-invalidation.md); this leaf gives it the typed settings to key on.

# 01 To Do
- [ ] **Typed settings.** Every config file and every `settings.json` kind is a Rust type with serde, in the config crate ([030/30](../030_rust-engine/30_config-loader-and-settings-schema.md) builds the loader; this leaf owns the versioning rules around it).
- [ ] **Strictness.**
    - [ ] `site.yaml`, `navbar.yaml`, `footer.yaml`, `dep.yaml`: an unknown key is an error naming the file, the key and the nearest known key.
    - [ ] `config/.env`: an unknown key is a warning (it only overrides known keys).
    - [ ] Content `settings.json` files: follow today's rules for each kind (docs folder, issue, tracker root); an unknown key in an issue's `settings.json` stays a validator finding, as `agent-ks check issues` does today.
- [ ] **Published schema.** Generate a JSON Schema for each file kind from the Rust types (for example with `schemars`), and print it with `agentks config schema [FILE-KIND] --json`. Editors and skills use it; nothing is hand-written.
- [ ] **One schema per engine version.** The schema is part of the binary; the content's `engine_version` selects nothing at run time (the gate already guarantees content matches the binary's schema).
- [ ] **Change rule**, enforced by a test in the gate: a change to any settings type (detected by a snapshot of the generated JSON Schemas) fails unless the same change adds a migration script under `migrations/docs/` for the new version, or the snapshot update is marked additive (a new optional key with a default). Additive changes need no floor move; removals and renames need a script and usually a floor move.
- [ ] **Settings fingerprint.** Expose, for each cache layer, a stable hash of only the settings that affect it (for example the theme fingerprint = `theme`, `theme_paths` and the theme files' hashes), so [040/20](../040_caching/20_settings-invalidation.md) can key on it. Each setting declares what it affects in the type (an attribute or a table).

## Guardrails
- No hand-written schema files that can drift from the types.
- Never silently ignore a config key.

## Done when
- `agentks config schema site --json` prints a schema that validates this repository's migrated `site.yaml`.
- Renaming a field in a test branch without a migration fails the gate with a message naming the file kind and field.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, the config crate under `apps/agentks-engine/`.

**Read first**
- [Project config](../../notes/02_engine/02_project-config.md) — every file and key.
- [Versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md), sections 02, 04 and 08.
- Today's settings handling: [settings-file.ts](../../../../../../agent-ks-engine/src/loaders/settings-file.ts), [config.ts](../../../../../../agent-ks-engine/src/loaders/config.ts).

**Depends on:** [030/30 config loader](../030_rust-engine/30_config-loader-and-settings-schema.md), [140/10 version constants](./10_version-and-release-stream.md).
**Unblocks:** [040/20 settings invalidation](../040_caching/20_settings-invalidation.md), [130/10 plugin port](../130_ai-plugins/10_agentks-plugin-port.md) (the config skill points at the schema command).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): forced migrations; content outside the supported range is refused ([versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md)).
- Decided (claude, 2026-09-30): the schema is generated from the Rust types and printed by the binary, and a gate test ties every non-additive settings change to a migration script.

# 05 Notes & Analysis
## Watch out
- The `agentks config schema` command name is proposed here; coordinate with [070/00 CLI](../070_cli/00_overview.md) so the command surface stays consistent.
