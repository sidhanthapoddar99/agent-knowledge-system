---
title: "The client and routing"
---

This page explains `agentks-client`, the single-page app of the local tool, and its router: how a URL becomes a drawn page, and how the client is built and run.

## What the client is

`apps/agentks-client` is a single-page app (SPA): the browser loads it once, and from then on it draws every page itself, with the layouts of `agentks-ui`, from data it fetches over `/api`. It holds no rules: every URL, order and status arrives computed. It never serves the public; it runs on localhost for one or two people.

## Its parts

```
apps/agentks-client/
  index.html
  vite.config.ts          the dev proxy and the build that gets embedded
  src/
    main.ts               start-up: the socket, the cache, the DataSource, the app
    app/                  the route level: controller.ts, App.tsx, document.ts
    router/               routes.ts, router.ts, links.ts, scroll.ts
    data/                 socket.ts, source.ts, cache.ts, and their helpers
    state/view.ts         what the app shows, as data
    islands.ts            mounts the islands Rust marked in page bodies
    pwa/                  the web app manifest and the service worker
    devtoolbar/           the dev toolbar and its tools
    editor/               in-place editing
  dev/                    a mock engine for development and tests; never shipped
  tools/                  build plugins; never shipped
```

`devtoolbar/` and `editor/` exist only here. The static renderer never imports them.

## Start-up

1. `main.ts` creates the socket, the cache and the `DataSource` over them, then renders the app and starts the controller.
2. The socket connects and sends its hello ([the WebSocket client](./25_websocket-client.md)).
3. The controller asks for the manifest. The manifest names the navbar and footer layouts, the theme CSS URL and the favicon. The controller loads the navbar and footer and points the head links at those URLs.
4. The router reads the current URL and draws the first page.

## The route level

`apps/agentks-client/src/app/controller.ts` turns a navigation into data and a layout, and a push into a redraw. It sits outside the components so it can be tested without rendering. What the app shows is plain data in `apps/agentks-client/src/state/view.ts`: starting, a page, not found, a fatal config error, or a load error.

**Drawing a page:**

1. The router finds the path in the route table and reads its section and data key.
2. `DataSource` returns the data for that key, from the cache or over the socket.
3. The controller looks up the page's layout by name in the package's registry, and fetches the sidebar too when the layout needs it.
4. The layout draws the page, with the body HTML Rust rendered.
5. After the markup is in the page, the controller sets the title, moves focus, settles the scroll, and mounts the islands in the body ([islands](./20_islands.md)).

A section whose layout is not in the registry draws a load error that names the layout. It never draws with another layout. When a draw takes longer than 150 ms, a progress bar shows.

## The router

**Routes come from Rust.** The route table in `apps/agentks-client/src/router/routes.ts` is built only from the manifest: every URL with its section, data key and hash, plus the redirects from old URLs. The router never works a URL out from a file name, a slug or an `NN_` prefix.

**Paths match exactly.** There is no trailing-slash folding, because folding would be a URL rule outside Rust. The engine's redirects cover old URLs.

**Reserved paths are never pages.** `/api`, `/artifacts`, `/content-assets`, `/assets`, `/_lib`, `/client` and `/theme.<hash>.css` belong to the server ([HTTP routes](../15_server-and-protocol/05_http-routes.md)). Links to them load normally.

| Path | Handled by |
|---|---|
| A URL in the manifest | The router: fetch the page data, draw it with its layout |
| An old URL in the manifest's redirects | The router replaces the history entry with the new URL |
| A reserved path | The server. An artifact is shown in an iframe, or opened in full |
| Any other path | The server returns the app, and the router shows the not-found page inside the site frame, with a way back into the section |

**Which clicks the router takes** (`apps/agentks-client/src/router/links.ts`). A plain left click on a same-origin link whose path the route table knows draws the page without a reload. Everything else goes to the browser: modifier-key clicks, a `target` other than `_self`, `download` links, other origins, reserved paths and unknown paths. A link to a heading on the same page adds a history entry and scrolls, with no refetch.

## The chores a server-rendered site gets for free

- **Anchors.** Scroll to the `#heading` after the page is drawn: on first load, after a navigation, and again after the islands mount, because islands above the heading take space as they load.
- **Back and forward.** `history.scrollRestoration` is `manual`. The router saves the scroll position of the entry on screen in `history.state` as the reader scrolls, and restores it on back and forward. A new page starts at the top.
- **Focus.** After a navigation, focus moves to the page's main heading, so a screen reader starts there.
- **Title.** The document title becomes the page title and the site name. A polite live region announces it.

## Embedded in the binary

- `vite build` writes the client with content-hashed file names.
- **The build hash.** A Vite plugin puts a fixed-length placeholder in the code, hashes every chunk and asset after bundling, then writes the hash in place of the placeholder and into `dist/client-build.txt`. The client sends this hash as `client_build` in its hello, and the engine's embed step reads it from the text file.
- The engine's build compresses the output and embeds it in the binary. The server sends it from memory ([HTTP routes](../15_server-and-protocol/05_http-routes.md)).
- One binary carries exactly one client, so the client and the engine always match.

## In development

The Vite dev server runs the client with hot reload, and passes everything that is not the client through to an engine: `/api` (as a WebSocket), `/artifacts`, `/content-assets`, `/assets`, `/_lib` and the theme CSS URL. The engine is either one built from the working tree, whose address `CLIENT_ENGINE_URL` gives, or the mock engine in `dev/`, which speaks the `/api` protocol over the schema's fixtures. In development the client sends `client_build: "dev"`, and the engine accepts the Vite origin on its socket. The team's workflow is in [contributing](../55_contributing/01_overview.md).
