---
title: "Multiple libraries, styles, themes and dependencies"
---

## Multiple libraries, styles and themes

The owner rejected the assumption that a library must have only one visual style. Agent KS Default is one collection and can itself have multiple styles. Other collections can offer different visual languages for technical explanations, editorial/book/account views or story-like analogies.

The discussed structure has a Libraries/catalog level, named collections beneath it, and each collection's component folder subdivided into categories and deeper subcategories. The required components folder should not force all assets to sit directly inside it.

Examples of useful grouping:

- Motion or animation styles, then entrances, emphasis, exits, loops and poses.
- Chart families, then line, scatter, quadrant, combined plots and other formats.
- Tables, then comparisons, accounts and structured data views.
- SVG objects, then technology/devices, books/accounts, people, animals and nature.
- Styles/themes, with several visual families and light/dark support.

These are example categories, not a final path schema. A manifest should be able to point to an inner path without changing the public component identity. Reorganizing files should not force authors to change every reference.

Themes and component behavior are related but different: a chart's logic can be shared while palette, typography, geometry and motion treatment vary by family.

## Sharing and library dependencies

The owner asked whether TSX sharing/inheritance and library dependencies could give the system more expressive power. The intended result is reuse of components and behavior, rather than copying implementations into each artifact or collection.

A future design should cover:

- How a library declares the code components, visual assets and libraries it uses.
- Stable public names, version compatibility and complete dependency resolution.
- Shared chart/state/motion primitives with collection-specific visual variants.
- Build output containing the dependencies needed by a plain HTML consumer.
- Diagnostics when a dependency or component cannot be resolved.

The current installed-library dependency mechanism is flat. Transitive executable-library imports require a declared build/resolution contract; they should not be advertised as supported merely because source files can import each other.

The exact package layout, locking model, distribution targets and dependency policy are still to design.

## References

- [Brainstorm index](./01_authoring-and-runtime-options.md)
- [The issue](../issue.md)
