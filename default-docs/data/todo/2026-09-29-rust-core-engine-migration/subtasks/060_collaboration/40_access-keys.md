---
title: "Access keys — `agentks share`: keys, roles, sessions and revocation"
status: in-progress
---

Other people reach a project's server only with an **access key** the owner creates. There are no accounts and no sign-in (sidhantha, 2026-09-30). A key is a long random secret with a role (`read` or `edit`) and a label. The server stores only a hash of it, in the machine home. A visitor presents the key once; the server swaps it for a session cookie so the key does not linger in URLs, history or logs. The owner can list and revoke keys at any time, and revoking cuts live sessions immediately.

# 01 To Do
- [x] **Key format.** `aks_` followed by 26 base32 characters (130 bits of randomness from the OS). The prefix makes a leaked key easy to spot in a paste.
- [x] **Store** `~/.agentks/share/<project key>.json`, owner-readable only (mode 600), written atomically:
      ```json
      { "format": 1, "keys": [ { "id": "k3f9", "label": "Asha", "role": "edit",
          "hash": "b3:…", "created": "…", "last_used": "…", "revoked": null } ] }
      ```
      Hash with BLAKE3 (a fast hash is right: the key is high-entropy random, not a password).
- [ ] **Commands** (surface in [070/90](../070_cli/90_share-commands.md)): `share create --role read|edit --label TEXT` prints the key and a ready link once; `share list`; `share revoke ID|--all`.
- [ ] **Owner key in share mode.** `agentks start --share` creates a one-run owner key and prints the owner link in the terminal. In share mode even loopback requests need a session, because a reverse proxy on the same machine makes every request look local.
- [ ] **Presenting a key.** `GET /?key=aks_…` (or a `POST /api/session` from the client's key prompt): verify the hash in constant time; create a session id (random 128 bits); set cookie `agentks_session=<id>; HttpOnly; SameSite=Strict; Path=/` plus `Secure` when served over HTTPS ([060/50](./50_network-exposure-and-tls.md)); redirect to the same URL without `key`.
- [x] **Sessions** stored hashed in the same file (`sessions: [{ id_hash, key_id, created, last_seen }]`), so a server restart does not log everyone out. A session dies with its key.
- [ ] **Checks.** Every HTTP request and the WebSocket upgrade in share mode need a valid session; the role goes into the connection (`hello.role`, [050/20](../050_server/20_websocket-api.md)). No session → the app shows the key prompt; the socket closes with `4401`.
- [ ] **Revoke.** Mark the key revoked, drop its sessions, and close its open sockets with `4401` within one second.
- [x] **Brute-force limit.** At most 10 failed key attempts per remote address per minute; then `429` for a minute.
- [ ] **Never log** keys, session ids or cookies. Redact `key=` from any logged URL.

## Guardrails
- Keys never live in the project or in `config/.env` ([project config, section 05](../../notes/02_engine/02_project-config.md)).
- Without `--share`, the server stays on loopback and needs no key: the owner is the only person who can reach it.
- A `read` key never gets `open`, `save`, document updates, tracker writes or `cache-stats`.

## Done when
- Tests: a valid key creates a session and the redirect drops the key from the URL; a wrong key fails and is rate-limited; a `read` session cannot save; revoking closes a live socket with `4401`; a restart keeps valid sessions; the store file has mode 600.
- A search of the server log after a test run finds no `aks_` string and no session id.

# 02 Status and Result
In progress. The store and the checks are built and tested in the sync crate. Left: the HTTP and socket side in the server (the `?key=` swap for a cookie and the redirect, the session check on every request and upgrade, `hello.role`, `4401` on revoke, `429`, log redaction), the one-run owner link printed by `start --share`, and `share log` in the CLI.

## Result
- Code: `apps/agentks-engine/crates/sync/src/keys/` in the main repository — `mod.rs` (`AccessKeys`: `create`, `list`, `revoke`, `start_session`, `session`; `redact_url`), `types.rs` (`KeyInfo`, `NewKey`, `NewSession`, `Session`), `store.rs` (the file: lock, atomic write, mode 600 in a mode 700 folder), `secret.rs` (`aks_` + 26 base32 characters, BLAKE3, constant-time checks), `owner.rs` (`OwnerKey`, the one-run owner key, in memory), `limiter.rs` (`KeyAttempts`: 10 failures a minute per address, then refused for a minute), `journal.rs` (`EditJournal::record` and `read`, the file `share log` reads); `src/random.rs` (OS randomness).
- The CLI's existing `share create`, `share list` and `share revoke` now work against the store; its API is unchanged.
- Tests: `cargo test -p agentks-sync` — 8 key tests: hashes only in the file, mode 600, label rules, unknown id; a session that survives a restart; revoke ends only that key's sessions; a store of another format is refused and left untouched; the owner key; the attempt limit; the journal (with a torn last line); URL redaction. `./ctl gate` green.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/` — the key store in `agentks-sync` (`crates/sync/src/keys.rs`), the checks in the server crate, the commands in the CLI crate.

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
- Decided (claude, 2026-10-01): a key store of another format, or one that does not parse, is an error and is never rewritten, because rebuilding it as the cache stores do would silently drop every key; the message says to move it aside.
- Decided (claude, 2026-10-01): times in the store and the journal are Unix seconds, because no crate below the sync crate formats dates yet and a second copy of the date code would drift; the CLI formats them for people.
- Decided (claude, 2026-10-01): the store is changed only under a sibling `.lock` file (the CLI and a running server both write it); readers take no lock, because writes are atomic renames.
- Decided (claude, 2026-10-01): the file is mode 600 inside a mode 700 `share/` folder; the folder's mode also covers the moment between the atomic write and the chmod.
- Decided (claude, 2026-10-01): key ids are `k` and 4 base32 characters, redrawn on a clash; labels are trimmed, 1 to 100 characters, with no control characters, because they go into git trailers.
- Decided (claude, 2026-10-01): session secrets are 128 random bits as hex; a session's `last_seen` is rewritten at most once an hour, so a request is not a write.
- Decided (claude, 2026-10-01): the owner's one-run key and its sessions live only in memory (`OwnerKey`), so they die with the server; its sessions carry role `owner` and no key id.
- Decided (claude, 2026-10-01): the store keeps an optional `expires` per key, honoured by every check, with nothing setting it yet, so adding expiry needs no format change.
- Decided (claude, 2026-10-01): the journal is one JSON line per entry with `"v": 1`; a last line without its line break is a crash-torn write and is skipped, any other bad line is an error.

# 05 Notes & Analysis

## 01 Open
Whether a key can expire, and the exact `share` command names, are open ([open questions and risks, section 03](../../notes/01_overview/05_open-questions-and-risks.md)). Build `expires` into the store shape as an optional field so adding it needs no format change.

## Watch out
- The store types in `crates/sync/src/keys.rs` (`AccessKeys`, `KeyInfo`) have no serde derives yet. Add them together with the store's `format` field, set from `agentks_core::formats::SHARE_KEYS_FORMAT`.
- `SameSite=Strict` cookies are not sent on the first navigation from another site's link. The `?key=` link still works because the key is in the URL; an existing session opened from an outside link shows the prompt once. Acceptable; document it.
