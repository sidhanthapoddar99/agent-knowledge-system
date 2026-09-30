---
title: "Security — localhost bind, Host and Origin checks, paths and the MIME boundary"
status: open
---

The local server can read the project and, from Phase 2, write it. Any web page the user opens in the same browser can try to talk to `localhost`. This leaf builds the rules that stop that: bind to loopback only, refuse requests whose `Host` or `Origin` is not the server's own, keep every file access inside allowed roots, serve HTML only where HTML is expected, and send safe headers. Network access in share mode changes the bind and adds access keys ([060/50](../060_collaboration/50_network-exposure-and-tls.md)); it relaxes nothing else.

# 01 To Do
- [ ] **Bind** `127.0.0.1` and `::1` only. Today's dev server listens on every interface with `allowedHosts: true`; that ends here.
- [ ] **`Host` check** on every request: `localhost`, `127.0.0.1` or `[::1]`, with this server's port. Anything else → `421`. This blocks DNS rebinding.
- [ ] **`Origin` check** on the WebSocket upgrade: exactly this server's own origin, or the Vite dev origin in state 1 (from an explicit flag, never by default). Missing or other → `403`.
- [ ] **Path canonicalisation** for every file route: decode once, reject `..`, absolute paths, NUL bytes and backslashes; resolve symlinks; require the result inside an allowed root (the content sections, the config-named asset paths, the library cache for `/_lib/`). One function in the core, used by the routes, `open`, `save` and the library store.
- [ ] **The MIME allowlist:** one table from extension to content type. `text/html` only from `/artifacts/` and `/_lib/`. Elsewhere `.html` is `text/plain`. An unknown extension is `application/octet-stream` with `Content-Disposition: attachment`.
- [ ] **Headers on every response:** `X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`. On the app (`index.html`): `Content-Security-Policy` allowing only same-origin scripts and the socket, plus `frame-ancestors 'self'`.
- [ ] **`/_lib/` responses** carry a sandboxing CSP (library HTML is third-party code); the project's own artifacts do not, as today. Build the header here; the route is [120/50](../120_libraries/50_lib-route-and-sandbox.md).
- [ ] **Writes** only through `save` ([050/35](./35_file-writes-and-echo-suppression.md)).
- [ ] **Resource limits:** request body and frame size caps, a connection cap per remote address in share mode, and time limits on slow requests.
- [ ] **A security test suite**, one test per rule above.

## Guardrails
- A rule is enforced on the server, once, in one place. Never trust the client.
- Share mode ([060/50](../060_collaboration/50_network-exposure-and-tls.md)) adds access checks on top of these rules; it never turns any of them off.

## Done when
- Tests: `Host: evil.example` → `421`; WebSocket with `Origin: https://evil.example` → `403`; `/content-assets/../../config/site.yaml` and `%2e%2e` variants → `404` or `403`; a symlink from a content folder to `/etc` → refused; an `.html` file under `/content-assets/` → `text/plain`; every response has `nosniff`.
- `ss -ltnp` (or the platform equivalent) shows the server listening on loopback only.
- A review pass with the `/security-review` checklist over the server crate finds no open item.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/` — path and MIME rules in the core, middleware in `agentks-server`.

**Read first:**
- [Sync engine and server, section 07 Security](../../notes/02_engine/04_sync-engine-and-server.md).
- [Library system, section 14 Trust](../../notes/04_ecosystem/01_library-system.md) — why library HTML is sandboxed.
- [Why and the prior audit](../../brainstorm/01_initial-discussion/02_why-and-prior-audit.md) — the `.html` MIME boundary named as a loss to carry.
- Today's MIME map and asset routes: [mime.ts](../../../../../../agent-ks-engine/src/pages/lib/mime.ts), [content-assets](../../../../../../agent-ks-engine/src/pages/content-assets).

**Depends on:** [050/10](./10_http-and-routes.md).
**Unblocks:** [050/35](./35_file-writes-and-echo-suppression.md), [060/50](../060_collaboration/50_network-exposure-and-tls.md), [120/50](../120_libraries/50_lib-route-and-sandbox.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the server listens on localhost only by default; network access needs an access key ([project config](../../notes/02_engine/02_project-config.md)).
- Proposed (claude, 2026-09-30), adopted here: the security table of the server note.
- Decided (claude, 2026-09-30): library HTML under `/_lib/` is sandboxed with a CSP; the project's own artifacts are not ([library system](../../notes/04_ecosystem/01_library-system.md)).

# 05 Notes & Analysis

## 01 Open
Whether the project's own artifacts should also get a sandboxing CSP is open ([open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md)). Build the header as a function of the route, so adding it to `/artifacts/` later is one line.

## Watch out
- An app CSP must still allow the diagram viewers and the Excalidraw and draw.io editors, which may need `blob:` and worker sources. Test every island with the CSP on.
