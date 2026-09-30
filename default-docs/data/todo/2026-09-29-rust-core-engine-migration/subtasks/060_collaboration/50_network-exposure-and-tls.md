---
title: "Network exposure and TLS — `agentks start --share`"
status: open
---

By default the server listens on loopback only. To let a teammate in, the owner starts it with `--share`. That changes three things: where the server listens, which `Host` and `Origin` values it accepts, and the requirement that every request carries a valid access-key session. agentks does not terminate TLS itself; over anything other than a trusted LAN, TLS comes from a tunnel or a reverse proxy in front of it. This leaf builds share mode and its safety checks.

# 01 To Do
- [ ] **Flags:** `agentks start --share [--bind ADDR] [--public-url URL]`.
    - [ ] `--bind` defaults to `0.0.0.0` (and `::`) in share mode; an address limits it to one interface (for example a Tailscale address).
    - [ ] `--public-url https://docs.example.ts.net` names the address people use through a tunnel or proxy. It sets the accepted `Host` and `Origin`, and marks cookies `Secure` when it is `https`.
- [ ] **Accepted `Host` values in share mode:** loopback names, the bound address, the machine's host name, and the `--public-url` host. Anything else → `421`. **Accepted `Origin`** for the socket: the same set, with the scheme the request came on.
- [ ] **Every request needs a session** ([060/40](./40_access-keys.md)); share mode never serves anything without one, including `/client/*` (serve only the key prompt page and its assets without a session).
- [ ] **Warnings at start:** listening on a non-loopback address over plain HTTP prints a clear warning that keys and content travel unencrypted, and names the tunnel options.
- [ ] **Proxy headers.** Honour `X-Forwarded-Proto` and `X-Forwarded-Host` only when the peer address is loopback and `--public-url` is set (a proxy on the same machine). Otherwise ignore them.
- [ ] **Limits:** a cap on connections per remote address (for example 20), request size caps from [050/50](../050_server/50_security.md), the key brute-force limit.
- [ ] **Run record** gains `"share": true` and the public URL, so `agentks ps` shows it ([050/40](../050_server/40_lifecycle-ps-stop-logs.md)).
- [ ] **Docs:** a short guide for the three supported set-ups — LAN with plain HTTP, Tailscale (`tailscale serve`), Cloudflare Tunnel or Caddy — handed to [180/00](../180_documentation/00_overview.md).

## Guardrails
- Share mode adds checks; it removes none of [050/50](../050_server/50_security.md)'s rules.
- agentks never opens router ports, never registers with any tunnel service, and never sends anything to a third party.
- Leaving share mode is a restart without `--share`.

## Done when
- Tests: without `--share`, a request to the machine's LAN address is refused (nothing listens); with `--share`, it gets the key prompt without a session and the app with one; a wrong `Host` → `421`; a forged `X-Forwarded-Host` from a non-loopback peer is ignored.
- A manual check through `tailscale serve` (or `cloudflared`) with `--public-url` works end to end, with `Secure` cookies.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/`, the server crate.

**Read first:**
- [Sync engine and server, sections 06–07](../../notes/02_engine/04_sync-engine-and-server.md) — "network access needs both a key and an explicit flag"; TLS from a tunnel or proxy.
- [Project config, section 04](../../notes/02_engine/02_project-config.md) — `server.allowedHosts` is gone.

**Depends on:** [060/40](./40_access-keys.md), [050/50](../050_server/50_security.md), [050/45](../050_server/45_stable-ports.md).
**Unblocks:** multi-user use across machines; [060/95](./95_collaboration-tests.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the server listens on localhost only by default.
- Decided (claude, 2026-09-30): network access needs `--share` plus a key; TLS comes from a tunnel or reverse proxy in front of the server ([server note](../../notes/02_engine/04_sync-engine-and-server.md)).
- Decided (claude, 2026-09-30): forwarded headers are trusted only from a loopback peer with `--public-url` set.

# 05 Notes & Analysis

## Watch out
- A service worker ([080/60](../080_ui-and-client/60_pwa-and-mobile.md)) only runs on `localhost` or HTTPS. Over plain-HTTP LAN sharing, the PWA features are off for the visitor; that is expected.
