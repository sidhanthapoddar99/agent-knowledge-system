---
title: "Scope and execution boundaries"
---

These work orders turn the owner's discussion into a proposed decomposition. Their acceptance checks are draft scoping criteria, not evidence of delivered features. The current action creates tracker documents; implementation is not started.

# 03 References

- [The issue](../issue.md)
- [The brainstorm index](../brainstorm/01_authoring-and-runtime-options.md)
- [The library brief](../../../../../../../agent-knowledge-system-library/AGENTS.md)
- [The engine brief](../../../../../../../agent-knowledge-system/AGENTS.md)

# 04 Decisions

## 01 One standard for webpage and narrated artifacts

- Decided (sidhantha, 2026-10-02): the same TSX components should be referenced/imported as proper elements inside normal webpages and embedded/narrated artifacts, because behavior should be shared rather than rebuilt for each artifact kind.

## 02 Narrated artifacts are live component experiences

- Decided (sidhantha, 2026-10-02): the video-style experience is a flow of slides and live components with timestamped actions and voiceover. This scopes sequencing and interaction, rather than rendered movie production.

## 03 Library work precedes engine changes

- Decided (sidhantha, 2026-10-02): build the library, its shipped Vite developer methodology and examples first, then integrate into the engine, because the library must be independently useful. The plan places actual Rust CLI changes in the later engine stage; CLI-facing metadata can be prepared with the library.

## 04 GitHub provides versioned distribution

- Requested (sidhantha, 2026-10-02): use GitHub tags and release notes/links for library versions; no separate package-registry release is required. A source-based distribution still needs a documented browser build and dependency/asset closure.

## 05 Authoring and consuming both need tooling

- Decided (sidhantha, 2026-10-02): provide a whole library plugin with guidance for building libraries and for using them to author webpage/narrated artifacts, plus convenient Rust CLI discovery and installation, because agents need component information and a repeatable methodology.

## 06 Dedicated runtime work and mobile support

- Requested (sidhantha, 2026-10-02): separate narrated sequencing, divergent paths and element interaction; include hover/click actions and mobile friendliness. Work orders translate these into concrete touch, keyboard and responsive checks.

## 07 Grouping and the engine blocker

- Requested (sidhantha, 2026-10-02): combine narrated sequencing, divergent paths and component interaction into one group; initialize every group with a 00 index and keep all engine-dependent work blocked on the other agent building the engine.

# 05 Notes & Analysis

## Draft decomposition and acceptance criteria

The ten folders are areas of work, not execution phases. Their numbers are stable sort identifiers. Stage order lives in the linked plan. A folder carries a display title, while each leaf carries its own work, checks and state.

The framework, component API, dependency format and build policy are outputs of the standard work. Routine naming and reversible implementation details can be chosen within an accepted contract. A change to that public contract belongs back in the standard work with its reason and compatibility impact.

The owner suggested multiple agents for migration. The migration work defines ownership lanes after an agreed reference component and contract; this documentation action does not launch those agents.

## Source and implementation boundaries

Library code/assets and Vite examples live in the separate library repository. The library brief currently governs its catalog, manifests, passive SVG/JSON assets and size/category contracts; TSX changes must deliberately revise the relevant contract when implemented.

The engine repository owns the Rust library/CLI/compiler, shared UI islands, player and plugins. Apply its AGENTS.md and ctl-only checks when those files are implemented. App/package boundaries and the existing Preact/framework-free player choices must be reconciled explicitly in the standard rather than silently replaced.

## Verification responsibilities

Work orders include focused acceptance checks per area, plus cross-component production and integration proof. The standard work selects measurable budgets; no unapproved numerical latency or bundle target is invented here.

A compiled browser module/embed is an artifact build output. GitHub-based distribution does not force a separately uploaded library bundle, and a tag does not eliminate storage used by assets, history or installed-version caches.

## Toolkit index-status discrepancy

The [installed toolkit's index aggregation](../../../../../agent-ks-cli/src/checks.rs) derives in-progress for any nonempty sibling set that is neither all open nor all closed. Therefore two intentionally wholly blocked groups produce index-status warnings. Their work orders and indices remain blocked, following the owner's request; no implementation is in progress.
