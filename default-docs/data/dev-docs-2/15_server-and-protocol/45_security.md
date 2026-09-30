---
title: "Security"
---

This page lists the rules that keep the local server local. The server can read the whole project and write its content, and any web page open in the same browser can try to talk to `localhost`. Each rule blocks one way in, is enforced once on the server, and has its own test.

## The rules at a glance

| Rule | Blocks |
|---|---|
| Bind to `127.0.0.1` and `::1` only | Anyone on the network reaching the server |
| Refuse a `Host` other than `localhost`, `127.0.0.1` or `[::1]` with this server's port | DNS rebinding: a web page that points its own name at `127.0.0.1` to reach the server |
| Refuse a WebSocket upgrade whose `Origin` is not the server's own | Another site open in the browser driving `/api` |
| Decode file paths once, refuse traversal, resolve symlinks, require the result inside an allowed root | Reading files outside the project with `../`, encoded dots or symlinks |
| Serve `text/html` only from `/artifacts/` and `/_lib/` | A file that happens to be HTML running as a page on the server's origin |
| Security headers and a CSP on every response | Content-type sniffing, leaked referrers, embedding by other sites, scripts in data files |
| Writes only through `save`, only to existing files in content sections | The editor writing config, `.git` or anything outside the project ([file writes](./30_file-writes.md)) |
| Network access only with `--share`, and then every request needs an access-key session | Reaching the editor over a network without a key ([collaboration](../30_collaboration/01_overview.md)) |

Most of these live in `apps/agentks-engine/crates/server/src/security.rs` and `apps/agentks-engine/crates/server/src/mime.rs`. A middleware, `guard`, runs in front of every route.

## Loopback only

Outside share mode the server binds `127.0.0.1` and `::1` and nothing else. `ss -ltnp`, or the platform's equivalent, shows it.

## The Host check

`guard` reads the `Host` header, or the authority of an absolute-form request line. It must be `localhost`, `127.0.0.1` or `[::1]`, with this server's own port. Anything else gets `421 Misdirected Request`, before any route runs.

This is what stops DNS rebinding. A hostile page can make its own domain resolve to `127.0.0.1`, but the browser still sends that domain in `Host`, so the server refuses it.

## The Origin check

A WebSocket upgrade on `/api` must carry an `Origin` equal to `http://` plus the `Host` it was sent to. A missing or different `Origin` gets `403`.

In development, the Vite dev server proxies the socket, so the `Origin` is Vite's. A development build of `agentks` accepts one extra origin, named explicitly with the hidden flag `agentks start --dev-origin <URL>`, and never by default. A release build refuses that flag.

## File paths

Every file route, `/assets/`, `/content-assets/`, `/artifacts/` and `/_lib/`, handles its path in two steps.

**The server decodes once and refuses** (`decode_file_path`):

- `.` and `..` segments, and empty segments such as `a//b`;
- a leading `/`;
- backslashes and NUL bytes, in plain or encoded form;
- anything that is not valid UTF-8 after decoding.

Decoding happens exactly once. `%2e%2e` becomes `..` and is refused. `%252e` becomes the literal text `%2e`, which is an ordinary name.

**The engine resolves and checks the root.** `Backend::file_for` resolves symlinks and requires the result inside the route's allowed root: the content sections, the asset paths config names, or the library cache. It uses one function, `canonical_inside` in `agentks-cache`, which the page saves and the library store use too. The split exists because the server does not know the roots, and the engine does.

## The MIME allowlist

`apps/agentks-engine/crates/server/src/mime.rs` holds one table from file extension to content type.

- `text/html` comes only from `/artifacts/`, `/_lib/` and the client's own `index.html`.
- An `.html` or `.htm` file anywhere else is sent as `text/plain`.
- An extension not in the table is `application/octet-stream`, with `Content-Disposition: attachment`, so the browser downloads it instead of guessing.

This is the HTML boundary. The project's HTML runs only where it is meant to run.

## Headers

Every response, refusals included, carries:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |

The `Content-Security-Policy` depends on the route. `file_csp` builds it as a function of the route, so changing one route's policy is one line.

| Response | CSP | Why |
|---|---|---|
| The app, `index.html` | Same-origin scripts and styles, the socket, `blob:` and `data:` where diagram viewers and editors need them, `frame-ancestors 'self'` | Only agentks's own code runs in the app, and no other site can frame it |
| `/_lib/` | A sandbox that allows scripts and popups, but no network connections | Library HTML is third-party code ([libraries](../35_libraries/01_overview.md)) |
| `/content-assets/`, `/assets/` | `sandbox; default-src 'none'`, with images and inline styles allowed | An SVG or XML file opened directly runs no script. The header does not affect the file used as an image |
| `/artifacts/` | None | The project's own artifacts run unsandboxed, as first-party content |

## Resource limits

The time, frame-size and in-flight limits are on [HTTP routes](./05_http-routes.md) and [the /api socket](./10_the-api-socket.md). A slow client cannot grow server memory ([pushes and back-pressure](./20_pushes-and-back-pressure.md)).

## Share mode adds, never removes

`agentks start --share` changes where the server listens and which `Host` and `Origin` values it accepts, and requires an access-key session on every request, loopback included. It turns none of the rules above off ([network exposure](../30_collaboration/30_network-exposure.md)).
