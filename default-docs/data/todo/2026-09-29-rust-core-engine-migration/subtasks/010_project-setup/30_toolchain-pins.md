---
title: "Toolchain pins — latest Rust and Vite, one version everywhere"
status: in-progress
---

sidhantha asked on 2026-09-30 for the latest Rust and the latest Vite. Every machine and CI must build with the same versions, or a green gate on one machine means nothing on another. This leaf pins the toolchain in the files the tools read, and records the versions in `AGENTS.md`.

# 01 To Do
- [ ] **Check for newer stable releases first**: `rustup check`, `npm view vite version`, `npm view typescript version`, `bun --version` against Bun's releases. Use the newest stable at the time of work. Update [toolchain versions](../../agent-memory/toolchain-versions.md) if anything moved (memory is the one file outside this group this leaf may edit, because it is the record).
- [ ] **`apps/agentks-engine/rust-toolchain.toml`:**
    ```toml
    [toolchain]
    channel = "1.98.1"
    components = ["clippy", "rustfmt"]
    ```
    and `edition = "2024"` plus `rust-version = "1.98"` in `[workspace.package]` of the engine's `Cargo.toml`, inherited by every crate.
- [ ] **`.mise.toml` at the root:**
    ```toml
    [tools]
    rust = "1.98.1"
    bun = "1.4.2"
    node = "24"

    [env]
    _.path = ["{{config_root}}", "{{config_root}}/data/builds"]
    ```
    `{{config_root}}` puts `ctl` on the path; `data/builds` makes `agentks` mean the working-tree build inside the repository ([05/05](../../notes/05_delivery/05_development-workflow-and-testing.md) section 02). Add a `[tasks.agentks-release]` that runs the installed release, so maintainers can compare.
- [ ] **Front-end pins in each app's `package.json`:** Vite 8.3.1 (or newer stable), TypeScript at the version neuracode uses (7.0.2) unless newer stable exists, the Vite plugin for the chosen UI framework once [080/10](../080_ui-and-client/10_ui-framework-decision.md) decides it. Exact versions, no `^`, and a committed `bun.lock` per app.
- [ ] **Rust dependency policy** in `AGENTS.md`: resolve each new crate against crates.io at the time of adding, commit `Cargo.lock`, and run `cargo update --dry-run` monthly (a reminder line, not automation).
- [ ] **Record the table** of versions in `AGENTS.md` under "Stack".

## Guardrails
- Never fill a version from memory. Check the registry; the project-setup `ctl check` fails on a `<version>` placeholder.
- One version per tool across the repository. The client, the static renderer and the homepage use the same TypeScript and Vite.

## Done when
- `rustc --version` inside `apps/agentks-engine` prints the pinned version; `mise ls --current` shows the pinned Rust, Bun and Node.
- `ctl check` passes (no placeholder versions).
- `AGENTS.md` has the "Stack" table with the same numbers as the files.

# 02 Status and Result
In progress. Rust is pinned; Bun and Node are being added by the homepage track in wave 1.

## Result
- Rust 1.98.1 pinned in `apps/agentks-engine/rust-toolchain.toml` and in `.mise.toml`, where clippy and rustfmt are listed as components (mise sets `RUSTUP_TOOLCHAIN`, which bypasses the toolchain file's components; CI failed without them).
- `AGENTS.md` has the Stack section with Rust 1.98.1, and Vite 8.3.1, Bun 1.4.2 and Node 24.21.0 for when the first frontend lands.

## Agent log
none

# 03 References
- **Where:** `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`.
- **Read first:** [toolchain versions](../../agent-memory/toolchain-versions.md); the project-setup skill's `04_stack.md` (version rule); `/home/sid/projects/06_02_NeuraLabs/neuracode/.mise.toml` and its `rust-toolchain.toml` (Rust 1.98.1, Bun 1.4.2, Vite 8.3.1, TypeScript 7.0.2 already in use there); today's [mise.toml](../../../../../../mise.toml).
- **Unblocks:** [20](./20_main-repo-skeleton.md), [40](./40_ctl-and-gate.md), [50](./50_ci-workflows.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the latest Rust and the latest Vite.
- Decided (sidhantha, 2026-09-30): mise points `agentks` at `data/builds/` inside the repository ([05/05](../../notes/05_delivery/05_development-workflow-and-testing.md)).

# 05 Notes & Analysis
## Watch out
- On 2026-09-30: Rust 1.98.1 (edition 2024), Vite 8.3.1, Bun 1.4.2, Node 24.21.0.
- Bun is the runtime for `ctl` workers written in TypeScript and for `agentks build` at build time; Node is kept only because some tools (Next.js for the homepage) expect it.
