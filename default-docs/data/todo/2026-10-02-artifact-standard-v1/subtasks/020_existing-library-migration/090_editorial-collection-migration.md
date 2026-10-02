---
title: "Migrate Editorial with its own collection worktree"
status: review
---

Editorial can migrate its books/accounts/paper/precise visual families independently of Default and Storybook.

# 01 To Do
- [x] **Own Editorial sources.** Convert the collection's components, local themes and examples to the frozen TSX contract.
- [x] **Reuse shared behavior.** Depend on published/frozen primitive interfaces or typed fixtures rather than duplicating chart/state logic.
- [x] **Submit collection metadata.** Preserve names/assets/licenses and provide a fragment for canonical manifest generation.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Branch from the merged contract/foundation checkpoint and follow its interfaces.
- Own only the assigned source/assets/examples and a local metadata fragment; the integrator owns catalogs, manifests, shared configuration and locks.

## Done when
- Editorial examples and component contracts work independently in webpage and narrated hosts.
- The complete collection migration map and provenance are accounted for with focused proof.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Editorial preserves all 22 native identities and adds ten typed definitions, nine explicit same-ID replacements and book-reading. Paper/precise families reuse Default charts/ledger and SDK SVG posing while retaining original artwork/pivots.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `libraries/agentks-editorial/components/tsx`; `libraries/agentks-editorial/artifact-library.json`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: Editorial family/host/metadata/provenance/backward-time and nested-event cases. The native compatibility suite also passed 63 tests.

Native animation/style/background entries remain native. Final compiled browser parity is tracked separately, and no new engine compatibility is asserted. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Editorial Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/editorial-migration.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 02_shared tsx artifact elements.md](../../brainstorm/02_shared-tsx-artifact-elements.md)
- [Related idea: 05_libraries styles themes dependencies.md](../../brainstorm/05_libraries-styles-themes-dependencies.md)
- [Current library catalog](../../../../../../../../agent-knowledge-system-library/README.md)
- [Default manifest](../../../../../../../../agent-knowledge-system-library/libraries/agentks-default/manifest.json)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Declare Default 0.1.0 as the exact dependency; preserve artwork and share calculations rather than copying them.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
The central Editorial manifest and root catalog are integration-owned; worker ownership covers its local component/theme/example subtree.
