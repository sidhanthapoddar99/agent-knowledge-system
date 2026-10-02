---
title: "Interactive artifacts — webpage and narrated kinds"
---

## Interactive explanations with optional audio

The owner described the artifact as an interactive flow with audio, rather than only a conventional video. The reader can hover over items for more information, explore a graph/table and interact with the work while the explanation progresses.

Possible interactions include:

- Hover/focus details on chart points or vector objects.
- Selecting points, rows, accounts or objects to reveal more information.
- Filters and controls that update linked views.
- Pausing narration to explore a scene.
- Continuing after a choice or an explicit “continue” action.
- Optional audio that supplements, rather than replaces, the interactive content.

The same component should be useful when no narration is attached. Keyboard access, focus behavior, clear controls and reduced motion are design considerations to carry into the later standard.

## Webpage and video are artifact kinds

The owner described two artifact categories/kinds within the Artifact area:

| Kind | Experience | Shared elements |
|---|---|---|
| Normal webpage artifact | A report, dashboard or explanation the reader explores directly | Imported/referenced TSX charts, tables, SVG objects and other interactive components |
| Video or narrated artifact | A guided explanation with optional audio, timeline motion and reader choices | The same TSX components, hosted with narration/scene context |

These are content/runtime kinds, distinct from the tracker's Artifact component and from a library's component categories. A future schema should make that distinction clear.

## Reuse inside an embedded artifact

An artifact may itself be embedded in a docs/tracker page. The embedded page should be able to load and compose shared library elements within its own content, rather than being limited to a single monolithic visualization.

Examples include an embedded dashboard with a scatter plot and linked table, or a narrated artifact with the same scatter plot paused for exploration. Both import/reference a shared implementation with the declared data, theme and interaction contract.

The same capability should also work in the artifact's standalone page. The eventual packaging/runtime design must specify how its JavaScript, styles and assets load inside the embed; sharing an implementation does not mean every hosting context automatically shares memory or state.

## Related ideas

- [Shared TSX artifact elements](./02_shared-tsx-artifact-elements.md)
- [Multipath narrated experiences](./04_multipath-narrated-experiences.md)

## References

- [Brainstorm index](./01_authoring-and-runtime-options.md)
- [The issue](../issue.md)
