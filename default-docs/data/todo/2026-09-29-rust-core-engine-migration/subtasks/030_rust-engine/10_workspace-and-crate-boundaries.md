---
title: "Workspace and crate boundaries — 14 crates, dependencies point one way"
status: open
---

A single large crate lets any module reach any other, and after a year nobody can change one part without reading all of it. sidhantha asked for a very modular engine. This leaf creates the Cargo workspace with one crate per responsibility, arranges the crates in layers, and adds a check that fails the gate when a crate depends on a layer above it. Every later leaf writes into one of these crates.

# 01 To Do
- [ ] **Create the workspace** in `apps/agentks-engine/`: `Cargo.toml` with `[workspace]`, `resolver = "3"`, `[workspace.package]` (version, `edition = "2024"`, `rust-version`, licence), `[workspace.dependencies]` for every shared third-party crate (one version each), and `[workspace.lints]` inherited by every crate.
- [ ] **The crates, by layer.** A crate may depend only on crates in lower layers.

| Layer | Crate | Owns | Depends on |
|---|---|---|---|
| 0 | `agentks-core` | Project-relative paths, BLAKE3 hashes, `Version`, the error record and error kinds, small shared types. No I/O | — |
| 1 | `agentks-config` | Discovery, `site.yaml`/`navbar.yaml`/`footer.yaml`, `.env`, aliases, the typed settings schema, the version gate | core |
| 1 | `agentks-git` | Git-derived facts: `updated` dates, the current branch, merge-base checks | core |
| 1 | `agentks-cache` | The in-memory and on-disk cache stores, keys, format versions ([040](../040_caching/00_overview.md)) | core |
| 1 | `agentks-api` | The data interface: wire types for pages, manifest, sidebars, indexes, messages; schema export ([80](./80_page-data-interface.md)) | core |
| 2 | `agentks-content` | The format rules: prefix grammar, `settings.json`, frontmatter, page kinds, the tracker anatomy and status vocabulary, validation | core, config |
| 2 | `agentks-library` | `dep.yaml`, `dep.lock`, resolving and fetching libraries, the library cache ([120](../120_libraries/00_overview.md)) | core, config, cache |
| 2 | `agentks-migrate` | Fetching and running migration scripts ([140](../140_versioning-and-migrations/00_overview.md)) | core, config |
| 3 | `agentks-index` | The site index, URLs, the link resolver, folder hashes, the reference graph | core, config, content |
| 4 | `agentks-render` | The markdown pipeline, highlighting, heading IDs, theme CSS compilation | core, config, content, index |
| 5 | `agentks-site` | The engine as one object: loads a project, owns the index snapshot and caches, answers "page for URL" as `agentks-api` types, applies file changes | core, config, git, cache, api, content, library, index, render |
| 6 | `agentks-sync` | Live editing documents (`yrs`), presence, access keys ([060](../060_collaboration/00_overview.md)) | core, api, site |
| 7 | `agentks-server` | axum, the `/api` WebSocket, file routes, the watcher, the embedded client ([050](../050_server/00_overview.md)) | core, config, api, site, sync |
| 8 | `agentks-cli` | Argument parsing, commands, output formats; the binary's `main`; the embedded static renderer | all |

- [ ] **The layer check**: `crates/LAYERS.toml` lists each crate's layer; `scripts/gate/crate-layers.ts` (Bun) reads `cargo metadata --format-version 1 --no-deps` and fails on any dependency to the same or a higher layer, printing the offending edge. It runs in the `check` rung ([010/40](../010_project-setup/40_ctl-and-gate.md)). Control it: add an upward edge, see red, remove it.
- [ ] **Workspace lints**: `unsafe_code = "forbid"`; clippy `unwrap_used`, `expect_used`, `panic` denied outside tests (allowed in `agentks-cli`'s `main` only); `missing_docs` warned on public items of layers 0–5.
- [ ] **Each crate has** a `README.md` (one paragraph: what it owns, what it must not do), a `src/lib.rs` whose top doc comment repeats that, and its own tests. Public API is small: `pub` items are the crate's contract; internals are `pub(crate)`.
- [ ] **Port, don't rewrite blindly.** Move today's CLI code ([agent-ks-cli/src](../../../../../../agent-ks-cli/src/main.rs)) into the matching crates: `content.rs` → `agentks-content`, `links.rs` → `agentks-index`, `issues.rs` → `agentks-content`/`agentks-site`, `checks.rs` → `agentks-content`, `update.rs` → `agentks-cli`, `viewer.rs` → dropped (the Astro viewer lifecycle is replaced by `agentks-server`).
- [ ] **One binary**: `agentks-cli` builds `agentks`. `cargo build --release -p agentks-cli` in `ctl build`, output to `data/builds/agentks`.

## Guardrails
- A crate that needs something from a higher layer is a design error: move the shared piece down, or pass it in through a trait defined in the lower crate.
- No crate below `agentks-server` knows about HTTP, WebSockets or the terminal. No crate below `agentks-cli` prints to stdout.
- Add a crate only for a real boundary with a second consumer or a distinct dependency set (the project-setup "promote when shared" rule); do not split further for symmetry.

## Done when
- `cargo build --workspace` and `cargo test --workspace` pass with every crate present (most with a placeholder test at first).
- `scripts/gate/crate-layers.ts` passes, and fails on a deliberate upward edge.
- `cargo tree -p agentks-core` shows no internal crate; `cargo tree -i agentks-server` shows only `agentks-cli` depending on it.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** `apps/agentks-engine/Cargo.toml`, `apps/agentks-engine/crates/*`, `scripts/gate/crate-layers.ts`.
- **Read first:** [02/03 The Rust engine](../../notes/02_engine/03_rust-engine.md) section 01 (the five-crate starting proposal this refines) and section 09 (what the core replaces); [05/01](../../notes/05_delivery/01_repositories-and-layout.md) section 03 (what the engine folder must not hold); the project-setup skill's `06_backend.md` (Rust `crates/` by layer) and `11_conventions.md` (promote when shared); today's CLI [Cargo.toml](../../../../../../agent-ks-cli/Cargo.toml) for dependencies already in use.
- **Depends on:** [010/20](../010_project-setup/20_main-repo-skeleton.md), [010/30](../010_project-setup/30_toolchain-pins.md).
- **Unblocks:** every other leaf in this group, and [020](../020_content-contract/00_overview.md), [040](../040_caching/00_overview.md), [050](../050_server/00_overview.md), [060](../060_collaboration/00_overview.md), [070](../070_cli/00_overview.md), [120](../120_libraries/00_overview.md), [140](../140_versioning-and-migrations/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the CLI and the server share one core; one binary.
- Decided (sidhantha, 2026-09-30): the engine is very modular.
- Decided (claude, 2026-09-30): the 14-crate layer table above. It adds `agentks-api` (wire types shared by the server and the static build without either depending on the other) and `agentks-site` (the one place that assembles index, render and caches, so the server and the CLI do not each assemble them) to the crate list proposed on 2026-09-30.

# 05 Notes & Analysis
## 01 Why these two extra crates
- **`agentks-api`** sits low (layer 1) so `agentks-render`, `agentks-site`, `agentks-server`, `agentks-sync` and the CLI's `build` all speak the same types. If the types lived in `agentks-site`, `agentks-sync` could not use them without depending on everything.
- **`agentks-site`** exists because both the server and `agentks build` must do the same sequence: load config, run the gate, build the index, render with the cache, answer by URL. Written twice, it would drift.

## Watch out
- Start with few `pub` items. Widening an API later is cheap; narrowing it after other crates depend on it is not.
- Keep third-party versions in `[workspace.dependencies]` only; a crate's own `Cargo.toml` says `foo.workspace = true`.
