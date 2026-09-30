---
title: "Default library: scaffold the library repository"
status: open
---

The default library lives in its own repository, `NeuraLabsHQ/agent-knowledge-system-library`, together with the project templates and `library.json`, the catalog `agentks library` reads. This leaf sets that repository up: its layout, root `manifest.json`, `library.json`, `AGENTS.md`, a check in CI, and the first version tag. It is part of launch step 1: the engine, the client and the default library are built and tested end to end together. Element content comes in [120/70](./70_elements-icons.md), [120/75](./75_elements-frames-and-widgets.md) and [120/80](./80_elements-video-cue-kit.md); templates in [120/85](./85_templates.md).

# 01 To Do
- [ ] **Layout.** Create the repository layout:
    - [ ] `manifest.json` — the default library's manifest at the root (`name: agentks-default`, `version`, `description`, `engine: ">=1.0.0 <2.0.0"`, `elements: {}` until content lands).
    - [ ] `library.json` — the catalog, with the `agentks-default` library entry and the `agentks-default` template entry.
    - [ ] Element folders chosen by the library, for example `icons/`, `frames/`, `widgets/`, `video/`.
    - [ ] `templates/agentks-default/` — filled by [120/85](./85_templates.md).
    - [ ] `AGENTS.md` (the only instruction file; no `CLAUDE.md`), `README.md`, `LICENSE` (same licence as the main repository), `.gitignore`.
- [ ] **AGENTS.md.** Say what the repository is, the manifest rules from [120/30](./30_manifest-and-catalog.md), that one version covers the whole library, that `library.json` must never move, how to test locally (a project whose `dep.yaml` uses `path:` pointing at a checkout), and that library migrations are run by the owner with `agentks migrate --library .`.
- [ ] **CI.** A GitHub Actions workflow that installs the latest `agentks` build (a released binary, or the main repository's build artifact before 1.0.0) and runs `agentks check libraries` against a tiny test project that uses this repository through `path:`. It also validates `library.json` against its schema and checks every template with `agentks check config`.
- [ ] **Versioning.** Tags are the releases: `1.0.0` (or `v1.0.0`; pick one form and record it). `manifest.json → version` must equal the tag; CI fails a tag push where they differ.
- [ ] **First tag.** Tag `1.0.0` when the icons ([120/70](./70_elements-icons.md)), frames ([120/75](./75_elements-frames-and-widgets.md)) and the default template ([120/85](./85_templates.md)) pass the end-to-end run in [170/30](../170_testing/30_end-to-end.md), alongside the engine's 1.0.0.
- [ ] **Push** to `origin` (`git@github.com:NeuraLabsHQ/agent-knowledge-system-library.git`). The repository is private until the launch; making it public is part of [200/00 launch](../200_launch/00_overview.md).

## Guardrails
- The engine never depends on any element being present. Nothing in the main repository hard-codes an element name from this library.
- `library.json` stays at the repository root forever; its address is built into the binary.
- No build step and no release pipeline: a tag is the release.

## Done when
- `gh repo view NeuraLabsHQ/agent-knowledge-system-library` shows the layout above on `main`.
- CI is green on `main`.
- A test project with `icons: { github: NeuraLabsHQ/agent-knowledge-system-library }` runs `agentks install` and `agentks library show icons` successfully.

# 02 Status and Result
Open. Not started. The empty private repository exists (created 2026-09-30, `origin` set, no commits).

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the library repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library`.

**Read first**
- [Library system](../../notes/04_ecosystem/01_library-system.md), sections 06, 08 and 16 (the default library).
- [Repositories and layout](../../notes/05_delivery/01_repositories-and-layout.md) — the library repository's layout.
- [Templates and init](../../notes/04_ecosystem/04_templates-and-init.md), section 05.
- [Permissions and repositories](../../agent-memory/permissions-and-repositories.md) — Claude has full autonomy in this repository.

**Depends on:** [010/00 project setup](../010_project-setup/00_overview.md) (conventions shared across the three repositories), [120/30 manifest and catalog](./30_manifest-and-catalog.md).
**Unblocks:** [120/70](./70_elements-icons.md), [120/75](./75_elements-frames-and-widgets.md), [120/80](./80_elements-video-cue-kit.md), [120/85](./85_templates.md), [170/30 end to end](../170_testing/30_end-to-end.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the default library has its own repository with the templates and `library.json`; one version series; tags are releases ([library system](../../notes/04_ecosystem/01_library-system.md)).
- Decided (sidhantha, 2026-09-30): use only `AGENTS.md` as the instruction file in every repository ([permissions](../../agent-memory/permissions-and-repositories.md)).

# 05 Notes & Analysis
## Watch out
- The notes write `neuralabshq/…`; the organisation is `NeuraLabsHQ`. Use the real casing in `library.json` and the binary's constants.
- Keep the whole repository small; each fetch is shallow but still downloads every file at that commit. Large binaries (videos, big images) do not belong here.
