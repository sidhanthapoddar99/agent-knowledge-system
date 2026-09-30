---
title: "Sync engine and server: HTTP, the /api WebSocket and the watcher"
---

`agentks start` runs one local server per project, built on axum. It serves the embedded client at every path, the project's files at a few fixed routes, and **one WebSocket at `/api` that carries everything else**. Over it the client pulls data (manifest, pages, sidebars, indexes) and the engine pushes changes: when the file watcher sees a file change on disk, the engine updates its index and pushes the new hashes, and the client refetches only what changed. Phase 2 adds editing on the same socket: live-preview renders and saves, with echo suppression so a saved file does not come back as an outside change. A later stage adds multi-user editing with `yrs` (the Rust port of Yjs) and presence, and it needs auth first. Until then the server binds to localhost only, checks the `Host` and `Origin` of every request, and serves only files inside the project and the library cache. A published site runs no server at all.

# 03 References

- [Server and WebSocket](../../brainstorm/01_initial-discussion/09_server-websockets-and-editing.md) and [the architecture note](../../brainstorm/01_initial-discussion/17_local-spa-over-websocket.md) — the decisions.
- [Editing mode](../../brainstorm/02_future-stages/02_editing-mode.md) and [multi-user editing and auth](../../brainstorm/02_future-stages/04_multi-user-editing-and-auth.md).
- [Why and the prior audit](../../brainstorm/01_initial-discussion/02_why-and-prior-audit.md) — the `.html` MIME boundary and echo suppression, both named as losses to carry.
- [The Rust engine](./03_rust-engine.md) — the data interface this note transports.
- [Client application](../03_frontend/02_client-application.md) — the other end of the socket. [Editor engines](../03_frontend/03_editor-engines.md) — the Phase 2 editing client.
- [Development workflow and testing](../05_delivery/05_development-workflow-and-testing.md) — how the Vite dev server proxies to the engine in state 1.
- [2026-04-10-sync-and-presence](../../../2026-04-10-sync-and-presence/issue.md) and [diagram editing with presence](../../../2026-04-10-editor-diagrams/subtasks/30_editor/40_in-place-and-multi-user-editing.md).
- [2026-05-08-update-date-time-optimization](../../../2026-05-08-update-date-time-optimization/issue.md) — the git-date algorithm.
- Today's server pieces, which this replaces: [the Yjs sync server](../../../../../../agent-ks-engine/src/dev-tools/server/yjs-sync.ts), [presence](../../../../../../agent-ks-engine/src/dev-tools/server/presence.ts), [the editor store](../../../../../../agent-ks-engine/src/dev-tools/server/editor-store.ts), [the git ref watcher](../../../../../../agent-ks-engine/src/dev-tools/server/git-ref-watcher.ts), [the MIME map](../../../../../../agent-ks-engine/src/pages/lib/mime.ts), and the [artifact](../../../../../../agent-ks-engine/src/pages/artifacts), [asset](../../../../../../agent-ks-engine/src/pages/assets) and [content-asset](../../../../../../agent-ks-engine/src/pages/content-assets) routes.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): one server. `/api` is the WebSocket endpoint and `/**` serves the frontend.
- Decided (sidhantha, 2026-09-29): the WebSocket carries pulls and pushes. There is no separate HTTP data API.
- Decided (sidhantha, 2026-09-29): in development, the Vite dev server proxies to Rust. When installed, the Rust server serves the embedded client.
- Decided (sidhantha, 2026-09-29): editing mode talks to the server over the same WebSocket.
- Decided (sidhantha, 2026-09-30): multi-user access has no sign-in. The project owner grants access with an access key, shared or generated.
- Decided (claude, 2026-09-30): multi-user sync ships in 1.0.0, as the stage right after single-user editing. Single-user editing already runs on one `yrs` document per open file, so multi-user adds presence and access keys, not a second protocol.
- Decided (claude, 2026-09-30): derived data is cached once, on the server, and shared by every user and tab. The browser keeps only a hash-checked copy of it plus each user's own UI state.
- Decided (claude, 2026-09-30): each project keeps a stable port, so its browser origin and storage survive restarts, and a reused port can never show another project's storage.
- Decided (sidhantha, 2026-09-29): no Rust server in a published site.
- Decided (sidhantha, 2026-09-29): layouts and major data are cached in the browser, versioned by hash.
- Decided (sidhantha, 2026-09-29): the audience is one or two developers at a time.
- Proposed (claude, 2026-09-29): the server listens on localhost only from Phase 1; network access is an explicit opt-in once auth exists.
- Proposed (claude, 2026-09-30): the message protocol, the routes and the safety rules below.

# 05 Notes & Analysis

## 01 Serving by state

| State | Client served by | Data |
|---|---|---|
| 1, developing agentks | The Vite dev server, with hot reload | Vite proxies `/api` and the file routes to the engine |
| 2, using agentks (`agentks start`) | The engine, from the client bundle embedded in the binary | The `/api` WebSocket |
| 3, publishing | nginx, a static host or a CDN | Static HTML from `agentks build`; no server, no WebSocket |

## 02 Routes

| Route | Serves | Notes |
|---|---|---|
| `/api` | The WebSocket | Upgrade only; the `Origin` must be the server's own |
| `/theme.<hash>.css` | The project's compiled theme CSS | Immutable; the hash changes when the CSS does |
| `/client/*` | The client's JavaScript, CSS and fonts | From the embedded bundle; hashed names, immutable |
| `/assets/*` | Framework chrome named from config: logo, favicon | From the paths `site.yaml` names |
| `/content-assets/*` | Files a page refers to: images, data, diagram sources | From the content sections only |
| `/artifacts/*` | `.html` artifact pages | The one place project HTML is served as `text/html` |
| `/_lib/<alias>/<element>` (Phase 2) | A library element | From the machine's library cache, for the locked commit |
| everything else | The client's `index.html` | The client routes by the real path |

**The `.html` boundary is explicit.** A file is served as `text/html` only from `/artifacts/` and `/_lib/`. Everywhere else, `.html` is served as plain text or refused. The MIME map is an allowlist; an unknown extension is served as `application/octet-stream` with `Content-Disposition: attachment`.

## 03 The /api protocol (claude, proposed)

Text frames carry JSON. Binary frames are reserved for `yrs` updates in the multi-user stage.

**Requests from the client** carry an `id`; the reply echoes it.

```json
{ "id": 7, "op": "get", "what": "page", "params": { "url": "/dev-docs/architecture/overview" }, "have": "b3:5f1c..." }
```

| `what` | `params` |
|---|---|
| `manifest` | — |
| `page` | `url` |
| `sidebar` | `section` |
| `issues-index` | `section` |
| `issue` | `section`, `id` |
| `blog-index` | `section` |
| `custom` | `page` |
| `render` (Phase 2) | `path`, `markdown` |

`have` is the hash the client already holds. If it still matches, the reply says `"unchanged": true` and carries no data.

**Replies:**

```json
{ "id": 7, "ok": true, "hash": "b3:5f1c...", "data": { ... } }
{ "id": 7, "ok": false, "error": { "type": "not-found", "message": "No page at /dev-docs/x" } }
```

**Pushes from the engine** carry no `id`:

```json
{ "push": "changed", "hashes": { "page:/dev-docs/a": "b3:...", "sidebar:dev-docs": "b3:...", "manifest": "b3:..." }, "removed": ["page:/dev-docs/old"] }
{ "push": "errors", "file": "data/dev-docs/01_x.md", "errors": [ ... ] }
{ "push": "fatal", "error": { "type": "config", "message": "site.yaml: unknown alias @dat" } }
```

- **On connect**, the client asks for the manifest and compares its hashes with its cache. It refetches only what differs.
- **On a change**, the engine pushes the new hashes of every affected key: the page, the pages that embed it, the section's sidebar, the tracker index, the manifest when config changed. The client refetches only keys it is showing or caching.
- **`fatal`** covers a config edit that breaks loading. The server stays up and shows the error page until the config is fixed, instead of dying.
- **Versioning.** The manifest carries the engine version. A client from another version reloads itself, which matters in state 1 when the engine is rebuilt.

## 04 The watcher

- One `notify` watcher per project, over the content sections, `config/`, the theme folders and local libraries.
- **Debounce and coalesce** events for about 50 ms, so an editor's save-then-rename, or a `git checkout` touching hundreds of files, becomes one update.
- **Handle the known hazards** from the prior audit: WSL reports unreliable mtimes, so change detection compares content hashes, not times; editors write a temp file and rename it over the target, so the watcher watches folders, not file inodes.
- **Git refs.** The watcher also watches `.git/` and the folder holding the active branch ref, because git writes a ref by renaming a lock file over it. A moved `HEAD` or branch ref triggers the incremental git-date walk and pushes the changed `updated` dates.
- **On each batch:** re-read the changed files, update the index and the rolled-up folder hashes, invalidate cached renders whose render hash changed, then push.
- **Config changes** reload config and, if the result is valid, rebuild the index. If it is invalid, push `fatal`.

## 05 Editing, Phase 2

| Message | Direction | Job |
|---|---|---|
| `render` | request | Render unsaved markdown for the live preview, with the same pipeline as every page |
| `save` | request | Write a file: `{ path, content, base_hash }` |
| `saved` | reply and push | The new hash, sent to every client showing that page |

Rules:

- **Existing files only.** `save` refuses a path that does not exist and any path outside a content section. Human editing is small tweaks; creating files is the AI's job ([editing mode](../../brainstorm/02_future-stages/02_editing-mode.md)).
- **No lost writes.** `base_hash` is the hash of the file the editor started from. If the file on disk has changed since, the save is refused with a conflict error that carries the disk version. The engine never overwrites a change it has not seen.
- **Atomic writes.** Write a temp file in the same folder, then rename it over the target.
- **Echo suppression.** The engine records the hash it just wrote. When the watcher reports that file with that hash, the event is the save's own echo: it becomes a `saved` push, not an outside change. Any other hash is an outside change and is pushed as usual.
- **Single user.** Two editors on one file are handled by the conflict rule until the multi-user stage.

## 06 Multi-user editing and presence

- **Shared editing** uses `yrs` on the server, one document per open file, synced with Yjs in the browser. `yrs` is native to Rust, so the prior audit's concern about a server-side CRDT does not apply.
- **Transport** is the same `/api` socket: binary frames for sync updates, JSON for awareness.
- **Presence** (who is on the page, their cursor or selection) uses the Yjs awareness protocol.
- **Persistence.** The file on disk stays the source of truth. The shared document writes back through the `save` path, with echo suppression.
- **Diagrams** join through the diagram editing subtask in [2026-04-10-editor-diagrams](../../../2026-04-10-editor-diagrams/issue.md).
- **Access keys, no sign-in.** The owner runs a command such as `agentks share` to create a key. A key is random (at least 128 bits), has a role (`read` or `edit`) and a label, and can be revoked. The server stores only a hash of each key, in the machine home, never in the project.
- **Using a key.** The first visit carries the key once (a link, or a prompt in the client). The server swaps it for an `HttpOnly`, `SameSite=Strict` session cookie, so the key does not stay in the URL, the history or the logs.
- **Names.** A visitor types a display name, shown in presence. Edits are attributed in git to the key's label, because there is no identity beyond the key.
- **Network access** needs both a key and an explicit flag, such as `agentks start --share`. Without the flag the server stays on localhost. Over any network other than a trusted LAN, TLS comes from a tunnel or a reverse proxy in front of the server.

## 07 Security

| Rule | Why |
|---|---|
| Bind to `127.0.0.1` and `::1` only | The live editor must not be reachable from the network. Today's dev server listens on every interface with `allowedHosts: true` |
| Refuse a request whose `Host` is not `localhost`, `127.0.0.1` or `[::1]` with the server's port | Blocks DNS rebinding, where a web page tricks the browser into talking to the local server |
| Refuse a WebSocket upgrade whose `Origin` is not the server's own (or the Vite dev origin in state 1) | Another site open in the browser cannot drive `/api` |
| Canonicalise every requested path and require it inside an allowed root: the content sections, the config-named asset paths, the library cache | Path traversal (`../`) and symlinks out of the project are refused |
| Serve HTML only from `/artifacts/` and `/_lib/` | The MIME boundary the prior audit named |
| Writes go only through `save`, only to existing files inside content sections | The editor cannot write config, `.git` or anything outside the project |
| Network access is an explicit opt-in (`--share`) and every remote request needs a valid access key | Reaching the editor over a network needs a key |

## 08 Several projects on one machine

- Each `agentks start` serves one project on its own stable port: `server.port` when set, otherwise a port derived from the project key and recorded in the machine home. When that port is taken by something else, start fails with a clear error and the fix, rather than moving to another port. A moved port would change the browser origin, lose the project's browser cache, and could show one project's stored UI state to another.
- Each running server records itself in the machine home (project path, port, process id), so `agentks ps` lists every server on the machine and `agentks stop` can find one by project ([machine home](./06_machine-home-and-build-cache.md)).
- Starting a project that already has a server attaches to it and prints its address, instead of starting a second one.

## 09 Open

- Whether the dev toolkit keeps a system-metrics panel, which needs a metrics message on the socket ([open question 04](../01_overview/05_open-questions-and-risks.md)).
- The exact `agentks share` command surface, and whether a key can expire.
- Library HTML under `/_lib/` is sandboxed, with a `Content-Security-Policy` header ([library system](../04_ecosystem/01_library-system.md)). Whether the project's own artifacts, which run unsandboxed today, should also get a header is open ([open questions and risks](../01_overview/05_open-questions-and-risks.md)).
