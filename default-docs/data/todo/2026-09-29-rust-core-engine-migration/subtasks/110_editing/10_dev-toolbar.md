---
title: "The dev toolbar: the bar, Edit and the tools"
status: open
---

The dev toolbar is a slim bar over every page of the local client, like Astro's dev toolbar. It holds the Edit option first, then the developer tools rebuilt from today's six Astro toolbar apps. It exists only in the client app, talks to Rust over the same `/api` WebSocket, and is left out of published sites at build time rather than hidden. This leaf builds the bar and the tools, and takes over the open work of [2025-06-25-dev-toolbar-enhancements](../../../2025-06-25-dev-toolbar-enhancements/issue.md).

# 01 To Do
- [ ] **The bar** in `apps/agentks-client/src/devtoolbar/`: bottom of the screen, one button per tool, Edit first; one panel open at a time above the bar; Escape closes it; collapsible to a small handle; on a phone a single button opening the tool list. State (collapsed, last tool) in UI state ([090/10](../090_frontend-performance/10_ui-state-persistence.md)). Own class prefix; theme variables only.
- [ ] **Edit** — enabled on pages the manifest marks `editable`, disabled with a tooltip saying why elsewhere, and while offline ([090/30](../090_frontend-performance/30_service-worker-and-offline.md)). On: loads the editor chunk and hands over to [20](./20_edit-in-place.md); shows the raw / live preview switch and the save status (saved, saving, failed) beside it.
- [ ] **Problems** (today's error logger, rebuilt): Rust runs the same checks as the CLI (frontmatter, links, prefixes, config) and pushes results; the tool lists them by file and line for the current page or the whole project. Messages: pull `dev.problems`, push on change.
- [ ] **Cache** (today's cache inspector and browser cache, folded together): the server side — the index and build cache for this project, entry counts and sizes by kind, a clear button for this project's build cache (`dev.cache.stats`, `dev.cache.clear`); the browser side — IndexedDB page cache, service worker asset cache and UI state by kind, each clearable. Absorbs the dev-toolbar issue's cache inspector subtask (02) and "cache status viewer", re-targeted from Yjs rooms and Astro caches to the Rust caches and the server's open `yrs` documents.
- [ ] **System** (today's system metrics, kept small): the Rust server's memory and CPU and the page's memory where the browser exposes it, plus the last ten navigation and redraw timings ([090/70](../090_frontend-performance/70_render-performance.md)). Pull `dev.metrics` about every two seconds while the panel is open, nothing while closed. Absorbs "performance metrics display" and the built RAM/CPU viewer (subtask 01, in review today).
- [ ] **Theme preview** (today's layout selector, smaller): switch theme and light or dark mode for this browser only, by swapping the theme stylesheet URL and `data-theme`; no server call. Absorbs "theme preview panel". Switching layouts for real is a config change the AI makes.
- [ ] **Server side.** The engine answers `dev.*` messages only on the local server; it refuses them from a shared network session unless the key has the `edit` role ([060/40](../060_collaboration/40_access-keys.md)).
- [ ] **Never published.** The static renderer imports only `agentks-ui`; add a test that the `agentks-ssg` bundle contains no `devtoolbar` module.

## Guardrails
- Users cannot add toolbar tools.
- The toolbar never deletes anything outside the project. Machine-wide cleanup is `agentks cache clean <root>` ([070_cli](../070_cli/00_overview.md)).
- No dev HTTP routes: today's `/api/dev/*` and `/__editor/*` go away.

## Done when
- The bar shows on every page of the local client, Edit toggles editing on editable pages, and each tool shows live data from the running engine.
- The Cache tool's clear buttons empty exactly this project's build cache and this browser's caches, verified by `agentks cache status` before and after.
- A static build contains no toolbar code (test above).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `apps/agentks-client/src/devtoolbar/`, the engine's `dev.*` handlers.
- **Read first:** [the dev toolbar](../../notes/03_frontend/05_dev-toolbar.md) (all), [the dev toolkit](../../brainstorm/02_future-stages/03_dev-toolkit.md).
- **Absorbed:** [2025-06-25-dev-toolbar-enhancements](../../../2025-06-25-dev-toolbar-enhancements/issue.md) — [01 RAM/CPU viewer](../../../2025-06-25-dev-toolbar-enhancements/subtasks/01_ram-cpu-viewer.md) (becomes System), [02 cache inspector](../../../2025-06-25-dev-toolbar-enhancements/subtasks/02_cache-inspector.md) (becomes Cache), and its open tasks: theme preview (becomes Theme preview), performance metrics (System), cache status viewer (Cache). Its "config generator UI" tasks are **dropped**: config is changed by the AI and checked by `agentks check config`, not by a UI.
- **Today's code:** [the dev-tools folder](../../../../../../agent-ks-engine/src/dev-tools): [integration](../../../../../../agent-ks-engine/src/dev-tools/integration.ts), [error logger](../../../../../../agent-ks-engine/src/dev-tools/error-logger/index.ts), [layout selector](../../../../../../agent-ks-engine/src/dev-tools/layout-selector/index.ts), [cache inspector](../../../../../../agent-ks-engine/src/dev-tools/cache-inspector/index.ts), [browser cache](../../../../../../agent-ks-engine/src/dev-tools/browser-cache/index.ts), [system metrics](../../../../../../agent-ks-engine/src/dev-tools/system-metrics/index.ts), [server metrics](../../../../../../agent-ks-engine/src/dev-tools/server/metrics.ts).
- **Depends on:** [080/40](../080_ui-and-client/40_websocket-client.md), [050/20 WebSocket API](../050_server/20_websocket-api.md), [040/95 cache metrics](../040_caching/95_cache-metrics.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the dev toolkit, cache clearing and the dev tools are Phase 2; the toolkit holds the editing switch.
- Decided (sidhantha, 2026-09-30): the toolkit is a bar like Astro's, with an Edit option.
- Decided (claude, 2026-09-30, under sidhantha's delegation): open question 04 is settled by the recommendation in [the dev toolbar](../../notes/03_frontend/05_dev-toolbar.md) section 03 — Problems, Cache (server and browser), System, Theme preview; the editor app is replaced by Edit. Record it as decided in [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md) when this leaf starts (edit, never commit, in this repository).

# 05 Notes & Analysis
## 01 Messages (working names; the format belongs to [050/20](../050_server/20_websocket-api.md))

| Tool | Messages |
|---|---|
| Problems | pull `dev.problems` (`scope: page | project`); push `dev.problems` on change |
| Cache | pull `dev.cache.stats`; `dev.cache.clear` for this project's build cache |
| System | pull `dev.metrics` about every 2 s while open |
| Theme preview | none |

## Watch out
- Today's toolbar apps total about 1,800 lines tied to Astro's toolbar host; none moves across as code. Rebuild from the behaviour, not the files.
