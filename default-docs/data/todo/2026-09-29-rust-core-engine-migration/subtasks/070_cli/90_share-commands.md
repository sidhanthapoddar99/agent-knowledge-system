---
title: "Share commands — `agentks share` and `start --share`"
status: open
---

The owner of a project lets other people in with access keys. This leaf builds the commands: create, list and revoke keys, see who edited what, and start the server in share mode. The key store, sessions and checks are [060/40](../060_collaboration/40_access-keys.md); network behaviour is [060/50](../060_collaboration/50_network-exposure-and-tls.md); the journal is [060/90](../060_collaboration/90_git-attribution.md).

# 01 To Do
- [ ] **`agentks share create --role read|edit --label TEXT [--json]`**: prints the key once, and a ready link when a share-mode server runs (`<public url>/?key=…`). Warns that the key is shown only now.
- [ ] **`agentks share list [--json]`**: id, label, role, created, last used, revoked. Never the key or its hash.
- [ ] **`agentks share revoke ID... | --all [--yes]`**: revoke; tell a running server so sessions close at once.
- [ ] **`agentks share log [--since REF] [--json]`**: who edited which files ([060/90](../060_collaboration/90_git-attribution.md)).
- [ ] **`agentks start --share [--bind ADDR] [--public-url URL]`**: prints the owner link and the plain-HTTP warning when relevant ([070/30](./30_start-and-dev-mode.md)).
- [ ] **Talking to a running server:** revocation and key changes take effect live. The server watches its share store file; the command writes the file atomically.

## Guardrails
- Keys are printed once, never stored in the project, never written to logs or `--json` output other than `create`'s.
- `--json` output of `create` is for agents acting for the owner; the skills tell agents never to paste a key anywhere except to the owner.

## Done when
- `share create` then `share list` shows the key without its secret; `share revoke` closes a live session within one second (end-to-end with [060/95](../060_collaboration/95_collaboration-tests.md)).
- `start --share --public-url https://x.ts.net` prints an `https` owner link.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/agentks-cli/`.

**Read first:**
- [Sync engine and server, section 06](../../notes/02_engine/04_sync-engine-and-server.md) — "the owner runs a command such as `agentks share`".
- [Open questions and risks, section 03](../../notes/01_overview/05_open-questions-and-risks.md) — the exact commands and key expiry are open; this leaf proposes the surface.

**Depends on:** [060/40](../060_collaboration/40_access-keys.md), [060/50](../060_collaboration/50_network-exposure-and-tls.md), [070/30](./30_start-and-dev-mode.md).
**Unblocks:** the sharing guide ([180/00](../180_documentation/00_overview.md)).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the owner grants access with an access key; no sign-in.
- Decided (claude, 2026-09-30): the surface `share create · list · revoke · log` and `start --share`; open for the user to rename.

# 05 Notes & Analysis

## Watch out
- Key expiry is open. If it is added, it is a `--expires` flag on `create` and a field already reserved in the store.
