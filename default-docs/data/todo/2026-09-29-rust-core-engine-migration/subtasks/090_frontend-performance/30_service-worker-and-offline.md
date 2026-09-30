---
title: "Service worker and offline reading"
status: open
---

When the agentks server for a project is not running, an installed client should still open and show the pages already in its cache, clearly marked as possibly stale. This leaf defines exactly what the service worker does beyond the app shell of [080/60](../080_ui-and-client/60_pwa-and-mobile.md), how offline reading works, and how nothing stale is ever shown as current.

# 01 To Do
- [ ] **Scope of the worker** (one worker, registered by the client): app shell precache (from 080/60), plus `/content-assets/*` images of pages the user visited, cache-first with a size cap of 50 MB (claude, proposed). Never `/api`, never `/artifacts/*` or `/_lib/*` (they may run code and must come from the server).
- [ ] **Offline mode in the client.** When the socket fails to connect after the first retry, switch `DataSource` to cache-only: pages in IndexedDB draw normally with a banner "Server off — showing cached copy"; pages not cached show the server-off screen.
- [ ] **Leaving offline mode.** On reconnect, refetch the manifest and redraw what changed; remove the banner.
- [ ] **Editing is off while offline.** The Edit option is disabled with a tooltip ([110/10](../110_editing/10_dev-toolbar.md)).
- [ ] **Clearing.** The dev toolbar's Cache tool clears the worker's asset cache along with IndexedDB.
- [ ] **Tests** in Playwright with the server stopped mid-session and at start: banner shown, cached pages readable, uncached page shows the server-off screen, reconnect clears the banner.

## Guardrails
- Offline reading is read-only and always labelled.
- The worker never caches anything that can execute: artifacts, library elements, scripts outside the app shell.

## Done when
- With the server stopped, an installed app opens, shows the banner, and reads every page visited in the last session.
- No request to `/api` or `/artifacts/` is ever answered by the worker (checked in tests).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/agentks-client/src/pwa/sw.ts` and `src/data/source.ts`.
- **Read first:** [the client application](../../notes/03_frontend/02_client-application.md) (section 08), [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md) (how much an installed PWA does while the server is off).
- **Depends on:** [20](./20_data-cache-indexeddb.md), [080/60 PWA and mobile](../080_ui-and-client/60_pwa-and-mobile.md).

# 04 Decisions
- Proposed (claude, 2026-09-30): an installed app with the server off shows cached pages read-only and never pretends to be current ([the client](../../notes/03_frontend/02_client-application.md) section 08).
- Decided (claude, 2026-09-30): this leaf settles the open point "how much an installed PWA does while the server is off" as above; record it in the client note's section 12 when done (edit, never commit, in this repository).

# 05 Notes & Analysis
## Watch out
- A service worker keeps serving old shell files until it activates. Always pair it with the version handshake of [080/40](../080_ui-and-client/40_websocket-client.md).
