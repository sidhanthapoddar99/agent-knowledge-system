---
title: "Contract, parallel libraries, then engine"
---

Validate one shared contract and reference, run bounded library/runtime/preview lanes in parallel, then prove their integrated browser outputs before external engine integration.

# 01 To Do

| Stage | Outcome | Dependency |
|---|---|---|
| [Agree the standard and reference component](./10_standard-and-reference.md) | A tested component, source catalog and time/state contract give parallel teams one reference. | Three contract prototypes and inventory/blueprints proceed independently; coordinator reconciles the public API before bulk migration. |
| [Establish the shared library and preview foundation](./20_library-preview-and-tooling.md) | Source index, lazy rendering, scene fixtures and a shipped Vite skeleton provide stable lane inputs. | Depends on the tested standard/reference checkpoint; developer preview has no Rust engine dependency. |
| [Build collections, experiences and tooling in parallel](./23_parallel-library-builds.md) | Independent collection and runtime lanes deliver compatible components, examples and authoring guidance. | Starts from the shared foundation; each lane owns bounded files and can merge as soon as its focused checks pass. |
| [Integrate and verify independent library outputs](./26_integration-and-production-proof.md) | Merged libraries and standalone examples pass parity, mobile/accessibility and built-output validation. | Consumes checked lane commits; full interaction/audio/branch coordination follows subsystem integration. |
| [Integrate the Rust CLI and engine after its build is ready](./30_cli-and-engine-integration.md) | Installed/discovered library components work in the engine reader and static publishing with compatibility proof. | Blocked on the external typed-artifact integration checkpoint; the native engine and validated library contract are available; library developer preview remains independent. |

## Ownership and capacity

The coordinator owns shared types/exports, root configuration and locks, canonical catalogs/manifests and integration checks. Workers own collection subtrees or isolated modules plus local registration fragments. Default charts, tables, vectors and motion are separate migration lanes; Editorial and Storybook have one lane each. New collections, preview pages, runtime modules, asset builds and plugin methodology can run alongside them when their inputs are ready. Current execution has three worker slots and one coordinator; further independent lanes queue rather than overlap global files.

# 02 Status and Result

The library-first implementation and production proof are merged into library main: six collections, 73 typed definitions, preserved native inventory, shipped Vite preview, portable author/use plugin, standalone closures and an ordinary HTML consumption example. All 43 library-first work orders are submitted for review; seven actual Rust CLI/engine work orders remain blocked. Live UI and reproducible loading measurements are recorded. All created worktrees are removed, with unique captures preserved in primary. [Library-first result](../../notes/02_library-first-result.md) records exact scope, checkpoints and limits. The owner marks work closed after review.

# 03 References

- [The issue](../../issue.md)
- [Owner scope](../../notes/01_scope-and-boundaries.md)
- [Brainstorm index](../../brainstorm/01_authoring-and-runtime-options.md)
- [Other engine build](../../../2026-09-29-rust-core-engine-migration/issue.md)

# 04 Decisions

The owner authorized maximum useful parallelism and clarified that developer rendering means preview pages. Actual Rust CLI and core engine integration remain a later externally dependent stage. Narration, divergent paths and element interaction keep separate work orders inside one experience area.

# 05 Notes & Analysis

Use tested foundation commits as worktree inputs. Merge focused passing lanes as they finish, then perform whole-library production proof. Preserve all legacy identities/assets and ordinary HTML compatibility. GitHub tags and release notes remain the distribution choice; no publish/tag/push is authorized by this execution.
