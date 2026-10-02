---
title: "Migrate existing component families with parallel ownership"
status: review
---

Migration can be divided among agents after the reference API is agreed, while keeping behavior and public interfaces consistent.

# 01 To Do
- [x] **Assign bounded lanes.** Define independent chart/table/widget, SVG/object, motion/style and asset-wrapper batches with clear file ownership.
- [x] **Convert behavior.** Implement existing families against the shared TSX API, reusing primitives and keeping vector/font assets in suitable native forms.
- [x] **Supply proof.** Add a webpage and narrated usage example for each migrated behavior; reconcile shared changes through the contract owner.

## Guardrails
- Apply the [owner scope and execution boundaries](../../notes/01_scope-and-boundaries.md).
- Do this work in the library repository, with independent preview proof before engine integration.
- Preserve existing public identities and provenance, or document any deliberate compatibility change through the standard.

## Done when
- All mapped families are accounted for and expose the agreed inputs/events rather than competing APIs.
- Representative migrated behaviors work in both hosts, and shared files have explicit integration ownership.

# 02 Status and Result
Implementation is ready for owner review; external integration/release limits are recorded below.

## Result
Independent collection lanes delivered shared-API chart/table/vector/motion behavior, local registrations and complete examples. Default primitives serve Editorial, Storybook and the additional collections without forked chart/ledger/pose mathematics.

Source paths below are relative to `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` at the reviewed source revision: `libraries/agentks-default/components/tsx`; `libraries/agentks-editorial/components/tsx`; `libraries/agentks-storybook/components/tsx`.

Verified on 2026-10-03 at library source `7b2c057513cde265ae3c9008bc6b32909bbbab82`: the focused unit/DOM batch passed 170 tests / 2,155 assertions. Relevant coverage: All collection defaults/metadata/host cases and shared Default semantics. The native compatibility suite also passed 63 tests.

Mapped native widget/presentation assets retain their old compatibility path. Their retention does not imply a universal TSX conversion. Final aggregate/output evidence belongs in the [library-first result](../../notes/02_library-first-result.md); this focused batch is not a claim that the final gate or all compiled outputs already pass.

## Agent log
none

# 03 References
- [Library-first implementation result](../../notes/02_library-first-result.md)
- [Default Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/default-migration.md)
- [Editorial Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/editorial-migration.md)
- [Storybook Migration contract](../../../../../../../../agent-knowledge-system-library/contracts/storybook-migration.md)
- [Owner scope and boundaries](../../notes/01_scope-and-boundaries.md)
- [Library-first plan](../../plans/01_library-first/overview.md)
- [Related idea: 02_shared tsx artifact elements.md](../../brainstorm/02_shared-tsx-artifact-elements.md)
- [Related idea: 05_libraries styles themes dependencies.md](../../brainstorm/05_libraries-styles-themes-dependencies.md)
- [Current library structure](../../../../../../../../agent-knowledge-system-library/README.md)
- [Default collection manifest](../../../../../../../../agent-knowledge-system-library/libraries/agentks-default/manifest.json)

# 04 Decisions
## 01 Scope basis
The owner direction and reasons are recorded in the linked scope note. These acceptance checks are a draft decomposition of that direction.

## 02 Local design
Keep shared types, catalogs, locks and integration checks coordinator-owned; collection workers compose frozen primitives and preserve source assets.

# 05 Notes & Analysis
## Execution dependencies
Follow the linked plan for order. Folder and file numbers identify areas and items; they do not imply an execution schedule.

## Watch out
This task scopes the multi-agent migration workflow; creating the work order does not launch agents. Preserve imported asset bytes unless a reviewed conversion needs a change.
