---
title: "Main repository skeleton — the project-setup tree for agentks"
status: in-progress
---

The main repository needs one fixed tree before any code lands, so every agent working in parallel puts files in the same places. This leaf creates that tree from the project-setup template, adapted to agentks: one Rust app (the engine and CLI), three TypeScript apps (client, static renderer, homepage), one shared package (the UI), `docs/` as an agentks project, and `plugins/`. It ends with an empty but green gate.

# 01 To Do
- [ ] **Copy the project-setup `template/` whole, then delete what agentks does not use.** Keep `ctl`, `scripts/`, `data/.gitignore`, `logs/.gitignore`, `.env.template`, `AGENTS.md`, `README.md`. Delete `docker/` (no compose stack: agentks ships an installer, not containers), `apps/database/`, and the example apps.
- [ ] **Create the apps with role names:**
    - [ ] `apps/agentks-engine/` — Rust. A Cargo workspace inside the app (`Cargo.toml` at the app root, `crates/` below), plus `migrations/docs/`, `migrations/library/`, `release-notes/`, `clippy.toml`, `rust-toolchain.toml` (from [30](./30_toolchain-pins.md)). The crate list is [030/10](../030_rust-engine/10_workspace-and-crate-boundaries.md)'s; this leaf creates only an `agentks-cli` crate whose `main` prints the version, so the build and gate have something to run.
    - [ ] `apps/packages/agentks-ui/` — the shared UI package: its own `package.json` (`private: true`, `exports` pointing at `src/`), `tsconfig.json`, lint config, `src/index.ts`.
    - [ ] `apps/agentks-client/` — Vite app: `package.json`, `vite.config.ts`, `index.html`, `src/main.ts`. Depends on the UI package by path: `"@agentks/ui": "file:../packages/agentks-ui"`.
    - [ ] `apps/agentks-ssg/` — the static renderer run by `agentks build`: `package.json`, `src/render.ts`. Same path dependency on the UI package.
    - [ ] `apps/agentks-homepage/` — a placeholder `README.md` only. [190/00 homepage](../190_homepage/00_overview.md) creates the app.
- [ ] **`docs/`** — an agentks project: `docs/config/` with `site.yaml`, `navbar.yaml`, `footer.yaml`, an empty `dep.yaml` (`libraries: {}`), and `docs/data/`. Empty sections only; content comes from [180/00 documentation](../180_documentation/00_overview.md).
- [ ] **`plugins/`** — `plugins/agentks/` and `plugins/agentks-library/` with a README each. Content comes from [130/00 AI plugins](../130_ai-plugins/00_overview.md).
- [ ] **`data/builds/`** — development builds of the binary; ignored by git through `data/.gitignore`.
- [ ] **`.env.template`** — the grouped contract, with only what `ctl` needs (ports for `ctl dev`: engine port, Vite port). No secrets exist yet.
- [ ] **Root `.gitignore`**, `RELEASING.md` (a stub; [160/00 distribution](../160_distribution/00_overview.md) fills it), `.github/workflows/` (filled by [50](./50_ci-workflows.md)).
- [ ] **`./ctl setup && ./ctl gate`** exits 0 on the empty skeleton. Commit and push.

The target tree:

```
agent-knowledge-system/
  ctl                              the one entrypoint
  .mise.toml  .env.template  .gitignore  AGENTS.md  README.md  RELEASING.md  LICENSE
  scripts/                         ctl workers (bash; Bun TypeScript for structured steps)
  data/  builds/                   ignored; dev builds of the binary
  logs/                            ignored; ctl's produced state
  apps/
    packages/agentks-ui/           shared layouts and components
    agentks-engine/                Rust workspace: crates/, migrations/{docs,library}/, release-notes/
    agentks-client/                Vite SPA (state 2)
    agentks-ssg/                   static renderer (state 3)
    agentks-homepage/              Next.js homepage (from 190)
  docs/                            agentks's own docs, an agentks project
  plugins/  agentks/  agentks-library/
  .github/workflows/
```

## Guardrails
- **No JavaScript workspace.** No root `package.json`, no `bun.lock` at the root or in `apps/` or `apps/packages/`. Each app and the package own their manifest and lock (project-setup `01_layout.md`). The UI package is linked with a `file:` dependency.
- **The Cargo workspace lives inside `apps/agentks-engine/`**, not at the repository root.
- **`ctl` is the only executable at the root**; `.mise.toml` puts the root on `PATH`.
- **Only `AGENTS.md`**; no `CLAUDE.md`.

## Done when
- `./ctl setup` then `./ctl gate` exit 0 in a fresh clone.
- `cargo run --manifest-path apps/agentks-engine/Cargo.toml -p agentks-cli -- --version` prints a version.
- `bun run --cwd apps/agentks-client build` produces `dist/` and imports one symbol from `@agentks/ui`.
- `ctl check` reports no placeholder `<version>` and no workspace manifest.

# 02 Status and Result
In progress. The engine half exists; the client half waits for the UI framework decision ([080/10](../080_ui-and-client/10_ui-framework-decision.md)).

## Result
- The project-setup shape: `ctl`, `scripts/` (common, config, build, test, gate), `.mise.toml`, `.env.template`, `.gitignore`, `data/` and `logs/` with their own ignore files, `AGENTS.md`, `README.md`, `LICENSE`, `.github/workflows/gate.yml`.
- `apps/agentks-engine`: a Cargo workspace (Rust 1.98.1, edition 2024) with `agentks-core` and the `agentks` binary. `ctl build` writes `data/builds/agentks`; `agentks --version` prints `agentks 0.1.0`.
- `./ctl setup` and `./ctl gate` exit 0 locally and in CI.
- Left: `apps/agentks-client` and `apps/packages/agentks-ui` (after 080/10), and the client build check in Done when.

## Agent log
none

# 03 References
- **Where:** `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`.
- **Read first:**
    - [05/01 Repositories and layout](../../notes/05_delivery/01_repositories-and-layout.md) sections 02 and 03 — the tree and folder ownership.
    - [01/03 Architecture](../../notes/01_overview/03_architecture.md) — what each app is.
    - [03/01 Shared UI package](../../notes/03_frontend/01_shared-ui-package.md) and [03/02 Client application](../../notes/03_frontend/02_client-application.md).
    - The project-setup skill: `01_layout.md` (the tree, the no-workspace rule), `05_frontend.md` (package shape), `11_conventions.md` (naming).
    - `/home/sid/projects/06_02_NeuraLabs/neuracode` for a filled-in example of the same shape.
- **Depends on:** [10](./10_create-neuralabshq-repos.md), [30](./30_toolchain-pins.md).
- **Unblocks:** [40](./40_ctl-and-gate.md), [60](./60_agents-md-contracts.md), [030/00 Rust engine](../030_rust-engine/00_overview.md), [080/00 UI and client](../080_ui-and-client/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the apps folder is `apps/`; the shared UI lives in `apps/packages/agentks-ui`, used by `apps/agentks-client` and `apps/agentks-ssg`; the homepage is in the main repository; dev builds go to `data/builds/` ([05/01](../../notes/05_delivery/01_repositories-and-layout.md)).
- Decided (claude, 2026-09-30): no `docker/` folder and no compose stack. agentks releases an installer only; the website's Dockerfile lives in `docs/` ([05/06](../../notes/05_delivery/06_deployment-and-hosting.md)). Record as an exception in `AGENTS.md`.
- Decided (claude, 2026-09-30): `data/builds/` stays under `data/` as decided, although project-setup puts frozen builds under `logs/`. Record as an exception.

# 05 Notes & Analysis
## Watch out
- The project-setup template's Rust example (`example-engine-rust`) carries a `config.yaml` and a `Dockerfile`; agentks's engine needs neither. Delete them.
- `apps/agentks-ssg` is embedded into the binary later ([150/00 publishing](../150_publishing/00_overview.md)); keep its entry point a single file so embedding stays simple.
