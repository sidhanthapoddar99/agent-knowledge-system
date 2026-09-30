---
title: "HTTP and routes — axum, the route table and the embedded client"
status: in-progress
---

The server answers every HTTP request of a project: the client app at any page path, the client's own files, the compiled theme CSS, the project's assets, artifacts and library elements. This leaf builds the axum application and its route table, serves the client bundle embedded in the binary, and serves files from disk with correct types and cache headers. The WebSocket at `/api` is [050/20](./20_websocket-api.md); the safety rules every route obeys are [050/50](./50_security.md).

# 01 To Do
- [ ] **The route table**, exactly:

      | Route | Serves | Cache |
      |---|---|---|
      | `/api` | WebSocket upgrade only ([050/20](./20_websocket-api.md)) | — |
      | `/theme.<hash>.css` | The compiled theme CSS ([030/85](../030_rust-engine/85_theme-css-compiler.md)) | `immutable`, one year |
      | `/client/*` | The client's scripts, CSS, fonts, from the embedded bundle | `immutable`, one year (hashed names) |
      | `/assets/*` | Framework chrome named from config: logo, favicon | `no-cache` + ETag |
      | `/content-assets/*` | Files a page refers to, from the content sections only | `no-cache` + ETag |
      | `/artifacts/*` | `.html` artifact pages (the one place project HTML is `text/html`) | `no-cache` + ETag |
      | `/_lib/<alias>/<element>` | A library element (Phase 2; handler from [120/50](../120_libraries/50_lib-route-and-sandbox.md)) | `immutable` for a locked commit, `no-cache` for a local library |
      | `/manifest.webmanifest`, `/sw.js` | PWA files from the bundle ([080/60](../080_ui-and-client/60_pwa-and-mobile.md)) | `no-cache` |
      | everything else | The client's `index.html` | `no-cache` |

- [ ] **Reserved prefixes.** `api`, `client`, `assets`, `content-assets`, `artifacts`, `_lib`, `theme.*` are reserved. The manifest builder ([030/80](../030_rust-engine/80_page-data-interface.md)) must refuse a section whose base URL collides; add the list to the core as one constant both use.
- [ ] **The embedded client.** Include the `vite build` output at compile time (for example with `rust-embed` or `include_dir`), stored pre-compressed (brotli and gzip). Serve by `Accept-Encoding`. `index.html` is revalidated every time, so a new binary's client shows up on the next load.
- [ ] **Development mode.** When the binary runs in state 1 (a flag or the absence of an embedded bundle in a dev build), do not serve `/client/*` or `index.html`; the Vite dev server serves them and proxies the rest here ([080/30](../080_ui-and-client/30_client-shell-and-routing.md), [170/00 testing](../170_testing/00_overview.md)).
- [ ] **File serving from disk:** stream large files; support `Range` requests (audio and video pages need seeking); ETag from the index's content hash, never from the modification time; `304` on `If-None-Match`.
- [ ] **Content types** from the allowlist in [050/50](./50_security.md). `.html` outside `/artifacts/` and `/_lib/` is never `text/html`.
- [ ] **The not-found page** is the client's job: the server returns `index.html` with status `200` for unknown page paths, and the client shows its not-found view, because routes live in the manifest. Unknown files under a file route return a real `404`.
- [ ] **A health probe** used by [050/40](./40_lifecycle-ps-stop-logs.md): `GET /api` without upgrade returns `426 Upgrade Required` with a JSON body `{ "agentks": "<version>", "project": "<key>" }`. That identifies an agentks server of this project without a second route.
- [ ] **Graceful shutdown** hook for [050/40](./40_lifecycle-ps-stop-logs.md).

## Guardrails
- No templates and no server-side page rendering. The server sends the client app and data only (sidhantha, 2026-09-29).
- Colocated document assets are served from `/content-assets/<path>`; framework assets from `/assets/`. Never mix the two ([AGENTS.md of this repository, "Two asset folders"](../../../../../../AGENTS.md)).

## Done when
- A route test hits every row of the table and checks status, content type and cache headers.
- A request for `/docs/some/page` returns `index.html`; `/content-assets/missing.png` returns `404`.
- `curl -H 'Range: bytes=0-99'` on an audio file returns `206` with 100 bytes.
- The binary serves the client with no files on disk besides the project (run it from an empty temp folder with `--config-dir`).

# 02 Status and Result
In progress: every route is built and tested; left is including the Vite build in the binary, which waits for the client app (080/70).

## Result
- The route table in `src/http.rs`: `/api` (WebSocket, and the `426` probe without an upgrade), `/theme.<hex>.css` (immutable; another hash is `404`), `/client/*` (immutable), `/assets/*`, `/content-assets/*`, `/artifacts/*` (all `no-cache` + ETag), `/_lib/*` (`501` with the library CSP until 120/50), `/manifest.webmanifest` and `/sw.js` (`no-cache`), and `index.html` with `200` for every other path. Only `GET` and `HEAD`; other methods get `405`.
- Reserved prefixes come from `agentks_core::RESERVED_SEGMENTS` and `RESERVED_ROOT_FILES`, the one constant the manifest builder also uses. A reserved prefix without a file (`/assets`, `/api/x`) is a real `404`.
- `src/files.rs`: files streamed in 64 KB chunks, one `Range` (`206`, `416`), `If-Range`, ETag from the BLAKE3 content hash (cached per path by length and time, and dropped by the watcher on every event), `304` on `If-None-Match`.
- `src/client.rs`: `ClientBundle` with pre-compressed forms, served by `Accept-Encoding` (brotli, gzip, then plain). `ClientBundle::embedded()` returns development mode until 080/70 fills it: no `/client/*` and no `index.html`, and the hello says `client_build: "dev"`.
- Graceful shutdown: `ServerHandle::shutdown()`.
- Tests: `tests/server.rs` `every_route_answers_with_its_type_and_cache_rule` and `development_mode_serves_no_client`, on a real localhost socket with a hand-built backend.
- Left: include the Vite build at compile time (080/70), then the "empty temp folder" check of Done when.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/server/`.

**Read first:**
- [Sync engine and server, sections 01, 02 and 07](../../notes/02_engine/04_sync-engine-and-server.md) — serving by state, routes, security.
- [Client application, sections 03, 09, 10](../../notes/03_frontend/02_client-application.md) — routing, the embedded build, dev mode.
- [Distribution and install, section 01](../../notes/05_delivery/04_distribution-and-install.md) — what is inside the binary.
- Today's routes, for behaviour to keep: [artifacts](../../../../../../agent-ks-engine/src/pages/artifacts), [assets](../../../../../../agent-ks-engine/src/pages/assets), [content-assets](../../../../../../agent-ks-engine/src/pages/content-assets), [the MIME map](../../../../../../agent-ks-engine/src/pages/lib/mime.ts).

**Depends on:** [030/80 page data interface](../030_rust-engine/80_page-data-interface.md), [080/70 embed in binary](../080_ui-and-client/70_embed-in-binary.md).
**Unblocks:** [050/20](./20_websocket-api.md), [050/40](./40_lifecycle-ps-stop-logs.md), [120/50](../120_libraries/50_lib-route-and-sandbox.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): one server; `/api` for the WebSocket, `/**` for the frontend.
- Decided (sidhantha, 2026-09-29): the frontend bundle is embedded in the binary.
- Proposed (claude, 2026-09-30), adopted here: the route table and the `.html` boundary of the server note.
- Decided (claude, 2026-09-30): the health probe is `GET /api` without upgrade, answering `426` with the version and project key.
- Decided (claude, 2026-10-01): the server reaches the engine only through a `Backend` trait in `agentks-server`, which `Site` implements, because `Site` cannot be constructed yet and the transport must be testable with a hand-built backend; the trait is also the seam for any later embedder.
- Decided (claude, 2026-10-01): every non-`/api` path goes through one dispatch function that reads the raw URL path, because axum's path extractors decode, and a file route must decode exactly once.
- Decided (claude, 2026-10-01): the theme URL is `/theme.<64 hex digits>.css` (`Hash::to_hex`, no `b3:`), and a hash that is not the current theme's is `404`, because answering an old immutable URL with today's CSS would poison browser caches.
- Decided (claude, 2026-10-01): with no embedded client the server answers page paths with a plain `404` that names the Vite dev server, because serving nothing silently would look like a broken app.

# 05 Notes & Analysis

## Watch out
- `/assets/` in a document body is a content error (link-form rejects it); the server still serves it for config-named chrome. Do not "help" by resolving document links here.
- Serving `index.html` for unknown paths means a typo in a file route would silently render the app. Keep the file routes strict (`404`).
