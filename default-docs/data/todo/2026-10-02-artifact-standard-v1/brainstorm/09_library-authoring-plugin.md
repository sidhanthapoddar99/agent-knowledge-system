---
title: "A whole plugin for building libraries"
---

## A whole plugin for library authors

The owner asked for a **library-authoring plugin**, not just one skill. Its purpose is to give AI agents and library developers a complete workflow for building and maintaining libraries.

Potential plugin capabilities to scope later include:

- Library scaffolding and structure guidance.
- Creating TSX components, SVG objects, styles, themes and examples.
- Documenting public inputs, events, state and dependencies.
- Running the Vite preview and validating components.
- Discovering/reusing existing components before creating duplicates.
- Packaging, compatibility checks, provenance and release preparation.

An existing agentks-library plugin is present in the new engine repository and currently describes a single library/template-authoring skill. The new work should evaluate and extend that starting point rather than assume no authoring tooling exists.

The exact plugin skills, commands and bundled tooling will be defined later. The user requested a coherent authoring product, not merely a renamed skill.

## References

- [Brainstorm index](./01_authoring-and-runtime-options.md)
- [The issue](../issue.md)
