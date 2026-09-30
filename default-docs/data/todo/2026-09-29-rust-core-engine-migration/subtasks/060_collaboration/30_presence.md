---
title: "Presence — who is here, and where their cursor is"
status: open
---

When several people use one project, each should see who else is on the same page, and while editing, where their cursors and selections are. This leaf builds presence at two levels: **page presence** (who is viewing which page, shown on the page and in the toolbar) and **document presence** (cursors and selections inside a live document, through the Yjs awareness protocol). It takes over subtask `02_presence-and-live-users` of [2026-04-10-sync-and-presence](../../../2026-04-10-sync-and-presence/issue.md), whose server half was written in TypeScript but never had a client.

# 01 To Do
- [ ] **Identity for display.** No accounts: on first visit in share mode the client asks for a display name (kept in local storage per project) and gets a colour picked from the theme's palette, deterministically from a per-connection id. The owner on localhost shows as the name set in machine settings, or "Owner".
- [ ] **Page presence (server).** Each connection reports the page it shows (`presence.page { url }`). The server keeps `connection → { name, colour, role, url, editing path?, last seen }` and pushes `presence { users: [...] }` to connections on the same page when it changes. Remove a user 30 s after its socket dies (today's stale threshold).
- [ ] **Document presence (awareness).** Inside a joined document, cursors and selections use the Yjs awareness protocol on channel `1` ([060/20](./20_sync-protocol.md)). The server relays awareness to the document's other connections and clears a connection's state when it leaves.
- [ ] **Client, carried from subtask 02:**
    - [ ] Remote cursor labels in the user's colour, and remote selection highlights, in CodeMirror (the `y-codemirror.next` remote cursors, styled with theme variables).
    - [ ] The list of people on the page, with colours, in the dev toolbar and on the page header ([110/10](../110_editing/10_dev-toolbar.md)).
    - [ ] Click a person to jump to their cursor.
- [ ] **Throttle** cursor updates to one per 100 ms on the client (today's `cursor_throttle`).
- [ ] **Privacy:** presence carries names and positions only. Never access-key labels or ids to other users, never file contents.
- [ ] **Diagram presence** hooks for [060/80](./80_diagram-collaboration.md): pointer position and selected element ids through the same awareness channel.

## Guardrails
- Presence never affects content or the shared cache.
- Colours come from theme variables, never hard-coded hex ([theming rules in AGENTS.md](../../../../../../AGENTS.md)).

## Done when
- Two browsers on one page each see the other's name; closing one removes it within 30 s.
- While both edit, each sees the other's cursor label and selection move live.
- Clicking a name scrolls to that person's cursor.
- A `read` visitor appears in the list but has no cursor in the text.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository — server in `apps/agentks-engine/` (`agentks-sync`), client in `apps/agentks-client/src/editor/` and the dev toolbar.

**Read first:**
- [Sync engine and server, section 06](../../notes/02_engine/04_sync-engine-and-server.md) — presence uses Yjs awareness; names typed by visitors.
- The absorbed subtask: [02_presence-and-live-users](../../../2026-04-10-sync-and-presence/subtasks/02_presence-and-live-users.md), and [its comment on the unused presence server](../../../2026-04-10-sync-and-presence/comments/001_2026-08-07_claude.md).
- Today's presence server, for the data it tracked: [presence.ts](../../../../../../agent-ks-engine/src/dev-tools/server/presence.ts).

**Depends on:** [060/20](./20_sync-protocol.md), [060/40](./40_access-keys.md) (roles), [110/10](../110_editing/10_dev-toolbar.md).
**Unblocks:** [060/80](./80_diagram-collaboration.md), [060/95](./95_collaboration-tests.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): a visitor types a display name; there is no identity beyond the access key ([server note](../../notes/02_engine/04_sync-engine-and-server.md)).
- Decided (claude, 2026-09-30): page presence is a JSON push on `/api`; cursor presence is Yjs awareness in binary frames. Today's separate SSE channel is not rebuilt.

# 05 Notes & Analysis

## 01 What happens to today's presence config
The six `editor.presence.*` keys in `site.yaml` are dropped in 1.0.0; the useful values (100 ms cursor throttle, 30 s stale threshold) become constants here.

## Watch out
- Awareness state from a crashed tab lingers until the awareness timeout (30 s in `y-protocols`). Clear it on socket close on the server instead of waiting.
