---
title: "Testing — overview"
status: open
---

This group proves that the new agentks works and matches today's engine. It owns the test layers that span the whole product: Rust tests, the old-against-new parity comparison, browser end-to-end tests and the performance budget. Tests inside a single feature (a crate's own unit tests, a component's render test) are written by that feature's leaf; this group sets the shared harness, the corpus and the gate they plug into.

# 01 To Do

| Leaf | What it proves | Status |
|---|---|---|
| [170/10 Rust tests](./10_rust-tests.md) | Every crate's rules and the CLI's contract, without a browser | open |
| [170/20 Route and content parity](./20_route-and-content-parity.md) | The new engine serves every route today's engine serves, with the same content | open |
| [170/30 End to end](./30_end-to-end.md) | A real user's flows work in a real browser, including the default library | open |
| [170/40 Performance budget](./40_performance-budget.md) | Start-up, memory, render time, binary size and build time stay inside their budgets | open |

**Order of work inside the group.** 10 starts with the first crate and grows with every engine leaf. 20 starts as soon as the engine renders one section, and is the acceptance test of Phase 1. 30 starts once `agentks start` serves the client. 40 starts after 20 is green, so the budget measures a correct engine.

## Guardrails
- A test that cannot decide returns a failure, never a pass. A skipped rung of the gate is red.
- Tests never touch the user's real `~/.agentks`. Every test sets `AGENTKS_HOME` to a temporary folder.
- Tests never need network access, except the named end-to-end and parity jobs that fetch the library repository at a pinned tag.
- Never loosen a parity rule to make a diff pass. An intended difference goes in the allowlist with its reason.

## Done when
- `ctl gate` and `ctl e2e` both pass in CI on the default branch of `NeuraLabsHQ/agent-knowledge-system`.
- Every leaf in this group is in `review` or closed.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, local folder `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`. Tests live beside the code they test; shared harness code lives under `apps/agentks-engine/tests/` (Rust) and `tests/e2e/` (Playwright).
- **Read first:**
  - [Development workflow and testing](../../notes/05_delivery/05_development-workflow-and-testing.md) — the gate, the test layers and the corpus. This group implements its sections 04 to 07.
  - [Architecture](../../notes/01_overview/03_architecture.md) and [flows](../../notes/01_overview/04_flows.md) — what an end-to-end test walks through.
  - [Permissions and repositories](../../agent-memory/permissions-and-repositories.md) and [toolchain versions](../../agent-memory/toolchain-versions.md).
- **Depends on:** [010/40 ctl and gate](../010_project-setup/40_ctl-and-gate.md), [010/50 CI workflows](../010_project-setup/50_ci-workflows.md), [020/10 golden fixtures](../020_content-contract/10_golden-fixtures.md).
- **Unblocks:** the Phase 1 acceptance, the 1.0.0 release ([160/10 installer and release workflow](../160_distribution/10_installer-and-release-workflow.md)).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): output may differ from today's only in small visual improvements. Routes, heading IDs, links and text must match exactly ([development workflow](../../notes/05_delivery/05_development-workflow-and-testing.md)).
- Decided (claude, delegated by sidhantha, 2026-09-29): the new engine is proven by route parity, a rendered-content comparison in a headless browser, and screenshots of each layout. The user's own use is the final check.
- Decided (sidhantha, 2026-09-30): the first launch step is building the engine, the client and the default library, tested end to end.
- Decided (claude, 2026-09-30): tests set `AGENTKS_HOME` to a temporary folder, so no test reads or writes a developer's real machine home.

# 05 Notes & Analysis

## 01 The gate this group feeds

| Rung | Rust | TypeScript |
|---|---|---|
| lint | `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings` | the linter of each app |
| typecheck | the compiler | `tsc --noEmit` per app |
| test | `cargo test --workspace` | unit and component tests per package |
| check | theme contract, release contract, `agentks check` on `docs/` | purity check on `agentks-ui` |

`ctl gate` runs all four. `ctl e2e` runs the browser layers: parity, screenshots and end-to-end.

## 02 The corpus

- This repository's docs and tracker, about 1,300 pages: the [user guide](../../../../user-guide), the [developer docs](../../../../dev-docs) and the tracker.
- The tracker fixture [2026-07-01-demo-issue-anatomy-showcase](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md) for every part of the issues layout.
- First-class diagram and artifact pages with their sidecars.
- The golden fixtures from [020/10](../020_content-contract/10_golden-fixtures.md): small, hand-picked cases for each rule.

The corpus is copied into the test repository at a pinned commit of this repository, so a later edit here never silently changes a baseline.

## Watch out
- This repository keeps changing until the switch-over. Pin the corpus by commit and refresh it on purpose, with the baseline regenerated in the same change.
- WSL reports unreliable file times. Tests that wait for a file change must wait on the pushed message, never on a sleep.
