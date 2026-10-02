---
title: "Engine integration — group scope"
status: blocked
---

After the other agent's engine build and the library contract are ready, integrate resolution/compilation, reader embeds and static publishing with end-to-end proof.

# 01 To Do
Deliver the following scoped work orders. Their live state is also shown by the tracker.

| Work order | Initial state |
|---|---|
| [Integrate library resolution, compilation and browser outputs](./010_resolver-compiler-and-browser-build-adapter.md) | blocked |
| [Integrate webpage embeds and narrated interactions in the reader](./020_reader-embeds-and-narrated-adapter.md) | blocked |
| [Publish optimized static artifacts and verify the full flow](./030_static-publishing-and-end-to-end-proof.md) | blocked |

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
