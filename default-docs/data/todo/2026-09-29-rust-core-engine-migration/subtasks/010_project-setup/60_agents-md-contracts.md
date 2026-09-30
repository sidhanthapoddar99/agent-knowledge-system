---
title: "AGENTS.md contracts — one brief per repository"
status: review
---

Many agents will work in these repositories in parallel, most of them starting cold. `AGENTS.md` is the one file every agent reads first, so it must carry the choices each repository has made, its hard limits and where the product contract lives. sidhantha asked on 2026-09-30 for `AGENTS.md` only: no `CLAUDE.md` anywhere. This leaf writes the three briefs.

# 01 To Do
- [ ] **Main repository `AGENTS.md`**, filling every section of the project-setup template (`template/AGENTS.md`, nine sections). Content it must carry:
    - [ ] **Working rules.** The product contract is this tracker issue, `2026-09-29-rust-core-engine-migration`, in `sidhanthapoddar99/agent-knowledge-system` under `default-docs/data/todo/` until the tracker moves into this repository's `docs/` ([200/10](../200_launch/10_tracker-move.md)). Read the subtask and its notes before changing behaviour.
    - [ ] **The load-bearing principle**, carried from today's [AGENTS.md](../../../../../../AGENTS.md): the filesystem is the document; the app renders it; relative links, always; a link that is right on disk and wrong on the site is a renderer defect.
    - [ ] **The engine rules:** every rule lives in Rust; the frontend displays; when unsure, return an error; one implementation of each rule, shared by the CLI and the server ([02/03](../../notes/02_engine/03_rust-engine.md)).
    - [ ] **The three states** (developing, using, publishing) and where tooling for each belongs ([05/05](../../notes/05_delivery/05_development-workflow-and-testing.md) section 01).
    - [ ] **Skeletons** (the tree from [20](./20_main-repo-skeleton.md)), **Stack** (the table from [30](./30_toolchain-pins.md)), **Commands** (from [40](./40_ctl-and-gate.md)), **Exceptions to the standard layout** (no `docker/`, `data/builds/`, the engine's inner Cargo workspace, the `file:` link to the UI package).
    - [ ] **The theme contract rules** from today's AGENTS.md "Theming" and "Typography" sections, reworded for `apps/packages/agentks-ui` ([100/10](../100_layouts/10_theme-contract-and-css.md) owns the final text).
    - [ ] **Hard limits:** never commit secrets; the binary's built-in addresses (repositories, catalog, docs URL) never move once released ([05/01](../../notes/05_delivery/01_repositories-and-layout.md) section 06).
    - [ ] **Deciding alone / escalation:** decide inside the recorded design and write the decision in the subtask's `04 Decisions`; stop only for a product question the notes do not settle.
- [ ] **Library repository `AGENTS.md`**: what a library is, the manifest rules, one version series for the whole library, tags are x.y.z, `library.json` lists libraries and templates, library migrations are the owner's job ([04/01](../../notes/04_ecosystem/01_library-system.md)).
- [ ] **Marketplace repository `AGENTS.md`**: the marketplace holds no plugin code; each entry points at a plugin folder elsewhere; how to add a Neuralabs plugin.
- [ ] **Keep each brief short.** Link to the tracker and the notes rather than copying them. Past one screen per section, split into `memory/` files (the project-setup add-on) — that is allowed here without asking, because Claude owns these repositories.

## Guardrails
- No `CLAUDE.md`, and no `@import` of a `CLAUDE.md`. Tools that look for `CLAUDE.md` find nothing, by design.
- Write plainly: short sentences, one idea each, everyday words (the `instruction-writing` skill's rules).

## Done when
- `find /home/sid/projects/06_02_NeuraLabs/{agent-knowledge-system,agent-knowledge-system-library,neuralabs-plugin-marketplace} -name CLAUDE.md` finds nothing.
- Each repository's `AGENTS.md` is committed; the main one has all nine template sections filled with no `<angle-bracket>` placeholder left.
- `ctl check` (which checks the brief) passes in the main repository.

# 02 Status and Result
In review. Each repository has an `AGENTS.md` and no `CLAUDE.md`.

## Result
- Main repository: `AGENTS.md` with every template section filled; it records the layout exceptions (separate static apps, no `docker/`, `data/builds/`), the apps deferred until their subtasks, and where the plan lives. `ctl check` fails if a `CLAUDE.md` appears, and passes today.
- Library and marketplace repositories: an `AGENTS.md` each, describing their contracts and their layout exception (content repositories, no `ctl`).
- `find` over the three folders finds no `CLAUDE.md`.

## Agent log
none

# 03 References
- **Where:** the three repositories' roots.
- **Read first:** today's [AGENTS.md](../../../../../../AGENTS.md) (the principles to carry); the project-setup skill's `template/AGENTS.md` and `11_conventions.md` § The agent brief; the `instruction-writing` skill; `/home/sid/projects/06_02_NeuraLabs/neuracode/AGENTS.md` as a filled example.
- **Depends on:** [20](./20_main-repo-skeleton.md), [30](./30_toolchain-pins.md), [40](./40_ctl-and-gate.md) (the brief records their results).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): use only `AGENTS.md` in every repository.

# 05 Notes & Analysis
## Watch out
- Update the brief in the same commit as any change it records (a new verb, a new crate, a new exception). A stale brief misleads every later agent.
