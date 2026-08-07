---
title: "Dev tools, live editor, CRDT sync"
---

# Surface 5 — dev tools, live editor, CRDT sync

**Headline.** The CRDT server is *not* the fatal item — two actively-maintained pure-Go Yjs
ports exist and one is wire-conformance-tested (measured, August 2026). The expensive item is
the **Astro dev-toolbar host**: 1,793 lines of app code hang off a proprietary browser API
(`astro-dev-toolbar-window`, `app.onToggled`, `addDevToolbarApp`) that has no equivalent
anywhere, so porting means writing the toolbar chrome as well as the six apps. Separately,
**1,969 of the 9,370 lines in this surface are already dead or unreachable** at runtime, which
cuts the real port list by about a fifth before any design work starts.

---

## 1. Measured size of the surface

All counts from `wc -l` on 2026-08-07. Confidence: **measured**.

| Area | Files | Lines | Notes |
|---|---:|---:|---|
| `src/dev-tools/server/` | 5 | 1,492 | Node-side: HTTP middleware, file store, CRDT rooms, presence, metrics |
| `src/dev-tools/editor/` | 38 | 5,429 | CodeMirror 6 app (incl. 861 lines CSS) |
| `src/dev-tools/` toolbar apps + `_shared/` | 6 | 1,793 | 5 panel apps + shared shadow-DOM token sheet |
| `src/dev-tools/integration.ts` | 1 | 376 | The Astro integration |
| `src/pages/api/dev/` | 3 | 187 | `errors.ts` 37, `layouts.ts` 71, `themes.ts` 79 |
| `src/pages/editor.astro` | 1 | 93 | The `/editor` route shell |
| **Total** | **54** | **9,370** | |

Sub-breakdown of `server/`:

| File | Lines | Job |
|---|---:|---|
| `middleware.ts` | 431 | 13 HTTP endpoints under `/__editor/*` + recursive file-tree builder |
| `editor-store.ts` | 372 | Open documents, dirty tracking, autosave, file CRUD, path allow-list |
| `yjs-sync.ts` | 344 | WebSocket upgrade, Y.Doc per file, sync/awareness/ping multiplexing, room eviction |
| `presence.ts` | 267 | Multi-user table over SSE — **has no client** (see §8) |
| `metrics.ts` | 78 | `process.memoryUsage()` / `process.cpuUsage()` / `os.*` snapshot |

Largest files in `editor/`: `styles/editor.css` 616, `editor-page.ts` 507,
`core/wysiwyg-decorations.ts` 438 (dead), `core/editor-theme.ts` 416,
`live-preview/build-decorations.ts` 376, `sync/yjs-client-v2.ts` 264,
`core/formatting-commands.ts` 238, `layout/menubar.ts` 215, `renderer/index.ts` 184.

---

## 2. The six dev-toolbar apps

All six are registered in one place: `astro-doc-code/src/dev-tools/integration.ts`, inside the
`astro:config:setup` hook, via six `addDevToolbarApp({ id, name, icon, entrypoint })` calls
(measured: 6 call sites). Astro loads each `entrypoint` in the browser, hands it a `ShadowRoot`
canvas and an app handle, and owns the icon strip, the toggle state machine, the keyboard
shortcut, the "hide toolbar" preference, and the 3-dot overflow placement.

| App | Entry file | Lines | Server dependency | Astro API it needs |
|---|---|---:|---|---|
| Layout & Theme | `layout-selector/index.ts` | 739 | `GET /api/dev/themes`, `GET /api/dev/layouts` (Astro API routes) | `addDevToolbarApp`, `astro-dev-toolbar-window`, `app.toggleState()` |
| Doc Errors | `error-logger/index.ts` | 486 | `GET /api/dev/errors` → `loaders/cache.ts` `getAllIssues()` / `getCacheStats()` | `addDevToolbarApp`, `astro-dev-toolbar-window` |
| Cache Inspector | `cache-inspector/index.ts` | 165 | `GET /__editor/system` (Vite middleware) | `addDevToolbarApp`, `astro-dev-toolbar-window`, `app.onToggled()` |
| System Metrics | `system-metrics/index.ts` | 154 | `GET /__editor/system` (Vite middleware) | same as above |
| Browser Cache | `browser-cache/index.ts` | 154 | none — reads `localStorage` only | same as above |
| Edit Page | `editor/index.ts` | 34 | none — it just navigates to `/editor?root=…` | `addDevToolbarApp`, `eventTarget` `app-toggled` event |

`_shared/styles.ts` (95 lines) is a CSS string every app prepends to its own `<style>`, because
each app lives in its own shadow root and cannot share a stylesheet. It declares a `--dt-*`
token set on `:host` and caps the height of `astro-dev-toolbar-window`.

**How hard is the toolbar coupling?** Two ways to count it, both measured:

- **8** references to `astro-dev-toolbar-*` custom elements across 6 files.
- **7** references to the app-handle API (`app.toggleState`, `app.onToggled`, `app-toggled`).

That is a *small* API surface but a *load-bearing* one: it is the entire host. The apps
themselves are plain DOM string-building and `fetch` — nothing Astro-specific inside the panel
bodies. So the port is not "rewrite 1,793 lines", it is "write a toolbar host, then re-target
1,793 lines of otherwise-portable DOM code at it". Concretely the host must supply: a
persistent floating icon strip, a shadow-root per app, an open/close state machine with a
toggle event, an overflow menu, and a way to keep a panel open across a full page reload
(`layout-selector/index.ts` line 48 relies on exactly that via a `sessionStorage` flag).

**Note on the Edit Page app.** `integration.ts` registers it with `id: 'doc-editor'` while
`editor/index.ts` declares `id: 'doc-editor-v2'` in its own default export. Astro uses the
registered id; the in-module one is inert. Cosmetic, but it will confuse whoever ports it.

---

## 3. `integration.ts` (376 lines) — what it actually wires

It uses exactly **one** Astro lifecycle hook: `astro:config:setup`. Everything else is done by
injecting a **Vite plugin** through `updateConfig({ vite: { plugins: [...] } })`, which then uses
two Vite hooks: `configureServer(server)` and `handleHotUpdate({ file, server })`.

| Block | Lines (approx) | What it does | Go equivalent |
|---|---:|---|---|
| `getEditorConfig()` | 33–74 | Reads `site.yaml → editor.autosave_interval` (hard error if missing) and 6 optional `editor.presence.*` keys with floors | `yaml.v3` unmarshal + validation — straight port |
| Watch-path assembly | 81–101 | Collects every user path from `getUserPaths()`, plus `paths.config` and `paths.styles`; calls `loadSiteConfig()` to populate `getThemePaths()` | `fsnotify` watch list — straight port |
| Cache-manager wiring | 104–109 | `cacheManager.setWatchPaths({ contentPaths, configPaths, assetPaths, themePaths })` | Per-package caches; the manager itself disappears |
| Component construction | 112–117 | `new EditorStore(...)`, `new PresenceManager(...)` | Struct construction |
| `configureServer` | 138–283 | Creates `YjsSync`, attaches WS upgrade to Vite's `httpServer`, registers `/__editor/*` middleware, starts autosave + presence cleanup + room eviction, adds watch paths to Vite's chokidar watcher, wires git-ref watching | `http.Server` + `chi` + goroutine timers + `fsnotify` |
| Git-ref watcher + SSR invalidation | 173–246 | Watches `.git/HEAD` and the active branch ref; on change clears the local issue-date cache **and** force-invalidates the SSR copy via `server.moduleGraph.invalidateModule()` | **Deleted entirely.** One process, one cache. This block is the bug that started the migration |
| `add` / `unlink` watcher handlers | 248–282 | Classify the file, invalidate caches, and either suppress reload (file is open in the editor) or `server.ws.send({ type: 'full-reload' })` | fsnotify + SSE `full-reload` event |
| `handleHotUpdate` | 284–317 | Same for changes; distinguishes the editor's *own* write (via `consumeEditorSave`) from an external edit, and on external edit calls `editorStore.reloadFromDisk()` + `yjsSync.resetContent()` | fsnotify + the same logic; the echo-suppression counter ports directly |
| 6× `addDevToolbarApp` | 324–370 | App registration | **No equivalent.** See §2 |

Two structural observations for the port:

1. Roughly **75 lines** of `integration.ts` (the git-ref + `moduleGraph.invalidateModule`
   block, lines 173–246, including its long comment) exist only to work around Vite 6's
   plugin/SSR module isolation. That code has no counterpart in Go. Confidence: **read**.
2. `server.ws.send({ type: 'full-reload' })` is Vite's HMR websocket. A Go server replaces it
   with its own SSE or WS channel plus a client-side listener that today does not exist —
   Vite's HMR client is injected by Vite. That client is **not** in this repo's source and is
   easy to forget when estimating.

---

## 4. The editor — client half and server half

### 4a. Client half (browser-side; survives any server)

`src/pages/editor.astro` (93 lines) renders a near-empty HTML document with an
`#editor-root` div carrying three data attributes (`data-content-root`,
`data-content-root-key`, `data-return-url`) resolved server-side from `site.yaml → pages`, then
a `<script>` that imports `mountEditor` from `dev-tools/editor/editor-page`. The only
server-rendered content is those three attributes. Replacing it with a Go `html/template` is a
half-hour job.

Everything under `dev-tools/editor/` except `sync/yjs-client-v2.ts`'s network calls is pure
browser code:

| Concern | Files | Lines | Portability |
|---|---|---:|---|
| CM6 setup, keymaps, compartments | `core/codemirror-setup.ts` | 92 | Browser-side — survives |
| CM6 themes (VS Code Dark+/Light+) | `core/editor-theme.ts` | 416 | Browser-side — survives |
| Markdown formatting commands + keymap | `core/formatting-commands.ts` | 238 | Browser-side — survives |
| Obsidian-style Live Preview decorations | `live-preview/{index,build-decorations,widgets,theme}.ts` | 756 | Browser-side — survives |
| Yjs ⇄ CM6 binding | `core/codemirror-yjs.ts` | 24 | Browser-side (`y-codemirror.next`) — survives |
| Shell / menubar / toolbar / resize / icons | `layout/*` | 536 (incl. 94 dead) | Browser-side — survives |
| File tree UI, context menu, dialogs, CRUD calls | `file-tree/*` | 397 | Browser-side — survives; the `fetch` targets move |
| View manager (source / live-preview / preview split) | `views/*` | 288 | Browser-side — survives |
| Client markdown renderer | `renderer/index.ts` | 184 | Browser-side (`marked` + `marked-alert` + lazy `shiki`) — survives |
| CSS | `styles/*.css` | 861 | Survives; imported from TS, which Vite handles either way |

The preview renderer is worth calling out: it deliberately **duplicates the server pipeline in
the browser** using the same npm packages (`marked`, `marked-alert`, `shiki`) so the preview
matches the site. In a Go runtime the server pipeline becomes goldmark + chroma while the
editor preview stays marked + shiki. **The two will diverge** — different CommonMark edge
cases, different highlighter token classes, different alert markup. Either the preview drifts
from the rendered page, or the preview becomes a server round-trip to the Go renderer (which
is what the current code explicitly moved *away* from — see the "Rendering is fully
client-side — no server render round-trips" comment at `sync/yjs-client-v2.ts` line 8).

One live defect found while reading: `views/preview.ts` line 45 dispatches a
`diagrams:render` CustomEvent, and `src/scripts/diagrams.ts` line 157 listens for it — but
`editor.astro` never loads `diagrams.ts`. Mermaid/graphviz blocks in the editor preview
therefore stay as inert `<div class="diagram">`. Confidence: **read**, not reproduced in a
browser.

### 4b. Server half (must be reimplemented in Go)

Thirteen HTTP endpoints, all registered by `setupEditorMiddleware()` on Vite's connect-style
middleware stack, plus one WebSocket upgrade path:

| Method + path | Handler location | What it needs from the host |
|---|---|---|
| `GET /__editor/styles` | `middleware.ts` 200 | Concatenates 5 CSS files off disk, no cache |
| `GET /__editor/events?userId=` | `middleware.ts` 210 | SSE stream + keepalive interval — **no client exists** |
| `GET /__editor/tree?root=` | `middleware.ts` 249 | Recursive dir walk reading `settings.json`/`settings.jsonc` and markdown frontmatter, prefix-aware sort |
| `GET /__editor/stats` | `middleware.ts` 266 | Room + doc stats — **no client exists** |
| `GET /__editor/system` | `middleware.ts` 275 | `collectServerMetrics()` + 3 cache snapshots; polled every 2 s by two toolbar apps |
| `POST /__editor/presence` | `middleware.ts` 295 | **No client exists** |
| `POST /__editor/open` | `middleware.ts` 304 | `store.openDocument()` + `yjsSync.getOrCreateRoom()` |
| `POST /__editor/save` | `middleware.ts` 318 | `store.saveDocument()` |
| `POST /__editor/close` | `middleware.ts` 328 | `store.closeDocument()` + conditional room destroy |
| `POST /__editor/create-file` | `middleware.ts` 348 | Next-`NN_`-prefix computation + frontmatter template |
| `POST /__editor/create-folder` | `middleware.ts` 357 | Prefix + `settings.json` scaffold |
| `POST /__editor/rename` | `middleware.ts` 366 | Prefix-preserving rename + room destroy |
| `POST /__editor/delete` | `middleware.ts` 410 | Recursive delete + close open docs |
| `POST /__editor/subtask-toggle` | `middleware.ts` 377 | `gray-matter` parse → set `status:` → `matter.stringify` write. **Called by the issues layout, not by the editor** — see §9 |
| `WS /__editor/yjs?file=&userId=` | `yjs-sync.ts` 82 | HTTP upgrade, per-file room |

`editor-store.ts` is the one piece that ports almost line-for-line to Go and where the
**subtle risk** lives. Its echo-suppression is a counter, not a timer:
`ignoreSaveMap` increments on every `fs.writeFileSync` and decrements on every watcher event
(`consumeEditorSave`, lines 124–131). That design is deliberate — the comment says "No timing
assumptions". Porting it means the Go watcher must fire **exactly one** event per write. Node's
chokidar (what Vite uses) normalises this; `fsnotify` does not. A single editor save on Linux
produces multiple inotify events (`WRITE`, `WRITE`, `CHMOD`) and on macOS the FSEvents
coalescing differs again. Get this wrong and the editor's own save is treated as an external
edit, which triggers `reloadFromDisk()` + `resetContent()` — a full CRDT text replacement that
will visibly stomp the user's cursor mid-typing. **This is the highest-probability regression
in the whole port and it will not show up in a smoke test.** Confidence: **read** for the
current design, **assumed** for the fsnotify behaviour (not tested here).

---

## 5. Yjs / CRDT — the honest assessment

### What the server actually does with Yjs

This matters because the notes claim it is client-side only. It is not. `yjs-sync.ts`:

- Builds an authoritative `Y.Doc` + `Y.Text` per file and seeds it inside a
  `doc.transact(..., 'init')` (lines 111–117).
- Applies every inbound client update through `syncProtocol.readSyncMessage(decoder,
  responseEncoder, room.doc, ws)` (line 294) — full CRDT merge, server-side.
- Answers `SyncStep1` with its own state vector on connect (line 275).
- Observes `Y.Text` and pushes `text.toString()` into `EditorStore` on every change, filtering
  by `transaction.origin` (lines 120–123). This is what makes autosave work.
- Rebroadcasts `doc.on('update')` to every peer except the origin (lines 126–141).
- Calls `Y.encodeStateAsUpdate(room.doc).byteLength` for the cache inspector (line 233).
- Replaces the whole text in a `'reset'` transaction when the file changes on disk (lines
  179–189).

Only the awareness channel (`MSG_AWARENESS`, line 312) is a dumb relay. So a Go server needs a
**real CRDT implementation**, not a websocket proxy.

On top of Yjs, the WS carries a small custom multiplex: a first varuint message type
(`MSG_SYNC=0`, `MSG_PING=2`, `MSG_CONFIG=3`, `MSG_AWARENESS=6`), with `MSG_PING` and
`MSG_CONFIG` payloads being lib0-varstring-encoded JSON. That framing is ~40 lines of trivial
Go (`binary.PutUvarint` + length-prefixed string).

### The four options, costed

Web search run 2026-08-07; GitHub API figures measured the same day.

| Option | Cost | What breaks | Maturity (measured) |
|---|---|---|---|
| **(a) Pure-Go Yjs port** — `reearth/ygo` or `Deln0r/ygo` | 1–2 weeks: swap `Y.Doc`→`crdt.Doc`, `syncProtocol.*`→`sync.*`, keep the custom framing. No cgo, single binary preserved | Nothing structural, *if* wire compatibility holds. Needs a conformance test against the real JS client before committing | `reearth/ygo`: 34★, 7 forks, 8 contributors, created 2025-04-02, last push 2026-08-06, v1.45.0, MIT, weekly releases, 28 open issues, 2.28 MB Go. `Deln0r/ygo`: 116★, 26 forks, 3 contributors, **created 2026-05-15** (12 weeks old), last push 2026-08-04, v1.15.0, MIT, 1.23 MB Go. Both listed on the official Yjs "ports to other languages" page |
| **(b) Rust `y-crdt` via cgo** (`yffi`) | 2–3 weeks + permanent build tax: cgo kills pure cross-compilation, so `goreleaser` needs a C toolchain per target. Directly contradicts the single-binary/cross-compile story in `notes/architecture/04_distribution-single-binary.md` | Windows/ARM release matrix becomes painful | `y-crdt/y-crdt`: 2,135★, 136 forks, last push 2026-08-05. Far more mature than any Go port — but there is **no maintained Go binding**; the published bindings are Python, Ruby, R, .NET, Swift, Kotlin, WASM, Elixir, C-FFI |
| **(c) Node sidecar for sync only** | 3–5 days to build, forever to live with. Reintroduces the Node runtime the whole migration exists to delete; the binary now ships or requires `node` + `yjs` + `ws` | The "zero runtime dependencies, ~25 MB binary" claim dies for anyone who wants the editor. Two processes to supervise, two crash modes, an IPC boundary | Uses today's exact code — highest fidelity, lowest risk, worst distribution story |
| **(d) Drop CRDT** — last-write-wins over plain WS, or single-writer lock | 3–4 days | Concurrent editing of one file silently loses text. Also loses `y-codemirror.next`'s remote cursors (`core/codemirror-yjs.ts`) and the CM6 `UndoManager` integration, so undo has to be rebuilt on plain CM6 history | n/a |

**Recommendation to whoever decides:** (a), gated on a written conformance test. Specifically:
stand up `reearth/ygo`, connect the *unmodified* `sync/yjs-client-v2.ts` to it, and assert
(i) `SyncStep1`/`SyncStep2` round-trip, (ii) concurrent inserts from two browsers converge,
(iii) awareness cursors render. That is a 1–2 day spike and it converts the single largest
unknown in this migration into a fact. If it fails, (c) as a bridge, never (b).

**What the notes get wrong here.** `notes/architecture/02_go-runtime.md` names the library
`y-crdt-go` (y-go) and rates it "less mature than yrs but available". No Go module by that name
turned up in either search. The real candidates are `reearth/ygo` and `Deln0r/ygo`, and the
second one did not exist when the note was written (created 2026-05-15; the note dates from
2026-05-08). The note's *conclusion* is directionally right and now understates the position —
but a plan should not be built on a package name nobody can `go get`.

**Second wrong claim.** `notes/architecture/06_performance-comparison.md` line 255: *"Editor
performance (CodeMirror + Yjs) is unaffected by the runtime swap — it's all client-side."*
False, per the list at the top of this section. The server holds and mutates CRDT state.

---

## 6. Dependency ledger

| Package | Installed | Used by | Class |
|---|---|---|---|
| `yjs` 13.6.29 | devDependency | `server/yjs-sync.ts`, `editor/sync/yjs-client-v2.ts`, `core/codemirror-yjs.ts` | **Node-only** on the server half, **browser-side** on the client half |
| `y-protocols` 1.0.7 | devDependency | same | same split |
| `y-codemirror.next` 0.3.5 | dependency | `core/codemirror-yjs.ts` | Browser-side — survives |
| `lib0` 0.2.117 | **not declared** — transitive via `yjs`; imported directly in 5 files | encoding/decoding on both halves | Phantom dependency. Minor, but a `bun install --production` shape change could break the build |
| `ws` 8.19.0 | devDependency | `server/yjs-sync.ts` | Node-only → `nhooyr.io/websocket` or `gorilla/websocket` |
| `@codemirror/*` (13 packages) | dependencies | `editor/` | Browser-side — survives |
| `marked` 17, `marked-alert` 2.1 | dependencies | `editor/renderer/index.ts` **and** the server parser | Browser-side here; portable elsewhere |
| `shiki` 3.22 | dependency | `editor/renderer/index.ts` (lazy `import('shiki')`) **and** the server | Browser-side here |
| `gray-matter` 4.0.3 | dependency | `server/middleware.ts` (tree frontmatter + subtask write-back) | Node-only → `yaml.v3` + a frontmatter splitter |
| `js-yaml` 4.1 | dependency | `integration.ts` (`getEditorConfig`) | Node-only → `yaml.v3` |
| Node `fs` / `path` / `os` / `process` / `http` | stdlib | `server/*`, `integration.ts` | Node-only → Go stdlib + `gopsutil` for CPU% |
| Astro `AstroIntegration`, `addDevToolbarApp`, `APIRoute`, `Astro.cookies`, `import.meta.env.DEV/PROD`, `import.meta.glob` | — | `integration.ts`, `api/dev/*`, `editor.astro` | **Astro-only** |
| Vite `ViteDevServer`, `configureServer`, `handleHotUpdate`, `server.watcher`, `server.ws`, `server.moduleGraph` | — | `integration.ts`, `server/middleware.ts` | **Vite-only** |
| Browser `WebSocket`, `sessionStorage`, `localStorage`, `crypto.randomUUID`, `matchMedia`, `performance.memory`, `document.cookie`, `ShadowRoot` | — | editor + toolbar apps | Browser-side — survives |

`performance.memory` is Chromium-only; `system-metrics/index.ts` already guards for it. Not a
migration concern.

---

## 7. Go rewrite, capability by capability

| Capability | Go equivalent | Verdict |
|---|---|---|
| HTTP endpoints `/__editor/*` | `chi` + `net/http` | Straight port |
| File tree walk with settings + frontmatter | `os.ReadDir` + `yaml.v3` | Straight port |
| Editor document store, dirty tracking, autosave | maps + `sync.RWMutex` + `time.Ticker` | Straight port |
| File CRUD with `NN_` prefixes | `os` + `regexp` | Straight port |
| Path allow-list security check | `filepath.Abs` + prefix compare. **Note:** the current check is `resolved.startsWith(wp)` (`editor-store.ts` line 64) — a plain string prefix, so `/data/docs-secret` passes an allow-list entry of `/data/docs`. Port it as a *path-segment* check, not a string prefix | Straight port + bug fix |
| Editor-save echo suppression vs watcher | `fsnotify` + the same counter — **but event-count semantics differ** | Redesign, see §4b |
| External-edit detection → CRDT reset | fsnotify + ygo `Transact` | Straight port once the above is right |
| WebSocket upgrade + per-file rooms | `nhooyr.io/websocket` or `gorilla/websocket` | Straight port |
| Yjs CRDT server state | `reearth/ygo` (`crdt`, `sync`, `awareness` packages) | Redesign-with-library; **needs a conformance spike** |
| lib0 varuint / varstring framing | `encoding/binary` | Straight port (~40 lines) |
| Awareness relay | Raw byte rebroadcast — no library needed | Straight port |
| SSE presence stream | `http.Flusher` | Straight port — or delete, since nothing consumes it |
| Server metrics | `runtime.MemStats` + `gopsutil` | Straight port; `nodeVersion` field becomes meaningless |
| Content-CSS concatenation for preview | `os.ReadFile` loop | Straight port |
| `/api/dev/themes`, `/api/dev/layouts` | Theme loader + a compile-time layout registry | Straight port; `import.meta.glob` becomes an explicit map |
| `/api/dev/errors` | Port of `loaders/cache.ts` (221 lines) | Straight port, but depends on Surface "content pipeline" landing first |
| Full-page reload push | SSE + a small client listener | New code — Vite's HMR client is not in this repo |
| **Dev-toolbar host** | Nothing exists | **Must be written from scratch** |
| CodeMirror 6 editor, Live Preview, themes, menubar | Unchanged — Vite builds it | Survives |
| `y-codemirror.next` binding | Unchanged | Survives |
| Client markdown preview (`marked` + `shiki`) | Unchanged — but now diverges from the Go server renderer | Survives with a **fidelity regression** |

**Effort, with basis.** Confidence: **assumed** (estimate), from measured line counts and the
number of distinct designs that have to change.

| Slice | Estimate | Basis |
|---|---|---|
| Editor client re-hosting (drop `editor.astro`, keep Vite build) | 2–3 days | 4,727 live lines move unchanged; only entry wiring changes |
| Editor server (store, CRUD, tree, save, watcher) | 1.5–2 weeks | 1,152 lines of straight port + one genuine redesign (watcher echo) |
| Yjs server on ygo, incl. conformance spike | 2–3 weeks | 344 lines but an unproven library boundary; budget the spike + the failure branch |
| Dev-toolbar host + re-target 6 apps | 2.5–3.5 weeks | 1,793 lines port mechanically, the host does not exist |
| Dev API routes (`themes`, `layouts`, `errors`) | 3–4 days | 187 lines, but blocked on the theme/layout loaders |
| **Total, full parity** | **7–10 weeks solo** | |
| **Total, if presence is dropped and the toolbar becomes 2 plain dev-only pages** | **4–5 weeks solo** | The fallback `notes/architecture/03_vite-frontend-and-dist.md` already contemplates |

---

## 8. Dead and unreachable code (measured)

This is the good news in the surface, and it is large enough to change the estimate.

**Files with zero importers** (verified by grepping every `from '…x'` and `import('…x')`
form across `src/`):

| File | Lines |
|---|---:|
| `editor/core/wysiwyg-decorations.ts` | 438 |
| `editor/layout/shell.ts` | 94 |
| `editor/layout/preview-panel.ts` | 51 |
| `editor/core/codemirror-languages.ts` | 43 |
| `editor/util/lazy-import.ts` | 42 |
| `editor/util/prefix-utils.ts` | 27 |
| `editor/layout/shell-styles.ts` (imported only by dead `shell.ts`) | 7 |
| **Subtotal** | **702** |

That is **12.9 % of `editor/`**. Note that `wysiwyg-decorations.ts` — one of the files this
audit was asked to inventory — is the largest dead file in the tree. `views/wysiwyg.ts` (19
lines) is a live but empty placeholder returning `[]` with `wysiwygAvailable = false`; the
menubar greys the mode out.

**Features with a server but no client:**

| Feature | Server lines | Evidence |
|---|---:|---|
| Presence table (join/leave/page/cursor, SSE broadcast, stale cleanup) | 267 (`presence.ts`) + ~40 in `middleware.ts` | **Zero** `EventSource` uses in the codebase — the only string match is `mxEventSource` inside the vendored draw.io bundle. Nothing POSTs `/__editor/presence`. Nothing GETs `/__editor/events`. `handleAction('join')` is never called, so `users` is always empty, so `updateLatency()` and `broadcastPresence()` are permanent no-ops |
| `/__editor/stats` | ~8 | No fetcher; the toolbar apps poll `/__editor/system` instead |
| Config keys `editor.presence.content_debounce`, `sse_reconnect` | — | Parsed into `PresenceConfig`, never read afterwards |
| Config key `editor.presence.render_interval` | — | Present in `default-docs/config/site.yaml` line 57; **never read by any code** |

Running total of code in this surface that a Go port does not need to reproduce:
**702 + 307 ≈ 1,009 lines** outright, plus the presence-adjacent config surface. Against a
9,370-line surface that is ~11 %; against the *server* half specifically it is ~20 %.

**Live-but-vestigial:** `PresenceManager` is still constructed, injected into `YjsSync`, cleanup
-timed, and surfaced in the Cache Inspector (which will always render `0 users / 0 streams`).
So it is not merely unused — it is actively costing a timer and a panel row.

---

## 9. Dev-only versus consumer-facing — and the one that crosses the line

Everything in `dev-tools/server/` and every `/__editor/*` endpoint exists **only** inside
Vite's `configureServer`, which never runs in a production build. Every `/api/dev/*` route
self-disables via `import.meta.env.PROD`. The dev toolbar itself is injected only by
`astro dev`. So on paper the entire surface is dev-only and a shipped binary owes none of it.

Three measured facts complicate that:

1. **The production build already ships the editor client.** `astro-doc-code/dist/` contains
   `editor/index.html` (953 B) plus `editor.astro_astro_type_script_index_0_lang.*.js`
   (175 KB), `codemirror-setup.*.js` (298 KB), `codemirror-yjs.*.js` (7 KB),
   `editor-theme.*.js` (7 KB) and `editor.*.css` (14 KB) — **~501 KB uncompressed of an editor
   that cannot function**, because every endpoint it calls 404s. Measured on the checked-in
   `dist/`.
2. **The dev API routes are prerendered as static 403 bodies.** `dist/api/dev/errors`,
   `.../layouts`, `.../themes` each contain exactly `{"error":"Not available in production"}`
   (39 bytes). Harmless, but it shows the dev/prod split is enforced by a build-time constant
   rather than by not emitting the route.
3. **The issue tracker's subtask toggle depends on a dev endpoint.**
   `src/layouts/issues/default/scripts/detail/subtask-state.ts` line 14 POSTs to
   `/__editor/subtask-toggle` with **no dev guard**. Clicking a subtask status chip in a
   production build fires a request that fails and the UI silently rolls back (line 176
   `catch` → `applySubtaskState(key, prevState)`). This is the one place where a "dev tool"
   is wired into a consumer-facing feature.

**Consequence for the migration.** `notes/architecture/02_go-runtime.md` lists
`internal/editor/` as "if Phase 3a (in-binary editor); else absent in v1". If the editor is
absent in v1, `/__editor/subtask-toggle` is absent too, and the tracker's status toggle stays
broken — the same as today, but now in a product whose whole pitch is "the binary *is* the
framework". Conversely, the Go runtime is the first version where this could *work* in a
shipped artefact, because a Go `serve` is a live server, not a static dump. That is a genuine
capability the Astro version cannot have, and it is not claimed anywhere in the notes.

---

## 10. Claims checked against the code

| Claim | Where | Verdict | Evidence |
|---|---|---|---|
| "Editor performance (CodeMirror + Yjs) is unaffected by the runtime swap — it's all client-side" | `notes/architecture/06_performance-comparison.md` line 255 | **False** | Server owns the authoritative `Y.Doc`, applies sync messages, observes `Y.Text`, encodes state — `server/yjs-sync.ts` lines 111–189, 233, 294 |
| "Yjs (if in-binary editor) → `y-crdt-go` (y-go), less mature than yrs but available" | `notes/architecture/02_go-runtime.md` library table | **False as written, conclusion now better** | No Go module found under that name. Real candidates measured 2026-08-07: `reearth/ygo` (34★, v1.45.0, 8 contributors, pushed 2026-08-06) and `Deln0r/ygo` (116★, v1.15.0, created 2026-05-15) |
| "Astro dev-toolbar plumbing" is deletable | `notes/architecture/01_overview.md`, "What this lets us delete" | **Holds as a deletion, understated as a cost** | Deleting it deletes the *host*; the 1,793 lines of app code then have nowhere to live |
| "The dev-toolbar UI (system metrics, cache inspector) → optionally rebuilt as plain dev-only routes; or dropped from v1" | `notes/architecture/03_vite-frontend-and-dist.md` | **Partly holds** | Names 2 of 6 apps, and the 2 smallest server-backed ones (319 lines). The two biggest — Layout & Theme (739) and Doc Errors (486) — are unaccounted for |
| "The dev toolbar (system metrics, cache inspector, layout selector) is part of the framework's value" | `notes/architecture/06_performance-comparison.md` line 17 | **Contradicts the note above** | Two notes in the same folder disagree on whether the toolbar ships. Needs a decision, not a reconciliation |
| "What this requires us to write" list | `notes/architecture/01_overview.md` | **Incomplete** | Lists 8 items; none of them is the editor server (1,152 lines), the CRDT server (344), the dev toolbar (1,793), or the dev API routes (187). The list omits ~3,500 lines of this surface |
| "File watcher + SSE refresh channel" covers the watcher story | `notes/architecture/01_overview.md` | **Partly holds** | Covers full-reload. Does not cover the editor-save echo suppression or the external-edit → `resetContent` path, which is where the real difficulty is |
| Single binary, cross-compiled, no cgo | `notes/architecture/04_distribution-single-binary.md` | **Holds only under CRDT option (a)** | The Rust `y-crdt` route needs cgo and breaks `goreleaser`'s pure cross-compile |
| "Yjs server (y-go) ~2 MB" binary contribution | `notes/architecture/04_distribution-single-binary.md` line 21 | **Unverifiable, plausibly low** | `reearth/ygo` is 2.28 MB of Go *source*; compiled contribution not measured here |

---

## 11. Losses and degradations

| Item | Severity | Why | Mitigation |
|---|---|---|---|
| Astro dev-toolbar host (icon strip, shadow-root canvases, toggle state machine, overflow menu) | **major** | Proprietary; no Go, Vite or standalone equivalent. 6 apps and 1,793 lines depend on it | Write a minimal host: a floating button, one shadow root per panel, a toggle event. ~300–500 lines of vanilla TS, shipped in the Vite bundle behind a dev flag. Or the notes' own fallback: plain dev-only routes at `/__dev/metrics` etc. |
| Server-side Yjs on a JS library | **major** | `yjs` + `y-protocols` cannot run in a Go process | `reearth/ygo` — but gate on a conformance spike against the real browser client before committing the design |
| Preview fidelity: editor renders with `marked`+`shiki`, site will render with goldmark+chroma | **major** | Two independent markdown implementations diverge on edge cases and highlighter markup. Today they are the same libraries by construction | Either accept drift and document it, or make the preview a debounced round-trip to the Go renderer — which costs the "no server round-trips" property the current design deliberately bought |
| Watcher echo-suppression semantics (chokidar → fsnotify) | **major** | The counter design assumes one watcher event per write. Getting it wrong stomps the user's text mid-edit via `resetContent` | Add a content-hash guard alongside the counter: if the on-disk bytes equal the in-memory `raw`, it was our own write regardless of event count |
| Vite HMR client (the browser half of `server.ws.send({type:'full-reload'})`) | minor | Not in this repo — Vite injects it. Easy to under-budget | ~30 lines: an `EventSource` on a Go SSE endpoint that calls `location.reload()` |
| `import.meta.glob` layout discovery in `/api/dev/layouts` | minor | Vite-specific | Compile-time map for built-ins + a `os.ReadDir` scan for the user overlay — the notes already plan this |
| Cookie-driven layout/theme override (`dev-layout`, `dev-color-theme`, `dev-navbar`, `dev-footer`) | minor | Read via `Astro.cookies` in `BaseLayout.astro` and `[...slug].astro` | `r.Cookie()` in the Go handler. Strictly easier, and it works in `serve` mode too, which the static build cannot do |
| `process.memoryUsage()` / `process.cpuUsage()` fidelity | minor | Go's `runtime.MemStats` does not map 1:1 to Node's `rss / heapUsed / external / arrayBuffers` | `gopsutil` for process RSS + CPU%; drop the heap breakdown or relabel it |
| Presence table (multi-user cursors in a shared table) | **none** | Feature is dead: no client, `users` map never populated | Do not port. Delete `presence.ts`, `/__editor/events`, `/__editor/presence`, and the 3 unread config keys — or build the client, but call that new work |
| 702 lines of unreferenced editor code | **none** | Already dead | Do not port |
| CodeMirror 6, Live Preview decorations, themes, keymaps, file tree UI, view manager | **none** | All browser-side | Moves unchanged into the Vite `frontend/` tree |

---

## 12. Open questions for whoever decides

1. **Does the toolbar ship?** Two notes in `notes/architecture/` disagree. The answer swings
   this surface's estimate by roughly 3 weeks.
2. **Has anyone run a `reearth/ygo` ⇄ `y-codemirror.next` conformance test?** Everything about
   the CRDT decision rests on it and it is a 1–2 day spike. Until it is run, every schedule
   containing "in-binary editor" is unverified.
3. **Is the presence feature wanted, or was it abandoned?** 267 lines and 6 config keys are
   sitting on disk with no client. Port, delete, or finish — but not "port as-is".
4. **Does the preview stay client-rendered?** If yes, accept permanent divergence between the
   editor preview and the published page. If no, the CRDT round-trip design changes.
5. **Should `/__editor/subtask-toggle` be promoted out of the dev surface?** It is the only
   write path a consumer touches, and today it is broken in every shipped build.
