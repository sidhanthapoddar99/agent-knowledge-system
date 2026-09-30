---
title: "CI workflows — the gate on every push, parity on engine changes"
status: in-progress
---

CI proves on a clean machine what `ctl gate` proves locally. Without it, a green gate depends on one maintainer's machine. This leaf adds the workflows the repositories need now; the release workflow and the website deploy are owned by their groups and only stubbed here.

# 01 To Do
- [ ] **`.github/workflows/gate.yml`** (main repository): on every push and pull request, on `ubuntu-latest`: install mise, `ctl setup`, `ctl gate`. Cache `~/.cargo`, `apps/agentks-engine/target` and each app's Bun cache, keyed by the lock files.
- [ ] **`.github/workflows/parity.yml`**: on pull requests touching `apps/agentks-engine/`, `apps/packages/agentks-ui/` or `apps/agentks-client/`: `ctl e2e`. Starts as a stub that runs `ctl e2e --help` until [170/20](../170_testing/20_route-and-content-parity.md) lands.
- [ ] **`.github/workflows/release.yml`**: a stub with the trigger (`v*.*.*` tags) and a comment pointing at [160/10](../160_distribution/10_installer-and-release-workflow.md), which fills it.
- [ ] **`.github/workflows/website.yml`**: a stub pointing at [195/00 hosting](../195_hosting/00_overview.md).
- [ ] **Library repository**: a `check.yml` that validates `library.json` and every `manifest.json` against their schemas ([70](./70_library-repo-skeleton.md)).
- [ ] **Branch protection**: require `gate` on `main` of the main repository, if the plan allows it on a private repository ([10](./10_create-neuralabshq-repos.md)).

## Guardrails
- CI calls `ctl`, never tools directly, so CI and local runs cannot drift.
- No secrets are needed yet. Do not add any.
- Actions minutes on a private organisation repository are limited: keep the parity job path-filtered.

## Done when
- A push to a branch shows the `gate` check green in `gh run list -R NeuraLabsHQ/agent-knowledge-system`.
- A deliberate lint error on a throwaway branch turns the check red.
- The library repository's `check` workflow runs green on its first manifest.

# 02 Status and Result
In progress. The main repository's gate runs green in CI.

## Result
- `.github/workflows/gate.yml` runs `ctl setup` and `ctl gate` on push and pull request. Run `36753313412` on `main` is green (28 s).
- The first run failed because mise installed Rust without rustfmt; fixed in `5019933`.
- Left: the deliberate red check, the library repository's check workflow.

## Agent log
none

# 03 References
- **Where:** `.github/workflows/` in the main and library repositories.
- **Read first:** [05/05](../../notes/05_delivery/05_development-workflow-and-testing.md) section 06 (the CI table); today's workflows in `.github/workflows/` of this repository (four release workflows) for the matrix and caching shapes.
- **Depends on:** [40](./40_ctl-and-gate.md).
- **Unblocks:** [160/10](../160_distribution/10_installer-and-release-workflow.md), [195/00 hosting](../195_hosting/00_overview.md).

# 04 Decisions
- Decided (claude, 2026-09-30): the CI table from [05/05](../../notes/05_delivery/05_development-workflow-and-testing.md) section 06; workflows call `ctl` only.

# 05 Notes & Analysis
## Watch out
- mise in CI: use the official `jdx/mise-action` so `.mise.toml` pins are honoured.
