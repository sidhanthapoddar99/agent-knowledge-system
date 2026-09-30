---
title: "Docs: libraries and templates"
status: open
---

Libraries are new in 1.0: git repositories of reusable elements (icons, frames, widgets, video cue kits) that a project names in `config/dep.yaml` and pins in `config/dep.lock`. Templates are the starting projects `agentks init` copies. This leaf documents both, for two readers: people who use libraries, and people who build and host them. There is no page for this in today's docs.

# 01 To Do
- [ ] **`40_libraries/01_overview.md`** — what a library is, what it is for, where its elements can be used (video pages inside cues, artifact pages through `/_lib/<alias>/<element>`), and that library HTML runs sandboxed.
- [ ] **Using a library** — `dep.yaml` sources (`github:`, `git:`, a local `path` relative to `dep.yaml`); selectors (`tag` exact or a range such as `^1.4`, `commit`, `branch`, none meaning the latest x.y.z tag); `agentks install` and `--update`; what `dep.lock` pins; the machine cache; offline use.
- [ ] **The catalog and the TUI** — `agentks library` (browse, search, add), the plain subcommands, `library.json` in the library repository.
- [ ] **Using elements** — referencing an element from a video cue and from an artifact; the element's description and tags from `manifest.json`; `agentks library find` for agents.
- [ ] **Templates** — `agentks init --template <id or url> <path>`, the default template, what a template contains.
- [ ] **Building a library** — `manifest.json` (name, x.y.z version, description, the required engine range, elements with file, description and tags); one version series per library; tagging a release; library migrations run by the owner (`agentks migrate --library`); the library-development plugin.
- [ ] **Hosting a library** — any git host; private libraries through git credentials; adding it to a catalog.
- [ ] **Cleaning up** — `agentks cache clean <root>` and what it keeps.

## Guardrails
- Group rules in [180/00 overview](./00_overview.md).
- Every example uses a real library at a real tag, starting with the default library, and every command was run.

## Done when
- The section exists under `docs/data/user-guide/40_libraries/` and renders.
- A reader can add the default library to a new project and use one element on an artifact page following only these pages (tested by a fresh agent).
- A reader can create a one-element library in a local git repository and use it through a `path` source.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `docs/data/user-guide/40_libraries/`.
- **Read first:**
  - [Library system](../../notes/04_ecosystem/01_library-system.md) — the full contract: `dep.yaml`, `dep.lock`, `manifest.json`, `library.json`, resolution, errors.
  - [Templates and init](../../notes/04_ecosystem/04_templates-and-init.md).
  - [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md) — the library-development plugin.
  - [Libraries and dependencies](../../brainstorm/02_future-stages/09_libraries-and-dependencies.md).
- **Depends on:** the [120/00 libraries](../120_libraries/00_overview.md) group, especially [120/90 library authoring guide](../120_libraries/90_library-authoring-guide.md) (which this section publishes or links), [140/40 library migrations](../140_versioning-and-migrations/40_library-migrations.md).
- **Unblocks:** [200/20 switch-over](../200_launch/20_switch-over.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): `dep.yaml` is required even when empty; sources are git URLs or local paths; `dep.lock` pins commits ([library system](../../notes/04_ecosystem/01_library-system.md)).
- Decided (sidhantha, 2026-09-30): elements are used only in video pages and artifact pages; there are no element kinds and no dependencies between libraries.

# 05 Notes & Analysis

## Watch out
- [120/90](../120_libraries/90_library-authoring-guide.md) may produce an authoring guide inside the library repository. Keep one copy of each fact: either this section links to it, or it moves here. Decide when both exist and record it.
