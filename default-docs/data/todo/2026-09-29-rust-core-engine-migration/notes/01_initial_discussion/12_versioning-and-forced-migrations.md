---
title: "Versioning and forced migrations"
---

Migrations are **forced**. The engine supports current content only. A user who does not want to migrate installs the older version and keeps using it, and we suggest **mise** for pinning a version per project. The migration release is a breaking change and should be numbered **1.0.0**.

# 03 References

- [dev-docs: versioning overview](../../../../dev-docs/30_versioning/01_overview.md) and [migrations](../../../../dev-docs/30_versioning/04_migrations.md) — today's version gate and migration discipline.
- [One install](./05_single-install-tool-engine-frontend.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): forced migrations. Users migrate, or download and use an older version.
- Decided (sidhantha, 2026-09-29): recommend mise to pin an older version per project.
- Decided (sidhantha, 2026-09-29): publishers stay on the last 0.x release until the Phase 3 static export ships, because 1.0.0 has no publishing ([Phase 3](../02_future-stages/07_phase-3-publishing.md)).

# 05 Notes & Analysis

## 01 Why mise fits

mise can install a specific release straight from GitHub. A project that wants to stay behind pins it in its own `mise.toml`. We do not need to build a version manager.

## 02 Migrations move into the binary (claude, proposed)

Today migrations are Python scripts in `agent-ks-engine/migration/`. A single-binary tool cannot require Python on every user's machine. They become `agentks migrate`, written in Rust, keeping today's detect → dry-run → migrate → re-detect structure.

The prior audit warned that restarting at 1.0.0 leaves every existing project below the version floor. Forced migrations answer that only if `agentks migrate` covers **every 0.x format**, from the oldest supported content version up. The 1.0.0 migration also creates the files 1.0.0 requires, such as an empty `config/dep.yaml` ([libraries](../02_future-stages/09_libraries-and-dependencies.md)).

## 03 Safety rails (claude, proposed)

A forced migration that corrupts content is the worst failure in this design. So `agentks migrate`:

- refuses to run on a git tree with uncommitted changes;
- always shows a dry run first;
- re-checks after running and reports anything left.

## 04 The version number

The user proposed 1.0.1. This release changes the binary name, the config layout and removes custom layouts, so it breaks existing projects. **1.0.0** is the usual number for that (claude's suggestion).

## 05 Release streams

Today there are three independent releases: engine, plugin and CLI. With the engine inside the binary, they become two: the binary (CLI, engine and frontend) and the plugin.
