---
title: "Library authoring guide"
status: open
---

People who build their own library (a company design kit, a team's artifacts, a set of video scenes) need one place that explains how. This leaf writes that guide for the new docs and a short in-repo version in the library repository's `AGENTS.md`. It covers the manifest, elements and their contract, testing through a local `path:` entry, tagging x.y.z versions, the engine range, publishing through `library.json` (for official libraries), and running library migrations after a breaking engine release. The library-development AI plugin ([130/20](../130_ai-plugins/20_library-dev-plugin.md)) teaches the same material to agents.

# 01 To Do
- [ ] **Guide pages** in the main repository's `docs/` (the new docs, section chosen by [180/00](../180_documentation/00_overview.md)):
    - [ ] What a library is and is not (not a plugin, not a template, not markdown syntax).
    - [ ] `manifest.json` field by field, with the element-name rule and a full example.
    - [ ] Element types and how each is shown: SVG and images, self-contained HTML (sandboxed), scripts (the page's contract), folder elements of manifest-less local libraries.
    - [ ] The element contract for HTML frames and widgets from [120/75](./75_elements-frames-and-widgets.md) (inputs, theme, size) and the `currentColor` trick for icons from [120/70](./70_elements-icons.md).
    - [ ] Testing: a project with `path: ../my-library` in `dep.yaml`, `agentks check libraries`, `agentks library show`.
    - [ ] Versioning: one version for the whole library, tags `x.y.z`, the `engine` range, pre-releases, what a breaking change is.
    - [ ] Publishing: push a tag; users add `github: owner/repo` and a selector. Official libraries also get a `library.json` entry.
    - [ ] Library migrations: `agentks migrate --library <folder>` ([140/40](../140_versioning-and-migrations/40_library-migrations.md)), then a new version with a new `engine` range.
    - [ ] Trust: what users see when they add a library, and why library HTML is sandboxed.
- [ ] **Link from** the libraries page of the user guide ([180/40](../180_documentation/40_libraries-and-templates.md)) and from `agentks help library`.
- [ ] **Every example must run**: build a tiny example library in the library repository's test folder and check the guide's commands against it.

## Guardrails
- Follow the docs rules of the new docs project: relative links, `NN_` prefixes, `title` frontmatter.
- Describe the current system only; no history of how the design evolved.

## Done when
- The guide pages exist and pass `agentks check section` and `agentks check link-form`.
- An agent with only the guide builds a two-element library, tests it through `path:`, and `agentks check libraries` passes.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, under `docs/`; a short version in the library repository's `AGENTS.md`.

**Read first**
- [Library system](../../notes/04_ecosystem/01_library-system.md) — all sections.
- [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md), section 02 (what the library-development plugin covers).
- [Versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md), section 05.

**Depends on:** [120/30](./30_manifest-and-catalog.md), [120/40](./40_library-commands-and-tui.md), [120/50](./50_lib-route-and-sandbox.md), [120/70](./70_elements-icons.md), [120/75](./75_elements-frames-and-widgets.md), [180/00 documentation](../180_documentation/00_overview.md).
**Unblocks:** [130/20 library-development plugin](../130_ai-plugins/20_library-dev-plugin.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): library migrations are done by the library's owner, who publishes a new version ([library system](../../notes/04_ecosystem/01_library-system.md)).

# 05 Notes & Analysis
## Watch out
- Keep one source of truth: the guide explains; the manifest schema itself is printed by the binary (`agentks help library --json` or a schema command, if [120/40](./40_library-commands-and-tui.md) adds one). Do not copy a schema that can drift.
