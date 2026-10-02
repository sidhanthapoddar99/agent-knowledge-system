---
title: "Artifact standard v1 and shared library"
---

# Goal

Define a shared artifact standard and migrate/expand the library around executable TypeScript/TSX components. Normal webpages, embedded artifacts and live narrated experiences should import/reference the same reusable elements.

The narrated experience is a flow of live slides/components, timestamped actions and voiceover, with optional reader interaction and branching. It is not a rendered movie production pipeline.

## Context

The detailed work is now scoped in ten area folders and fifty work orders, with a group index in each. The [plan](./plans/01_library-first/overview.md) runs standard/reference work first, library/preview/plugin work next and Rust CLI/engine integration later.

The [HTML artifact issue](../2026-07-07-artifact-component/issue.md) and [Video artifacts issue](../2026-09-29-narrated-video-pages/issue.md) retain their existing work. All three use the Artifact tracker component; diagram work remains in Components. “v1” is the working name of the standard, not an announced release version.

The [brainstorm index](./brainstorm/01_authoring-and-runtime-options.md) retains the ideas and examples. The [initial comment](./comments/001_2026-10-02_initial-direction-and-todos.md) captures the original basic to-dos; [scope and boundaries](./notes/01_scope-and-boundaries.md) records the current owner direction.

## Current result

The library-first work is merged into library main at `f20ee086`: six collections, 73 typed definitions, preserved native assets, a Vite developer preview, reusable ordinary HTML/narrated components and portable author/use tooling. All 43 library-first work orders are ready for review; seven Rust CLI/engine integration items remain blocked. Production gates, independent author/consumer smoke, both-theme/mobile UI checks and reproducible cold/limited-load observations pass. All created worktrees are removed, with unique captures preserved in primary. [Detailed result and engine handoff](./notes/02_library-first-result.md) records scope, validation and limits.

## Work areas

| Area | Detailed work orders |
|---|---|
| [Standard and contracts](./subtasks/010_standard-and-contracts/00_index.md) | 4 |
| [Existing library migration](./subtasks/020_existing-library-migration/00_index.md) | 10 |
| [Additional libraries](./subtasks/030_additional-libraries/00_index.md) | 6 |
| [Innovative components](./subtasks/040_innovative-components/00_index.md) | 4 |
| [Developer preview](./subtasks/050_developer-preview/00_index.md) | 3 |
| [AI authoring and usage plugin](./subtasks/060_ai-authoring-and-usage-plugin/00_index.md) | 3 |
| [Rust CLI library tooling](./subtasks/070_cli-library-tooling/00_index.md) — blocked on typed engine integration | 4 |
| [Narrated and interactive experiences](./subtasks/080_narrated-and-interactive-experiences/00_index.md) | 9 |
| [Production rendering and optimization](./subtasks/110_production-and-optimization/00_index.md) | 4 |
| [Engine integration](./subtasks/120_engine-integration/00_index.md) — blocked on typed engine integration | 3 |

## Done when

These are draft acceptance criteria for the implementation:

- The reviewed standard and reference component define artifact kinds, TSX APIs, data/events/state, dependencies, GitHub versioning and production rendering.
- The migrated/expanded libraries work independently in webpage and narrated examples, with richer charts/tables, vector motion, branching, interaction and mobile/touch support.
- The shipped Vite developer package, examples/audio and plugin methodology support library authors and artifact consumers.
- Once the other engine build is ready, Rust CLI discovery/install/inspection and engine reader/static publishing consume the same contract with compatibility and end-to-end proof.
- Each work order records its result and relevant validation evidence before review.

## Scope decisions

- The owner has authorized autonomous implementation in independent worktrees, with parallel migration and additional-collection lanes after the validated shared contract. No outward release is authorized.
- Build and prove the library/preview first. Keep CLI and engine-integration work blocked on the external typed-artifact adapter checkpoint; the usable native engine and reviewed library/reference inputs are available.
- Combine narration, divergent paths and component interaction into one experience group.
- Use GitHub tags and release notes/links for library versions; no separate package-registry publication is required. A browser build step still needs a contract.
- Keep ordinary HTML artifacts supported, including shared elements inside embedded artifacts.
- Include mobile/touch behavior, readable initial HTML/SVG, loading strategy and measured performance checks.
