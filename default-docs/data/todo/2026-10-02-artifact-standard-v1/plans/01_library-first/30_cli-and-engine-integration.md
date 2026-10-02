---
title: "Integrate the Rust CLI and engine after its build is ready"
status: blocked
outcome: "Installed/discovered library components work in the engine reader and static publishing with compatibility proof."
notes: "Blocked on the external engine build and separately validated library contract; library developer preview remains independent."
subtasks:
  - "[Install libraries with pinned GitHub versions](../../subtasks/070_cli-library-tooling/010_installation-and-version-locking.md)"
  - "[Search libraries and components through a typed catalog](../../subtasks/070_cli-library-tooling/020_catalog-index-and-search.md)"
  - "[Inspect component contracts, source and examples](../../subtasks/070_cli-library-tooling/030_component-inspection-and-examples.md)"
  - "[Validate the CLI-to-plugin discovery workflow](../../subtasks/070_cli-library-tooling/040_cli-plugin-workflow-and-validation.md)"
  - "[Integrate library resolution, compilation and browser outputs](../../subtasks/120_engine-integration/010_resolver-compiler-and-browser-build-adapter.md)"
  - "[Integrate webpage embeds and narrated interactions in the reader](../../subtasks/120_engine-integration/020_reader-embeds-and-narrated-adapter.md)"
  - "[Publish optimized static artifacts and verify the full flow](../../subtasks/120_engine-integration/030_static-publishing-and-end-to-end-proof.md)"
---

Developer rendering means Vite preview pages. It does not authorize assuming or replacing Rust engine interfaces.

# 01 To Do

- [ ] Accept the other engine agent's usable checkpoint and exact agreed library/build contract.
- [ ] Implement actual CLI/resolver, reader and static publishing adapters with that owner.
- [ ] Validate real commands and published outputs before changing blocked work states.

## Done when

Installed/discovered library components work in the engine reader and static publishing with compatibility proof.

# 02 Status and Result

Blocked on the external typed-artifact integration checkpoint. A usable native engine and the validated library contract/closures are available. Its owner must integrate typed installation/discovery, client islands and static publishing. All seven CLI/engine work orders and both indices remain blocked; this library run claims no Rust adapter work. See [Library-first result](../../notes/02_library-first-result.md).

# 03 References

- [Plan overview](./overview.md)
- [Owner scope](../../notes/01_scope-and-boundaries.md)

# 04 Decisions

The owner authorized autonomous isolated-worktree execution with as much real parallelism as dependencies permit. Shared entrypoints and configuration have one integrator.

# 05 Notes & Analysis

Blocked on the external engine build and separately validated library contract; library developer preview remains independent.
