---
title: "Sync engine and server: HTTP, the /api WebSocket and the watcher"
---

`agentks start` runs one local server per project, built on axum. It serves the embedded client at every path, the project's files at a few fixed routes, and **one WebSocket at `/api` that carries everything else**. Over it the client pulls data (manifest, pages, sidebars, indexes) and the engine pushes changes: when the file watcher sees a file change on disk, the engine updates its index and pushes the new hashes, and the client refetches only what changed. Phase 2 adds editing on the same socket: live-preview renders and saves, with echo suppression so a saved file does not come back as an outside change. The multi-user stage, right after single-user editing, adds presence and access keys on the same `yrs` documents (`yrs` is the Rust port of Yjs). Until then the server binds to localhost only, checks the `Host` and `Origin` of every request, and serves only files inside the project and the library cache. A published site runs no server at all.

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
- Proposed (claude, 2026-09-29): the server listens on localhost only from Phase 1; network access is an explicit opt-in that needs an access key.
- Decided (claude, 2026-09-30): the `/api` messages of section 03, built as Rust types in `agentks-api`: the client's hello comes first, one `api_version` versions every message and shape, `render` is its own `op`, and request failures are a closed list ([030/80](../../subtasks/030_rust-engine/80_page-data-interface.md), [030/20](../../subtasks/030_rust-engine/20_error-model.md)).
- Proposed (claude, 2026-09-30): the routes and the safety rules below.

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
| `/theme.<hash>.css` | The project's compiled theme CSS | Immutable; the hash changes when the CSS does. The URL carries the hash as plain hex, without the `b3:` prefix |
| `/client/*` | The client's JavaScript, CSS and fonts | From the embedded bundle; hashed names, immutable |
| `/assets/*` | Framework chrome named from config: logo, favicon | From the paths `site.yaml` names. Sent with a sandbox CSP |
| `/content-assets/*` | Files a page refers to: images, data, diagram sources | From the content sections only. Sent with a sandbox CSP, so an SVG opened directly runs no script |
| `/artifacts/*` | `.html` artifact pages | The one place project HTML is served as `text/html` |
| `/artifacts/<path>.video` | The standalone video page, a shell the engine writes; `?sheet` shows the review sheet, `?theme=light` or `dark` sets the mode | The same shell for a single-file video and a video folder ([video artifacts](../04_ecosystem/05_video-pages.md)) |
| `/_audio/<key>.opus` | A video's audio stream from `~/.agentks/audio/` | Range requests; only names of 64 hex characters |
| `/_lib/<alias>/<element>` (Phase 2) | A library element | From the machine's library cache, for the locked commit. Until [120/50](../../subtasks/120_libraries/50_lib-route-and-sandbox.md) lands it answers `501`, already with the library sandbox CSP |
| everything else | The client's `index.html` | The client routes by the real path |

**Redirects come from the site index.** The server answers a redirect from `RouteTable::find`: the old file-path forms of a URL, a docs root to its first page, and plan stages. A plan stage's alias is an anchored redirect, to the plan page's URL with the stage's heading as the `#fragment`.

**The `.html` boundary is explicit.** A file is served as `text/html` only from `/artifacts/` and `/_lib/`. Everywhere else, `.html` is served as plain text or refused. The MIME map is an allowlist; an unknown extension is served as `application/octet-stream` with `Content-Disposition: attachment`.

## 03 The /api protocol

Text frames carry JSON. Binary frames are reserved for `yrs` updates in the multi-user stage. The message types are Rust types in `apps/agentks-engine/crates/api/src/messages/`, and `apps/agentks-engine/schema/api.schema.json` is generated from them ([030/80](../../subtasks/030_rust-engine/80_page-data-interface.md)).

**Hello first.** The client's first frame is its hello. The server answers with its own hello before anything else. A connection whose first frame is not a hello is closed with code `4400`. A hello whose version does not match gets the `reload` answer below, and then the server closes the connection with code `4409`. A frame larger than the limit closes the connection; it gets no `invalid-request` reply.

```json
{ "op": "hello", "api_version": 1, "client_build": "a1b2c3" }
{ "op": "hello", "ok": true, "api_version": 1, "engine": "1.0.0", "project": "8c1f...", "role": "owner", "client_build": "a1b2c3" }
{ "op": "hello", "ok": false, "api_version": 1, "engine": "1.0.0", "project": "8c1f...", "client_build": "d4e5f6", "reload": true }
```

- **`api_version`** is one number for the whole message set and every data shape. It goes up on any breaking change: a removed or renamed field or message, or a changed meaning. An added optional field is not breaking.
- **`client_build`** is the hash of the client bundle. The server compares both values with its own. On a mismatch it answers `ok: false, reload: true`, and the client reloads itself. The Vite dev server's client sends `dev`, which the server accepts ([140/50](../../subtasks/140_versioning-and-migrations/50_protocol-version-handshake.md)).
- **`role`** is `owner` for a localhost connection, or the access key's role (`edit`, `read`) in share mode. It is present when `ok` is true.

**Requests** carry an `id`; the reply echoes it, possibly out of order. `get` is the cacheable pull: `what` names the data, `params` picks the item, and `have` is the hash the client already holds.

```json
{ "id": 7, "op": "get", "what": "page", "params": { "url": "/dev-docs/architecture/overview" }, "have": "b3:5f1c..." }
{ "id": 9, "op": "render", "params": { "path": "data/dev-docs/01_intro.md", "markdown": "..." } }
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

Each `what` with its params is a data key, written as a string such as `page:/dev-docs/a` or `issue:todo/<id>`. Pushes name changed data by these keys, and the browser caches by them. An action has no hash to compare, so it is its own `op`, not a `what`. `render` (Phase 2) renders unsaved markdown for the live preview; `open`, `save` and the other editing requests are ops too (section 05).

**Replies:**

```json
{ "id": 7, "ok": true, "hash": "b3:5f1c...", "data": { ... } }
{ "id": 7, "ok": true, "hash": "b3:5f1c...", "unchanged": true }
{ "id": 8, "ok": false, "error": { "type": "not-found", "message": "No page at /dev-docs/x." } }
```

- When `have` still matches, the reply says `"unchanged": true` and carries no data.
- A failed reply's `error` is `{ type, message, errors? }`. `type` comes from the closed `ReplyErrorKind` list: `not-found`, `invalid-request`, `forbidden`, `conflict`, `busy`, `fatal`, `internal`, `not-implemented`. `errors` holds the error records behind a `fatal` failure. A content problem never fails a request; it travels in the data's own `errors` ([the Rust engine](./03_rust-engine.md), section 08).

**Pushes from the engine** carry no `id`:

```json
{ "push": "changed", "hashes": { "page:/dev-docs/a": "b3:...", "sidebar:dev-docs": "b3:...", "manifest": "b3:..." }, "removed": ["page:/dev-docs/old"], "moved": { "page:/dev-docs/old": "/dev-docs/new" } }
{ "push": "errors", "file": "data/dev-docs/01_x.md", "errors": [ ... ] }
{ "push": "fatal", "errors": [{ "file": "config/site.yaml", "line": 12, "type": "alias-unknown", "severity": "error", "message": "Unknown alias @dat.", "key": "pages.docs.data", "suggestion": "Did you mean @data?" }] }
{ "push": "resync" }
```

- **On connect**, after the hello, the client asks for the manifest and compares its hashes with its cache. It refetches only what differs.
- **On a change**, the engine pushes the new hashes of every affected key: the page, the pages that embed it, the section's sidebar, the tracker index, the manifest when config changed. `removed` lists keys that no longer exist, and `moved` gives the new URL of a page whose file moved. The client refetches only keys it is showing or caching. The server filters only `changed` pushes, per connection, to the keys that connection asked for. `errors`, `fatal` and `resync` go to every connection.
- **`errors`** carries the current content problems of one file. An empty list means the file is clean now.
- **`fatal`** covers a config edit that breaks loading, and carries every problem as an error record. The server stays up and keeps serving the last good config, and the client shows the errors until the config is fixed.
- **`resync`** tells a client that the server dropped pushes for it, because its outgoing queue was full. The client refetches the manifest and compares hashes.

## 04 The watcher

- One `notify` watcher per project, over the content sections, `config/`, the theme folders and local libraries. Until the site names its roots (`watch_roots`), it watches the whole project root, plus the config folder when that lies outside it.
- **Debounce and coalesce** events for about 50 ms, so an editor's save-then-rename, or a `git checkout` touching hundreds of files, becomes one update.
- **Handle the known hazards** from the prior audit: WSL reports unreliable mtimes, so change detection compares content hashes, not times; editors write a temp file and rename it over the target, so the watcher watches folders, not file inodes. The watcher keeps its own table of file hashes to decide what changed, and it ignores `Access` events, which change nothing.
- **Git refs.** The watcher also watches `.git/` and the folder holding the active branch ref, because git writes a ref by renaming a lock file over it. A moved `HEAD` or branch ref triggers the incremental git-date walk and pushes the changed `updated` dates. The separate debounce for git refs is not built yet.
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
- **Is a recorded server alive?** The server answers `426` on a plain HTTP `GET /api`. A record counts as live only when its port gives that answer with the project's key. The process id is not checked: the probe already proves the server is there, and a process check needs code for each platform.
- **`--detach`** runs the same command again in the background, with `AGENTKS_DETACHED_CHILD=1` set, and returns once the child serves.

## 09 Open

- Whether the dev toolkit keeps a system-metrics panel, which needs a metrics message on the socket ([open question 04](../01_overview/05_open-questions-and-risks.md)).
- The exact `agentks share` command surface, and whether a key can expire.
- Library HTML under `/_lib/` is sandboxed, with a `Content-Security-Policy` header ([library system](../04_ecosystem/01_library-system.md)). Whether the project's own artifacts, which run unsandboxed today, should also get a header is open ([open questions and risks](../01_overview/05_open-questions-and-risks.md)).
