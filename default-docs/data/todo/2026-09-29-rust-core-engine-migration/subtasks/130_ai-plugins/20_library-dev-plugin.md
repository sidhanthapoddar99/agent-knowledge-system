---
title: "The library-development plugin (agentks-library)"
status: open
---

People who build or host libraries and templates need different guidance from people writing docs. This leaf writes the second, smaller plugin, `agentks-library` (working name), so an agent can create a library, write its `manifest.json`, test it through a local `path:` entry, tag x.y.z versions, set the engine range, add an official library to `library.json`, and run library migrations after a breaking engine release.

# 01 To Do
- [ ] **Plugin folder** `plugins/agentks-library/` with both manifests (Claude Code and Codex), `README.md`, `LICENSE`, version `1.0.0`.
- [ ] **One skill, `agentks-library`**, with references:
    - [ ] `SKILL.md` — when to use it (building or maintaining a library or a template), the workflow in order, what it never does (edit a user's cache, publish without a tag).
    - [ ] `references/manifest.md` — how to write elements and descriptions that `library find` surfaces (synonyms in tags, one-sentence descriptions that say when to use it). Point at `agentks help library --json` for the schema instead of copying it.
    - [ ] `references/elements.md` — self-contained HTML, the frame and widget contract, theme-aware SVG (`currentColor` and `mask-image`), the sandbox and what it blocks.
    - [ ] `references/testing.md` — a test project with `path:` in `dep.yaml`, `agentks check libraries`, `agentks library show`, viewing elements through `/_lib/`.
    - [ ] `references/versioning.md` — one version for the whole library, tags, the `engine` range, pre-releases, when a change is breaking.
    - [ ] `references/migrations.md` — `agentks migrate --library <folder>` after a breaking engine release, then a new tag with a new range.
    - [ ] `references/templates.md` — what a template holds, how it is tested (`agentks start` in its folder), the catalog entry.
- [ ] **Evaluate** by having an agent build a small two-element library from nothing using only the plugin, then fix the gaps.

## Guardrails
- The final name is open; keep `agentks-library` until sidhantha renames it ([open questions](../../notes/01_overview/05_open-questions-and-risks.md)).
- Keep it small. Anything a docs author needs belongs in the usage plugin.
- The binary is the reference; no copied schemas.

## Done when
- The plugin folder exists with the skill and references.
- The evaluation run produces a library that passes `agentks check libraries` and is found by `agentks library find`.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `plugins/agentks-library/`.

**Read first**
- [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md), section 02.
- [Library system](../../notes/04_ecosystem/01_library-system.md) and [templates and init](../../notes/04_ecosystem/04_templates-and-init.md).
- The guide for humans: [120/90 library authoring guide](../120_libraries/90_library-authoring-guide.md).

**Depends on:** [120/30](../120_libraries/30_manifest-and-catalog.md), [120/40](../120_libraries/40_library-commands-and-tui.md), [120/90](../120_libraries/90_library-authoring-guide.md), [140/40 library migrations](../140_versioning-and-migrations/40_library-migrations.md).
**Unblocks:** [130/30 marketplace listing](./30_marketplace-listing.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): two agentks plugins, one for using agentks and a smaller developer-oriented one for building and hosting libraries ([AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md)).
- Decided (claude, 2026-09-30): the working name is `agentks-library`; the user can rename it.

# 05 Notes & Analysis
## Watch out
- An earlier delivery note used `agentks-library-dev`; it was aligned to `agentks-library` on 2026-09-30.
