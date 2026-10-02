---
title: "Rust CLI library tooling — group scope"
status: blocked
---

Extend the Rust CLI with library installation, pinned version/dependency management, search/discovery and inspectable component contracts/examples.

# 01 To Do
Deliver the following scoped work orders. Their live state is also shown by the tracker.

| Work order | Initial state |
|---|---|
| [Install libraries with pinned GitHub versions](./010_installation-and-version-locking.md) | blocked |
| [Search libraries and components through a typed catalog](./020_catalog-index-and-search.md) | blocked |
| [Inspect component contracts, source and examples](./030_component-inspection-and-examples.md) | blocked |
| [Validate the CLI-to-plugin discovery workflow](./040_cli-plugin-workflow-and-validation.md) | blocked |

## Guardrails
- Follow the [owner scope and boundaries](../../notes/01_scope-and-boundaries.md).
- All work in this group is blocked on the other agent's usable engine build and the accepted library contract.

## Done when
- Each child work order meets its checks and records its result/evidence.

# 02 Status and Result
Blocked on the other agent's engine build and library/reference readiness.

## Agent log
none

# 03 References
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Brainstorm index](../../brainstorm/01_authoring-and-runtime-options.md)
- [Other engine build and migration work](../../../2026-09-29-rust-core-engine-migration/issue.md)

# 04 Decisions
## 01 Area of work
This group is an area, not a phase. The owner requested an index explaining the area and combined narration, branching and interaction into one experience group.

# 05 Notes & Analysis
## Dependency and index maintenance
Follow the plan and each child's actual state. Update this scope table and the index state when child results change.

## Validator note
The installed toolkit derives any sibling set that is neither all open nor all closed as in-progress, including a wholly blocked group. This index intentionally remains blocked with its children, following the owner's explicit scheduling request. See the [scope note](../../notes/01_scope-and-boundaries.md).
