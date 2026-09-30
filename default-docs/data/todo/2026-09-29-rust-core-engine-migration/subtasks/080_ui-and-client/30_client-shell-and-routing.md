---
title: "Client shell and real-path routing"
status: in-progress
---

The client `apps/agentks-client` is a single-page app: one page load, then it draws every page itself. This leaf builds its shell and its router. Routes come from the manifest Rust sends, never from file names. The router must also do the chores a server-rendered site gets for free — `#heading` anchors, scroll restoration on back and forward, focus and the document title after navigation — because the prior audit named their absence as a real loss.

# 01 To Do
- [ ] **Create the app** `apps/agentks-client/` with Vite 8.3.1 and Preact 11.0.0 ([10](./10_ui-framework-decision.md)): `index.html`, `vite.config.ts`, `src/main.ts`, `src/router/`, `src/data/`, `src/state/`, `src/islands.ts`, `src/pwa/`, and empty `src/devtoolbar/` and `src/editor/` for Phase 2. The app owns its `package.json` and `bun.lock` and depends on the UI package with `link:../packages/agentks-ui`; there is no JS workspace.
- [ ] **Start-up** in `src/main.ts`: connect the socket ([40](./40_websocket-client.md)), load the manifest (from the cache first when its hash still matches), route the first URL, mount the navbar and footer the manifest names.
- [ ] **The router** in `src/router/`: our own, about 60 lines, driven by the manifest. No router library: the manifest is the route table, so a pattern router adds nothing. The spike in [10](./10_ui-framework-decision.md) built it and checked scroll, `#heading`, back and forward in headless Chromium ([the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) section 07).
    - [ ] Look the path up in the manifest's route table. A hit gives the section, the data key to fetch and that key's hash.
    - [ ] Draw: fetch the key through `DataSource` (`page(url)` for a page; `issuesIndex`, `issue`, `blogIndex` or `custom` for the other keys) → the layout the data or the section names, from the registry → mount the body's islands ([50](./50_islands.md)).
    - [ ] A miss draws the not-found page inside the normal shell, with a link to the section's first page when the path starts with a known section.
    - [ ] Reserved prefixes are never routed: `/api`, `/artifacts/`, `/content-assets/`, `/assets/`, `/_lib/`, `/client/`, the theme CSS route. Links to them are normal browser navigations.
- [ ] **Link interception.** Catch clicks on same-origin `<a>` elements whose path is in the manifest; ignore modified clicks (ctrl, meta, shift, middle button), `target="_blank"`, `download`, and links to reserved prefixes. Push history and draw without a reload.
- [ ] **Anchors.** After a page is drawn, scroll to `location.hash` if present, on first load, on navigation and on a same-page hash change. Account for the fixed navbar height (`--navbar-height`).
- [ ] **Scroll restoration.** Store scroll per history entry (`history.state`); back and forward restore it after the page is drawn; a new navigation scrolls to top unless it has a hash. Set `history.scrollRestoration = 'manual'`.
- [ ] **Focus and title.** After navigation set `document.title` from the page data, move focus to the main heading (`tabindex="-1"`), and announce the new title through a polite live region.
- [ ] **Live updates.** When a `changed` push touches the page on screen, its sidebar or its index, refetch and redraw in place, keeping scroll and open panels. When the page was removed, show a notice with the new URL if Rust reports one, else the section's first page ([the client](../../notes/03_frontend/02_client-application.md) section 06).
- [ ] **Error and loading states.** A slow page (over 150 ms) shows a thin progress bar, never a blank screen. A `fatal` push (broken config) shows an error page listing the push's `errors` (each with file, line and fix) and keeps the socket open until the config is fixed.
- [ ] **Tests** with the framework's test runner and a headless browser: in-app navigation, back and forward scroll, anchor on first load, not-found, modified clicks passing through, reserved prefixes not intercepted.

## Guardrails
- The router never computes a URL from a slug, a file name or an `NN_` prefix. Links in bodies are already root-absolute.
- No data access outside `DataSource`.
- Each layout and each heavy island is loaded on demand; the start-up bundle holds the shell, the router and the socket only.

## Done when
- Against this repository's docs and tracker served by the engine, every route in the manifest draws without a reload, back and forward restore scroll, and `/dev-docs/…#some-heading` lands on the heading on a cold load.
- A headless test clicking 50 random sidebar links reports no full reloads and no console errors.
- Screen reader check: the live region announces each new page title.

# 02 Status and Result
In progress. The shell, router and live updates are built and tested against a mock engine. Left: the checks that need the real engine and a browser (every route of this repository, 50 random sidebar clicks headless, the screen reader check), and `src/pwa/` ([60](./60_pwa-and-mobile.md)).

## Result
- `apps/agentks-client/`: Vite 8.3.1, Preact 11.0.0, `@preact/preset-vite` 2.10.6; own `package.json` and `bun.lock`; `index.html`, `vite.config.ts`, `src/main.ts`, `src/app/` (`controller.ts`, `App.tsx`, `document.ts`), `src/router/` (`routes.ts`, `links.ts`, `scroll.ts`, `router.ts`), `src/data/`, `src/state/view.ts`, `src/islands.ts`, and `src/pwa/`, `src/devtoolbar/`, `src/editor/` holding a README each.
- The router: the route table from the manifest only (routes and redirects), reserved prefixes never routed (`/api`, `/artifacts`, `/content-assets`, `/assets`, `/_lib`, `/client`, `/theme.<hash>.css`), link interception that leaves modified clicks, `target`, `download`, other origins and unknown paths to the browser, same-page hash links without a refetch, `history.scrollRestoration = 'manual'`, scroll saved per entry and restored on back and forward, anchors on first load, after navigation and after islands mount, focus to the main heading, the title, and a polite live region.
- The controller: start-up (socket, manifest, first URL, navbar and footer from the manifest), not-found inside the frame with a way back into the section, a progress bar after 150 ms, `fatal` pushes and failures drawn as the error list, `changed` pushes redrawing the page, its sidebar or the manifest once per animation frame, a removed or moved page shown as a notice, `resync` and reconnect rechecking every hash, the theme CSS link swapped when its URL changes.
- `ctl build client` writes `apps/agentks-client/dist/` (19 files; first-load JS 13.5 KiB gzipped, each layout its own chunk) and `dist/client-build.txt`.
- Tests: Vitest 5.0.3 with happy-dom, 21 tests in under 1 s (router, link rules, route table, scroll, and the whole app drawing a docs fixture page through `DataSource`, following a sidebar link without a reload, not-found, and an unbuilt section layout shown as an error).
- `ctl dev client` runs Vite on 5173 against `CLIENT_ENGINE_URL`, or against the mock engine in `dev/` on 5174 when it is blank; checked by hand: the page, the theme CSS and `/api` all pass through the proxy.

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, folder `apps/agentks-client`.
- **Read first:** [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) (section 07, the router), [the client application](../../notes/03_frontend/02_client-application.md) (sections 02, 03, 06, 07), [the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) (section 02, routes), [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md) (risk "Single-page app chores").
- **Today's code to learn from:** the catch-all route in [the pages folder](../../../../../../agent-ks-engine/src/pages), [the route matcher](../../../../../../agent-ks-engine/src/pages/lib/route-match.ts), [the layout registry](../../../../../../agent-ks-engine/src/pages/lib/layout-registry.ts).
- **Related:** [2026-08-04-absolute-link-resolution](../../../2026-08-04-absolute-link-resolution/issue.md) — why links reach the client root-absolute.
- **Depends on:** [080/20 shared UI package](./20_shared-ui-package.md), [080/40 WebSocket client](./40_websocket-client.md) (can be stubbed at first), [020/30 links and URLs](../020_content-contract/30_links-and-urls.md).
- **Unblocks:** [50](./50_islands.md), [60](./60_pwa-and-mobile.md), [70](./70_embed-in-binary.md), [090/50 prefetch](../090_frontend-performance/50_prefetch.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the router uses real URL paths.
- Decided (sidhantha, 2026-09-29): one server; `/api` is the WebSocket and `/**` serves the client ([the client](../../notes/03_frontend/02_client-application.md)).
- Decided (claude, 2026-09-30): routes come only from the manifest; a reserved prefix can never be a content URL (Rust enforces it when it builds the manifest).
- Decided (claude, 2026-09-30): the router is our own, about 60 lines, in `agentks-client`, because the manifest is the route table and a pattern router adds nothing ([10](./10_ui-framework-decision.md)).
- Decided (claude, 2026-10-01): the client resolves `@agentks/ui` by a path alias in `tsconfig.json` and `vite.config.ts`, not a `link:` dependency, because bun 1.4.2 cannot link a package by path (`FileNotFound: failed linking dependency/workspace`) and `file:` copies the folder, so edits would not show; Vite's `resolve.dedupe: ['preact']` keeps one Preact.
- Decided (claude, 2026-10-01): the client's tests run on Vitest with happy-dom, not `bun test` and not a headless browser, because Vitest resolves modules through the same Vite config as the build (one deduped Preact); `bun test` would load the package's own Preact copy and bun runtime plugins cannot redirect bare imports; browser runs wait for the testing stage.
- Decided (claude, 2026-10-01): a section whose layout is not in the package yet (blog, issues, custom) draws a load error naming the layout, never another layout, because a wrong page that looks right is worse than an error.
- Decided (claude, 2026-10-01): the router matches paths exactly (no trailing-slash folding), because the manifest's URLs are canonical and folding would be a URL rule outside Rust; the engine's redirects cover old URLs.
- Decided (claude, 2026-10-01): the app's route level is `src/app/` (a controller plus `App.tsx`), beside the subtask's folders, because the project-setup shape wants route logic out of components and the controller is testable without rendering.
- Decided (claude, 2026-10-01): `client_build` is a hash of the built bundle: a Vite plugin puts a fixed-length placeholder in the code, hashes every chunk and asset after bundling, writes the hash in place of the placeholder and into `dist/client-build.txt` for the engine's embed step; the dev server sends `dev`.
- Decided (claude, 2026-10-01): a body island whose name the registry does not know keeps its plain content and gets `data-island-state="unknown"`, with a dev log, because the page must still show the source while the island is not built.

# 05 Notes & Analysis
## 01 The manifest's route entry ([030/80](../030_rust-engine/80_page-data-interface.md))

```json
{ "url": "/dev-docs/architecture/overview", "section": "dev-docs",
  "key": "page:/dev-docs/architecture/overview", "hash": "b3:db77…" }
```

The manifest's `sections` list gives each section's layout (`@docs/default`) and base URL. Phase 2 editing takes the file path from the page data's `source` and the right to edit from the `role` in the server's hello ([110/20](../110_editing/20_edit-in-place.md)).

## Watch out
- Draw first, then scroll: scrolling before the new page's images and diagrams take space lands in the wrong place. Re-apply the anchor scroll once islands above it have mounted.
- A same-page link with only a hash must not refetch the page.
- The theme CSS URL carries its hash; when the manifest's theme hash changes, swap the `<link>` instead of reloading.
