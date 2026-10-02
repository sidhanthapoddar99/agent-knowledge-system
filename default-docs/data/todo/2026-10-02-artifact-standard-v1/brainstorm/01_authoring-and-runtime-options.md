---
title: "Artifact standard and shared library — brainstorm index"
---

The discussion is split into individual idea entries below. Each is a brainstorming element with its own page; detailed work orders and the library-first plan are now linked from the issue.

## Ideas

- [Shared TSX components as artifact elements](./02_shared-tsx-artifact-elements.md)
- [Interactive artifacts — webpage and narrated kinds](./03_interactive-artifact-kinds.md)
- [Multipath narrated experiences — the Bandersnatch idea](./04_multipath-narrated-experiences.md)
- [Multiple libraries, styles, themes and dependencies](./05_libraries-styles-themes-dependencies.md)
- [Richer charts, quadrants, 3D exploration and tables](./06_charts-and-tables.md)
- [SVG objects and explanatory motion graphics](./07_svg-objects-and-motion.md)
- [A shipped Vite package for library developers](./08_vite-developer-package.md)
- [A whole plugin for building libraries](./09_library-authoring-plugin.md)
- [CLI and AI-friendly library discovery](./10_cli-ai-library-discovery.md)
- [Library distribution and later engine integration](./11_distribution-and-engine-integration.md)

## Why artifacts need their own area

Artifacts have become a primary part of agentks, beyond a minor addition to markdown or a feature limited to video. The owner asked for an Artifact tracker component covering both HTML artifacts and narrated experiences. The existing HTML and video issues have been assigned to that component.

Markdown-rendered diagram work remains in Components. An artifact may contain a diagram, but the diagram renderer's own work is not absorbed into this new issue.

The shared library serves HTML reports, dashboards, tables, interactive explanations and narrated experiences. Icons, fonts, SVG objects and themes can also be reusable outside an artifact. The taxonomy should not artificially prevent that reuse.

## Library first, engine integration later

The owner explicitly separated implementation into two parts:

1. Define and build the library, with the components it needs, examples/audio, a shipped preview and the authoring/discovery methodology.
2. Update the engine later to consume that completed library and standard.

The ideas have now been decomposed into detailed work orders and a library-first plan. This documentation action does not start implementation.

The library's preview must be independently useful before engine integration. A Vite developer gallery is different from the engine's existing standalone-video page writer; neither should be described as replacing the other without a later design decision.

## What remains to scope

The formal work orders and plan now exist. The standard work resolves these design topics before implementation relies on them:

- The TSX framework and public API.
- Composition/inheritance and cross-library dependency rules.
- Component/data/scene formats and compatibility with existing consumers.
- Branch-state persistence, navigation and narration timing.
- Chart/table families and the optional 3D boundary.
- Preview packaging and sample-audio conventions.
- Authoring-plugin capabilities and CLI/AI discovery contracts.
- Distribution/versioning and the later engine adapter.

These are design topics retained for the next discussion, not blockers being asked of the owner in this capture.

## References

- [The issue and grouped work orders](../issue.md)
- [Library-first plan](../plans/01_library-first/overview.md)
- [Owner scope and boundaries](../notes/01_scope-and-boundaries.md)
- [HTML artifacts as first-class content](../../2026-07-07-artifact-component/issue.md)
- [Video artifacts](../../2026-09-29-narrated-video-pages/issue.md)
- [Existing standalone-video work](../../2026-09-29-narrated-video-pages/subtasks/080_standalone-artifact.md)
- [Existing library machinery scope](../../2026-09-29-rust-core-engine-migration/notes/04_ecosystem/01_library-system.md)
