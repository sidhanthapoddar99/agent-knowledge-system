---
title: "Later stage: multi-user editing and auth"
---

Several people editing the same content at once comes **after phase 2**, and it needs **auth first**. Nobody should reach the editor over a network without signing in. The auth design is deliberately left for that stage; this note keeps the requirement and the inputs so they are not lost.

# 03 References

- [Server, WebSockets and editing](../01_initial_discussion/09_server-websockets-and-editing.md) — the `/api` WebSocket and the localhost default.
- [Editing mode](./02_editing-mode.md) — the single-user editing this extends.
- [2026-04-10-sync-and-presence](../../../2026-04-10-sync-and-presence/issue.md) — the existing sync and presence work.
- [Auth and access control](../../../2026-05-08-runtime-stack-migration/brainstorm/02_idea_editor-as-standalone-product/03_discuss_auth-and-access-control.md) — earlier thinking on gating, from the Go issue.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): multi-user editing is a later stage, after phase 2.
- Decided (sidhantha, 2026-09-29): it needs auth, which will be designed at that stage.

# 05 Notes & Analysis

## 01 Building blocks

- **Shared editing:** `yrs`, the Rust port of Yjs, on the server. The prior audit's worry about the server-side CRDT does not apply in Rust, where `yrs` is native.
- **Transport:** the same `/api` WebSocket the single-user editor uses.
- **Presence:** who is here and where their cursor is, from the sync and presence issue.
- **Secrets:** in `config/.env` ([config and .env](../01_initial_discussion/06_config-folder-and-env.md)).

## 02 Until then

The server listens on localhost only. Network access stays off until auth exists. This is a safety rule for phase 1, not part of this later stage.

## 03 Questions for that stage

- Who signs in, and how: local accounts, a shared token, or an outside login provider.
- What a signed-in person may do: read, edit, or change config.
- How edits are attributed in git when several people change one file.
