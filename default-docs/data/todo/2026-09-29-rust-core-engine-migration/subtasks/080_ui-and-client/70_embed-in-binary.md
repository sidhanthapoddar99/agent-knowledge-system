---
title: "Embed the client in the binary, and the dev proxy"
status: in-progress
---

One `agentks` binary carries exactly one client version, so the engine and the client always match, and pinning an older agentks with mise pins its client too. This leaf wires the Vite build into the engine's build: hashed files compressed and embedded, served from memory with the right cache headers. It also sets up state 1, where the Vite dev server runs the client with hot reload and passes everything else to the Rust engine running from the working tree.

# 01 To Do
- [x] **Vite build output** to `apps/agentks-client/dist/` with content-hashed file names under `client/` (so the server's `/client/*` route maps one to one), and `index.html` at the root.
- [x] **Embedding in the engine build.**
    - [x] The engine's `build.rs` (or a `ctl build` step that runs first) runs `bun run build` in the client when its sources changed, then embeds `dist/` into the binary (for example with `include_dir` or `rust-embed`), storing each file pre-compressed with Brotli and gzip.
    - [x] A release build fails if `dist/` is missing or older than the client sources, so a binary can never ship a stale client.
- [x] **Serving** (with [050/10](../050_server/10_http-and-routes.md)):
    - [x] `/client/*` hashed files: `Cache-Control: public, max-age=31536000, immutable`, with `Content-Encoding` chosen from `Accept-Encoding`.
    - [x] `index.html` for every non-reserved path: `Cache-Control: no-cache`, so a new binary's client shows on the next load.
    - [x] The `ETag` of each embedded file is its content hash.
- [x] **Dev mode (state 1).** `apps/agentks-client/vite.config.ts` proxies `/api` (with `ws: true`), `/artifacts`, `/content-assets`, `/assets`, `/_lib`, `/manifest.webmanifest` and the theme CSS route to `ENGINE_URL` (default the engine's port from `agentks start --dev`). The engine in dev mode serves data and files only, never the embedded client ([070/30](../070_cli/30_start-and-dev-mode.md)).
- [x] **`ctl dev`** starts both: the engine from the working tree in dev mode and the Vite dev server, with one Ctrl-C stopping both ([010/40](../010_project-setup/40_ctl-and-gate.md)).
- [ ] **Size check.** Record the compressed size of the embedded client in the release notes and fail `ctl gate` if the start-up bundle exceeds the budget in [090/00](../090_frontend-performance/00_overview.md).

## Guardrails
- One client at a time: in dev mode the engine never serves an embedded copy, so there is no stale client to confuse.
- The embedded files are read-only and served from memory; no temp extraction to disk.

## Done when
- `cargo build --release` produces a binary that, run as `agentks start` on this repository's docs, serves the client with no other files on disk.
- Changing a client source file and rebuilding changes the embedded hashes; a stale `dist/` fails the release build.
- `ctl dev` gives hot reload of a layout change without restarting the engine.

# 02 Status and Result
In progress. Embedding, serving and the dev proxy are built and tested; left: the end-to-end Done-when checks (they need `agentks-site` to open a project and `docs/` to exist), and the compressed size in the release notes (no release notes exist yet).

## Result
- **Embedding:** the server crate's build script (main repository, `apps/agentks-engine/crates/server/build.rs`) reads `apps/agentks-client/dist/`, stores each file with its brotli (quality 11) and gzip forms when smaller, and generates the list `src/client/embedded.rs` includes. `ClientBundle::embedded()` now returns `Result`: `ServerError::Client` when the binary has no client or holds a file the route table never reaches.
- **Release guard:** `cargo check --release -p agentks-server` fails with `cargo::error` when `dist/` is missing or older than the client sources (checked by hand: a touched `agentks-ui/src/index.ts` fails, a fresh `ctl build client` passes, a moved-away `dist/` fails). Debug builds without `dist/` embed nothing and stay fresh between builds.
- **Serving:** `/client/*` immutable, `index.html` `no-cache`, `Vary: accept-encoding`, `ETag` = blake3 content hash (`"<hash>"`, `"<hash>-br"`, `"<hash>-gzip"`), `304` on `If-None-Match`. The app CSP now carries the `sha256` of `index.html`'s inline pre-paint script; without it `script-src 'self'` blocked that script. `.map` is served as `application/json`.
- **Vite:** `build.assetsDir: 'client'`; the proxy uses `changeOrigin: true` (Host rewritten, which the engine's Host check needs) and keeps `Origin` (`rewriteWsOrigin: false`).
- **Dev origin:** with `--dev-origin` the server loads no client; the origin must be `scheme://host[:port]` (`valid_origin`), else `ServerError::DevOrigin`.
- **Checks:** `ctl build engine` = `ctl build client` (types, vite build, start-up budget: JS 17.8 KB gz of 120 KB, CSS 1.1 KB of 40 KB, whole bundle 70.8 KB gz) → `cargo build` → `AGENTKS_EXPECT_CLIENT=1 cargo test -p agentks-server --test embedded` (serves the embedded client from an empty temp folder, decodes the br and gzip forms, checks 304) → schema. About 8 s warm.
- **Tests added:** `tests/embedded.rs` (3 tests, 0.02 s), unit tests in `src/client/` and `security.rs` (7). `./ctl gate` green, 11 s warm.
- **Browser check:** the embedded client served by a temporary hand-built server loaded in headless Chromium, ran its inline script under the CSP (`data-theme` set) and reached the socket.
- **Left:** Done when 1 and 3 need a site that opens; the release-notes size line belongs with [160/10](../160_distribution/10_installer-and-release-workflow.md); the budget runs in `ctl build client`, not the gate, until the gate has a build rung.

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
- Decided (claude, 2026-10-01): the server crate's `build.rs` compresses and embeds `dist/`; `ctl build engine` runs the Vite build first. The build script does not run Bun, because that would tie every `cargo check` in the gate to Bun and to a client rebuild.
- Decided (claude, 2026-10-01): staleness is judged by file times (the newest client source against `dist/client-build.txt`), because one piece of code, the build script, can then judge it; a content-hash stamp would need the same file walk written twice, in TypeScript and in Rust.
- Decided (claude, 2026-10-01): a debug build without `dist/` embeds nothing and `ClientBundle::embedded()` returns an error, never an empty client, because an empty client that looks like a real one is a wrong answer. Before the first client build the build script watches `apps/agentks-client/` instead of the missing `dist/`, because a missing watched path makes Cargo rebuild on every run.
- Decided (claude, 2026-10-01): each form of an embedded file has its own `ETag` (the content hash, with `-br` or `-gzip` added), because each form is a different representation and a strong `ETag` must differ between them.
- Decided (claude, 2026-10-01): the app CSP allows `index.html`'s inline scripts by `sha256` hash, computed from the embedded `index.html` when the bundle loads, because the UI package's pre-paint theme script is inline and `script-src 'self'` blocked it.
- Decided (claude, 2026-10-01): source maps are embedded and served (about 40 KB compressed), because the maintainer debugging an installed client needs them.
- Decided (claude, 2026-10-01): `/manifest.webmanifest` and `/sw.js` are not proxied in dev, because the server serves them from the client bundle; in dev they belong to Vite once the PWA work adds them.
- Decided (claude, 2026-10-01): the start-up budget counts the entry chunk with its static imports plus the default docs, navbar and footer layouts, and runs in `ctl build client`; the gate has no build rung, so it cannot check a bundle it does not build.

# 05 Notes & Analysis
## Watch out
- Cargo does not know about the client's sources. Make the build script print `cargo:rerun-if-changed` for the client's `src/`, `index.html`, `package.json` and `vite.config.ts`, or the embedded client goes stale in incremental builds.
- CI must install Bun before `cargo build`, or the build script fails with an unclear error; make it fail with a clear one.
