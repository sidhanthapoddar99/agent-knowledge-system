---
title: "Shared TSX components as artifact elements"
---

## Proper TypeScript/TSX components

The owner requested real TSX components for the new standard instead of relying only on predefined JSON component descriptions. The purpose is to make components easier to write, edit, share and extend, and to express state transitions and interaction in frontend code.

The requested capabilities include:

- Reusable chart, table, SVG/object and scene components with typed inputs.
- Shared behavior that can be used in several libraries and visual families.
- Component reuse, composition and possible inheritance where appropriate.
- Native events and state changes for hovering, selecting, filtering, exploring and choosing a narrative path.
- Components that can be used in an ordinary HTML artifact as well as in a narrated scene.

TSX is an authoring format; the browser receives compiled JavaScript. Choosing TSX does not, by itself, implement timeline control, branch logic, chart mathematics or 3D rendering. Those are library/runtime capabilities to design.

The discussion does not require all structured data to become executable code. Datasets, metadata, theme values, presets and scene/choice declarations may remain JSON, YAML or typed data when that is useful. The requested change is that reusable behavior should no longer be confined to a fixed declarative component vocabulary.

**Implementation suggestion, not a chosen framework:** use shared primitives, props, state/hooks and variants for composition. For example, a quadrant chart can combine axes, scales, scatter points, threshold zones, labels and a line/frontier overlay. Evaluate whether class inheritance adds value rather than making it the default.

The engine's UI package currently uses Preact; its video player is framework-free TypeScript. React has not been selected simply because TSX was mentioned. The framework/API decision must account for interoperability, bundle cost, rendering and standalone output.

## Existing and new HTML artifacts

The owner confirmed that ordinary HTML artifacts should continue to work, and the new components should be additive capabilities available to those artifacts.

An existing report can remain a plain HTML page. It could add a reusable interactive chart in one part of the page, using a compiled browser entry/mount API or a packaged embed. It should not require a complete rewrite into TSX.

The library should demonstrate:

- A hand-written HTML artifact that uses a shared chart/table/object.
- A narrated example using the same component implementation.
- An output that can be embedded or packaged according to the artifact's self-contained/static requirements.
- Correct loading of its styles, fonts, data, SVGs and optional audio.

This is a consumer contract to implement. Existing HTML pages do not automatically gain the new components merely by installing TSX source code. Browser embedding, bundling and asset closure need deliberate work.

## One component is a proper element in either artifact kind

The owner's clarification is that an artifact has kinds: a normal webpage-style artifact and a video/narrated artifact. Both should reference and import the same reusable TSX component library. A chart, table or SVG object is an artifact element in either kind, rather than a separate video-only implementation.

For example, the same quadrant-chart component can be embedded inside a report page and used inside a narrated scene. Its typed data, theme options, selection events and detail view remain shared. The host may provide page-level interaction state or narration/timeline context through the agreed API.

TSX authoring and library references describe the source workflow. Plain HTML consumes the compiled browser component or a packaged embed; it does not execute a TSX file directly. The exact import, bundling and mount interface remains to design.

## Related ideas

- [Interactive artifacts and artifact kinds](./03_interactive-artifact-kinds.md)
- [Multipath narrated experiences](./04_multipath-narrated-experiences.md)

## References

- [Brainstorm index](./01_authoring-and-runtime-options.md)
- [The issue](../issue.md)
