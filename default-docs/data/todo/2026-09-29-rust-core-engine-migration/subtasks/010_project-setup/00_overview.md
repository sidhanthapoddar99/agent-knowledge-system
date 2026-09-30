---
title: "Project setup — the three NeuraLabsHQ repositories, ready to build in"
status: in-progress
---

This group turns three empty GitHub repositories into working repositories that the rest of the migration builds in. When it is done, `NeuraLabsHQ/agent-knowledge-system` has the project-setup shape (`apps/`, `ctl`, `AGENTS.md`, pinned toolchains, CI), and the library and marketplace repositories have their first files. Every other group writes code into the tree this group creates, so it goes first.

# 01 To Do
- [ ] **Work the leaves in this order.** Numbers are ids, not order; this is the order that avoids rework:
    1. [010/10 create the repositories](./10_create-neuralabshq-repos.md): first commit, README, licence, settings.
    2. [010/30 toolchain pins](./30_toolchain-pins.md) and [010/20 main repository skeleton](./20_main-repo-skeleton.md), together: the skeleton needs the pinned versions.
    3. [010/60 AGENTS.md contracts](./60_agents-md-contracts.md): written as soon as the skeleton exists, because every later agent reads it first.
    4. [010/40 ctl and the gate](./40_ctl-and-gate.md), then [010/50 CI workflows](./50_ci-workflows.md), which call `ctl gate`.
    5. [010/70 library repository skeleton](./70_library-repo-skeleton.md) and [010/80 marketplace repository skeleton](./80_marketplace-repo-skeleton.md): independent of the main repository; any time after 10.
    6. [010/90 contributor setup guide](./90_contributor-setup-guide.md): last, when the commands it documents exist.

| Leaf | Delivers | Repository | Status |
|---|---|---|---|
| [10](./10_create-neuralabshq-repos.md) | First commit, README, licence, default branch, repository settings | all three | review |
| [20](./20_main-repo-skeleton.md) | The project-setup tree: `apps/`, `scripts/`, `data/`, `logs/`, `docs/`, `.env.template`, `ctl` | main | in-progress |
| [30](./30_toolchain-pins.md) | `rust-toolchain.toml`, `.mise.toml`, the app manifests' version pins | main | in-progress |
| [40](./40_ctl-and-gate.md) | `ctl` verbs and the four-rung gate | main | in-progress |
| [50](./50_ci-workflows.md) | The GitHub Actions workflows | main, library | in-progress |
| [60](./60_agents-md-contracts.md) | One `AGENTS.md` per repository | all three | review |
| [70](./70_library-repo-skeleton.md) | `library.json`, the default library's `manifest.json`, `templates/` | library | in-progress |
| [80](./80_marketplace-repo-skeleton.md) | The Neuralabs marketplace file, pointing at the agentks plugins | marketplace | in-progress |
| [90](./90_contributor-setup-guide.md) | The guide a new contributor follows from clone to green gate | main | open |

## Guardrails
- **Only `AGENTS.md`.** No `CLAUDE.md` in any of the three repositories (sidhantha, 2026-09-30).
- **Claude owns these three repositories** until the migration completes: commit, branch, push and merge freely ([permissions](../../agent-memory/permissions-and-repositories.md)). This repository, the one being frozen, is edited but never committed by Claude.
- **Versions come from the toolchain memory**, never from recall: [toolchain versions](../../agent-memory/toolchain-versions.md). A newer stable release at the time of work is fine; record it in `AGENTS.md`.
- **Follow the project-setup skill** (`project-setup:project-setup`) for the tree, `ctl` and the gate. Record every deviation in `AGENTS.md` under "Exceptions to the standard layout".

## Done when
- `git -C /home/sid/projects/06_02_NeuraLabs/agent-knowledge-system log --oneline` shows the skeleton commits, and `./ctl gate` exits 0 there.
- The library and marketplace repositories each have a pushed `main` with their first files.
- CI runs the gate on every push to the main repository and is green.

# 02 Status and Result
In progress. 10 and 60 are in review; 20, 30, 40, 50, 70 and 80 are in progress; 90 is open.

## Result
None yet.

## Agent log
none

# 03 References
- **Where the work happens:** `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library`, `/home/sid/projects/06_02_NeuraLabs/neuralabs-plugin-marketplace`.
- **Read first, for every leaf in this group:**
    - [Permissions and repositories](../../agent-memory/permissions-and-repositories.md) and [toolchain versions](../../agent-memory/toolchain-versions.md).
    - [05/01 Repositories and layout](../../notes/05_delivery/01_repositories-and-layout.md) — the three repositories, the main tree, who owns each folder.
    - [05/05 Development workflow and testing](../../notes/05_delivery/05_development-workflow-and-testing.md) — `ctl`, the gate, the test layers, CI.
    - [05/04 Distribution and install](../../notes/05_delivery/04_distribution-and-install.md) — what the main repository releases.
    - The project-setup skill, pages `01_layout.md`, `08_ctl.md`, `10b_static-checks.md`, `11_conventions.md`.
    - `/home/sid/projects/06_02_NeuraLabs/neuracode` — a sibling NeuraLabsHQ repository already in this shape (`AGENTS.md`, `ctl`, `.mise.toml`, `rust-toolchain.toml`, per-app Bun locks).
- **Unblocks:** every other group. The engine crates ([030](../030_rust-engine/00_overview.md)) and the UI apps ([080](../080_ui-and-client/00_overview.md)) are written into the tree 20 creates.

# 04 Decisions
- Decided (sidhantha, 2026-09-30): three private repositories in NeuraLabsHQ: `agent-knowledge-system`, `agent-knowledge-system-library`, `neuralabs-plugin-marketplace` ([05/01](../../notes/05_delivery/01_repositories-and-layout.md)). Each local folder is its own repository; the open question of one folder holding two repositories is settled this way.
- Decided (sidhantha, 2026-09-30): the main repository is set up with the project-setup guide and starts from scratch; only what is needed moves across.
- Decided (sidhantha, 2026-09-30): use only `AGENTS.md`; latest Rust and latest Vite.

# 05 Notes & Analysis
## Watch out
- The project-setup skill says "ask before adding a rung beyond the floor or an add-on". sidhantha gave Claude full autonomy over these repositories, so that ask is answered: add what the project needs and record it in `AGENTS.md`.
- The notes write `mise.toml`; the project-setup shape is `.mise.toml`. Use `.mise.toml`.
