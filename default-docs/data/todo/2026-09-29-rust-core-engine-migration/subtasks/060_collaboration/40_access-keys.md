---
title: "Access keys — `agentks share`: keys, roles, sessions and revocation"
status: open
---

Other people reach a project's server only with an **access key** the owner creates. There are no accounts and no sign-in (sidhantha, 2026-09-30). A key is a long random secret with a role (`read` or `edit`) and a label. The server stores only a hash of it, in the machine home. A visitor presents the key once; the server swaps it for a session cookie so the key does not linger in URLs, history or logs. The owner can list and revoke keys at any time, and revoking cuts live sessions immediately.

# 01 To Do
- [ ] **Key format.** `aks_` followed by 26 base32 characters (130 bits of randomness from the OS). The prefix makes a leaked key easy to spot in a paste.
- [ ] **Store** `~/.agentks/share/<project key>.json`, owner-readable only (mode 600), written atomically:
      ```json
      { "format": 1, "keys": [ { "id": "k3f9", "label": "Asha", "role": "edit",
          "hash": "b3:…", "created": "…", "last_used": "…", "revoked": null } ] }
      ```
      Hash with BLAKE3 (a fast hash is right: the key is high-entropy random, not a password).
- [ ] **Commands** (surface in [070/90](../070_cli/90_share-commands.md)): `share create --role read|edit --label TEXT` prints the key and a ready link once; `share list`; `share revoke ID|--all`.
- [ ] **Owner key in share mode.** `agentks start --share` creates a one-run owner key and prints the owner link in the terminal. In share mode even loopback requests need a session, because a reverse proxy on the same machine makes every request look local.
- [ ] **Presenting a key.** `GET /?key=aks_…` (or a `POST /api/session` from the client's key prompt): verify the hash in constant time; create a session id (random 128 bits); set cookie `agentks_session=<id>; HttpOnly; SameSite=Strict; Path=/` plus `Secure` when served over HTTPS ([060/50](./50_network-exposure-and-tls.md)); redirect to the same URL without `key`.
- [ ] **Sessions** stored hashed in the same file (`sessions: [{ id_hash, key_id, created, last_seen }]`), so a server restart does not log everyone out. A session dies with its key.
- [ ] **Checks.** Every HTTP request and the WebSocket upgrade in share mode need a valid session; the role goes into the connection (`hello.role`, [050/20](../050_server/20_websocket-api.md)). No session → the app shows the key prompt; the socket closes with `4401`.
- [ ] **Revoke.** Mark the key revoked, drop its sessions, and close its open sockets with `4401` within one second.
- [ ] **Brute-force limit.** At most 10 failed key attempts per remote address per minute; then `429` for a minute.
- [ ] **Never log** keys, session ids or cookies. Redact `key=` from any logged URL.

## Guardrails
- Keys never live in the project or in `config/.env` ([project config, section 05](../../notes/02_engine/02_project-config.md)).
- Without `--share`, the server stays on loopback and needs no key: the owner is the only person who can reach it.
- A `read` key never gets `open`, `save`, document updates, tracker writes or `cache-stats`.

## Done when
- Tests: a valid key creates a session and the redirect drops the key from the URL; a wrong key fails and is rate-limited; a `read` session cannot save; revoking closes a live socket with `4401`; a restart keeps valid sessions; the store file has mode 600.
- A search of the server log after a test run finds no `aks_` string and no session id.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/` — key store and checks in the server crate; commands in the CLI crate.

**Read first:**
- [Sync engine and server, sections 06 and 07](../../notes/02_engine/04_sync-engine-and-server.md) — access keys, cookie swap, names, network access.
- [Project config, section 05](../../notes/02_engine/02_project-config.md) — keys are not stored in `.env`.
- The earlier [auth and access control](../../../2026-05-08-runtime-stack-migration/brainstorm/02_idea_editor-as-standalone-product/03_discuss_auth-and-access-control.md) thinking from the Go issue, for threats considered.

**Depends on:** [050/20](../050_server/20_websocket-api.md), [050/50](../050_server/50_security.md), [040/80](../040_caching/80_cache-format-versions.md).
**Unblocks:** [060/50](./50_network-exposure-and-tls.md), [070/90](../070_cli/90_share-commands.md), [060/90](./90_git-attribution.md), every role check.

# 04 Decisions
- Decided (sidhantha, 2026-09-30): no sign-in; access keys, shared or generated.
- Decided (claude, 2026-09-30): a key is random (at least 128 bits), has a `read` or `edit` role and a label, is stored only as a hash in the machine home, and is swapped for an `HttpOnly`, `SameSite=Strict` cookie ([server note](../../notes/02_engine/04_sync-engine-and-server.md)).
- Decided (claude, 2026-09-30): in share mode every request needs a session, loopback included; `start --share` prints a one-run owner link.
- Decided (claude, 2026-09-30): sessions survive a restart (stored hashed) and die with their key.

# 05 Notes & Analysis

## 01 Open
Whether a key can expire, and the exact `share` command names, are open ([open questions and risks, section 03](../../notes/01_overview/05_open-questions-and-risks.md)). Build `expires` into the store shape as an optional field so adding it needs no format change.

## Watch out
- `SameSite=Strict` cookies are not sent on the first navigation from another site's link. The `?key=` link still works because the key is in the URL; an existing session opened from an outside link shows the prompt once. Acceptable; document it.
