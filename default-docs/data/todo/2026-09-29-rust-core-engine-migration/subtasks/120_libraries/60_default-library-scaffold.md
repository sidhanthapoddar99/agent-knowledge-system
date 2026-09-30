---
title: "Default library: scaffold the library repository"
status: in-progress
---

The default library lives in its own repository, `NeuraLabsHQ/agent-knowledge-system-library`, together with the project templates and `library.json`, the catalog `agentks library` reads. This leaf sets that repository up: its layout, root `manifest.json`, `library.json`, `AGENTS.md`, a check in CI, and the first version tag. It is part of launch step 1: the engine, the client and the default library are built and tested end to end together. Element content comes in [120/70](./70_elements-icons.md), [120/75](./75_elements-frames-and-widgets.md) and [120/80](./80_elements-video-cue-kit.md); templates in [120/85](./85_templates.md).

# 01 To Do
- [ ] **Layout.** Create the repository layout:
    - [x] `manifest.json` — the default library's manifest at the root (`name: agentks-default`, `version`, `description`, `engine: ">=1.0.0 <2.0.0"`, `elements: {}` until content lands).
    - [ ] `library.json` — the catalog, with the `agentks-default` library entry and the `agentks-default` template entry. The library entry is in; the template entry waits for [120/85](./85_templates.md), because the check rejects a template path that does not exist.
    - [x] Element folders chosen by the library, for example `icons/`, `frames/`, `widgets/`, `video/`.
    - [ ] `templates/agentks-default/` — filled by [120/85](./85_templates.md).
    - [x] `AGENTS.md` (the only instruction file; no `CLAUDE.md`), `README.md`, `LICENSE` (same licence as the main repository), `.gitignore`.
- [x] **AGENTS.md.** Say what the repository is, the manifest rules from [120/30](./30_manifest-and-catalog.md), that one version covers the whole library, that `library.json` must never move, how to test locally (a project whose `dep.yaml` uses `path:` pointing at a checkout), and that library migrations are run by the owner with `agentks migrate --library .`.
- [ ] **CI.** (Partly done: the workflow runs `scripts/check.py`, its tests and the tag check; the `agentks` steps wait for a binary.) A GitHub Actions workflow that installs the latest `agentks` build (a released binary, or the main repository's build artifact before 1.0.0) and runs `agentks check libraries` against a tiny test project that uses this repository through `path:`. It also validates `library.json` against its schema and checks every template with `agentks check config`.
- [x] **Versioning.** Tags are the releases, in the form `vX.Y.Z` (see Decisions). `manifest.json → version` must equal the tag; CI fails a tag push where they differ.
- [ ] **First tag.** Tag `v1.0.0` when the icons ([120/70](./70_elements-icons.md)), frames ([120/75](./75_elements-frames-and-widgets.md)) and the default template ([120/85](./85_templates.md)) pass the end-to-end run in [170/30](../170_testing/30_end-to-end.md), alongside the engine's 1.0.0.
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
In progress. The layout, the brief, the check script and the CI workflow exist; the `agentks` CI steps, the template catalog entry, the first tag and the push are left.

## Result
- **Layout** in the library repository: `manifest.json` (83 elements, version `0.1.0`, engine `>=1.0.0 <2.0.0`), `library.json`, `icons/`, `frames/`, `widgets/`, `scripts/`, `preview/`, `LICENSES/`, `.github/workflows/check.yml`, `AGENTS.md`, `README.md`, `LICENSE` (MIT), `.gitignore`.
- **Check:** `python3 scripts/check.py` checks the manifest fields, element names, that each `file` exists and stays inside the library, that no file in an element folder is unlisted, the icon format, the HTML element rules, the shared code blocks, template paths, and that `library.json`'s `latest` equals the manifest version. `--tag vX.Y.Z` checks a release tag. It runs in under 0.1 s. `python3 -m unittest discover -s scripts` runs its 11 tests in 0.02 s.
- **CI:** `.github/workflows/check.yml` runs the tests and the check on push and pull request, and the tag check on a `v*` tag push. It uses `actions/checkout@v7` and `actions/setup-python@v7`.
- **AGENTS.md** covers the layout, the manifest rules, the HTML element contract, the checks, local testing with `path:`, `agentks migrate --library .`, and the version rules.
- **Left:** add the `agentks check libraries` and `agentks check config` CI steps once a binary exists; add the `agentks-default` template entry with [120/85](./85_templates.md); tag `v1.0.0` after [170/30](../170_testing/30_end-to-end.md); push (the orchestrator commits).
- Nothing is committed yet. The orchestrator commits and pushes.

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
- Decided (claude, 2026-09-30): release tags use the form `vX.Y.Z`, because the repository's `AGENTS.md` already said so and one form keeps the tag check simple. CI fails a tag that does not match `manifest.json`.
- Decided (claude, 2026-09-30): the version stays `0.1.0` until the first tag, because nothing has been released, so adding elements needs no bump. The first tag is `v1.0.0`, as this subtask says. The minor bumps in [120/70](./70_elements-icons.md) and [120/75](./75_elements-frames-and-widgets.md) fold into it.
- Decided (claude, 2026-09-30): the check script is standard-library Python at `scripts/check.py`, because the repository has no toolchain and Python runs on every CI image with no install. `AGENTS.md`'s "no `scripts/`" exception now names this one tool.
- Decided (claude, 2026-09-30): the check also requires every file in an element folder to be named by an element, and `library.json`'s `latest` to equal the manifest version, because an unlisted file ships unseen and a stale `latest` misleads the catalog.
- Decided (claude, 2026-09-30): `library.json` uses the real casing `NeuraLabsHQ` in its git URL, as the watch-out below says.
- Decided (claude, 2026-09-30): the template entry is left out of `library.json` until [120/85](./85_templates.md) creates the folder, because an entry pointing at a missing folder looks right and fails at `agentks init`.

# 05 Notes & Analysis
## Watch out
- The organisation is `NeuraLabsHQ`. GitHub also accepts `neuralabshq`, but `library.json` and the binary's constants use the real casing.
- Keep the whole repository small; each fetch is shallow but still downloads every file at that commit. Large binaries (videos, big images) do not belong here.
