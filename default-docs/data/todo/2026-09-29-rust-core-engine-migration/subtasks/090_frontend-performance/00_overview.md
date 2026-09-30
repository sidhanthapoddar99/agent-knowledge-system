---
title: "Frontend performance — group index"
status: open
---

This group makes the local client fast and keeps it fast: the budgets it must meet, how UI state and data are kept in the browser, what the service worker does, how code is split, what is prefetched, how very long lists stay smooth, and the checks that fail the build when a budget is broken. Derived data is cached once on the server and shared by every user and tab ([040_caching](../040_caching/00_overview.md)); the browser holds only a hash-checked copy of it plus each user's own UI state.

# 01 To Do

| Leaf | Status | Delivers | Waits on |
|---|---|---|---|
| [090/10 UI state persistence](./10_ui-state-persistence.md) | open | Sidebar folders, filters, scroll, theme mode and editing mode kept per project and per browser; today's sidebar cache carried over | [080/20](../080_ui-and-client/20_shared-ui-package.md) |
| [090/20 Data cache in IndexedDB](./20_data-cache-indexeddb.md) | open | The hash-keyed page, sidebar and index store: keys, versioning, quota, eviction | [080/40](../080_ui-and-client/40_websocket-client.md) |
| [090/30 Service worker and offline](./30_service-worker-and-offline.md) | open | Offline reading of cached pages when the server is off; cache lifetimes | 20, [080/60](../080_ui-and-client/60_pwa-and-mobile.md) |
| [090/40 Code splitting and lazy islands](./40_code-splitting-and-lazy-islands.md) | open | A small start-up bundle; each layout and heavy island its own chunk | [080/50](../080_ui-and-client/50_islands.md) |
| [090/50 Prefetch](./50_prefetch.md) | open | Page data fetched on hover and for next and previous, within limits | 20, [080/30](../080_ui-and-client/30_client-shell-and-routing.md) |
| [090/60 Large-list virtualisation](./60_large-list-virtualisation.md) | open | Sidebars and tracker tables with thousands of rows stay smooth | [100/15](../100_layouts/15_docs-layouts.md), [100/25](../100_layouts/25_issues-layouts.md) |
| [090/70 Render performance](./70_render-performance.md) | open | In-place redraws on pushes, no layout thrash, fast navigation | [080/30](../080_ui-and-client/30_client-shell-and-routing.md) |
| [090/80 Performance budget checks](./80_perf-budget-checks.md) | open | The budgets below measured in CI; a broken budget fails the gate | all above, [170/40](../170_testing/40_performance-budget.md) |

**Order inside the group.** 10 and 20 as soon as the client exists. 40 alongside the first layouts. 50, 60 and 70 once the layouts render real content. 30 after 20 and the PWA shell. 80 last, but its measuring harness early, so every other leaf can check itself.

## The budgets (Proposed, claude, 2026-09-30)

Measured on this repository's docs and tracker (about 1,300 pages) on localhost, production build, a mid-range laptop, cold browser cache unless stated.

| Budget | Target |
|---|---|
| Start-up JavaScript (shell, router, socket, docs layout), gzipped | at most 120 KB |
| Start-up CSS (theme plus component CSS for the first layout), gzipped | at most 40 KB |
| First contentful paint of a docs page, cold | at most 400 ms |
| First contentful paint, warm (data in IndexedDB) | at most 200 ms |
| In-app navigation to a cached page, click to painted | at most 50 ms |
| In-app navigation to an uncached page | at most 150 ms |
| Redraw after a `changed` push for the page on screen | at most 100 ms after the push |
| Scrolling a 5,000-row sidebar or tracker table | 60 frames a second, no long task over 50 ms |
| Tab memory after visiting 200 pages | at most 150 MB |
| A diagram library downloaded on a page without that diagram kind | never |

## Guardrails
- Performance never moves a rule into the browser. Faster filtering, sorting or search is done by Rust sending better data, not by the browser computing it.
- Every cached thing has an owner, a key and a way to be cleared ([the dev toolbar](../../notes/03_frontend/05_dev-toolbar.md) section 03).
- Change a budget only with a line in this index saying why.

## Done when
- Every leaf is `review` or closed.
- [80](./80_perf-budget-checks.md) runs in CI and every budget above passes on the corpus.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, local folder `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`; work in `apps/agentks-client` and `apps/packages/agentks-ui`.
- **Design, read first:** [the client application](../../notes/03_frontend/02_client-application.md) (sections 05 to 09), [the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) (sections 03, 08), [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md) (risks "Frontend weight", "Stale caches").
- **Today's browser caches:** [the sidebar state cache](../../../../dev-docs/05_architecture/05_layout-internals/07_sidebar-state-cache.md), [the browser-cache tool](../../../../../../agent-ks-engine/src/dev-tools/browser-cache/index.ts).
- **Server side of caching:** [040_caching](../040_caching/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): layouts and major data are cached in the browser, versioned by hash so updates still show.
- Decided (claude, 2026-09-30): derived data is cached once on the server; the browser keeps only a hash-checked copy plus each user's UI state ([the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md)).
- Decided (claude, 2026-09-30): each project keeps a stable port, and every browser storage name and key carries the project key ([the client](../../notes/03_frontend/02_client-application.md) section 05).

# 05 Notes & Analysis
## 01 What lives where

| Kind | Where | Key | Cleared by |
|---|---|---|---|
| Rendered page data, sidebars, indexes | Server (build cache) — source of truth | engine version, content hash, embed hashes, settings fingerprint | `agentks cache` commands, the toolbar's Cache tool |
| Copy of that data | Browser IndexedDB ([20](./20_data-cache-indexeddb.md)) | project key, engine version, then `page:<url>` etc. with its hash | Dev toolbar Cache tool, the browser's site data |
| UI state | Browser localStorage ([10](./10_ui-state-persistence.md)) | `aks:<project key>:<scope>` | Dev toolbar Cache tool |
| App shell | Service worker cache ([30](./30_service-worker-and-offline.md), [080/60](../080_ui-and-client/60_pwa-and-mobile.md)) | client version | A new binary |
