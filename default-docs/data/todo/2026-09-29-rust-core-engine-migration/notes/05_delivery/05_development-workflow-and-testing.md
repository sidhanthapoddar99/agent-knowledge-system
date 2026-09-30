---
title: "Development workflow and testing (state 1)"
---

State 1 is the agentks team developing agentks itself. The Rust engine runs from the working tree, and the client runs in Vite's dev server with hot reload. Vite passes WebSocket requests on `/api` through to the engine, so the browser sees one origin, exactly as it does with the installed binary. Development builds of the binary go to `data/builds/`, which git ignores. Inside the repository mise puts that folder first on the path, so `agentks` there means the working-tree build, while everywhere else it means the installed release. The repository follows the project-setup guide, so `ctl` is its one entrypoint and `ctl gate` is what "green" means. The engine is proven correct against today's Astro engine by route parity, a rendered-content comparison in a headless browser, and screenshots of every layout, run on this repository's docs, its tracker and the default library. Tooling that needs the source or a dev server stays in the repository and never ships.

# 03 References

- [Repositories and layout](./01_repositories-and-layout.md) — the folders this note works in.
- [Architecture](../01_overview/03_architecture.md) and [flows](../01_overview/04_flows.md) — what each part does at run time.
- [Sync engine and server](../02_engine/04_sync-engine-and-server.md) — the `/api` WebSocket the dev proxy forwards.
- [Client application](../03_frontend/02_client-application.md) and [shared UI package](../03_frontend/01_shared-ui-package.md) — what runs in the Vite dev server.
- [Distribution and install](./04_distribution-and-install.md) — how a tested build becomes a release.
- [Brainstorm: the repositories and three states](../../brainstorm/02_future-stages/12_repositories-and-three-states.md) and [open question 06](../../brainstorm/01_initial-discussion/16_open-questions.md).
- Today's checks, reworked for the new repository: [route parity](../../../../../../scripts/checks/check-route-parity.mjs), [rendered links](../../../../../../scripts/checks/check-links.mjs), [theme contract](../../../../../../scripts/checks/check-theme-contract.mjs), [incremental staleness](../../../../../../scripts/checks/check-incremental-staleness.mjs), [release contracts](../../../../../../scripts/checks/check-release-contracts.mjs). Today's mise setup: [mise.toml](../../../../../../mise.toml).
- The tracker fixture: [2026-07-01-demo-issue-anatomy-showcase](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md).

# 04 Decisions

- Decided (sidhantha, 2026-09-29): in development, the Vite dev server runs the client and proxies to the Rust engine. The installed binary serves the embedded client itself.
- Decided (claude, delegated by sidhantha, 2026-09-29): the new engine is proven by route parity, a rendered-content comparison in a headless browser, and screenshots of each layout. The user's own use is the final check.
- Decided (sidhantha, 2026-09-29): output may differ from today's only in small visual improvements. Routes, heading IDs, links and text must match exactly.
- Decided (sidhantha, 2026-09-30): development builds go to `data/builds/`, ignored by git. mise points `agentks` at them inside the repository, so the working tree overrides the installed release there.
- Decided (sidhantha, 2026-09-30): the new repository is set up with the project-setup guide.
- Decided (sidhantha, 2026-09-30): the first launch step is building the engine, the client and the default library, tested end to end.
- Proposed (claude, 2026-09-30), not yet agreed: the `ctl` verbs, the gate rungs and the test layers in sections 03 to 06; keeping a second name for the installed release inside the repository.

# 05 Notes & Analysis

## 01 The three states, and where this one sits

| | State 1: developing agentks | State 2: using agentks | State 3: publishing |
|---|---|---|---|
| Who | The agentks team | Anyone writing docs, issues, artifacts | Anyone putting docs online |
| Engine | From the working tree | The installed binary | The installed binary, `agentks build` |
| Client | Vite dev server, hot reload | Embedded in the binary | The static renderer, run once |
| Served by | Vite (client) and the engine (data) | The binary's local server | nginx, a static host or a CDN |
| Selected by | mise, inside the repository | The installed `agentks` | `agentks build` |

**Where a tool belongs.** A tool that needs the agentks source, a build or a dev server is state 1 tooling: it stays in the repository and never ships. A tool that needs only a project's files belongs in the binary, because every user has files. This is today's "three stages" rule in [AGENTS.md](../../../../../../AGENTS.md), renamed.

## 02 Running agentks from the working tree

```
ctl dev                 # engine (cargo, watch mode) + Vite dev server, one command
  engine   http://127.0.0.1:<engine port>    WebSocket at /api
  vite     http://127.0.0.1:<client port>    proxies /api to the engine
```

- The Vite config proxies `/api` (with WebSocket upgrade) to the engine. The browser talks to one origin, so no CORS and the client code is the same in every state.
- The engine serves the project given by `--config-dir` (default: the repository's `docs/`).
- Editing a Rust file restarts the engine; the client reconnects and refetches only what changed. Editing a component hot-reloads in the browser.
- `ctl build` writes the full binary, with the client and the static renderer embedded, into `data/builds/`.

**mise inside the repository (claude, proposed):**

```toml
[env]
_.path = ["data/builds"]          # agentks = the working-tree build here

[tasks.agentks-release]
run = "<path of the installed agentks>"   # the installed release, still reachable
```

Today the working-tree binary has its own name, `agent-ks-dev`, so a maintainer can run both and compare. The new setup reverses it: `agentks` is the working-tree build inside the repository, and a second name reaches the installed release.

## 03 `ctl` (claude, proposed)

| Verb | Does |
|---|---|
| `ctl setup` | Installs toolchains (Rust, Bun) and dependencies |
| `ctl dev` | Engine and Vite dev server together |
| `ctl build` | The release binary into `data/builds/` |
| `ctl test` | Every test layer below that needs no browser |
| `ctl e2e` | The end-to-end and parity checks, with a headless browser |
| `ctl gate` | The gate: lint, typecheck, test, check. Green means all four passed |
| `ctl release-check` | The release contract: version, note, workflow matrix. Publishes nothing |

## 04 The gate

The project-setup guide's four-rung floor, filled in for this repository:

| Rung | Rust (`apps/agentks-engine`) | TypeScript (`apps/packages/agentks-ui`, `apps/agentks-client`, `apps/agentks-ssg`, `apps/agentks-homepage`) |
|---|---|---|
| lint | `cargo fmt --check`, `cargo clippy -D warnings` | The linter each app ships with |
| typecheck | (the compiler) | `tsc --noEmit` per app. Today's engine has no typecheck script; the new repository has one from day one |
| test | `cargo test` | Unit tests per package |
| check | The theme contract, the release contract, `agentks check` on `docs/` | The purity check on the shared package (below) |

Every rung exits 0 only when its rule was proved. A skipped rung is red, not green.

## 05 Test layers

| Layer | What it proves | Runs on |
|---|---|---|
| Rust unit tests | Parsing, links, frontmatter, the tracker rules, ordering, URL derivation, the version gate | Small fixtures inside the crate |
| Rust integration tests | The CLI's commands and exit codes; the WebSocket messages for a page, a sidebar, the issues index; push after a file change; `agentks build` output | Temporary project folders |
| Component tests | Each layout renders the expected markup from given data | The shared package |
| Purity check | The shared package imports nothing browser-only while rendering, and never the WebSocket | A static scan plus rendering every component under Bun with no DOM |
| Route parity | Every route today's Astro engine serves, the new engine serves too | This repository's docs and tracker, then the new `docs/` |
| Rendered content | For every page, the rendered main content matches today's: headings and their IDs, links and their targets, text, tables, code | Both engines, a headless browser, whitespace and attribute order normalised |
| Screenshots | Each layout in light and dark mode, reviewed by eye for "nothing drastic" | One page per layout and style |
| Static build | `agentks build` output matches what the local client shows, page by page | The same corpus, from Phase 3 |
| End to end with the default library | A fresh `agentks init`, `dep.yaml` naming the default library, `agentks install`, `agentks start`, every element the library lists resolved on a video page and an artifact page | A temporary project and the library repository at a known tag |
| Migration | The 1.0.0 docs migrations bring 0.x content to 1.0.0, and the result passes route parity | This repository's docs and tracker, then fixtures for every 0.x format |

**The corpus.** This repository's docs and tracker (about 1,300 pages), the tracker fixture [2026-07-01-demo-issue-anatomy-showcase](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md) for the issues layout, and first-class diagram and artifact pages with their sidecars. The comparison uses the rendered page, not raw server HTML, because the local client is a single-page app.

**The user's own use is the final check.** Tests prove parity; the maintainer using the new engine daily proves it is usable.

## 06 CI

| Workflow | Runs on | Does |
|---|---|---|
| Gate | Every push and pull request | `ctl gate` on Linux |
| Parity | Pull requests that touch the engine, the UI package or the client | `ctl e2e` against the corpus |
| Release | A pushed `vX.Y.Z` tag | The gate on every platform, then the release builds ([distribution](./04_distribution-and-install.md)) |
| Website | Pushes to the default branch that touch `docs/` or `apps/agentks-homepage` | Builds and deploys the website ([hosting](./06_deployment-and-hosting.md)) |

## 07 What carries over from today's checks

| Today | In the new repository |
|---|---|
| [check-route-parity.mjs](../../../../../../scripts/checks/check-route-parity.mjs): dev and build resolve the same URL | Becomes the old-against-new engine comparison during Phase 1, then the local-against-built comparison in Phase 3 |
| [check-links.mjs](../../../../../../scripts/checks/check-links.mjs): rendered links resolve | Runs against the engine's WebSocket data and the static build |
| [check-theme-contract.mjs](../../../../../../scripts/checks/check-theme-contract.mjs): the theme contract matches what layouts read | Kept, reading the shared package's CSS |
| [check-incremental-staleness.mjs](../../../../../../scripts/checks/check-incremental-staleness.mjs): the incremental build did not lie | Becomes a test that edits a file (and a file it embeds) and checks the pushed hashes and the refetched page |
| [check-release-contracts.mjs](../../../../../../scripts/checks/check-release-contracts.mjs): three release streams | Reduced to one stream: the installer |

## 08 Open

- Which UI framework the client and the shared package use, which decides the component-test and purity-check tools. See [open questions and risks](../01_overview/05_open-questions-and-risks.md).
