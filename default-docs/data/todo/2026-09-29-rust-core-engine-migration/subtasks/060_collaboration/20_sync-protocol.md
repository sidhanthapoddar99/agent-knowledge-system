---
title: "Sync protocol — joining a document and syncing it over /api"
status: open
---

Live documents sync over the same `/api` WebSocket as everything else, in binary frames, using the standard Yjs sync and awareness messages so the browser can use the stock `yjs` library. This leaf defines and builds the framing: how a client joins and leaves a document, how the initial sync runs, how updates and awareness flow, and how the protocol is versioned. It keeps text frames (JSON) for control and binary frames for CRDT data.

# 01 To Do
- [ ] **Control messages (JSON text frames), through the request router of [050/20](../050_server/20_websocket-api.md):**
      ```json
      { "id": 12, "op": "doc.join",  "params": { "path": "data/dev-docs/01_x.md", "epoch": "e7…" } }
      { "id": 12, "ok": true, "data": { "doc": 3, "epoch": "e7…", "role": "edit", "kind": "text" } }
      { "id": 13, "op": "doc.leave", "params": { "doc": 3 } }
      ```
      `doc` is a small number for this connection, so binary frames need not repeat the path. `epoch` in the request is the one the client holds (or null); a different reply epoch means "discard and resync" ([060/10](./10_yrs-document-per-file.md)).
- [ ] **Binary frames:** `[u8 channel][varuint doc][payload]`.
    - [ ] Channel `0` sync: the Yjs sync protocol messages (step 1 = state vector, step 2 = missing updates, update). Use the `yrs` sync module (or the `y-sync` crate) so the bytes match the JavaScript `y-protocols`.
    - [ ] Channel `1` awareness: the Yjs awareness protocol ([060/30](./30_presence.md)).
    - [ ] Unknown channel or doc number → close `4400`.
- [ ] **Join sequence:** join → server sends step 1 → client answers step 2 and sends its own step 1 → server answers step 2 → both then stream updates. The client keeps the editor read-only until the first sync completes (the fix today's editor needed).
- [ ] **Role enforcement:** updates from a `read` connection are dropped and answered once with an error; awareness from `read` connections is allowed (they can be seen).
- [ ] **Fan-out:** an update from one connection is applied to the server document and forwarded to every other joined connection. Bound each connection's queue as in [050/20](../050_server/20_websocket-api.md); on overflow force a resync for that document.
- [ ] **Reconnect:** a client that reconnects re-joins with its epoch. Same epoch → normal step 1/2 exchange sends only what is missing. Different epoch → discard and apply unsaved text as a diff.
- [ ] **Protocol version:** the `hello` exchange's `protocol` number covers this framing ([140/50](../140_versioning-and-migrations/50_protocol-version-handshake.md)). A framing change bumps it.
- [ ] **Client adapter:** a small TypeScript provider in the client (replacing today's `yjs-client-v2.ts`) that speaks this framing; built with [110/40](../110_editing/40_save-path-and-sync.md).

## Guardrails
- One socket per tab for everything. No second WebSocket for sync (today's editor had its own).
- Stock Yjs wire messages inside our framing, so the browser side uses the maintained `yjs` and `y-protocols` packages unmodified.

## Done when
- A Rust test client and the TypeScript provider interoperate: text typed in a browser appears in a Rust-driven client and back (end-to-end test in [060/95](./95_collaboration-tests.md)).
- A `read` connection's update is rejected and the document is unchanged.
- A dropped connection that reconnects receives only the missing updates (measure bytes).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository — server in `apps/agentks-engine/` (sync module), client provider in `apps/agentks-client/src/editor/`.

**Read first:**
- [Sync engine and server, sections 03 and 06](../../notes/02_engine/04_sync-engine-and-server.md) — "binary frames for sync updates, JSON for awareness"; this leaf moves awareness into binary frames too, because the Yjs awareness protocol is binary.
- Today's framing and message types: [yjs-sync.ts](../../../../../../agent-ks-engine/src/dev-tools/server/yjs-sync.ts) (`MSG_SYNC 0`, `MSG_PING 2`, `MSG_CONFIG 3`, `MSG_AWARENESS 6`), [yjs-client-v2.ts](../../../../../../agent-ks-engine/src/dev-tools/editor/sync/yjs-client-v2.ts).

**Depends on:** [050/20](../050_server/20_websocket-api.md), [060/10](./10_yrs-document-per-file.md).
**Unblocks:** [060/30](./30_presence.md), [060/80](./80_diagram-collaboration.md), [110/40](../110_editing/40_save-path-and-sync.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): editing talks to the server over the same WebSocket.
- Decided (claude, 2026-09-30): binary frames `[channel][doc][payload]` with stock Yjs sync and awareness payloads; control messages stay JSON; awareness goes in binary frames, changing the server note's "JSON for awareness".
- Decided (claude, 2026-09-30): ping and timing config messages are dropped; WebSocket ping handles liveness, and timings are constants.

# 05 Notes & Analysis

## Watch out
- `yrs` and the JavaScript `yjs` must agree on the update encoding version (v1). Pin both, and add a cross-language test that fails if either changes.
