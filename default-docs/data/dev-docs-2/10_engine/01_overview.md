---
title: "The engine"
description: "The Cargo workspace behind the agentks binary: its 14 crates by layer, the rules every crate keeps, and where each job lives."
---

The engine is the Rust side of agentks. It is one Cargo workspace in `apps/agentks-engine/`, built into one binary named `agentks` that is the engine, the CLI and the local server at once. This section explains how the workspace is divided, why, and what each engine crate does. Read it before you add a rule, a command or a crate, so the change lands in the crate that owns it.

## The workspace at a glance

The workspace holds 14 crates in nine layers. A crate may depend only on crates in a lower layer. Layer 0 knows nothing of the others. Layer 8 builds the binary.

| Layer | Crate | Folder in `apps/agentks-engine/` | Owns |
|---|---|---|---|
| 0 | `agentks-core` | `crates/core` | Paths, URLs, hashes, versions, ids, the fixed vocabularies, the machine home layout, the error model. No I/O |
| 1 | `agentks-config` | `crates/config` | Finding a project; `site.yaml`, `navbar.yaml`, `footer.yaml`, `config/.env`; aliases; the version gate; what each setting affects |
| 1 | `agentks-git` | `crates/git` | Git facts: branch, ancestry, tracker dates, a clean tree; listing a remote's refs and fetching one commit |
| 1 | `agentks-cache` | `crates/cache` | Cache keys, the memory cache, the build cache on disk, the library store, cleanup, atomic writes and path checks |
| 1 | `agentks-api` | `crates/api` | Every `/api` message and page data shape, `API_VERSION`, the JSON Schema |
| 2 | `agentks-content` | `crates/content` | The content format rules: prefixes, folder settings, frontmatter, page kinds, sidecars, the tracker |
| 2 | `agentks-library` | `crates/library` | `dep.yaml`, `dep.lock`, resolving and syncing libraries, manifests, elements, the catalog |
| 2 | `agentks-migrate` | `crates/migrate` | `agentks migrate`: the runner for migration scripts |
| 3 | `agentks-index` | `crates/index` | The site index, URLs, the route table, the link resolver, the reference graph |
| 4 | `agentks-render` | `crates/render` | The markdown pipeline and the theme compiler |
| 5 | `agentks-site` | `crates/site` | The engine as one object: open a project, answer every request, apply changes |
| 6 | `agentks-sync` | `crates/sync` | Live editing documents, sync frames, presence, access keys, the edit journal |
| 7 | `agentks-server` | `crates/server` | HTTP routes, the `/api` WebSocket, the watcher, security, ports, the server's lifecycle |
| 8 | `agentks-cli` | `crates/cli` | The `agentks` binary: commands and output. The only crate that prints |

Each crate lives in `apps/agentks-engine/crates/<short name>/`, and its package name is `agentks-<name>`. So `agentks-render` lives in `apps/agentks-engine/crates/render/`.

## Rules every crate keeps

| Rule | Enforced by |
|---|---|
| Dependencies point down the layers, never sideways or up | `apps/agentks-engine/crates/LAYERS.toml` and `scripts/gate/crate-layers.ts`, in `ctl check` |
| No `unwrap`, `expect`, `panic`, `todo`, `unimplemented` or `dbg!` outside tests. When the engine cannot be sure of an answer, it returns an error | Workspace clippy lints, set to deny |
| No printing outside `agentks-cli` | Clippy denies `print_stdout` and `print_stderr` |
| No `unsafe` code | `unsafe_code = "forbid"` |
| Every public item has a doc comment that states its contract | `missing_docs` |
| A content problem goes to an `ErrorSink` and the work goes on; a fatal problem is an `Err` from loading | Code review, and the types: a fatal error carries a list that cannot be empty |
| Third-party versions live only in the workspace `Cargo.toml` | Each crate writes `foo.workspace = true` |

Each crate also has a `README.md` saying what it owns and what it must not do, and a `src/lib.rs` whose top comment says the same.

## Data outside the crates

| Folder | Holds |
|---|---|
| `apps/agentks-engine/schema/` | `api.schema.json`, generated from `agentks-api`, and `fixtures/`, one sample payload per page kind and result |
| `apps/agentks-engine/themes/` | The built-in theme (`default/`), which the render crate embeds in the binary, and example themes used as compiler test inputs |
| `apps/agentks-engine/migrations/` | Migration scripts, `docs/` and `library/`, fetched at run time and never compiled in |

## Pages in this section

| Page | Explains |
|---|---|
| [Crate layers and the layer check](./05_crate-layers.md) | Why the workspace is layered, how the check works, and what to do when a crate needs something from above |
| [The core crate](./10_core.md) | The shared types every crate builds on |
| [The error model](./15_error-model.md) | `ErrorRecord`, `ErrorKind`, the sink, fatal versus content errors, request failures |
| [Config: finding and loading a project](./20_config.md) | Discovery, loading, aliases, the version gate, the settings diff |
| [Content: the format rules](./25_content.md) | Prefixes, folder settings, frontmatter, page kinds, slug collisions |
| [The tracker model](./27_tracker.md) | The vocabulary, the seven anatomy sections, derived values, checks and writers |
| [The site index](./30_index.md) | Entries, hashes, URLs, the route table, the link resolver, incremental updates |
| [Render: the markdown pipeline](./35_render.md) | Each stage from markdown text to body HTML |
| [The theme compiler](./40_theme-compiler.md) | From `theme:` in `site.yaml` to one stylesheet per project |
| [Site: the engine as one object](./45_site.md) | Opening a project, answering requests, applying changes, snapshots |
| [Git and migrate](./50_git-and-migrate.md) | How the engine reads git, and the migration runner |
| [The CLI crate](./55_cli.md) | How the binary is laid out, its output and exit codes |

Five crates are covered in other sections: `agentks-api` and `agentks-server` in [server and protocol](../15_server-and-protocol/01_overview.md), `agentks-cache` in [caching](../20_caching/01_overview.md), `agentks-sync` in [collaboration](../30_collaboration/01_overview.md), and `agentks-library` in [libraries](../35_libraries/01_overview.md).

## Build and test the workspace

From the repository root, `ctl build`, `ctl test` and `ctl gate` are the entry points. Inside `apps/agentks-engine/`, Cargo works directly. `rust-toolchain.toml` pins the Rust version.

```bash
cargo build -p agentks-cli                           # the binary, in target/debug/agentks
cargo test --workspace                               # every crate's tests
cargo test -p agentks-index                          # one crate
cargo run -p agentks-api --bin agentks-api-schema    # rewrite schema/api.schema.json
cargo clippy --all-targets -- -D warnings -D clippy::cognitive_complexity
```

The [contributing section](../55_contributing/01_overview.md) explains the gate and the development workflow.
