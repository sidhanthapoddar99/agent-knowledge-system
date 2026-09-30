---
title: "Workspace and crate boundaries — 14 crates, dependencies point one way"
status: review
---

A single large crate lets any module reach any other, and after a year nobody can change one part without reading all of it. sidhantha asked for a very modular engine. This leaf creates the Cargo workspace with one crate per responsibility, arranges the crates in layers, and adds a check that fails the gate when a crate depends on a layer above it. Every later leaf writes into one of these crates.

# 01 To Do
- [x] **Create the workspace** in `apps/agentks-engine/`: `Cargo.toml` with `[workspace]`, `resolver = "3"`, `[workspace.package]` (version, `edition = "2024"`, `rust-version`, licence), `[workspace.dependencies]` for every shared third-party crate (one version each), and `[workspace.lints]` inherited by every crate.
- [x] **The crates, by layer.** A crate may depend only on crates in lower layers.

| Layer | Crate | Owns | Depends on |
|---|---|---|---|
| 0 | `agentks-core` | Project-relative paths, BLAKE3 hashes, `Version`, the error record and error kinds, the fixed vocabulary types (`SectionType`, `PageKind`, `DiagramType`, `IssueStatus`, `StatusCategory`, `RunStatus`, `TrackerSection`), small shared types. No I/O | — |
| 1 | `agentks-config` | Discovery, `site.yaml`/`navbar.yaml`/`footer.yaml`, `.env`, aliases, the typed settings schema, the version gate | core |
| 1 | `agentks-git` | Git-derived facts: `updated` dates, the current branch, merge-base checks; listing a remote's refs and fetching one commit, shared by libraries and migrations | core |
| 1 | `agentks-cache` | The in-memory and on-disk cache stores, keys, the library store, cleanup, and the shared file primitives `atomic_write` and `canonical_inside` ([040](../040_caching/00_overview.md)) | core |
| 1 | `agentks-api` | The data interface: wire types for pages, manifest, sidebars, indexes, messages; schema export ([80](./80_page-data-interface.md)) | core |
| 2 | `agentks-content` | The format rules and their validation: prefix grammar, `settings.json`, frontmatter, page kinds, the tracker anatomy, each tracker's declared vocabulary. The fixed vocabulary types it checks against live in `agentks-core` | core, config |
| 2 | `agentks-library` | `dep.yaml`, `dep.lock`, resolving and fetching libraries, the library cache ([120](../120_libraries/00_overview.md)) | core, config, cache, git |
| 2 | `agentks-migrate` | Fetching and running migration scripts ([140](../140_versioning-and-migrations/00_overview.md)) | core, config, git |
| 3 | `agentks-index` | The site index, URLs, the link resolver, folder hashes, the reference graph | core, config, content |
| 4 | `agentks-render` | The markdown pipeline, highlighting, heading IDs, theme CSS compilation | core, config, api, content, index |
| 5 | `agentks-site` | The engine as one object: loads a project, owns the index snapshot and caches, answers "page for URL" as `agentks-api` types, applies file changes | core, config, git, cache, api, content, library, index, render |
| 6 | `agentks-sync` | Live editing documents (`yrs`), presence, access keys ([060](../060_collaboration/00_overview.md)) | core, cache, api, site |
| 7 | `agentks-server` | axum, the `/api` WebSocket, file routes, the watcher, the embedded client ([050](../050_server/00_overview.md)) | core, cache, config, api, site, sync |
| 8 | `agentks-cli` | Argument parsing, commands, output formats; the binary's `main`; the embedded static renderer | all |

- [x] **The layer check**: `crates/LAYERS.toml` lists each crate's layer; `scripts/gate/crate-layers.ts` (Bun) reads `cargo metadata --format-version 1 --no-deps` and fails on any dependency to the same or a higher layer, printing the offending edge. It runs in the `check` rung ([010/40](../010_project-setup/40_ctl-and-gate.md)). Control it: add an upward edge, see red, remove it.
- [x] **Workspace lints**: `unsafe_code = "forbid"`; clippy `unwrap_used`, `expect_used`, `panic` denied outside tests (allowed in `agentks-cli`'s `main` only); `missing_docs` warned on public items of layers 0–5.
- [x] **Each crate has** a `README.md` (one paragraph: what it owns, what it must not do), a `src/lib.rs` whose top doc comment repeats that, and its own tests. Public API is small: `pub` items are the crate's contract; internals are `pub(crate)`.
- [x] **Port, don't rewrite blindly.** Moved to the next wave, one crate per agent; the file map is in `## Result`. Move today's CLI code ([agent-ks-cli/src](../../../../../../agent-ks-cli/src/main.rs)) into the matching crates: `content.rs` → `agentks-content`, `links.rs` → `agentks-index`, `issues.rs` → `agentks-content`/`agentks-site`, `checks.rs` → `agentks-content`, `update.rs` → `agentks-cli`, `viewer.rs` → dropped (the Astro viewer lifecycle is replaced by `agentks-server`).
- [x] **One binary**: `agentks-cli` builds `agentks`. `cargo build --release -p agentks-cli` in `ctl build`, output to `data/builds/agentks`.

## Guardrails
- A crate that needs something from a higher layer is a design error: move the shared piece down, or pass it in through a trait defined in the lower crate.
- No crate below `agentks-server` knows about HTTP, WebSockets or the terminal. No crate below `agentks-cli` prints to stdout.
- Add a crate only for a real boundary with a second consumer or a distinct dependency set (the project-setup "promote when shared" rule); do not split further for symmetry.

## Done when
- `cargo build --workspace` and `cargo test --workspace` pass with every crate present (most with a placeholder test at first).
- `scripts/gate/crate-layers.ts` passes, and fails on a deliberate upward edge.
- `cargo tree -p agentks-core` shows no internal crate; `cargo tree -i agentks-server` shows only `agentks-cli` depending on it.

# 02 Status and Result
Review. The workspace, the 14 crates, the layer check and the lints are in place on the main repository's `main` branch; `ctl gate` is green.

## Result
- **Workspace:** `apps/agentks-engine/Cargo.toml` lists the 14 crates, one `[workspace.dependencies]` entry per third-party crate (`serde`, `serde_json`, `schemars` 1.2.2, `thiserror` 2, `blake3`), and the workspace lints. Crate folders are `crates/<short name>/` (`crates/core`, `crates/render`, …); package names are `agentks-<name>`.
- **Every crate** has a `README.md` (what it owns, what it must not do, what is built, "To build next" with the leaves that fill it) and a `lib.rs` doc comment saying the same. Public items are types and function signatures with contract doc comments; unbuilt bodies return the crate's `NotImplemented` error variant, or the type holds an `Infallible` field so it cannot exist yet. No `todo!`, no panic, no made-up value.
- **Layer check:** `apps/agentks-engine/crates/LAYERS.toml` and `scripts/gate/crate-layers.ts` (Bun, over `cargo metadata --no-deps`) run in `ctl check`, the `check` rung. It counts normal, dev and build edges, and fails on a crate missing from the table. Today: 14 crates, 53 internal edges, all point down. Controlled: adding `agentks-core → agentks-site` and `agentks-cache → agentks-api` printed both edges ("higher layer", "same layer") and exited 1; removing them turned it green.
- **Done-when:** `cargo build --workspace` and `cargo test --workspace` pass (34 tests, about 0.7 s warm); `cargo tree -p agentks-core` shows no internal crate; `cargo tree -i agentks-server` shows only `agentks-cli`.
- **Lints:** `unsafe_code` forbidden; clippy denies `unwrap_used`, `expect_used`, `panic`, `todo`, `unimplemented`, `dbg_macro`, `print_stdout`, `print_stderr` (tests may unwrap and panic through `clippy.toml`; the binary's `main` may print); `missing_docs` on every crate.
- **Binary:** `ctl build` builds `agentks` into `data/builds/agentks` and then rewrites `apps/agentks-engine/schema/api.schema.json`. `agentks --version` and `--help` work.
- **Where today's CLI code goes** (the port is the next wave's): `content.rs` → `agentks-content` (frontmatter, prefixes, doc queries; the query commands stay in `agentks-cli`); `links.rs` → `agentks-index` (resolver, link-form, the reference rewrite behind `move`); `issues.rs` → `agentks-content` (tracker rules and model) and `agentks-site` (derived fields such as dates and counts); `checks.rs` → `agentks-content` (the rules), `agentks-index` (link checks), `agentks-cli` (the report output); `context.rs` → `agentks-config` (discovery); `scaffold.rs` → `agentks-content` (the writers: `tracker::with_status`, comments) and `agentks-cli` (templates and the scaffold commands); `theme.rs` → `agentks-render` (theme compile and tokens); `extras.rs` → `agentks-git` (git facts) and `agentks-cli` (the guarded `git commit`); `util.rs` → split: paths become `agentks_core::RelPath`, frontmatter and JSONC go to `agentks-content`, output helpers to `agentks-cli`; `args.rs`, `manifest.json`, `navigate.rs`, `images.rs`, `update.rs`, `main.rs` → `agentks-cli`; `viewer.rs` and `viewer/` → dropped (the Astro viewer lifecycle is replaced by `agentks-server`).
- **AGENTS.md** of the main repo records the crate map, the trait and `NotImplemented` rules, the schema, and Bun and the engine crates in the stack list.

## Agent log
none

# 03 References
- **Where:** `apps/agentks-engine/Cargo.toml`, `apps/agentks-engine/crates/*`, `scripts/gate/crate-layers.ts`.
- **Read first:** [02/03 The Rust engine](../../notes/02_engine/03_rust-engine.md) section 01 (the crate layout in brief; the full table is here) and section 09 (what the core replaces); [05/01](../../notes/05_delivery/01_repositories-and-layout.md) section 03 (what the engine folder must not hold); the project-setup skill's `06_backend.md` (Rust `crates/` by layer) and `11_conventions.md` (promote when shared); today's CLI [Cargo.toml](../../../../../../agent-ks-cli/Cargo.toml) for dependencies already in use.
- **Depends on:** [010/20](../010_project-setup/20_main-repo-skeleton.md), [010/30](../010_project-setup/30_toolchain-pins.md).
- **Unblocks:** every other leaf in this group, and [020](../020_content-contract/00_overview.md), [040](../040_caching/00_overview.md), [050](../050_server/00_overview.md), [060](../060_collaboration/00_overview.md), [070](../070_cli/00_overview.md), [120](../120_libraries/00_overview.md), [140](../140_versioning-and-migrations/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the CLI and the server share one core; one binary.
- Decided (sidhantha, 2026-09-30): the engine is very modular.
- Decided (claude, 2026-09-30): the 14-crate layer table above. It adds `agentks-api` (wire types shared by the server and the static build without either depending on the other) and `agentks-site` (the one place that assembles index, render and caches, so the server and the CLI do not each assemble them) to the crate list proposed on 2026-09-30.

- Decided (claude, 2026-09-30): crate folders keep the skeleton's short names (`crates/core`, `crates/render`); the package name carries the `agentks-` prefix. So the crate `agentks-render` lives in `crates/render/`.
- Decided (claude, 2026-09-30): `agentks-git` also owns listing a remote's refs and fetching one commit, and `agentks-library` and `agentks-migrate` depend on it, because both need the same git fetch code and two layer-2 crates cannot share sideways.
- Decided (claude, 2026-09-30): `agentks-render` depends on `agentks-api`, so it emits the wire shapes (`RenderedBody`, `OutlineItem`, `DiagramRef`) instead of a second copy of them.
- Decided (claude, 2026-09-30): `agentks-sync` and `agentks-server` depend on `agentks-cache` for `fs::atomic_write` and `fs::canonical_inside`, because run records, `ports.json` and the key store need the same atomic write and path check as the caches; one implementation.
- Decided (claude, 2026-09-30): small types two layers need move down to `agentks-core`: `SectionId`, `ProjectKey`, `CommitId`, `UrlPath`, `BasePath`, the reserved URL prefixes, the vocabularies (section types, page kinds, diagram types, the statuses with their fixed category, run statuses, tracker sections), `MachineHome` with each store's format constant, and the official repository addresses.
- Decided (claude, 2026-09-30): where a lower crate needs a higher one, the lower crate defines a trait: `agentks_content::FileSource` (the index implements it; content rules and the renderer read files through it), `agentks_cache::clean::ProjectNeeds` (libraries implement it), `agentks_migrate::Confirm` (the CLI implements it).
- Decided (claude, 2026-09-30): an unbuilt body returns the crate's `NotImplemented` error; a type whose constructor is unbuilt holds an `Infallible` field, so its methods are provably unreachable (`match self.unbuilt {}`) with no panic and no placeholder value.
- Decided (claude, 2026-09-30): `missing_docs` applies to every crate, not only layers 0 to 5, and the clippy deny list adds `todo`, `unimplemented`, `dbg_macro`, `print_stdout` and `print_stderr`, which enforces "no crate below the CLI prints" by lint.
- Decided (claude, 2026-09-30): the layer check counts dev and build dependencies too, and fails on a crate missing from `LAYERS.toml`, because a test that reaches up is still coupling and an unlisted crate would pass unchecked.
- Decided (claude, 2026-09-30): the port of today's CLI code moves to the next wave (one crate per agent, per the wave plan); this leaf records the file map instead.

# 05 Notes & Analysis
## 01 Why these two extra crates
- **`agentks-api`** sits low (layer 1) so `agentks-render`, `agentks-site`, `agentks-server`, `agentks-sync` and the CLI's `build` all speak the same types. If the types lived in `agentks-site`, `agentks-sync` could not use them without depending on everything.
- **`agentks-site`** exists because both the server and `agentks build` must do the same sequence: load config, run the gate, build the index, render with the cache, answer by URL. Written twice, it would drift.

## Watch out
- Start with few `pub` items. Widening an API later is cheap; narrowing it after other crates depend on it is not.
- Keep third-party versions in `[workspace.dependencies]` only; a crate's own `Cargo.toml` says `foo.workspace = true`.
