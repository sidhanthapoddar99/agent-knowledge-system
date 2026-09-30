---
title: "Contributor setup guide — clone to green gate in one page"
status: open
---

A contributor, human or agent, must get from `git clone` to a running dev server and a green gate without asking anyone. This leaf writes that guide once the commands exist, and tests it on a clean machine.

# 01 To Do
- [ ] **`README.md` "Develop" section** in the main repository, short: prerequisites (mise), `mise trust`, `./ctl setup`, `./ctl dev`, `./ctl gate`, where the tracker is, and a link to the full guide.
- [ ] **The full guide** as a page in `docs/` (the dev-docs section [180/00 documentation](../180_documentation/00_overview.md) creates; until then `docs/CONTRIBUTING.md` is acceptable and moves later):
    - [ ] The three states and which one a contributor is in.
    - [ ] The repository tree and who owns each folder ([05/01](../../notes/05_delivery/01_repositories-and-layout.md) section 03).
    - [ ] Running the engine against another project: `agentks start --config-dir <path>` with the working-tree build.
    - [ ] How mise makes `agentks` the working-tree build inside the repository, and how to reach the installed release.
    - [ ] Working with the library repository locally: a `path:` entry in a test project's `dep.yaml` pointing at the local library clone.
    - [ ] The gate, what each rung runs, and how to run one rung.
    - [ ] Where decisions are recorded (the subtask's `04 Decisions`, then `AGENTS.md` for repository-wide choices).
- [ ] **Test it cold**: in a fresh clone under `/tmp`, follow the guide word for word; fix every step that needed knowledge the guide does not give.

## Guardrails
- The guide never repeats a command's flags that `ctl --help` prints; it links to the help instead.

## Done when
- A fresh clone under `/tmp`, following only the guide, reaches `./ctl gate` exit 0 and a page served by `./ctl dev`.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system` (`README.md`, `docs/`).
- **Read first:** [05/05 Development workflow and testing](../../notes/05_delivery/05_development-workflow-and-testing.md); the project-setup skill's `08_ctl.md`.
- **Depends on:** [40](./40_ctl-and-gate.md), [60](./60_agents-md-contracts.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the new repository is set up with the project-setup guide; state 1 runs from the working tree with the Vite dev server proxying to the engine.

# 05 Notes & Analysis
## Watch out
- Keep the guide in step with `ctl`: any new verb or changed setup step updates the guide in the same commit.
