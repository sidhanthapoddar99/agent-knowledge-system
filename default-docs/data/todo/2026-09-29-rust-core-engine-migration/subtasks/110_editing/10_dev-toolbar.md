---
title: "The dev toolbar: the bar, Edit and the tools"
status: in-progress
---

The dev toolbar is a slim bar over every page of the local client, like Astro's dev toolbar. It holds the Edit option first, then the developer tools rebuilt from today's six Astro toolbar apps. It exists only in the client app, talks to Rust over the same `/api` WebSocket, and is left out of published sites at build time rather than hidden. This leaf builds the bar and the tools, and takes over the open work of [2025-06-25-dev-toolbar-enhancements](../../../2025-06-25-dev-toolbar-enhancements/issue.md).

# 01 To Do
- [x] **The bar** in `apps/agentks-client/src/devtoolbar/`: bottom of the screen, one button per tool, Edit first; one panel open at a time above the bar; Escape closes it; collapsible to a small handle; on a phone a single button opening the tool list. State (collapsed, last tool) in UI state ([090/10](../090_frontend-performance/10_ui-state-persistence.md)). Own class prefix; theme variables only.
- [x] **Edit** — enabled on pages the manifest marks `editable`, disabled with a tooltip saying why elsewhere, and while offline ([090/30](../090_frontend-performance/30_service-worker-and-offline.md)). On: loads the editor chunk and hands over to [20](./20_edit-in-place.md); shows the raw / live preview switch and the save status (saved, saving, failed) beside it.
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
In progress. The bar, Edit and the browser side of every tool are built and tested against the client's mock engine; the engine's `dev.*` messages and the static-build test are left.

## Result
Built in the wave-3 editor worktree (`/home/sid/projects/06_02_NeuraLabs/.agentks-worktrees/editor`, branch `wave3/editor`, not committed), under `apps/agentks-client/src/devtoolbar/`:

- `DevToolbar.tsx`, `edit/` and `tools/`: the bar at the bottom, Edit first, then the format buttons while editing, then Problems, Cache, System and Theme. One panel at a time; Escape closes it; the bar collapses to a handle; below 640 px it is one Tools button that opens the list. Class prefix `aks-devbar`, `@layer components`, contract variables only.
- `prefs.ts`: the bar's state (collapsed, last tool) and the editing mode, per project in `localStorage` under `aks:<project key>:<kind>:project`, deviations from the defaults only. A stand-in until [090/10](../090_frontend-performance/10_ui-state-persistence.md) lands.
- Edit: enabled only where the manifest route carries `editable: true`, the socket is open and the role is not `read`. Elsewhere it is `aria-disabled` with the reason as its tooltip, and a click shows the reason in the bar. Beside it: the live preview / raw switch, the save status (saved, unsaved, saving, failed, conflict) and the two conflict choices.
- What is left, per item:
  - **Problems** lists the page's own `errors` and the engine's `errors` pushes, by file and line, for this page or for every file reported this session. A line link moves the editor's cursor while editing. Left: Rust's `dev.problems` pull and push for the whole project.
  - **Cache** counts and clears this project's browser stores (UI state keys, IndexedDB and service-worker caches named `agentks:<project key>:…`). Left: the engine side (`dev.cache.stats`, `dev.cache.clear`). The panel says the engine does not report it yet.
  - **System** shows the page's JS heap (where the browser exposes it), the element count and the draws, every 2 s while open and nothing while closed. Left: `dev.metrics` (server memory and CPU) and the last ten navigation and redraw timings from [090/70](../090_frontend-performance/70_render-performance.md).
  - **Theme** switches light, dark or the system setting for this browser, through the UI package's `setThemeMode`. Left: switching the theme itself, which needs the manifest to list the available themes and their stylesheet URLs.
  - **Server side:** not started; engine work.
  - **Never published:** `apps/agentks-ssg` does not exist yet. For now `tests/devtoolbar/boundaries.test.ts` fails if any file in `apps/packages/agentks-ui/src` imports `editor/` or `devtoolbar/`.
- Tests: `tests/devtoolbar/toolbar.test.tsx` (3), `prefs.test.ts` (3) and `boundaries.test.ts` (2), with the editor's 17 in `tests/editor/`. The client's 46 tests run in about 0.9 s (`ctl test client`).
- Gate: `./ctl gate` in the worktree, exit 0 (lint 8 s, typecheck 3 s, test 19 s, check 1 s; 31 s total).
- Screenshots, light and dark, 1440 × 900 and a 390 px phone: `/tmp/aks-shots/out/{light,dark}-07-problems.png`, `-07b-cache.png`, `-07c-theme.png` and `-09-phone-menu.png`.

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
- Decided (claude, 2026-10-01): the bar's and the editor's settings live in [090/10](../090_frontend-performance/10_ui-state-persistence.md)'s store, reached through `src/devtoolbar/prefs.ts`, under the kinds `toolbar` and `edit` and the scope `project`, storing only deviations from the defaults. This is because one store per project is the rule, and a second store writing its own format under the same `aks:<project key>:` prefix would have its blobs deleted by the first one's start-up prune.
- Decided (claude, 2026-10-01): Edit is `aria-disabled` with the reason, not `disabled`, because a disabled button can neither take focus nor show a tooltip, and the reason is the point.
- Decided (claude, 2026-10-01): a panel whose engine data does not exist yet says so in one line, and shows no zero or placeholder number, because a made-up number looks like a real one.
- Decided (claude, 2026-10-01): Problems keeps an empty `errors` push as "this file is clean now", because the page's own list is older and would otherwise come back.
- Decided (claude, 2026-10-01): Theme mode uses the UI package's `setThemeMode` (light, dark, system), the same code as the navbar's toggle, because two copies of the theme switch would drift.
- Decided (claude, 2026-10-01): until `apps/agentks-ssg` exists, a test checks that the UI package never imports the editor or the toolbar, because the static build will draw only with that package; the bundle test is added with the SSG app.

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
