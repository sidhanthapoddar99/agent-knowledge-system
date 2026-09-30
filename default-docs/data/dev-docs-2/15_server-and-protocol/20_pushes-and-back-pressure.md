---
title: "Pushes and back-pressure"
---

This page explains the messages the server sends without being asked, which tabs receive each one, and how a slow tab is kept from growing the server's memory. The watcher that produces most pushes is on [the file watcher](./25_the-file-watcher.md).

## The pushes

A push has a `push` field and no `id`. It never carries page data, only hashes and problems. Each tab decides what to fetch again.

```json
{ "push": "changed", "hashes": { "page:/dev-docs/a": "b3:...", "sidebar:dev-docs": "b3:...", "manifest": "b3:..." }, "removed": ["page:/dev-docs/old"], "moved": { "page:/dev-docs/old": "/dev-docs/new" } }
{ "push": "errors", "file": "data/dev-docs/01_x.md", "errors": [ ] }
{ "push": "fatal", "errors": [{ "file": "config/site.yaml", "line": 12, "type": "alias-unknown", "severity": "error", "message": "Unknown alias @dat.", "key": "pages.docs.data", "suggestion": "Did you mean @data?" }] }
{ "push": "resync" }
```

| Push | Sent when | Carries |
|---|---|---|
| `changed` | Files changed and some data keys have new hashes | The new hash of every affected key. `removed` lists keys that no longer exist. `moved` gives the new URL of a page whose file moved |
| `errors` | A file's content problems changed | The current problems of one file. An empty list means the file is clean now |
| `fatal` | A config change broke loading | Every problem, as error records with file, line, key and a suggested fix |
| `resync` | The server dropped pushes for this tab | Nothing. The tab fetches the manifest again and compares hashes |
| `saved` | The server wrote a file for an editor | The file and its new hash, sent to every tab showing that page ([file writes](./30_file-writes.md)) |

The types are `Push` in `apps/agentks-engine/crates/api/src/messages/server.rs`.

## What "affected" means

On a change, the engine works out every key whose hash moved, and the server pushes them in one `changed`. The list can include:

- the page whose file changed;
- every page that embeds that file, because a page's hash covers what it embeds;
- the section's sidebar;
- the tracker index, when an issue changed;
- the manifest, when config changed or a page was added, removed or moved.

The server does not work this out itself. The engine's key function decides it ([caching](../20_caching/01_overview.md)).

## Who receives what

The server keeps one push channel per project, the `Hub` in `apps/agentks-engine/crates/server/src/push.rs`. It writes each push to JSON once, and every connection shares that text.

Each connection remembers every key it asked for during its life. Then:

| Push | Goes to |
|---|---|
| `changed` | Every connection, cut down to the keys that connection asked for, plus `manifest`. A connection with no matching key receives nothing |
| `errors`, `fatal`, `resync` | Every connection |

`errors`, `fatal` and `resync` are keyed by a file or by nothing, so there is nothing to filter on. The dev toolbar shows the problems of every file anyway.

**The first sync after connect.** After the hello, the client asks for the manifest. It compares the manifest's hashes with its cache and fetches only what differs. That covers anything that changed while the tab was away.

## Back-pressure

A tab that stops reading its socket, such as a laptop asleep with the tab open, must not make the server hold more and more pushes for it. Two bounds stop that:

1. **The project's channel is bounded.** It is a tokio broadcast channel that holds 256 pushes. A connection that falls further behind loses the oldest ones, and the channel tells it how many it lost.
2. **Each connection's outgoing queue is bounded,** at 256 messages. When it is full, the connection stops taking from the channel, so it falls behind there instead of growing a queue.

When a connection learns it fell behind, it throws away the pushes it still holds and sends the tab one `resync`. The tab then fetches the manifest and compares hashes, so it ends up correct without the pushes it missed.

The channel's own "you fell behind" signal is the trigger. That bounds memory without keeping a copy of any push per connection.

## Keep-alive

The server pings every connection every 20 seconds. A connection that sends nothing for 60 seconds, not even a pong, is closed with `1001`. The client then reconnects, sends its hello again and resyncs ([the WebSocket client](../25_frontend/25_websocket-client.md)).

## Rules for adding a push

- Add the variant to `Push` in `agentks-api`. The schema, the fixtures and the TypeScript types follow from it.
- A push names data by key and hash. It never carries data or a rule for the client to apply.
- Decide whether it is filtered by key. Only a push about data keys can be.
- A breaking change to a push bumps `api_version` ([the /api socket](./10_the-api-socket.md)).
