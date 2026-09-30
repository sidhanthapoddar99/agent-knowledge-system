---
title: "Library repository skeleton — library.json, the default manifest, templates/"
status: in-progress
---

`NeuraLabsHQ/agent-knowledge-system-library` holds the default library, the project templates and `library.json`, the catalog the binary reads. The engine's library code ([120](../120_libraries/00_overview.md)) and `agentks init` ([070/40](../070_cli/40_init-template.md)) need a real repository with valid files to be built and tested against. This leaf creates that first valid shape; filling the library with elements is [120](../120_libraries/00_overview.md)'s work.

# 01 To Do
- [ ] **`library.json`** at the root, with one library and one template entry:
    ```json
    {
      "libraries": {
        "agentks-default": {
          "description": "The default library: icons, frames, scene templates",
          "git": "https://github.com/neuralabshq/agent-knowledge-system-library.git",
          "path": ".",
          "latest": "0.1.0",
          "tags": ["icons", "frames", "video"]
        }
      },
      "templates": {
        "agentks-default": {
          "description": "A docs site with a guide, a blog and an issue tracker",
          "git": "https://github.com/neuralabshq/agent-knowledge-system-library.git",
          "path": "templates/agentks-default"
        }
      }
    }
    ```
- [ ] **`manifest.json`** at the root: `name`, `version` `0.1.0`, `description`, `engine` range, `elements` with one real element (an SVG icon under `icons/`), so resolution has something to find.
- [ ] **`templates/agentks-default/`**: an ordinary agentks project that runs with `agentks start` from its own folder — `config/site.yaml` (with `engine_version`), `navbar.yaml`, `footer.yaml`, `dep.yaml` (`libraries: {}`), `.env.example`, one starter page per section, `assets/`, a `Dockerfile` stub, `.gitignore` (`dist/`, `config/.env`). The full contents are [04/04](../../notes/04_ecosystem/04_templates-and-init.md) section 03; this leaf only makes it valid.
- [ ] **JSON Schemas** for `library.json` and `manifest.json` in `schemas/`, and the `check.yml` workflow ([50](./50_ci-workflows.md)) that validates every manifest against them and checks every element `file` exists inside the library folder.
- [ ] **Tag `v0.1.0`** once the files validate, so selector resolution ("the newest x.y.z tag") can be tested. 1.0.0 comes with the launch.

## Guardrails
- One version series for the whole repository: a change to any element is a new version ([04/01](../../notes/04_ecosystem/01_library-system.md)).
- No element kinds and no dependencies between libraries.
- An element `file` must stay inside the library folder.

## Done when
- `library.json` and `manifest.json` validate against their schemas in CI.
- `git ls-remote --tags origin` shows `v0.1.0`.
- `templates/agentks-default/config/dep.yaml` exists and parses as YAML with `libraries: {}`.

# 02 Status and Result
In progress. The catalog and the manifest exist; wave 1 builds the default library's scaffold and first elements ([120/60](../120_libraries/60_default-library-scaffold.md)).

## Result
- `library.json` (the catalog, one library entry, templates empty) and `manifest.json` (`agentks-default`, version 0.1.0, engine `>=1.0.0 <2.0.0`, no elements yet), `README.md`, `AGENTS.md`, `LICENSE`, `.gitignore`. Commit `80aa127`.
- Left: the schemas and their CI check, `templates/agentks-default/`, the `v0.1.0` tag.

## Agent log
none

# 03 References
- **Where:** `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library`.
- **Read first:** [04/01 Library system](../../notes/04_ecosystem/01_library-system.md) sections 06 (manifest), 08 (catalog), 15 and 16; [04/04 Templates and init](../../notes/04_ecosystem/04_templates-and-init.md) sections 03 and 05; [05/01](../../notes/05_delivery/01_repositories-and-layout.md) section 02 (the library tree).
- **Depends on:** [10](./10_create-neuralabshq-repos.md).
- **Unblocks:** [120/00 libraries](../120_libraries/00_overview.md), [070/40 init --template](../070_cli/40_init-template.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): libraries get their own repository; `manifest.json` per library; one version series per library; `library.json` is the catalog in the library repository.
- Decided (claude, 2026-09-30): the first tag is `v0.1.0`, so development resolution can be tested before the launch's 1.0.0.

# 05 Notes & Analysis
## Watch out
- The catalog's `git` URLs use `neuralabshq` in lower case; GitHub treats the organisation name case-insensitively, so `NeuraLabsHQ` and `neuralabshq` both resolve.
- The repository is private until launch. Fetching it from the engine in tests needs the developer's git credentials; CI in the main repository needs a read token for it, or tests use a local clone path.
