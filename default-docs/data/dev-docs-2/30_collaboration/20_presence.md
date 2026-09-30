---
title: "Presence"
---

This page explains presence: how each person sees who else is on the same page, and, while editing, where the others' cursors and selections are. Presence runs at two levels, on two channels, and it never touches content or the shared cache.

## Two levels

| Level | Shows | Travels as |
|---|---|---|
| **Page presence** | Who is viewing which page, in the toolbar and on the page header | JSON on `/api`: the client reports its page, and the server pushes the list of people on that page |
| **Document presence** | Cursors and selections inside a live document | Yjs awareness messages, in binary frames on channel `1` ([the sync protocol](./10_sync-protocol.md)) |

Both use the tab's one socket. There is no separate presence channel.

## Who a person is

There are no accounts, so presence carries only what a person chose to show:

- **A display name.** In share mode, a visitor types a name on the first visit. The client keeps it in local storage, per project. The owner on localhost shows as the name in the machine's settings, or as "Owner".
- **A colour.** Picked from the theme's palette, the same way every time for a given connection. Colours come from theme variables, never from hard-coded values.
- **A role.** `owner`, `edit` or `read`.

`PresenceUser` in `apps/agentks-engine/crates/sync/src/presence.rs` holds exactly these, plus the page URL: name, colour, role and URL.

**Privacy.** Presence never carries an access key's label or id to other people, and never carries file contents. Names and positions only. The key's label is used only in the owner's edit journal and in commit trailers ([tracker live edits and attribution](./35_tracker-live-edits-and-attribution.md)).

## Page presence

1. Each connection reports the page it shows.
2. The server keeps, for each connection, its name, colour, role, page, the file it is editing if any, and when it was last seen.
3. When the list of people on a page changes, the server pushes the new list to the connections on that page. `Presence::show` and `Presence::gone` return exactly the connections whose list changed.
4. When a socket dies, the person is removed 30 seconds later. A short network drop does not make them flicker out and back.

## Document presence

Inside a joined document, cursors and selections use the Yjs awareness protocol:

- The server relays each connection's awareness to the document's other connections.
- The client throttles its own cursor updates to one per 100 ms.
- When a connection leaves the document, or its socket closes, the server clears that connection's awareness at once. It does not wait for the awareness timeout of `y-protocols`, so a crashed tab's cursor does not linger.
- A `read` connection's awareness is relayed too: it appears in the list of people, but it has no cursor in the text, because it cannot type.

## What the client draws

- Remote cursors with a label in the person's colour, and remote selection highlights, in CodeMirror, styled with theme variables.
- The list of people on the page, with their colours, in the dev toolbar and on the page header.
- Clicking a person scrolls to their cursor.

On a diagram canvas, the same awareness channel carries each person's pointer position and selected element ids ([diagram documents](./40_diagram-documents.md)).

## What presence never does

- It never changes content.
- It never enters the shared cache, which holds only derived data that every user shares.
- It never stores anything on disk.

The timings, the 100 ms cursor throttle and the 30-second removal, are constants in the code, not config.
