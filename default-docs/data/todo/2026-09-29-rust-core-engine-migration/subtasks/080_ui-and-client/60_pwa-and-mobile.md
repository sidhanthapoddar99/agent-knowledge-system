---
title: "PWA install and mobile shell"
status: open
---

The local client must work on a phone and be installable as an app window (a PWA, progressive web app). This leaf adds the web app manifest, the app-shell part of the service worker, the "server is off" state of an installed app, and the mobile behaviour of the shell: the sidebar as a drawer, touch targets, sideways-scrolling tables. The data-cache side of offline use is [090/30](../090_frontend-performance/30_service-worker-and-offline.md); the per-layout responsive checks are [100/55](../100_layouts/55_responsive.md).

# 01 To Do
- [ ] **Web app manifest** in `apps/agentks-client/src/pwa/manifest.webmanifest`, generated at start-up from the site identity the manifest message carries (name, short name, theme colour from the theme's `--color-brand-primary`, icons from the site's favicon or a built-in default). Served by the engine at `/manifest.webmanifest`.
- [ ] **App-shell service worker** in `src/pwa/sw.ts`: precache `index.html`, the start-up scripts and CSS of this client version (the hashed file list from the Vite build). Network-first for `index.html`, cache-first for hashed files. Never cache `/api`, `/artifacts/`, `/content-assets/`, `/_lib/` or the theme CSS in the shell cache.
- [ ] **Update flow.** A new binary means new hashed files. The worker installs in the background and activates on the next load; the version handshake in [40](./40_websocket-client.md) forces the reload when needed.
- [ ] **Server off.** When the socket cannot connect, the installed app shows a clear "the agentks server for this project is not running" screen with the command to start it, and, if [090/30](../090_frontend-performance/30_service-worker-and-offline.md) has cached pages, lets the user read them read-only with a banner saying they may be stale.
- [ ] **Mobile shell.**
    - [ ] Below the tablet breakpoint the sidebar becomes a drawer opened from the navbar; it closes on navigation and on Escape, and traps focus while open.
    - [ ] The outline collapses into a "On this page" menu.
    - [ ] Touch targets at least 44 by 44 CSS pixels; no hover-only controls.
    - [ ] Wide tables and code blocks scroll sideways inside their own box; the page never scrolls sideways.
- [ ] **Tests.** Lighthouse PWA installability passes on `http://localhost:<port>`; Playwright at 320, 375, 768 and 1280 pixels: drawer opens and closes, no horizontal page overflow, tap targets meet the size.

## Guardrails
- The service worker caches the app shell only. Page data stays in IndexedDB, controlled by content hashes ([the client](../../notes/03_frontend/02_client-application.md) section 08).
- The app never pretends to be up to date while the server is off.
- Service workers are scoped per origin; with stable per-project ports ([the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) section 08) each project gets its own worker. Name caches with the project key anyway.

## Done when
- Chrome offers "Install app" for a running project, and the installed window opens the site.
- Stopping the server and reopening the installed app shows the server-off screen, not a browser error.
- The Playwright mobile checks pass for every layout kind.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, folder `apps/agentks-client/src/pwa`.
- **Read first:** [the client application](../../notes/03_frontend/02_client-application.md) (section 08), [theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) (section 08).
- **Absorbed context:** the mobile items of [2025-06-25-sizing-and-responsive](../../../2025-06-25-sizing-and-responsive/issue.md), subtask [02 mobile responsive](../../../2025-06-25-sizing-and-responsive/subtasks/02_mobile-responsive.md) (navbar mobile menu, sidebar drawer, touch targets, horizontal overflow) — the shell half here, the per-layout half in [100/55](../100_layouts/55_responsive.md).
- **Depends on:** [30](./30_client-shell-and-routing.md), [40](./40_websocket-client.md), [050/10 HTTP and routes](../050_server/10_http-and-routes.md) for the manifest route.
- **Related:** [090/30 service worker and offline](../090_frontend-performance/30_service-worker-and-offline.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the client is mobile friendly and PWA friendly.
- Proposed (claude, 2026-09-30): the service worker caches the app shell only; an installed app with the server off shows cached pages read-only ([the client](../../notes/03_frontend/02_client-application.md) section 08).

# 05 Notes & Analysis
## Watch out
- Browsers treat `localhost` as a secure origin, so a service worker works there without TLS. A shared session over the network ([060/50](../060_collaboration/50_network-exposure-and-tls.md)) needs TLS for the worker to register; without it the app still works, just not installable.
- The drawer must not be a second navigation: it is the same sidebar, moved.
