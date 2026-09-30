---
title: "Embed the client in the binary, and the dev proxy"
status: open
---

One `agentks` binary carries exactly one client version, so the engine and the client always match, and pinning an older agentks with mise pins its client too. This leaf wires the Vite build into the engine's build: hashed files compressed and embedded, served from memory with the right cache headers. It also sets up state 1, where the Vite dev server runs the client with hot reload and passes everything else to the Rust engine running from the working tree.

# 01 To Do
- [ ] **Vite build output** to `apps/agentks-client/dist/` with content-hashed file names under `client/` (so the server's `/client/*` route maps one to one), and `index.html` at the root.
- [ ] **Embedding in the engine build.**
    - [ ] The engine's `build.rs` (or a `ctl build` step that runs first) runs `bun run build` in the client when its sources changed, then embeds `dist/` into the binary (for example with `include_dir` or `rust-embed`), storing each file pre-compressed with Brotli and gzip.
    - [ ] A release build fails if `dist/` is missing or older than the client sources, so a binary can never ship a stale client.
- [ ] **Serving** (with [050/10](../050_server/10_http-and-routes.md)):
    - [ ] `/client/*` hashed files: `Cache-Control: public, max-age=31536000, immutable`, with `Content-Encoding` chosen from `Accept-Encoding`.
    - [ ] `index.html` for every non-reserved path: `Cache-Control: no-cache`, so a new binary's client shows on the next load.
    - [ ] The `ETag` of each embedded file is its content hash.
- [ ] **Dev mode (state 1).** `apps/agentks-client/vite.config.ts` proxies `/api` (with `ws: true`), `/artifacts`, `/content-assets`, `/assets`, `/_lib`, `/manifest.webmanifest` and the theme CSS route to `ENGINE_URL` (default the engine's port from `agentks start --dev`). The engine in dev mode serves data and files only, never the embedded client ([070/30](../070_cli/30_start-and-dev-mode.md)).
- [ ] **`ctl dev`** starts both: the engine from the working tree in dev mode and the Vite dev server, with one Ctrl-C stopping both ([010/40](../010_project-setup/40_ctl-and-gate.md)).
- [ ] **Size check.** Record the compressed size of the embedded client in the release notes and fail `ctl gate` if the start-up bundle exceeds the budget in [090/00](../090_frontend-performance/00_overview.md).

## Guardrails
- One client at a time: in dev mode the engine never serves an embedded copy, so there is no stale client to confuse.
- The embedded files are read-only and served from memory; no temp extraction to disk.

## Done when
- `cargo build --release` produces a binary that, run as `agentks start` on this repository's docs, serves the client with no other files on disk.
- Changing a client source file and rebuilding changes the embedded hashes; a stale `dist/` fails the release build.
- `ctl dev` gives hot reload of a layout change without restarting the engine.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `apps/agentks-client/vite.config.ts`, `apps/agentks-engine` (build script and the server's static route).
- **Read first:** [the client application](../../notes/03_frontend/02_client-application.md) (sections 09, 10), [the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) (sections 01, 02), [development workflow and testing](../../notes/05_delivery/05_development-workflow-and-testing.md) (sections 02, 03), [distribution and install](../../notes/05_delivery/04_distribution-and-install.md).
- **Depends on:** [30](./30_client-shell-and-routing.md), [050/10 HTTP and routes](../050_server/10_http-and-routes.md), [010/30 toolchain pins](../010_project-setup/30_toolchain-pins.md), [010/40 ctl and gate](../010_project-setup/40_ctl-and-gate.md).
- **Unblocks:** [160/10 installer and release workflow](../160_distribution/10_installer-and-release-workflow.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the frontend bundle is embedded in the binary.
- Decided (sidhantha, 2026-09-29): in dev, the Vite dev server is the proxy in front of Rust; installed, the Rust server serves the embedded build.
- Decided (sidhantha, 2026-09-30): only the compressed installer is released, carrying the engine and the embedded Vite build ([distribution and install](../../notes/05_delivery/04_distribution-and-install.md)).

# 05 Notes & Analysis
## Watch out
- Cargo does not know about the client's sources. Make the build script print `cargo:rerun-if-changed` for the client's `src/`, `index.html`, `package.json` and `vite.config.ts`, or the embedded client goes stale in incremental builds.
- CI must install Bun before `cargo build`, or the build script fails with an unclear error; make it fail with a clear one.
