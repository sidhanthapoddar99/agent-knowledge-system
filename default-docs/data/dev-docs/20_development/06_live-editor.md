---
title: Live Documentation Editor
description: In-browser split-pane editor with real-time collaboration via Yjs CRDT and multi-user presence
---

# Live Documentation Editor

The dev toolbar includes an Overleaf-style live editor for docs and blog pages. Click **Edit Page** in the toolbar to open a full-screen split-pane editor: raw markdown on the left, rendered preview on the right.

Multiple developers on the same network can see each other's presence, pages, latency, and live cursor positions — similar to Google Docs or Figma. Text synchronization uses the [Yjs CRDT](https://yjs.dev/) for conflict-free concurrent editing.

This is a **development-only** feature — it is completely disabled in production builds.

## Accessing the Editor

1. Start the dev server (`bun run dev`)
2. Navigate to any docs or blog page
3. Click the **pencil icon** ("Edit Page") in the dev toolbar at the bottom
4. Click **"Edit this page"** in the panel

The button is only enabled on pages that have content files (docs and blog pages). Custom pages like the home page do not show the editor.

## Editor Layout

The editor opens as a full-screen overlay with three sections:

### Header Bar

| Element | Description |
|---------|-------------|
| **File name** | Shows the path of the file being edited |
| **Status indicator** | Green "Saved", orange "Unsaved changes", or yellow "Saving..." |
| **Refresh Preview** | Force a re-render of the preview pane |
| **Save button** | Manual save (also via `Ctrl+S` / `Cmd+S`) |
| **Close button** | Close the editor (also via `Escape`) |

### Left Pane — Markdown Editor

A syntax-highlighted text editor showing the raw markdown including frontmatter. Features:

- **Syntax highlighting** for markdown elements:
  - Headings (`#`, `##`, etc.)
  - Bold (`**text**`) and italic (`*text*`)
  - Inline code and fenced code blocks
  - Links and images
  - Blockquotes, lists, and horizontal rules
  - YAML frontmatter block
- **Tab key** inserts spaces instead of changing focus
- **Remote cursors** — colored cursor markers with labels show where other users are editing in the same file
- Monospace font for consistent formatting
- Highlight overlay uses **Shadow DOM** to isolate DOM mutations from external observers

### Right Pane — Live Preview

Rendered HTML preview that updates periodically (configurable via `render_interval`, default 5s). The preview:

- Uses the same rendering pipeline as production (asset embedding, heading IDs, external link handling)
- Applies your site's active theme and content styles
- Matches the appearance of the actual docs page
- Only re-renders when content has changed since the last render

### Resize Handle

Drag the divider between panes to adjust the split ratio.

### Scroll Sync

Both panes scroll together proportionally — scrolling the markdown editor scrolls the preview to the matching position, and vice versa. Remote cursors reposition automatically during scrolling.

## Real-Time Collaboration (Yjs CRDT)

Text synchronization uses [Yjs](https://yjs.dev/), a CRDT (Conflict-free Replicated Data Type) library. Each file open in the editor has a **Yjs room** on the server with an authoritative `Y.Doc`. When multiple users edit the same file:

- Each client maintains a local `Y.Doc` and `Y.Text` that syncs with the server
- Local edits are computed by prefix/suffix matching between the textarea and `Y.Text`
- The Yjs sync protocol handles conflict resolution automatically
- Remote text changes adjust the local cursor position to avoid jumps

### Content Duplication Prevention

A `yjsSynced` flag blocks the input handler until the first Yjs sync completes. This prevents a race condition where keystrokes during initial HTTP content load could duplicate the entire document.

## Multi-User Presence

When multiple developers have the dev server open, a **presence table** appears in the toolbar panel showing all connected users.

### Presence Table

| Column | Content |
|--------|---------|
| **User** | Colored dot + randomly assigned name (e.g. "Swift Otter") with "(you)" marker |
| **Page** | Shortened URL path of the page the user is viewing |
| **Ping** | Round-trip latency, color-coded: green (<100ms), yellow (<300ms), red (>=300ms) |
| **Action** | "Jump" button to navigate to that user's current page |

The connected user count is shown as a badge in the section header.

### User Identity

Each browser tab is assigned a random identity (adjective + animal name and a color) on first load. This identity is preserved across page refreshes within the same session via `sessionStorage`.

### Live Cursors

When two or more users have the editor open on the **same file**, each user sees colored cursor markers showing other users' positions in real time:

- Cursors appear as a thin colored line with a name label above
- Position updates are throttled (configurable, default 100ms) to reduce network traffic
- Cursor broadcasts are **file-scoped** — only users editing the same file receive updates
- Cursors reposition on scroll and hide when scrolled out of view
- Cursor positions are measured using a **hidden mirror div** with identical styling to handle word-wrap accurately
- Absolute coordinates are cached; scroll events only subtract offsets without DOM measurement
- When a user's WebSocket disconnects, their cursor is automatically cleared for other users

## Communication Architecture

All real-time editing traffic flows through a single **multiplexed WebSocket** connection per editor session. A lightweight **SSE** stream exists separately for the global presence table, which runs even when no editor is open.

### What Goes Where

| Traffic | Channel | Why |
|---------|---------|-----|
| Text sync (Yjs CRDT) | **WebSocket** | Binary Yjs protocol, bidirectional, latency-critical |
| Cursor positions | **WebSocket** | High frequency (~10Hz), file-scoped, enriched by server with user name/color |
| Ping / latency | **WebSocket** | Round-trip echo for latency measurement, updates presence table |
| Config delivery | **WebSocket** | Timing values sent once on connect (`pingInterval`, `cursorThrottle`, `renderInterval`) |
| Rendered preview | **WebSocket** | Server pushes rendered HTML after re-render; client requests via `MSG_RENDER_REQ` |
| Presence table (join/leave/page) | **SSE** | Low frequency, global (not file-scoped), always-on even without editor open |
| Open / save / close | **HTTP POST** | One-shot request/response, not latency-critical |

### Connection Lifecycle

```
Page Load (any page)
  └─ SSE connects to /__editor/events?userId=xxx
     └─ Receives "presence" events (user list)
     └─ Sends HTTP POST for join/leave/page actions

Editor Opens (click "Edit this page")
  └─ HTTP POST /__editor/open → creates Yjs room, returns raw + rendered
  └─ WebSocket connects to /__editor/yjs?file=xxx&userId=xxx
     └─ Server sends MSG_CONFIG (timing values)
     └─ Yjs sync handshake (MSG_SYNC)
     └─ Client starts ping loop (MSG_PING every pingInterval)
     └─ Client starts render timer (MSG_RENDER_REQ every renderInterval)
     └─ Cursor events flow bidirectionally (MSG_CURSOR)
     └─ Server pushes rendered HTML (MSG_RENDER)

Editor Closes
  └─ WebSocket closes → server auto-clears cursor for other users
  └─ HTTP POST /__editor/close → Yjs room destroyed if no connections remain

Page Unload
  └─ navigator.sendBeacon POST /__editor/presence {type:'leave'} → reliable cleanup
  └─ SSE stream closes
```

### WebSocket Protocol

The Yjs WebSocket (`/__editor/yjs`) multiplexes all per-file editing traffic using [lib0](https://github.com/dmonad/lib0) binary framing. Each message starts with a `writeVarUint` message type:

| Type | Name | Direction | Payload |
|------|------|-----------|---------|
| `0` | `MSG_SYNC` | Bidirectional | Yjs binary sync protocol (raw bytes, not JSON) |
| `1` | `MSG_CURSOR` | C→S / S→C | C→S: `{cursor: {line, col, offset}}` — S→C: `{userId, name, color, cursor, file}` |
| `2` | `MSG_PING` | C→S / S→C | C→S: `{clientTime, latencyMs}` — S→C: `{clientTime}` |
| `3` | `MSG_CONFIG` | S→C | `{pingInterval, cursorThrottle, renderInterval}` |
| `4` | `MSG_RENDER` | S→C | `{file, rendered}` |
| `5` | `MSG_RENDER_REQ` | C→S | `{}` |

- `MSG_SYNC` uses the raw Yjs sync protocol (binary) after the type varuint
- All other messages encode as `writeVarUint(type) + writeVarString(JSON.stringify(payload))`
- Server enriches `MSG_CURSOR` broadcasts with the sender's `name` and `color` from the presence user record before relaying to room peers

### SSE Events

The `/__editor/events` SSE stream sends a single event type:

| Event | When | Payload |
|-------|------|---------|
| `presence` | User joins, leaves, navigates, or latency changes significantly (>20ms delta) | `{ type: 'presence', users: [...] }` — full user list |

The client (`sse-presence.ts`) listens only for `presence` events. SSE keepalive comments (`: keepalive`) are sent at `sse_keepalive` interval and also update `lastSeen` to prevent stale removal.

### HTTP Endpoints

All endpoints are dev-only and handled by Vite middleware:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/__editor/yjs` | WS | Multiplexed Yjs CRDT sync + cursor, ping, config, render |
| `/__editor/events` | GET | SSE stream — presence table updates only |
| `/__editor/styles` | GET | Combined CSS for preview styling |
| `/__editor/open` | POST | Open document — returns raw markdown + rendered HTML, creates Yjs room |
| `/__editor/save` | POST | Save current content to disk |
| `/__editor/close` | POST | Close document — destroys Yjs room if no connections remain |
| `/__editor/presence` | POST | Presence actions: join, leave, page, cursor-clear |

## Auto-Save

The editor automatically saves changes to disk at a configurable interval. During editing:

1. **Keystroke** — Changes flow through Yjs CRDT to the server, which updates the in-memory document via the `Y.Text` observe callback
2. **Render timer** — Client sends `MSG_RENDER_REQ` via WebSocket at `render_interval`; server re-renders and pushes `MSG_RENDER` back to all room clients
3. **Auto-save interval** — `EditorStore` flushes dirty documents to disk periodically
4. **Manual save** — `Ctrl+S` or the Save button triggers an immediate disk write via HTTP POST
5. **Close** — The editor overlay is removed, HTTP POST notifies the server

### Configuration

The auto-save interval is configured in `site.yaml` and is **required**:

```yaml
editor:
  autosave_interval: 10000  # milliseconds (minimum: 1000)
```

If this field is missing, the dev server will fail to start with an error message explaining what to add.

### Presence Configuration

All timing values are configurable in `site.yaml` under `editor.presence`:

```yaml
editor:
  autosave_interval: 10000
  presence:
    ping_interval: 5000       # How often clients ping the server (ms)
    stale_threshold: 30000    # Remove users with no heartbeat after this (ms)
    cursor_throttle: 100      # Min interval between cursor broadcasts (ms)
    content_debounce: 150     # Debounce for raw text diff sync (ms)
    render_interval: 5000     # Interval for rendered preview updates (ms)
    sse_keepalive: 15000      # SSE keepalive comment interval (ms)
    sse_reconnect: 2000       # SSE auto-reconnect delay on disconnect (ms)
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `ping_interval` | `number` | `5000` | Client ping frequency in ms. Minimum: `1000` |
| `stale_threshold` | `number` | `30000` | Duration before a silent user is removed. Minimum: `5000` |
| `cursor_throttle` | `number` | `100` | Min ms between cursor position sends. Minimum: `16` |
| `content_debounce` | `number` | `150` | Debounce for raw text diff sync in ms. Minimum: `50` |
| `render_interval` | `number` | `5000` | Server render interval in ms. Minimum: `1000` |
| `sse_keepalive` | `number` | `15000` | SSE keepalive comment interval in ms. Minimum: `5000` |
| `sse_reconnect` | `number` | `2000` | SSE auto-reconnect delay in ms. Minimum: `500` |

All fields are optional — sensible defaults are used if omitted. The server sends `pingInterval`, `cursorThrottle`, and `renderInterval` to editor clients via `MSG_CONFIG` on WebSocket connect, so there are no hardcoded timing values on the client side.

## HMR Suppression

While a file is open in the editor, hot module replacement (HMR) is suppressed for that file. This prevents the page from reloading mid-edit when the auto-save writes to disk.

- Caches are still cleared on each save so the next full load picks up changes
- Other files not being edited still trigger normal HMR
- External edits (e.g. from VS Code) are detected and pushed to the editor via Yjs — the document reloads from disk and the Yjs room content is reset

## Optimizations

### Network

| Optimization | Detail |
|-------------|--------|
| **Single WebSocket per editor session** | Text sync, cursors, ping, config, and render updates are multiplexed on one connection using lib0 binary framing (~6 bytes overhead per message vs ~800 bytes for HTTP POST headers). |
| **Binary Yjs sync protocol** | `MSG_SYNC` uses the raw Yjs binary protocol — no JSON serialization overhead for the most frequent message type. |
| **File-scoped cursor broadcasts** | `MSG_CURSOR` is only relayed to clients in the same Yjs room (same file), not to all connected users. A user editing `overview.md` never receives cursor traffic from `installation.md`. |
| **Cursor throttling** | Client-side throttle (`cursor_throttle`, default 100ms) limits cursor sends to ~10 per second regardless of how fast the user moves the cursor. |
| **Latency-gated presence broadcasts** | `updateLatency()` only triggers an SSE presence broadcast when latency changes by >20ms, preventing N² SSE writes every ping interval. |
| **Conditional render requests** | Client only sends `MSG_RENDER_REQ` when `contentChangedSinceLastRender` is true. Idle editors generate zero render traffic. |
| **Auto cursor-clear on disconnect** | Server detects WS close and clears the user's cursor immediately — no polling or timeout needed. |

### DOM Performance

| Optimization | Detail |
|-------------|--------|
| **Shadow DOM for highlight overlay** | The syntax-highlighted `<pre>` lives inside a Shadow DOM on the highlight host `<div>`. `innerHTML` mutations inside the shadow boundary are invisible to external `MutationObserver`s (including Astro's dev toolbar audit `perf.js`), preventing spurious image re-audits on every keystroke. |
| **rAF-batched highlight updates** | `updateHighlight()` is batched via `requestAnimationFrame` — multiple rapid calls within a single frame only produce one `innerHTML` write. |
| **Cached cursor coordinates** | Remote cursor positions are measured once (via mirror div) and stored as absolute `(absTop, absLeft)` coordinates. Scroll events only subtract `scrollTop`/`scrollLeft` without any DOM measurement. `remeasureAllCursors()` only runs on content changes or resize. |
| **Mirror div for cursor measurement** | A hidden off-screen `<div>` with identical font, padding, and `white-space: pre-wrap` styling measures actual pixel positions of character offsets, correctly handling word-wrap that simple `line * lineHeight + col * charWidth` calculations get wrong. |
| **Guard against redundant DOM writes** | `updateStatus()` skips DOM writes when the status hasn't changed (e.g. repeated 'unsaved' calls during typing). `setPreviewContent()` skips `innerHTML` replacement when the rendered HTML is identical to the previous render. Both prevent unnecessary MutationObserver triggers. |
| **CSS containment** | The editor overlay uses `contain: layout style paint` and `isolation: isolate` to create an independent stacking context and limit browser layout/paint recalculations to the overlay subtree. |
| **Content CSS scoping** | Site content styles fetched for the preview pane are wrapped in `.editor-preview { ... }` using CSS nesting, preventing them from leaking into the editor textarea or overlay chrome. |

### Memory

| Optimization | Detail |
|-------------|--------|
| **Yjs room lifecycle** | Rooms are created on `/__editor/open` and destroyed on `/__editor/close` when no WebSocket connections remain. No Y.Doc persists in memory for files not being edited. |
| **Pre-serialized SSE broadcasts** | `broadcastPresence()` and `broadcastToRoom()` serialize the JSON payload once and write the same string to all streams/connections, avoiding per-recipient `JSON.stringify()`. |
| **Single EventSource per tab** | The SSE connection is module-scoped — all toolbar panels share one stream. HMR teardown via `setupHmrGuard` prevents leaked connections. |

## Source Files

### Client-Side Modules (`src/dev-tools/editor/`)

| Module | Purpose |
|--------|---------|
| `types.ts` | Shared types (`EditorContext`, `EditorDom`, `SaveStatus`), identity generation, `escapeHtml` |
| `styles.ts` | CSS for the full-screen editor overlay |
| `overlay-dom.ts` | Builds the overlay DOM, returns typed element refs |
| `highlight.ts` | Regex-based markdown syntax highlighting |
| `scroll-sync.ts` | Shadow DOM highlight overlay + textarea/preview proportional scroll |
| `cursors.ts` | Remote cursor rendering via mirror div measurement + local cursor tracking |
| `sse-presence.ts` | Global SSE connection for presence table (join/leave/page only) |
| `yjs-client.ts` | Yjs CRDT sync, multiplexed WS messages (cursor/ping/config/render), input handler, save/close |

### Server-Side Files

| File | Purpose |
|------|---------|
| `src/dev-tools/editor/` | CodeMirror 6 client UI (mounted at `/editor`): `core/`, `file-tree/`, `forms/`, `layout/`, `live-preview/`, `renderer/`, `styles/`, plus `editor-page.ts` as the mount entry |
| `src/dev-tools/routes/editor.astro` | The `/editor` page itself. It lives here rather than in `src/pages/` so the build never emits it — see below |
| `src/dev-tools/routes/api/dev/` | `themes.ts`, `layouts.ts`, `errors.ts` — the toolbar's data endpoints, gated the same way |
| `src/dev-tools/server/editor-store.ts` | In-memory document store (`EditorStore`) — render pipeline, auto-save, `ignoreSaveSet` pattern |
| `src/dev-tools/server/presence.ts` | Multi-user presence manager (`PresenceManager`) — SSE streams, user tracking, stale cleanup |
| `src/dev-tools/server/yjs-sync.ts` | Yjs room management (`YjsSync`) — WS message routing, CRDT sync, cursor relay, render broadcast |
| `src/dev-tools/server/middleware.ts` | HTTP endpoint handlers (editor API, `/__editor/system`, SSE stream setup) |
| `src/dev-tools/server/metrics.ts` | `collectServerMetrics()` — CPU / RAM / load-avg snapshot for the system-metrics toolbar app |
| `src/dev-tools/server/git-ref-watcher.ts` | Watches `.git` for commits so derived `updated` dates refresh. Separate from Vite's watcher, which ignores `**/.git/**` unconditionally |
| `src/dev-tools/integration.ts` | Wires editor, presence, Yjs, and the toolbar apps into Vite's HMR pipeline, and injects the dev routes above |

### Why the dev routes are not in `src/pages/`

Astro routes **everything** in `src/pages/`, with no integration consulted. So for
as long as `editor.astro` and `api/dev/*.ts` lived there, they were built into
every production site — a `/editor` page rendering a live editor against
save endpoints that do not exist outside dev, plus 426 client chunks no reader
could reach (**49% of `_astro`**).

They now live under `src/dev-tools/routes/` and are injected by the integration
only when `command === 'dev'`:

```ts
const DEV_ROUTES: Record<string, string> = {
  '/editor':          './routes/editor.astro',
  '/api/dev/themes':  './routes/api/dev/themes.ts',
  '/api/dev/layouts': './routes/api/dev/layouts.ts',
  '/api/dev/errors':  './routes/api/dev/errors.ts',
};

if (command === 'dev') {
  for (const [pattern, entry] of Object.entries(DEV_ROUTES)) {
    injectRoute({ pattern, entrypoint: new URL(entry, import.meta.url).href });
  }
}
```

**Add a new dev surface here, not to `src/pages/`.** A file placed under
`src/dev-tools/routes/` is invisible to the build by default and needs a
deliberate line to become a route at all; a file placed in `src/pages/` ships to
every consumer and nothing warns you.

`api` and `editor` remain in `RESERVED_BASE_URLS` even though `dist/` has neither
— a user section whose `base_url` normalized to one of them would still be
shadowed in dev, silently. See
[Routing](../05_architecture/02_routing.md#reserved-base-urls).
