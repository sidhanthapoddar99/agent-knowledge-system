---
title: "Libraries — overview and rules for the group"
status: in-progress
---

This group builds the library system of agentks: `config/dep.yaml` and `config/dep.lock`, fetching and resolving git libraries, `manifest.json` and the `library.json` catalog, the `agentks library` commands and TUI, the `/_lib/` route, and the default library with its first elements and templates. A **library** is a folder of reusable files (icons, frames, HTML artifacts, scene templates, scripts) that a project uses without copying them in. The feature ships in Phase 2, before 1.0.0. The default library is built and tested end to end with the engine in step 1 of the launch.

# 01 To Do
- [ ] **Work the leaves in this order.** The format first, then the engine, then the commands, then content.

| Leaf | Status | Phase | Delivers |
|---|---|---|---|
| [120/10 dep.yaml and dep.lock](./10_dep-yaml-and-lock.md) | open | 2 | Parsing, validation and writing of the two files |
| [120/20 Fetch and resolve](./20_fetch-and-resolve.md) | open | 2 | Selectors, tag resolution, the git fetch, the sync algorithm |
| [120/30 Manifest and catalog](./30_manifest-and-catalog.md) | open | 2 | `manifest.json`, local libraries without one, `library.json` |
| [120/40 Library commands and TUI](./40_library-commands-and-tui.md) | open | 2 | `agentks install`, `agentks library …`, `check libraries`, the TUI |
| [120/50 /_lib/ route and sandbox](./50_lib-route-and-sandbox.md) | open | 2 | Serving elements, the CSP sandbox, the path-prefix fix |
| [120/60 Default library scaffold](./60_default-library-scaffold.md) | in-progress | 2 (launch step 1) | The library repository, its root manifest, tags, CI |
| [120/70 Elements: icons](./70_elements-icons.md) | review | 2 | The first icon set |
| [120/75 Elements: frames and widgets](./75_elements-frames-and-widgets.md) | review | 2 | Device frames, browser frames, HTML widgets |
| [120/80 Elements: video cue kit](./80_elements-video-cue-kit.md) | open | after the video cue syntax | Scene templates and script widgets for video pages |
| [120/85 Templates](./85_templates.md) | open | 2 (launch step 1) | The `agentks-default` template and its catalog entry |
| [120/90 Library authoring guide](./90_library-authoring-guide.md) | open | 2 | How to build, test, version and migrate a library |

Order: 10 → 20 → 30 → 40 and 50 in parallel → 60 → 70, 75, 85 in parallel → 90. Leaf 80 waits for the video issue's cue syntax.

# 02 Status and Result
In progress. 60 is in progress; 70 and 75 are in review; the rest are open.

## Result
None yet.

## Agent log
none

# 03 References
**Where the work happens.** Engine and CLI code: the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, under `apps/agentks-engine/` (the crate that owns libraries is set by [030/10 workspace and crate boundaries](../030_rust-engine/10_workspace-and-crate-boundaries.md)). Library content, templates and `library.json`: the library repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` (`NeuraLabsHQ/agent-knowledge-system-library`).

**Rules every leaf in this group follows**
- The design is [the library system note](../../notes/04_ecosystem/01_library-system.md). Every leaf builds against it. When a leaf finds the note wrong or silent, record the decision in the leaf's `04 Decisions` and say so in its result, so the note can be corrected.
- The library cache on disk (`~/.agentks/libraries/`) is built by [040/60 library cache](../040_caching/60_library-cache.md). This group calls it; it never writes cache folders itself.
- Markdown never names a library element. Elements are used only in video pages (inside cues) and artifact pages (through `/_lib/<alias>/<element>`) ([open question 13](../../brainstorm/01_initial-discussion/16_open-questions.md)).
- agentks defines no kinds of library or element, and libraries never depend on each other. Do not add either.
- Every error names the file or `dep.yaml` entry, what is wrong, and the command that fixes it. Never render a page with a blank where an element should be. When unsure, return an error.
- Every command takes `--json` (the TUI is the one exception) and follows the CLI exit codes: 0 success, 1 failure or no result, 2 wrong usage.
- The engine does not depend on any element of the default library. A project that removes the default library still works.

**Read first**
- [Library system](../../notes/04_ecosystem/01_library-system.md) — the contract.
- [Templates and init](../../notes/04_ecosystem/04_templates-and-init.md), [video pages](../../notes/04_ecosystem/05_video-pages.md), [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md).
- [Machine home and build cache](../../notes/02_engine/06_machine-home-and-build-cache.md), [Rust CLI](../../notes/02_engine/05_rust-cli.md), [project config](../../notes/02_engine/02_project-config.md).
- The discussion: [libraries, dep.yaml and dep.lock](../../brainstorm/02_future-stages/09_libraries-and-dependencies.md).

**Depends on:** [010/00 project setup](../010_project-setup/00_overview.md), [030/00 Rust engine](../030_rust-engine/00_overview.md), [040/60 library cache](../040_caching/60_library-cache.md), [050/00 server](../050_server/00_overview.md).
**Unblocks:** [100/30 artifact pages](../100_layouts/30_artifact-pages.md), [100/40 video pages](../100_layouts/40_video-pages.md), [150/00 publishing](../150_publishing/00_overview.md), [130/00 AI plugins](../130_ai-plugins/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): `config/dep.yaml` is required even when empty; `config/dep.lock` pins every git library to a commit, and the commit is the only hash ([library system](../../notes/04_ecosystem/01_library-system.md)).
- Decided (sidhantha, 2026-09-30): the default library, templates and `library.json` live in `NeuraLabsHQ/agent-knowledge-system-library`, with one version series for the whole library.
- Decided (sidhantha, 2026-09-30): library elements are used only in video pages and artifact pages.

# 05 Notes & Analysis
## Watch out
- The notes disagree on one detail: the [Rust CLI note](../../notes/02_engine/05_rust-cli.md) says `install --update` moves branch and latest entries; the [library system note](../../notes/04_ecosystem/01_library-system.md) says it also re-resolves ranges. The library note wins (claude decision there); [120/40](./40_library-commands-and-tui.md) builds it that way.
- The GitHub organisation is `NeuraLabsHQ`. GitHub ignores the case of the name, but URLs built into the binary and into `library.json` use `NeuraLabsHQ`, so they match what GitHub shows.
