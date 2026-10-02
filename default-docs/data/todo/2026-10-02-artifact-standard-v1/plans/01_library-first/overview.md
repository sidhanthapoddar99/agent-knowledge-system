---
title: "Contract, library, then engine"
---

Agree the shared contract and reference implementation, prove the library independently, then integrate after the other engine agent's build is ready. Groups describe areas; this plan describes execution order.

# 01 To Do

| Stage | Outcome | Dependency |
|---|---|---|
| [Agree the standard and reference component](./10_standard-and-reference.md) | A reviewed component/runtime/rendering contract and reference example unblock component teams. | Framework, public API and compatibility decisions precede migration. |
| [Build the library, preview and authoring tooling](./20_library-preview-and-tooling.md) | Migrated/new libraries, live examples, Vite/plugin workflows and optimized browser output are independently proven. | Held until the standard/reference contract is accepted; no core engine or Rust CLI changes in this stage. |
| [Integrate the Rust CLI and engine after its build is ready](./30_cli-and-engine-integration.md) | Installed/discovered library components work in the engine reader and static publishing with compatibility proof. | Blocked on the other engine agent's usable build and the independently verified library/runtime outputs. |

## Guardrails

- The current change creates work orders; it does not start implementation.
- Build library/runtime examples, Vite and plugin preparation before core engine or Rust CLI changes.
- Keep engine-dependent work blocked on the other agent's usable build and the proven library contract.

# 02 Status and Result

The schedule and detailed work orders are initialized. No implementation result is claimed.

# 03 References

- [The issue](../../issue.md)
- [Owner scope](../../notes/01_scope-and-boundaries.md)
- [Brainstorm index](../../brainstorm/01_authoring-and-runtime-options.md)
- [Other engine build and migration](../../../2026-09-29-rust-core-engine-migration/issue.md)

# 04 Decisions

## 01 Order

The owner placed library/preview work before engine integration. The standard/reference slice comes first within the library work so migration teams share one API. Actual Rust CLI work is grouped with the later engine stage.

## 02 Grouping

Narration, divergent paths and component interaction share one group; their individual work orders remain distinct.

# 05 Notes & Analysis

## External dependency

The other agent's engine build is a named dependency, not permission to assume its interfaces are ready. Record its usable checkpoint before unblocking the engine stage.

## Verification

Each work order owns its checks and results. Built library examples establish independent capability; later engine/static output needs separate end-to-end evidence.
