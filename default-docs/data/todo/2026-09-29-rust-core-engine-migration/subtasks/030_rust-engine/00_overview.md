---
title: "Rust engine — a modular core in one binary"
status: in-progress
---

The Rust engine replaces today's Astro loaders, parsers and cache manager, and absorbs the rules the Rust CLI already duplicates. sidhantha asked on 2026-09-30 for it to be **very modular and properly structured**, with memory, cache and versioning handled deliberately. This group builds it as a Cargo workspace of small crates with one-way dependencies, checked in CI, so each crate can be understood, tested and replaced alone. The server ([050](../050_server/00_overview.md)), the CLI ([070](../070_cli/00_overview.md)), caching ([040](../040_caching/00_overview.md)) and collaboration ([060](../060_collaboration/00_overview.md)) are built on these crates.

# 01 To Do
- [ ] **Work in this order:**
    1. [030/10 workspace and crate boundaries](./10_workspace-and-crate-boundaries.md) and [030/20 error model](./20_error-model.md): the skeleton every other crate lives in.
    2. [030/30 config loader and settings schema](./30_config-loader-and-settings-schema.md), with [020/20](../020_content-contract/20_config-folder.md).
    3. [030/40 site index](./40_site-index.md), then [030/50 markdown pipeline](./50_markdown-pipeline.md), [030/60 tracker loader](./60_tracker-loader.md) and [030/70 diagram and artifact sources](./70_diagram-and-artifact-sources.md) in parallel.
    4. [030/80 page data interface](./80_page-data-interface.md) and [030/85 theme CSS compiler](./85_theme-css-compiler.md): what the server and the static build consume.
    5. [030/90 memory and concurrency](./90_memory-and-concurrency.md): set the rules early (step 1), measure and tune once 40 to 80 exist.
    6. [030/95 retrieval index](./95_retrieval-index.md): a later stage; not needed for parity.

| Leaf | Delivers | Crate(s) | Absorbs | Status |
|---|---|---|---|---|
| [10](./10_workspace-and-crate-boundaries.md) | The Cargo workspace, 14 crates, the layer check | all | — | review |
| [20](./20_error-model.md) | Typed errors, the shared error record, fatal vs content errors | `agentks-core` | — | review |
| [30](./30_config-loader-and-settings-schema.md) | Typed settings; each setting declares what it affects; live reload | `agentks-config` | — | open |
| [40](./40_site-index.md) | The index: entries, URLs, folder hashes, the reference graph | `agentks-index` | [knowledge graph](../../../2026-04-19-knowledge-graph-and-wiki-links/issue.md) subtasks 01, 02 | open |
| [50](./50_markdown-pipeline.md) | Pre-processing, comrak, highlighting, heading IDs, post-processing | `agentks-render` | — | open |
| [60](./60_tracker-loader.md) | Issues, anatomy sections, statuses, derived fields | `agentks-content`, `agentks-site` | — | open |
| [70](./70_diagram-and-artifact-sources.md) | Diagram, artifact and video page data; sidecars | `agentks-content`, `agentks-site` | — | open |
| [80](./80_page-data-interface.md) | The one data interface the client and the static build read | `agentks-api`, `agentks-site` | — | in-progress |
| [85](./85_theme-css-compiler.md) | One compiled, contract-checked stylesheet per project | `agentks-render` | — | open |
| [90](./90_memory-and-concurrency.md) | The runtime model, snapshots, bounded queues, a memory budget | `agentks-site`, `agentks-server` | — | open |
| [95](./95_retrieval-index.md) | Full-text search for the site and agents | `agentks-search` (later) | [site-wide search](../../../2026-04-19-site-wide-search/issue.md), Rust side | open |

## Guardrails
These hold for every leaf in the group.
- **Rules live in Rust; the frontend displays.** Every derived value (URL, order, status category, filter options, resolved link) is computed here and sent as final data.
- **One implementation per rule.** The CLI's `check` commands, the server and `agentks build` call the same functions.
- **When unsure, return an error**, never a guess.
- **Dependencies point one way**, by the layer table in [10](./10_workspace-and-crate-boundaries.md); the check fails the gate on any upward edge.
- **No `unwrap()` or `expect()` outside tests and `main`**; clippy denies them in library crates.
- **Output parity** with today's engine is proved against [020/10 golden fixtures](../020_content-contract/10_golden-fixtures.md).

## Done when
- Every leaf's done-when holds (95 excepted until its stage).
- `ctl gate` passes, including the crate layer check.
- The engine renders every page of the corpus with zero unexpected differences from the golden snapshot.

# 02 Status and Result
In progress. 10 and 20 are in review; 80 is in progress; the rest are open.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system/apps/agentks-engine/`.
- **Read first, for every leaf:** [02/03 The Rust engine](../../notes/02_engine/03_rust-engine.md) (the whole note); [01/03 Architecture](../../notes/01_overview/03_architecture.md); [02/06 Machine home and build cache](../../notes/02_engine/06_machine-home-and-build-cache.md); [brainstorm: why, and the prior audit](../../brainstorm/01_initial-discussion/02_why-and-prior-audit.md) (the measurements); [brainstorm: performance and size](../../brainstorm/01_initial-discussion/13_performance-and-size.md).
- **Today's code the engine replaces:** [loaders](../../../../../../agent-ks-engine/src/loaders/index.ts), [parser pipeline](../../../../../../agent-ks-engine/src/parsers/core/pipeline.ts), [cache manager](../../../../../../agent-ks-engine/src/loaders/cache-manager.ts); and the CLI whose rules merge in: [content.rs](../../../../../../agent-ks-cli/src/content.rs), [issues.rs](../../../../../../agent-ks-cli/src/issues.rs), [links.rs](../../../../../../agent-ks-cli/src/links.rs), [checks.rs](../../../../../../agent-ks-cli/src/checks.rs).
- **Depends on:** [010/00 project setup](../010_project-setup/00_overview.md); [020/00 content contract](../020_content-contract/00_overview.md) supplies the format rules.

# 04 Decisions
- Decided (sidhantha, 2026-09-29): Rust owns the engine logic; browser code stays TypeScript; no WASM; Rust renders page bodies, not layouts.
- Decided (sidhantha, 2026-09-29): the hybrid — index at start-up, pages rendered on request, cached where it pays.
- Decided (sidhantha, 2026-09-30): the engine is very modular and properly structured, with memory, cache and versioning handled deliberately.
- Decided (claude, 2026-09-30): 14 crates in layers, with dependencies pointing one way ([10](./10_workspace-and-crate-boundaries.md) holds the layer table; [02/03](../../notes/02_engine/03_rust-engine.md) section 01 summarises it).

# 05 Notes & Analysis
## Watch out
- Today's measurements to beat: 874 MB RSS after 24 minutes of Astro dev; 419 MB of `node_modules` per project. The audit's Go prototype held the whole corpus in 13.9 MB and rendered an uncached page in 1.83 ms p50; a warm re-derivation of the corpus took 7.8 ms. Re-measure before quoting any of them in a decision.
