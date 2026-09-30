---
title: "Phase 1: rendering"
status: in-progress
outcome: "The Rust engine and client render this repository's docs and tracker"
notes: "Starts when [the foundation](./10_foundation.md) is green"
who: "claude"
subtasks:
  - "[030/30 Config loader and settings schema — typed settings that declare what they affect](../../subtasks/030_rust-engine/30_config-loader-and-settings-schema.md)"
  - "[030/40 Site index — one view of the project: entries, URLs, folder hashes, references](../../subtasks/030_rust-engine/40_site-index.md)"
  - "[030/50 Markdown pipeline — today's stages in Rust, on a syntax tree, same output](../../subtasks/030_rust-engine/50_markdown-pipeline.md)"
  - "[030/60 Tracker loader — issues, anatomy sections, statuses and derived fields in Rust](../../subtasks/030_rust-engine/60_tracker-loader.md)"
  - "[030/70 Diagram, artifact and video sources — page data for the non-markdown page kinds](../../subtasks/030_rust-engine/70_diagram-and-artifact-sources.md)"
  - "[030/80 Page data interface — the one set of shapes the client and the static build read](../../subtasks/030_rust-engine/80_page-data-interface.md)"
  - "[030/85 Theme CSS compiler — one contract-checked stylesheet per project](../../subtasks/030_rust-engine/85_theme-css-compiler.md)"
  - "[030/90 Memory and concurrency — snapshots, bounded queues and a memory budget](../../subtasks/030_rust-engine/90_memory-and-concurrency.md)"
  - "[040/10 Cache keys and dependencies — one key function for every derived value](../../subtasks/040_caching/10_cache-keys-and-dependencies.md)"
  - "[040/20 Settings invalidation — each config key declares what it invalidates](../../subtasks/040_caching/20_settings-invalidation.md)"
  - "[040/30 In-memory cache — least-recently-used, with a byte budget](../../subtasks/040_caching/30_in-memory-cache.md)"
  - "[040/40 Build cache on disk — per project, per engine version, self-healing](../../subtasks/040_caching/40_build-cache-on-disk.md)"
  - "[040/50 Document cache by location — the project key and relative-path addressing](../../subtasks/040_caching/50_document-cache-by-location.md)"
  - "[040/70 Git dates cache — branch-keyed, eager, incremental issue `updated` dates](../../subtasks/040_caching/70_git-dates-cache.md)"
  - "[040/80 Cache format versions — every store says its format; a mismatch rebuilds](../../subtasks/040_caching/80_cache-format-versions.md)"
  - "[040/90 Clean and reset — `agentks cache status · clean <root>… · reset`](../../subtasks/040_caching/90_clean-and-reset.md)"
  - "[040/95 Cache metrics — hit rate, size and evictions, where people can see them](../../subtasks/040_caching/95_cache-metrics.md)"
  - "[050/10 HTTP and routes — axum, the route table and the embedded client](../../subtasks/050_server/10_http-and-routes.md)"
  - "[050/20 WebSocket API — the /api protocol: hello, requests, replies and pushes](../../subtasks/050_server/20_websocket-api.md)"
  - "[050/30 Watcher and push — from a change on disk to a pushed hash](../../subtasks/050_server/30_watcher-and-push.md)"
  - "[050/40 Lifecycle — start, attach, detach, shutdown, and machine-wide ps, stop and logs](../../subtasks/050_server/40_lifecycle-ps-stop-logs.md)"
  - "[050/45 Stable ports — one port per project, kept across restarts](../../subtasks/050_server/45_stable-ports.md)"
  - "[050/50 Security — localhost bind, Host and Origin checks, paths and the MIME boundary](../../subtasks/050_server/50_security.md)"
  - "[070/10 Rename to agentks — every user-facing name, in one change](../../subtasks/070_cli/10_rename-to-agentks.md)"
  - "[070/20 Content commands port — today's toolkit on the shared core](../../subtasks/070_cli/20_content-commands-port.md)"
  - "[070/30 Start and dev mode — `start`, `stop`, `ps`, `logs`, `doctor`](../../subtasks/070_cli/30_start-and-dev-mode.md)"
  - "[070/60 Cache commands — `cache status`, `cache clean <root>…`, `cache reset`](../../subtasks/070_cli/60_cache-commands.md)"
  - "[070/80 Theme commands — `theme tokens`, `theme css`, `theme eject`](../../subtasks/070_cli/80_theme-commands.md)"
  - "[080/20 Scaffold the shared UI package agentks-ui](../../subtasks/080_ui-and-client/20_shared-ui-package.md)"
  - "[080/30 Client shell and real-path routing](../../subtasks/080_ui-and-client/30_client-shell-and-routing.md)"
  - "[080/40 The WebSocket client and DataSource over /api](../../subtasks/080_ui-and-client/40_websocket-client.md)"
  - "[080/50 Islands: the interactive parts](../../subtasks/080_ui-and-client/50_islands.md)"
  - "[080/60 PWA install and mobile shell](../../subtasks/080_ui-and-client/60_pwa-and-mobile.md)"
  - "[080/70 Embed the client in the binary, and the dev proxy](../../subtasks/080_ui-and-client/70_embed-in-binary.md)"
  - "[090/10 UI state kept per project and per browser](../../subtasks/090_frontend-performance/10_ui-state-persistence.md)"
  - "[090/20 The browser data cache in IndexedDB](../../subtasks/090_frontend-performance/20_data-cache-indexeddb.md)"
  - "[090/30 Service worker and offline reading](../../subtasks/090_frontend-performance/30_service-worker-and-offline.md)"
  - "[090/40 Code splitting and lazy islands](../../subtasks/090_frontend-performance/40_code-splitting-and-lazy-islands.md)"
  - "[090/50 Prefetch page data](../../subtasks/090_frontend-performance/50_prefetch.md)"
  - "[090/60 Large-list virtualisation](../../subtasks/090_frontend-performance/60_large-list-virtualisation.md)"
  - "[090/70 Render performance: navigation and in-place redraws](../../subtasks/090_frontend-performance/70_render-performance.md)"
  - "[100/10 Theme contract, built-in theme CSS and public hooks](../../subtasks/100_layouts/10_theme-contract-and-css.md)"
  - "[100/15 Docs layouts: default and compact](../../subtasks/100_layouts/15_docs-layouts.md)"
  - "[100/20 Blog layouts: index and post](../../subtasks/100_layouts/20_blog-layouts.md)"
  - "[100/25 Issues layouts: tracker index, issue detail and sub-documents](../../subtasks/100_layouts/25_issues-layouts.md)"
  - "[100/30 Artifact pages, embeds and HTML fragments](../../subtasks/100_layouts/30_artifact-pages.md)"
  - "[100/35 Diagram pages and diagram embeds](../../subtasks/100_layouts/35_diagram-pages.md)"
  - "[100/40 Video pages: layout and player island](../../subtasks/100_layouts/40_video-pages.md)"
  - "[100/45 Custom pages: home, info and countdown](../../subtasks/100_layouts/45_custom-pages.md)"
  - "[100/50 Navbar and footer](../../subtasks/100_layouts/50_navbar-and-footer.md)"
  - "[100/55 Responsive layouts: breakpoints and mobile checks](../../subtasks/100_layouts/55_responsive.md)"
  - "[100/65 Layout variations: what survives, on demand](../../subtasks/100_layouts/65_layout-variations.md)"
---

`agentks start` renders every page of this repository's docs and tracker. The parity proof runs in [stage 38](./38_testing.md).

# 01 To Do
- [ ] **Engine core:** config, site index, markdown pipeline, tracker, diagram and artifact sources, the page data interface, theme CSS (group 030).
- [ ] **Caching** on the server, keyed by content and settings (group 040).
- [ ] **Server:** routes, `/api`, watcher, lifecycle, stable ports, security (group 050).
- [ ] **CLI:** the rename, the ported content commands, `start`, cache and theme commands (group 070).
- [ ] **UI and client:** the shared package, shell, WebSocket client, islands, PWA, embedding (group 080), within the performance budgets (group 090).
- [ ] **Layouts** for every content type (group 100).
- [ ] **Basic tests only** while building: unit tests and a little integration testing, under 10 seconds for the whole run.

# 02 Status and Result
Not started.

# 03 References
- [The plan overview](./overview.md)
- The design: [notes index](../../notes/01_overview/01_index.md)

# 04 Decisions
- See [the plan overview](./overview.md#04-decisions).

# 05 Notes & Analysis
## 01 Scope
The `subtasks:` list above is the whole scope of this stage. Each subtask is written for a cold start: read its references first.
