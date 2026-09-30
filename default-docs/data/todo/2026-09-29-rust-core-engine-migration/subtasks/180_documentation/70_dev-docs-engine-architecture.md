---
title: "Developer docs: how agentks is built"
status: open
---

The developer docs explain agentks from the inside, for contributors: the repository, the Rust crates and which may depend on which, the content pipeline, caching, the `/api` protocol, the shared UI package and its two builds, the static renderer, versioning and migrations, releasing and testing. Today's developer docs describe the Astro engine and are not ported. This leaf writes the new set, largely by turning the settled design notes into present-tense documentation of what was built.

# 01 To Do
- [ ] **`dev-docs/01_overview/`** — the component map: engine and CLI (one binary), the WebSocket, the shared UI package, the client, the static renderer, the homepage, the library repository, the plugins. A diagram. The three states (developing, using, publishing) and where a tool belongs.
- [ ] **`05_repository-and-workflow/`** — the repository layout, `ctl` verbs, the gate, `data/builds/` and mise, running from the working tree, writing tests.
- [ ] **`10_engine/`** — the crate map and dependency rules; start-up; the site index; the markdown pipeline; the tracker loader and git dates; the error model; memory and concurrency.
- [ ] **`15_caching/`** — every cache layer (in memory, build cache on disk, library cache, git dates, browser), its key, what invalidates it, how settings changes invalidate only what they affect, cache format versions.
- [ ] **`20_protocol/`** — the `/api` WebSocket: message kinds, requests and pushes, hashes, the version handshake, editing messages, sync frames and presence. Generated or checked against the Rust types.
- [ ] **`25_frontend/`** — the shared UI package (pure components, the data interface), the client (routing, cache, PWA), islands, the purity rule.
- [ ] **`30_publishing/`** — how `agentks build` hands page data to the static renderer, the output layout, diagram-to-SVG.
- [ ] **`35_libraries/`** — resolution, the lock, the machine cache, the `/_lib/` route and its sandbox.
- [ ] **`40_collaboration/`** — the `yrs` documents, disk merge and echo suppression, access keys, network exposure.
- [ ] **`45_versioning-and-migrations/`** — the version gate, the floor, docs migrations and library migrations, how scripts are fetched, how to author one.
- [ ] **`50_releasing/`** — the one release stream, the installer, release notes, who tags.
- [ ] **Keep one source per fact.** Where a note in the migration issue is the design, the developer page describes the built result and does not repeat the argument.

## Guardrails
- Group rules in [180/00 overview](./00_overview.md). Developer docs explain mechanism, never how to use a feature.
- Describe the code as built. When the code differs from a design note, the page follows the code, and the difference is recorded in the note's issue.

## Done when
- The sections exist under `docs/data/dev-docs/` and render.
- A new contributor agent, given only the developer docs and the repository, can say which crate owns a rule, find the code, and run the gate.
- The protocol pages match the Rust types (checked by a generated table or a test).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `docs/data/dev-docs/`.
- **Read first:** every note in this issue, in the order of [the notes index](../../notes/01_overview/01_index.md). The engine notes ([02_engine](../../notes/02_engine/03_rust-engine.md)), the frontend notes ([03_frontend](../../notes/03_frontend/01_shared-ui-package.md)) and the delivery notes ([05_delivery](../../notes/05_delivery/05_development-workflow-and-testing.md)) map most directly to sections here.
- Today's developer docs, for structure and tone only: [dev-docs](../../../../dev-docs), especially [versioning](../../../../dev-docs/30_versioning).
- Absorbed: the dev-docs halves of [docs-phase-2 subtask 01](../../../2026-04-19-docs-phase-2/subtasks/01_issues-layout-docs.md) (the tracker's data interface and components) and [subtask 02](../../../2026-04-19-docs-phase-2/subtasks/02_theme-system-docs.md) (why the theme contract exists, required variables, the two-tier model, theme resolution).
- **Depends on:** the engine, caching, server, collaboration, UI, publishing and versioning groups being built.
- **Unblocks:** [200/20 switch-over](../200_launch/20_switch-over.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the docs keep the audience split; developer docs explain how it is built ([docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md)).
- Decided (claude, 2026-09-30): the developer docs describe the code as built; the design notes stay in the tracker as the record of why.

# 05 Notes & Analysis

## Watch out
- The protocol and cache pages are the ones most likely to drift. Tie them to the code with a generated table or a test, not only prose.
