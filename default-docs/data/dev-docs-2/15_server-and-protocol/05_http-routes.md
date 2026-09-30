---
title: "HTTP routes"
---

This page lists every HTTP route the server answers, what each serves and how the browser may cache it.

## The route table

| Route | Serves | `Cache-Control` |
|---|---|---|
| `/api` | The WebSocket upgrade. Without an upgrade, the health probe | — |
| `/theme.<hash>.css` | The project's compiled theme CSS | `public, max-age=31536000, immutable` |
| `/client/*` | The client's scripts, CSS and fonts, from the embedded bundle | immutable, because the names carry hashes |
| `/assets/*` | Framework chrome that config names: the logo and the favicon | `no-cache`, with an ETag |
| `/content-assets/*` | Files a page refers to: images, data, diagram sources. From the content sections only | `no-cache`, with an ETag |
| `/artifacts/*` | `.html` artifact pages. The one place project HTML is sent as `text/html` | `no-cache`, with an ETag |
| `/_lib/<alias>/<element>` | A library element from the machine's library cache | immutable for a locked commit, `no-cache` for a local library |
| `/manifest.webmanifest`, `/sw.js` | The PWA files from the bundle | `no-cache` |
| any other path | The client's `index.html` | `no-cache` |

The server answers only `GET` and `HEAD`. Any other method gets `405` with `Allow: GET, HEAD`. A `HEAD` request gets the same headers as `GET` and an empty body.

[Libraries](../35_libraries/01_overview.md) explains the cache behind `/_lib/`, and [security](./45_security.md) its sandboxing CSP.

## One dispatch function

`/api` has its own handler. Every other path goes through one function, `dispatch` in `apps/agentks-engine/crates/server/src/http.rs`. It reads the raw URL path itself, because axum's path extractors decode the path, and a file route must decode it exactly once. `dispatch` splits off the first segment and picks the route from it.

The reserved names live once, in `agentks-core`, as `RESERVED_SEGMENTS` and `RESERVED_ROOT_FILES`. The manifest builder refuses a section whose base URL collides with one, so no content page can take a URL under `/assets/` or `/api`.

A reserved prefix with no file after it, such as `/assets` or `/api/x`, is a real `404`. It never falls through to the app.

## Page paths return the app

For every path that is not a route, the server returns `index.html` with status `200`. The client looks the path up in the manifest and draws the page, or its own not-found view. The server never decides whether a page exists.

File routes stay strict. An unknown file under `/content-assets/` is a real `404`. Otherwise a typo in an asset link would quietly render the whole app instead of failing.

## The embedded client

The Vite build of the client is included in the binary at compile time. Each file is stored in three forms: brotli, gzip and plain. The server picks one by the request's `Accept-Encoding`, in that order, and sends `Vary: accept-encoding`.

- Files under `/client/*` have content hashes in their names, so they are immutable.
- `index.html` is revalidated on every load. A new binary's client therefore shows up on the next page load.
- The hello carries the client's build hash, so a stale tab reloads ([the /api socket](./10_the-api-socket.md)).
- `index.html` carries the app's `Content-Security-Policy` ([security](./45_security.md)).

**Development builds.** A development build of the engine has no embedded client, so it serves no `/client/*` and no `index.html`. A page path gets a plain `404` that names the Vite dev server. Its hello says `client_build: "dev"`.

## The theme CSS

The theme URL is `/theme.<64 hex digits>.css`, where the digits are the hash of the compiled CSS. The manifest names the current URL, and the client points its stylesheet link at it.

A request for any other hash gets `404`. Browsers cache an earlier URL as immutable, so answering it with the current CSS would poison those caches. The compiler behind this route belongs to [the engine](../10_engine/01_overview.md).

## Files from disk

`apps/agentks-engine/crates/server/src/files.rs` sends every file from `/assets/`, `/content-assets/` and `/artifacts/`.

1. `dispatch` decodes the path once and refuses traversal ([security](./45_security.md)).
2. The engine finds the file: `Backend::file_for(route, path)` resolves symlinks and checks that the result is inside the route's root. An unknown file is `404`.
3. The server streams the file in 64 KB chunks.
4. It honours one `Range` per request (`206`, or `416` when the range is outside the file) and `If-Range`, so audio and large files can seek.
5. The ETag is the file's BLAKE3 content hash, never its modification time. The server caches each hash by path, length and modification time, and the watcher drops the entry on every event. `If-None-Match` with the current ETag gets `304`.
6. The content type comes from the MIME allowlist.

| Route | Root the engine checks |
|---|---|
| `/assets/*` | The asset paths `site.yaml` names |
| `/content-assets/*`, `/artifacts/*` | The content sections |
| `/_lib/*` | The machine's library cache, at the locked commit |

## The health probe

`GET /api` without an upgrade answers `426 Upgrade Required`, with `Cache-Control: no-store` and a JSON body:

```json
{ "agentks": "1.0.0", "project": "8c1f..." }
```

That is how `agentks start`, `agentks ps` and a port conflict recognise an agentks server of a given project ([server lifecycle](./35_server-lifecycle.md)).

## When the engine fails behind a route

| Engine answer | HTTP answer |
|---|---|
| Not found | `404` |
| Not implemented | `501`, naming what is missing |
| Anything else | `500` "the engine failed", logged with the error |

A route that takes longer than 30 seconds to start its answer gets `408`. A file that has started streaming is not cut off.
