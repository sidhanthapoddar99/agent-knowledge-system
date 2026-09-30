---
title: "Permissions and repositories"
---

Granted by sidhantha on 2026-09-30, for the life of this migration.

| Where | What Claude may do | What stays with sidhantha |
|---|---|---|
| This repository (`agent-knowledge-system` in 02_OpenSource, the one being frozen) | Edit files, including this tracker | Every commit. Claude never commits here |
| The three new repositories (below) | Everything: commit, branch, push, merge, structure | Nothing, until the migration completes |
| Hosting, DNS, agentks.neuralabs.org | Prepare everything | The hosting work itself needs sidhantha |

- **Superseding issues.** Claude may mark an issue `superseded` (with its `→` line) once its work is finished or taken over and it is no longer relevant. `done` and `dropped` stay sidhantha's.
- **Instruction files.** Use only `AGENTS.md` in every repository. No `CLAUDE.md`.

## The three repositories

All private in the NeuraLabsHQ GitHub organisation, created 2026-09-30. Each is an empty git repo with `origin` set and branch `main`, no commits yet.

| Repository | Local folder |
|---|---|
| `NeuraLabsHQ/agent-knowledge-system` | `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system` |
| `NeuraLabsHQ/agent-knowledge-system-library` | `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library` |
| `NeuraLabsHQ/neuralabs-plugin-marketplace` | `/home/sid/projects/06_02_NeuraLabs/neuralabs-plugin-marketplace` |

- The marketplace repository is named `neuralabs-plugin-marketplace`, after its local folder and the org's `neuralabs-*` convention. Today's marketplace is `sidhanthapoddar99/sids-plugin-marketplace`.
- `gh` is signed in as `sidhanthapoddar99` with `repo` and `read:org` scopes. Git uses SSH.
- `/home/sid/projects/06_02_NeuraLabs/neuracode` is a sibling NeuraLabsHQ repo with the project-setup shape (`AGENTS.md`, `ctl`, `apps/`, `rust-toolchain.toml`, `.mise.toml`); a working reference for the main repo's setup.
