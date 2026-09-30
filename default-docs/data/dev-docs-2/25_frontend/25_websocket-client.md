---
title: "The WebSocket client"
---

This page explains the client's side of the `/api` protocol: how the one connection per tab opens, how requests and replies are matched, what the client does with each push, and how it survives a stopped server or an upgraded binary. The protocol itself belongs to the server, on [the /api socket](../15_server-and-protocol/10_the-api-socket.md) and [requests and replies](../15_server-and-protocol/15_requests-and-replies.md).

## The parts

| File in `apps/agentks-client/src/data/` | Job |
|---|---|
| `socket.ts` | `ApiSocket`: the one connection, requests, pushes, reconnect and reload |
| `source.ts` | The `DataSource` over the socket, with the cache in front ([the browser cache](./30_browser-cache-and-live-updates.md)) |
| `transport.ts` | The socket URL: `/api` on the page's own host, `wss:` when the page is `https:` |
| `backoff.ts` | The reconnect delays |
| `reload-guard.ts` | Stops a reload loop |
| `errors.ts` | `ApiError`, the one failure type callers see |
| `build.ts` | The `api_version` and the `client_build` this client sends |

## One connection per tab

Each tab opens one WebSocket to `/api` on the same host as the page. Because the URL is relative to the page's host, the same code works behind the Vite dev proxy and against the binary.

| Direction | Message | The client's use |
|---|---|---|
| First frame | `hello`, with `api_version` and `client_build` | Opens every connection |
| Pull | `get` with `what: manifest` | After each accepted hello |
| Pull | `get` for a page, sidebar, index, issue or custom page, with `have` | Through `DataSource` |
| Pull | `render`, `open`, `save` | The editor ([file writes](../15_server-and-protocol/30_file-writes.md)) |
| Push | `changed` | Drop stale copies, redraw what is on screen |
| Push | `errors` | The dev toolbar's list of content problems |
| Push | `fatal` | Draw the list of config errors instead of the page |
| Push | `resync` | Check every copy against the server again |
| Binary frames | Live-document sync | The editor ([the sync protocol](../30_collaboration/10_sync-protocol.md)) |

A push type the client does not know is ignored, with a note in development.

## Requests

- **Queued until the hello.** A request made before the server's hello is kept and sent once the connection is open.
- **Ids.** Each request gets the next number on this socket. Replies come back in any order and are matched by id, so several requests can be in flight.
- **Timeout.** A request with no reply after 10 seconds fails with `timeout`. A late reply to it is dropped.
- **Failures.** Every failure is an `ApiError`. Its `kind` is one of the server's `ReplyErrorKind` values, or one of two the client adds itself: `timeout` and `disconnected`. `busy`, `timeout` and `disconnected` are retryable.

## Reconnect

When the connection drops:

1. The client shows a small "disconnected" notice and keeps the current page on screen.
2. Requests already sent fail as `disconnected`, because a sent request can never be answered on a new connection. Requests not yet sent wait for the next one.
3. The client reconnects with backoff: 250 ms doubling up to 5 seconds, each delay scaled by a random 50 to 100 percent, so many tabs do not reconnect at the same instant.
4. It sends its hello again. After the hello is accepted, the app forgets which hashes it had confirmed, fetches the manifest again, and checks every cached copy against it. So it refreshes whatever changed while it was away.

## When the server runs another client

The server compares the hello's `api_version` and `client_build` with its own. On a mismatch its hello says `ok: false, reload: true`. The client then:

1. stops, fails every open request, and closes the socket;
2. reloads the page once, which fetches the client that matches the server.

**The reload guard.** Before reloading, the client sets a flag in session storage, keyed by its build. If the reloaded page still mismatches, for example because a proxy is caching the old bundle, the flag is already set, so the client stops instead of reloading again. An accepted hello clears the flag.

A client in development sends `client_build: "dev"`, which the server always accepts.

## When the key is refused

In share mode, a connection without a valid session closes with `4401`. The client then stops reconnecting and reports `unauthorised`, and the app shows the access-key prompt ([access keys and sessions](../30_collaboration/25_access-keys.md)).

## Connection states

`ApiSocket.status` is one of five values, and the app draws a notice from it:

| Status | Means |
|---|---|
| `connecting` | Opening a connection, or waiting for the hello |
| `open` | The hello was accepted |
| `disconnected` | The connection dropped. A reconnect is scheduled |
| `unauthorised` | Closed with `4401`. No reconnect |
| `outdated` | The hello did not match. The page reloads, or stops if it already reloaded once |

## Testing

The client's tests drive the socket and the source through an in-memory fake socket that runs the mock engine's protocol, under Vitest with happy-dom. They cover the hello order, out-of-order ids, `unchanged`, the timeout, reconnect with a new hello, a version mismatch that reloads once and never loops, `4401`, pushes, `have`, request sharing, and answers served with no round trip. The same mock engine runs over a real WebSocket in development.
