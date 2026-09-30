---
title: "Developer docs: how agentks is built"
status: review
---

The developer docs explain agentks from the inside, for contributors: the repository, the Rust crates and which may depend on which, the content pipeline, caching, the `/api` protocol, the shared UI package and its two builds, the static renderer, versioning and migrations, releasing and testing. Today's developer docs describe the Astro engine and are not ported. This leaf writes the new set, largely by turning the settled design notes into present-tense documentation of what was built.

# 01 To Do
- [x] **`dev-docs/01_overview/`** — the component map: engine and CLI (one binary), the WebSocket, the shared UI package, the client, the static renderer, the homepage, the library repository, the plugins. A diagram. The three states (developing, using, publishing) and where a tool belongs.
- [x] **`05_repository-and-workflow/`** — the repository layout, `ctl` verbs, the gate, `data/builds/` and mise, running from the working tree, writing tests.
- [x] **`10_engine/`** — the crate map and dependency rules; start-up; the site index; the markdown pipeline; the tracker loader and git dates; the error model; memory and concurrency.
- [x] **`15_caching/`** — every cache layer (in memory, build cache on disk, library cache, git dates, browser), its key, what invalidates it, how settings changes invalidate only what they affect, cache format versions.
- [x] **`20_protocol/`** — the `/api` WebSocket: message kinds, requests and pushes, hashes, the version handshake, editing messages, sync frames and presence. Generated or checked against the Rust types.
- [x] **`25_frontend/`** — the shared UI package (pure components, the data interface), the client (routing, cache, PWA), islands, the purity rule.
- [x] **`30_publishing/`** — how `agentks build` hands page data to the static renderer, the output layout, diagram-to-SVG.
- [x] **`35_libraries/`** — resolution, the lock, the machine cache, the `/_lib/` route and its sandbox.
- [x] **`40_collaboration/`** — the `yrs` documents, disk merge and echo suppression, access keys, network exposure.
- [x] **`45_versioning-and-migrations/`** — the version gate, the floor, docs migrations and library migrations, how scripts are fetched, how to author one.
- [x] **`50_releasing/`** — the one release stream, the installer, release notes, who tags.
- [ ] **Keep one source per fact.** Where a note in the migration issue is the design, the developer page describes the built result and does not repeat the argument.

## Guardrails
- Group rules in [180/00 overview](./00_overview.md). Developer docs explain mechanism, never how to use a feature.
- Describe the code as built. When the code differs from a design note, the page follows the code, and the difference is recorded in the note's issue.

## Done when
- The sections exist under `docs/data/dev-docs/` and render.
- A new contributor agent, given only the developer docs and the repository, can say which crate owns a rule, find the code, and run the gate.
- The protocol pages match the Rust types (checked by a generated table or a test).

# 02 Status and Result
Review. Every section this leaf lists is written in `dev-docs-2`, in ten folders, and each passes `agent-ks check section`. Releasing is a page of the versioning folder. Not done: the protocol pages are not yet checked against the Rust types by a generated table or a test, and nothing was rendered in the new engine.

## Result

**Overview, engine and caching** (the engine-architecture agent), 25 pages:

- [dev-docs-2/05 Overview](../../../../dev-docs-2/05_overview/01_overview.md): what agentks is and the rule that divides the work, the three states, a map of every section; the three repositories, the main repository's folders and what each app owns; the component map (diagram), the contracts, the one data interface, the processes; how a request flows (start-up, opening a page, a file change, a CLI command, publishing).
- [dev-docs-2/10 Engine](../../../../dev-docs-2/10_engine/01_overview.md): the 14 crates by layer and the rules every crate keeps; `LAYERS.toml`, the layer check and the trait pattern; the core crate's shared types; the error model (`ErrorRecord`, `ErrorKind`, the sink, fatal versus content, `ReplyErrorKind` and `SiteError::to_reply`); config (discovery, loading, aliases, the gate, `Affects` tags and the diff); content (the `NN_` grammar, settings, frontmatter, page kinds, slug collisions); the tracker model; the site index (hashes, routing, the resolver, the reference graph, incremental updates); the markdown pipeline; the theme compiler; the site object (open, answer, apply changes, save, the snapshot model); git and migrate; the CLI crate's shape.
- [dev-docs-2/20 Caching](../../../../dev-docs-2/20_caching/01_overview.md): every layer at a glance; keys and invalidation (the key functions, the settings fingerprint, the tag-to-work map, change propagation); the memory cache (byte budget, resident slots, single flight); the build cache on disk (layout, project key, entry header, atomic writes, `build-cache.json`); format versions and the read rule; the library store; the git dates cache (the walk, the cache file, the reconcile); cleanup and metrics.

**The other sections** (two other agents):

- [dev-docs-2/15 Server and protocol](../../../../dev-docs-2/15_server-and-protocol/01_overview.md): HTTP routes, the `/api` socket, requests, replies and pushes, the file watcher, file writes, the server lifecycle, stable ports and security. This covers the `20_protocol/` item.
- [dev-docs-2/25 Frontend](../../../../dev-docs-2/25_frontend/01_overview.md): the shared UI package, the data interface and generated types, the client and its router, islands, the WebSocket client, the browser cache, theming in components, performance and offline.
- [dev-docs-2/30 Collaboration](../../../../dev-docs-2/30_collaboration/01_overview.md): live documents, the sync protocol, disk merges, presence, access keys, network exposure, tracker live edits and attribution, diagram documents. This covers the `40_collaboration/` item.
- [dev-docs-2/35 Libraries](../../../../dev-docs-2/35_libraries/01_overview.md): the dep files, resolution and sync, manifests and lookup, search and the catalog, the `/_lib/` route and its sandbox.
- [dev-docs-2/45 Publishing](../../../../dev-docs-2/45_publishing/01_overview.md): the build pipeline, the static renderer and the output. This covers the `30_publishing/` item.
- [dev-docs-2/50 Versioning](../../../../dev-docs-2/50_versioning/01_overview.md): the version gate, the migrate runner, the script contract, library migrations and releases. This covers the `45_versioning-and-migrations/` and `50_releasing/` items.
- [dev-docs-2/55 Contributing](../../../../dev-docs-2/55_contributing/01_overview.md): where a change goes, setup, `ctl` and the gate, tests, `AGENTS.md` and the code rules, adding a crate or an app. This covers the `05_repository-and-workflow/` item.

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
- Decided (claude, 2026-10-01): links between the overview, engine and caching sections point at specific pages, not only at `01_overview.md`, because one agent writes both ends and `check link-form` confirms every target. Links to other agents' sections go through their `01_overview.md` only.
- Decided (claude, 2026-10-01): the engine section documents the 14 crates of `crates/LAYERS.toml`. The video compiler crate in the Rust-engine note is not in the workspace, and the video format is being revised, so it is left out.
- Decided (claude, 2026-10-01): the theme compiler gets its own engine page, because no developer section owns themes and the compiler lives in `agentks-render`.
- Decided (claude, 2026-10-01): the engine pages summarise the migrate runner and the new-crate checklist and point to the versioning and contributing sections, which own them in full, so each fact has one source.
- Decided (claude, 2026-10-01): the tracker model has its own engine page, split from the content-format page, because the two are separate subjects.
- Decided (claude, 2026-10-01): narration audio is left out of the caching pages. The cache crate has an `audio/` kind in the build cache, while the machine-home note puts audio in `~/.agentks/audio/`, and the video format is being revised.
- Decided (claude, 2026-10-01): this leaf stays `in-progress` after the overview, engine and caching sections, because it covers all of `dev-docs-2` and two other agents write the rest. It goes to `review` when every section is written.
- Decided (claude, 2026-10-01): code paths in the developer pages are written from the main repository's root and name the app and the crate, such as `apps/agentks-engine/crates/sync/src/docs.rs`, because a reader starts from the repository root. A table may keep short names when its column header carries the prefix.

# 05 Notes & Analysis

## Watch out
- The protocol and cache pages are the ones most likely to drift. Tie them to the code with a generated table or a test, not only prose.

## Where the code differs from the notes
Found while writing the engine and caching pages (2026-10-01). The pages follow the code. Each still needs recording in the owning note.
- The workspace has 14 crates; the [Rust engine note](../../notes/02_engine/03_rust-engine.md) section 01 says 15, with `crates/video`.
- `agentks-git` runs the `git` program; the [architecture note](../../notes/01_overview/03_architecture.md) section 07 still says libraries are fetched "through a Rust git library".
- Migration scripts may be Python (run with `uv`) or TypeScript and JavaScript (run with `bun`); the main repository's `AGENTS.md` says Python only.
- Narration audio: the cache crate stores it as `audio/` in the build cache, while the [machine home note](../../notes/02_engine/06_machine-home-and-build-cache.md) (decided 2026-10-01) puts it in `~/.agentks/audio/`.
- The index rolls up folder hashes itself (children in sidebar order, with settings files), while `agentks_cache::keys::folder_hash` does it a second way (sorted by name). Two implementations of one rule.
- The CLI's `run/ctx.rs` keeps its own 256 MB memory budget instead of reading `agentks_cache::MachineSettings`.
