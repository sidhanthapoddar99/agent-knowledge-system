---
title: "The /api socket"
---

This page explains how a connection on `/api` opens and stays healthy. The requests are on [requests and replies](./15_requests-and-replies.md), and the pushes on [pushes and back-pressure](./20_pushes-and-back-pressure.md).

## One socket, two kinds of frame

Every tab opens one WebSocket to `/api` on the page's own host. Everything the client needs travels on it.

| Frame | Carries |
|---|---|
| Text | JSON: the hello, every request, every reply and every push |
| Binary | Live-document sync for editing and collaboration. The framing is on [the sync protocol](../30_collaboration/10_sync-protocol.md) |

A binary frame that arrives before any document is joined closes the connection with `4400`.

## Where the messages are defined

Every message is a Rust type in the crate `agentks-api`, under `apps/agentks-engine/crates/api/src/messages/`. `client.rs` holds what the client sends (`ClientMessage`: hello, `get`, `render`, and the editing requests). `server.rs` holds what the server sends (`ServerMessage`: its hello, a reply or a push). `agentks-api` sits at layer 1 and depends only on `agentks-core`, so the server, the CLI and the tests share the same types.

The `agentks-api-schema` binary generates `apps/agentks-engine/schema/api.schema.json` from those types with `schemars`. Example messages live in `apps/agentks-engine/schema/fixtures/`. The frontend generates its TypeScript types from that schema ([data interface and types](../25_frontend/10_data-interface-and-types.md)), so each shape has one copy.

## The hello

The client's first frame is its hello. The server answers with its own hello before it sends anything else.

```json
{ "op": "hello", "api_version": 1, "client_build": "a1b2c3" }
{ "op": "hello", "ok": true, "api_version": 1, "engine": "1.0.0", "project": "8c1f...", "role": "owner", "client_build": "a1b2c3" }
{ "op": "hello", "ok": false, "api_version": 1, "engine": "1.0.0", "project": "8c1f...", "client_build": "d4e5f6", "reload": true }
```

| Field | Sent by | Meaning |
|---|---|---|
| `op` | both | Always `hello` |
| `api_version` | both | One number that versions every message and every data shape |
| `client_build` | both | The hash of the client bundle. The Vite dev server's client sends `dev` |
| `ok` | server | Whether the connection may go on |
| `engine` | server | The engine version |
| `project` | server | The project key |
| `role` | server, when `ok` is true | What this connection may do (below) |
| `reload` | server, on a mismatch | The client must reload to get the matching client |

The server closes the connection with `4400` when the first frame is not a hello, when no hello arrives within 10 seconds, or when a second hello arrives.

## Versioning

**One number, `api_version`,** versions the whole message set and every data shape, the sync frames included. It is `API_VERSION` in `apps/agentks-engine/crates/api/src/messages/mod.rs`. In agentks 1.0.0 it is `1`.

- It goes up on any breaking change: a removed or renamed field or message, or a changed meaning.
- An added optional field is not breaking, so it does not change the number.

**The client build is compared as well.** The server compares the hello's `client_build` with the build hash of its embedded client, so two builds of one version are told apart. A `client_build` of `dev` is always accepted.

**On a mismatch** the server answers `ok: false, reload: true`, then closes the connection with `4409`. The client reloads itself once and gets the client that matches the server. This catches the two cases a fresh page load cannot: a tab left open while the binary was upgraded, and an installed PWA whose cached client is old. The client's side of this is on [the WebSocket client](../25_frontend/25_websocket-client.md).

How `api_version` and the engine version relate to the content version gate is in [versioning](../50_versioning/01_overview.md).

## Roles

The hello's `role` is one of three values, the `Role` type in `agentks-api`:

| Role | Who has it | May use |
|---|---|---|
| `owner` | A localhost connection outside share mode | Everything |
| `edit` | A visitor whose access key has the `edit` role | Everything a page needs, including editing |
| `read` | A visitor whose access key has the `read` role | Pulls only |

`render`, `open`, `save` and document updates need `edit` or `owner`. The request router calls one function, `role_allows`, once for every request, and no handler repeats the check. Access keys are on [access keys and sessions](../30_collaboration/25_access-keys.md).

## Limits

The limits live in `Limits`, in `apps/agentks-engine/crates/server/src/app.rs`. Tests shrink them; the defaults are the product's.

| Limit | Default | When it is reached |
|---|---|---|
| Requests in flight per connection | 64 | The reply is `busy` |
| Messages waiting to be written to one connection | 256 | New messages for that connection wait, so it falls behind on the project's push channel |
| Pushes the project's channel holds for a connection that falls behind | 256 | That connection drops its pending pushes and gets one `resync` |
| Largest text frame | 8 MB | The connection closes with `1009`, because an unread frame has no `id` to reply to |
| Time to send the hello | 10 s | The connection closes with `4400` |
| Ping interval | 20 s | — |
| Silence before closing | 60 s | The connection closes with `1001` |

## Close codes

| Code | Meaning | What the client does |
|---|---|---|
| `1000` | Normal close | — |
| `1001` | The server is shutting down, or the connection went silent | Reconnects with backoff |
| `1009` | A text frame was larger than 8 MB | Reconnects |
| `4400` | Protocol error: no hello, a second hello, a frame that does not parse and has no readable `id`, an unknown binary channel | Reconnects |
| `4401` | No valid session, or the access key was revoked | Stops and shows the key prompt |
| `4409` | The hello did not match | Reloads once |

`4400` and `4401` are named constants in `agentks-api`: `CLOSE_PROTOCOL_ERROR` and `CLOSE_UNAUTHORISED`.
