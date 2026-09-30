---
title: "Performance and offline"
---

This page explains how the client stays fast as a project grows, and what it does when the server is not running. One rule sits above all of it: **performance never moves a rule into the browser.** Faster filtering, sorting or search comes from Rust sending better data, never from the browser computing it.

## Where the time goes

On localhost a data request takes milliseconds, and the server computes every derived value once and shares it between all tabs ([caching](../20_caching/01_overview.md)). What the client controls is:

- how much JavaScript it downloads before the first page;
- whether the data for the next click is already in the browser;
- how much of the page it redraws, and how much of the page it draws at all.

## Code splitting

Mermaid, Excalidraw, draw.io, the video player and the editor dominate the frontend's weight. A reader of an ordinary docs page downloads none of them.

| Chunk | Holds | Loaded |
|---|---|---|
| `shell` | Start-up, the router, the socket, the cache, UI state | At start |
| One per layout | `docs`, `blog`, `issues`, each custom page, the diagram, artifact and video pages | When a page with that layout is drawn |
| One per heavy island | `mermaid`, `graphviz`, `excalidraw` (with React), `drawio`, `video-player` | When a page uses it |
| Editing | `devtoolbar`, `editor`, and one per diagram editor | When editing is turned on |

- **Dynamic imports only.** The layout and island registries in `agentks-ui` load every entry with `import()`. The shell never imports a heavy chunk statically.
- **No cross-links.** A chunk imports only from the shell or the package, never from another layout's chunk.
- **CSS travels with its chunk.** The shell's CSS holds only the reset, the theme link, the navbar and the footer.
- **A heavy library never moves into the shell** to save a request.

## Prefetch

The client fetches the data a reader is likely to open next, so a click finds it already there:

- **On intent.** After 80 ms of hover over a link whose path is in the manifest, or on keyboard focus, or on `touchstart`, the client asks for that page's data through `DataSource`, and preloads its layout's chunk. A copy already in the cache costs only a `have` check.
- **Next and previous.** After a docs page paints and the browser is idle, the client prefetches the `next` and `prev` pages the page data names.

The limits keep prefetch from flooding the socket:

| Limit | Value |
|---|---|
| Prefetches in flight | At most 4 |
| Prefetches per minute | At most 30 |
| A hidden tab, or `saveData` on | None |
| The tracker index and other large payloads | Never prefetched |
| A real navigation | Cancels queued prefetches and goes first |

Prefetch uses the same `DataSource` and cache as a normal request. It never runs anything with side effects: opening a file for editing is not a prefetch.

## Long lists

A tracker can hold thousands of issues, and drawing every row at once makes scrolling stutter. The fix is virtualisation: drawing only the rows in view.

- **Only the lists that can grow without bound,** and only past a threshold measured on large fixtures, never guessed. The candidates are the tracker's index table and card view, and a docs sidebar with very many visible items.
- **Readers keep what they expect.** Arrow keys and Page Up and Page Down move through every row. Tables keep `aria-rowcount` and `aria-rowindex`; tree items keep `aria-level`, `aria-setsize` and `aria-posinset`. The active sidebar item scrolls into view on navigation even if it was not drawn.
- **Find-in-page cannot see rows that are not drawn.** The tracker's own filter box is the search, and the layout's help text says so.
- **Static pages** write the full list as HTML. The island virtualises only after it mounts, and only when the list is long.

## Redraws

The client redraws in two cases: a navigation, and a `changed` push for something on screen ([the browser cache and live updates](./30_browser-cache-and-live-updates.md)).

- **By part.** Each part of the frame, such as the navbar, sidebar, outline, body and footer, redraws only when the hash of its own data changed. A changed body leaves the sidebar alone, and the reverse.
- **Once per frame.** A burst of pushes, such as a `git checkout`, becomes one redraw on the next animation frame.
- **The reader's place stays.** An in-place redraw keeps the scroll position, open panels and focus, and mounts again only the islands whose input changed.
- **The body stays Rust's HTML.** The client never rewrites it to go faster.

## Mobile and the installable app

- **Mobile friendly.** Every layout works on a phone: the sidebar becomes a drawer, tables scroll sideways, and touch targets are large enough.
- **Installable.** A web app manifest, `/manifest.webmanifest`, and a service worker, `/sw.js`, let a browser install the local site as an app window. The server sends both with `no-cache`. Browsers treat `localhost` as a secure origin, so a service worker is allowed there.
- **When the server is off,** the installed app opens, says clearly that the server is not running, and can show pages already in its cache, read-only. It never pretends to be up to date.
- **Over plain HTTP on a LAN,** in share mode, a visitor's browser does not run the service worker, because it runs only on `localhost` or HTTPS. The installable-app features are then off for that visitor, and everything else works ([network exposure](../30_collaboration/30_network-exposure.md)).
