---
title: "Rust CLI library tooling — group scope"
status: blocked
---

Extend the Rust CLI with library installation, pinned version/dependency management, search/discovery and inspectable component contracts/examples.

# 01 To Do
- [ ] Deliver the detailed work orders in this group using the accepted artifact contract.
- [ ] Record each child item's result and evidence in that item's own Status and Result section.

## Guardrails
- Follow the [owner scope and boundaries](../../notes/01_scope-and-boundaries.md).
- This group is held on the other agent's engine build and the accepted library contract; do not start engine-repository code work before those dependencies are ready.

## Done when
- The group's child work orders meet their acceptance checks and carry their results/evidence.

# 02 Status and Result
Initialized as the group index. Implementation has not started.

## Agent log
none

# 03 References
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Brainstorm index](../../brainstorm/01_authoring-and-runtime-options.md)
- [Other engine build and migration work](../../../2026-09-29-rust-core-engine-migration/issue.md)

# 04 Decisions
## 01 Area of work
This folder groups a capability, not a phase. The group purpose and limits follow the owner's discussion; individual implementation decisions belong in the child work orders.

# 05 Notes & Analysis
## Dependency
Blocked on the other agent's engine build plus the library/reference contract. The later engine stage owns when this group can start.
