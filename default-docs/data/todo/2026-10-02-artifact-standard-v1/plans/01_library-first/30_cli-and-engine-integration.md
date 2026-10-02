---
title: "Integrate the Rust CLI and engine after its build is ready"
status: blocked
outcome: "Installed/discovered library components work in the engine reader and static publishing with compatibility proof."
notes: "Blocked on the other engine agent's usable build and the independently verified library/runtime outputs."
subtasks:
  - "[Install libraries with pinned GitHub versions](../../subtasks/070_cli-library-tooling/010_installation-and-version-locking.md)"
  - "[Search libraries and components through a typed catalog](../../subtasks/070_cli-library-tooling/020_catalog-index-and-search.md)"
  - "[Inspect component contracts, source and examples](../../subtasks/070_cli-library-tooling/030_component-inspection-and-examples.md)"
  - "[Validate the CLI-to-plugin discovery workflow](../../subtasks/070_cli-library-tooling/040_cli-plugin-workflow-and-validation.md)"
  - "[Integrate library resolution, compilation and browser outputs](../../subtasks/120_engine-integration/010_resolver-compiler-and-browser-build-adapter.md)"
  - "[Integrate webpage embeds and narrated interactions in the reader](../../subtasks/120_engine-integration/020_reader-embeds-and-narrated-adapter.md)"
  - "[Publish optimized static artifacts and verify the full flow](../../subtasks/120_engine-integration/030_static-publishing-and-end-to-end-proof.md)"
---

Blocked on the other engine agent's usable build and the independently verified library/runtime outputs.

# 01 To Do
- [ ] Accept a usable build checkpoint from the other engine agent and the selected library contract/revision.
- [ ] Implement the referenced CLI/resolver, reader/narrated and publishing adapters.
- [ ] Record compatibility, command and static-production end-to-end proof through relevant ctl checks.

## Done when
- Installed/discovered library components work in the engine reader and static publishing with compatibility proof.

# 02 Status and Result
Held on the dependencies named above. No stage output is claimed.

# 03 References
- [Plan overview](./overview.md)
- [Owner scope](../../notes/01_scope-and-boundaries.md)
- [Other engine build](../../../2026-09-29-rust-core-engine-migration/issue.md)

# 04 Decisions
## 01 Stage boundary
The owner explicitly requested all engine-dependent work remain blocked on the other agent's engine build.

# 05 Notes & Analysis
## Handoff
Do not infer readiness from prior library previews; verify actual engine interfaces and published artifact behavior.
