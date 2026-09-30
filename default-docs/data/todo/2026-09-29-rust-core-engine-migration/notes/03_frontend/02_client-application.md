---
title: "The client application: agentks-client"
---

`apps/agentks-client` is the **single-page app** (SPA) of the local tool: one page load, after which the app draws every page itself from data. It is built once with Vite, compressed, and embedded in the `agentks` binary, which serves it on localhost. It draws every page with the components of [the shared UI package](./01_shared-ui-package.md), fetches their data from the Rust engine over **one WebSocket at `/api`**, keeps that data in a browser cache versioned by content hash, and redraws only what changed when Rust pushes a change. Its router uses **real URL paths**, the same URLs a published site has. It is mobile friendly and installable as an app (a PWA). In state 1, when the team works on agentks itself, the Vite dev server runs it and passes `/api` through to the Rust engine. It holds no rules: every URL, order and status arrives computed.

# 03 References

- [The architecture note](../../brainstorm/01_initial-discussion/17_local-spa-over-websocket.md) — the SPA over WebSocket, the browser cache, the three safeguards.
- [Server and WebSocket](../../brainstorm/01_initial-discussion/09_server-websockets-and-editing.md) — serving by mode, the localhost default.
- [The repositories and three states](../../brainstorm/02_future-stages/12_repositories-and-three-states.md) — where the client sits in states 1 and 2.
- [The sync engine and server](../02_engine/04_sync-engine-and-server.md) — owns the `/api` protocol. This note covers only the client's side of it.
- [The shared UI package](./01_shared-ui-package.md) — the components the client draws with, and the `DataSource` interface it implements.
- [The dev toolbar](./05_dev-toolbar.md) and [editor engines](./03_editor-engines.md) — the Phase 2 parts that live only in this app.
- [Development workflow and testing](../05_delivery/05_development-workflow-and-testing.md) — state 1, mise and `data/builds/`.
- Today's browser state cache: [the sidebar state cache](../../../../dev-docs/05_architecture/05_layout-internals/07_sidebar-state-cache.md) and [2026-05-07-sidebar-state-persistence](../../../2026-05-07-sidebar-state-persistence/issue.md).
- Today's reserved routes live in [the pages folder](../../../../../../agent-ks-engine/src/pages): `artifacts/`, `content-assets/`, `assets/` and [the theme CSS route](../../../../../../agent-ks-engine/src/pages/theme.css.ts).

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the frontend is a Vite single-page app that renders every layout. Rust renders page bodies, not page layouts.
- Decided (sidhantha, 2026-09-29): one server. `/api` is the WebSocket endpoint and `/**` serves the frontend.
- Decided (sidhantha, 2026-09-29): the WebSocket carries both pulls and pushes. There is no separate HTTP data API.
- Decided (sidhantha, 2026-09-29): in dev, the Vite dev server is the proxy in front of Rust. For local use, the Rust server serves the embedded Vite build.
- Decided (sidhantha, 2026-09-29): the frontend bundle is embedded in the binary.
- Decided (sidhantha, 2026-09-29): layouts and major data are cached in the browser, versioned so that updates still show.
- Decided (sidhantha, 2026-09-29): the router uses real URL paths.
- Decided (sidhantha, 2026-09-30): the client is mobile friendly and PWA friendly.
- Decided (sidhantha, 2026-09-30): the client is fully client-rendered, and its layouts come from `apps/packages/agentks-ui`.

# 05 Notes & Analysis

## 01 What the client is, per state

| State | Who serves the client | Where data comes from |
|---|---|---|
| 1, developing agentks | The Vite dev server, with hot reload | Vite passes `/api` and the file routes through to the Rust engine from the working tree |
| 2, using agentks | The installed binary, from the embedded build | The same binary, over `/api` |
| 3, publishing | Not used. The static renderer draws the same components once per page ([publishing](../05_delivery/02_publishing-ssg.md)) | — |

The client never serves the public. State 2 is a development environment for its user: one or two people, on localhost.

## 02 Folder layout (claude, proposed)

```
apps/agentks-client/
  index.html
  vite.config.ts          dev proxy (section 10), build output for embedding
  src/
    main.ts               start-up: connect, load the manifest, route the first URL
    router/               real-path router, link interception, scroll and focus
    data/
      socket.ts           the one WebSocket: requests, pushes, reconnect
      source.ts           DataSource over the socket, from agentks-ui's interface
      cache.ts            IndexedDB store keyed by content hash
    state/                UI state kept between visits (local storage)
    islands.ts            mounts agentks-ui islands found in page bodies
    pwa/                  web app manifest, service worker for the app shell
    devtoolbar/           Phase 2: the dev toolbar and its tools
    editor/               Phase 2: in-place editing
```

The two Phase 2 folders exist only here. The static renderer never imports them, so a published page cannot contain them ([the dev toolbar](./05_dev-toolbar.md)).

## 03 Routing

**Routes come from Rust.** On connect, the client receives the site manifest: every URL with its page kind, the layout named in config and its content hash. The router looks a path up in that manifest. It never works a URL out from a file name, a slug or an `NN_` prefix.

| Path | Handled by |
|---|---|
| A URL in the manifest | The router: fetch the page data, draw it with its layout |
| `/api` | The WebSocket. Never a page |
| `/artifacts/…` | Rust serves the file. The client shows it in an iframe, or opens it in full |
| `/content-assets/…` | Rust serves a document's own colocated assets |
| `/assets/…` | Rust serves the framework's assets: favicon, logos |
| `/_lib/<alias>/<element>` | Rust serves a library element, for video and artifact pages ([libraries](../04_ecosystem/01_library-system.md)) |
| The theme CSS route | Rust serves the project's compiled theme CSS ([theming](./04_theming-and-layouts.md)) |
| Any other path | The server returns the app, and the router shows the not-found page |

The reserved prefixes stay reserved: no content page may take a URL under them. Rust enforces that when it builds the manifest.

**Link clicks.** The router catches a click on a same-origin link whose path is in the manifest, and draws the page without a reload. Any other link (an artifact opened in full, an asset, an outside site) is a normal browser navigation. Links in bodies are already root-absolute, because Rust resolved them ([the shared UI package](./01_shared-ui-package.md)).

**The chores a server-rendered site gets for free**, which the router must do itself:

- `#heading` anchors: scroll to the heading after the page is drawn, including on first load and on a same-page hash change.
- Back and forward restore the scroll position of the page left.
- Focus moves to the page's main heading after navigation, and the document title changes, so screen readers announce the new page.
- The first download stays small: each layout and each heavy island loads on demand.

## 04 The WebSocket client

One connection per tab, to `/api` on the same host. The message format belongs to [the sync engine and server](../02_engine/04_sync-engine-and-server.md). The client's side of it:

| Direction | Message (working names) | Client's use |
|---|---|---|
| Pull | `manifest` | On connect and after a reconnect |
| Pull | `page`, `sidebar`, `issues.index` | Through `DataSource`, when the cache does not have the current hash |
| Pull | `render` | Phase 2: the live preview asks Rust to render a block ([editor engines](./03_editor-engines.md)) |
| Pull | `save` | Phase 2: write an edited file |
| Push | `changed` | A list of paths and new hashes after files change on disk |
| Push | `error` | A content error for the current page; the dev toolbar shows the full list |
| Push | presence and sync | The multi-user stage |

Rules for the client (claude, proposed):

- **Requests carry an id**, and the answer echoes it, so several requests can be in flight on one connection.
- **Reconnect with backoff.** When the server stops, the client shows a small "disconnected" notice and keeps the current page on screen. On reconnect it fetches the manifest again and refreshes whatever changed while it was away.
- **Version handshake.** The first answer includes the engine version. If a tab was opened before the binary was upgraded, the versions differ and the client reloads itself, so an old client never talks to a new engine.

## 05 The browser cache

- **What is stored:** page data, sidebars and indexes, keyed by their content hash, in IndexedDB so they survive a refresh.
- **How it stays correct:** on connect the client compares the manifest's hashes with what it holds and fetches only what changed. A page's hash covers every file it embeds, so editing an embedded diagram changes the page's hash too ([2026-08-07-content-embed-cache-dependencies](../../../2026-08-07-content-embed-cache-dependencies/issue.md)).
- **One cache per project.** Each project's server runs on its own stable port, so each is its own browser origin, with its own storage. Every storage name and key also carries the project key, so storage stays correct even if a port is ever reused ([the server](../02_engine/04_sync-engine-and-server.md)).
- **The server owns derived data.** Rendering, git dates, CSS and search are computed once on the server and shared by every user and tab. The browser copy only saves a round trip; it is never the source.
- **Engine upgrades** (claude, proposed): the store's name includes the engine version, so an upgrade starts a fresh cache instead of reading data shaped by the old engine.
- **Clearing:** the browser-cache tool of the dev toolbar ([the dev toolbar](./05_dev-toolbar.md)), or the browser's own site-data controls.

**UI state** is separate from data. Sidebar collapse, issue filters, editing mode and scroll positions stay in local storage, under prefixed keys as today. This is today's sidebar state cache, carried over.

## 06 Live updates

1. Rust's file watcher sees a change and pushes `changed` with the new hashes.
2. The client drops the cache entries whose hashes changed.
3. If the current page, its sidebar or its index is affected, the client fetches the new data and redraws in place, keeping the scroll position and open panels.
4. If the current page was deleted or moved, the client shows a notice with a link to the new URL when Rust reports one, or to the section's first page.

Pages not on screen are fetched again only when visited.

## 07 Drawing a page

1. The router finds the URL in the manifest and reads its kind and layout.
2. `DataSource.page(url)` returns the data, from the cache or over the socket.
3. The layout component draws it, with the body HTML Rust rendered.
4. `islands.ts` mounts the islands marked in the body and in the layout (diagrams, artifact frames, filters, the video player).

Heavy libraries (Mermaid, Excalidraw, the draw.io viewer) load only on pages that use them, as today.

## 08 Mobile and PWA

- **Mobile friendly.** Every layout works on a phone: the sidebar becomes a drawer, tables scroll sideways, touch targets are large enough. The breakpoints from [2025-06-25-sizing-and-responsive](../../../2025-06-25-sizing-and-responsive/issue.md) become acceptance checks.
- **Installable.** A web app manifest and a service worker let a browser install the local site as an app window. A service worker is allowed on `localhost`, which browsers treat as a secure origin.
- **The service worker caches the app shell only**: `index.html`, the scripts and the CSS files of this client version. Page data stays in IndexedDB, where the hash logic above controls it (claude, proposed).
- **When the server is not running**, the installed app opens with the cached shell, shows that the server is off, and can show pages already in the cache, read-only (claude, proposed). It never pretends to be up to date.

## 09 Embedded in the binary

- `vite build` writes the client with content-hashed file names. The engine's build compresses the output and embeds it in the binary.
- The Rust server serves it from memory. Hashed files are sent with a long cache lifetime; `index.html` is always revalidated, so a new binary's client shows up on the next load.
- One binary carries exactly one client version, so the client and the engine always match. Pinning an older agentks with mise pins its client too.

## 10 Dev mode (state 1)

The Vite dev server runs the client with hot reload and passes everything that is not the client through to the Rust engine running from the working tree ([development workflow](../05_delivery/05_development-workflow-and-testing.md)).

```ts
// apps/agentks-client/vite.config.ts (sketch)
export default defineConfig({
  server: {
    proxy: {
      '/api':             { target: ENGINE_URL, ws: true },
      '/artifacts':       ENGINE_URL,
      '/content-assets':  ENGINE_URL,
      '/assets':          ENGINE_URL,
      '/_lib':            ENGINE_URL,
      // the theme CSS route as well
    },
  },
});
```

The engine in dev mode serves only data and files, never the client, so there is one client at a time and no stale embedded copy.

## 11 Safety

- **Localhost only by default.** The server listens on localhost, so the client and, in Phase 2, editing are not reachable from the network. Network access waits for auth in the multi-user stage ([the sync engine and server](../02_engine/04_sync-engine-and-server.md)).
- **Artifacts run in iframes**, as today, so their scripts cannot reach the app around them. Which files Rust serves as HTML stays a deliberate list; it is the security boundary the prior audit named.
- **Page bodies are the project's own content**, rendered by Rust, and are placed in the page as HTML. The client never inserts HTML that came from anywhere else.

## 12 Open

- The UI framework, which also decides the router ([open question 12](../01_overview/05_open-questions-and-risks.md)).
- How much an installed PWA does while the server is off (section 08).

Both are tracked in [open questions and risks](../01_overview/05_open-questions-and-risks.md).
