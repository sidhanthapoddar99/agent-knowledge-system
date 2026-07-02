---
title: "Tauri + Rust core — one core, three surfaces"
sidebar_label: "02 · Tauri + Rust core"
---

# Tauri + Rust core — the architecture explored

The load-bearing question in the original deliberation: *"If we use Tauri, does it serve as both
backend and frontend? Can one thing be a coordinator (server) and an Obsidian-like editor at
once?"* The answer shaped the whole design.

**Key realization:** Tauri is a *desktop-app* framework, not a *server* framework — the Tauri
runtime expects a webview window; if you don't want a window, you don't want Tauri, you want a
plain Rust binary. But the **Rust core that powers a Tauri app can also be packaged as a
separate headless server binary.** That shared-core insight is what yields three deployment
shapes from one codebase.

## One core, three surfaces

```
                 Rust core (library crate)
   yrs (Yjs-in-Rust) · file I/O + watcher · presence ·
   full-text index · persistence · Yjs y-protocols wire format
        │                    │                    │
        ▼                    ▼                    ▼
  Server binary        Desktop app          Web frontend
  (headless Rust)      (Tauri)              (browser, TS)
  HTTP/WS coordinator  core + webview       CM6 + Yjs JS
                       hosting the web UI   talks to a server
        └───────── all speak Yjs y-protocols over WS ─────────┘
              one wire format · clients interchangeable
```

| Surface | What it is | Use case |
|---|---|---|
| **Rust core** | `yrs` CRDT + file I/O + presence + index + persistence | Library — never shipped directly |
| **Server binary** | Headless Rust wrapping the core over HTTP + WS | Self-hosted multi-user "coordinator" (open-source Obsidian-Sync analogue) |
| **Desktop app (Tauri)** | Rust core linked in + native webview running the web UI | Local-first offline editor, *or* connect its webview to a remote server |
| **Web frontend** | CM6 + `yjs` JS client | Browser users; quick edits from any device |

The unifier is the **Yjs `y-protocols` wire format** — the same format the JS implementation
already speaks. That makes the migration *incremental*: the server can flip to Rust (`yrs`)
while JS clients keep working, `y-websocket` servers are drop-in interoperable, and a web client
and a Tauri client can collaborate on one document without knowing each other's runtime. Edits
propagate as compact binary updates (tens of bytes/keystroke, sub-ms merge, no server-side
conflict code — the CRDT handles it).

## Tauri vs Electron — the decisive axis

| Concern | Tauri | Electron |
|---|---|---|
| Binary size | 5–15 MB | 100–150 MB |
| Idle RAM | 30–80 MB | 150–300 MB |
| Cold startup | < 1 s | 1–3 s |
| Backend language | **Rust — shared with the server** | Node — would *not* share |
| Editor-pane JS perf | webview engine, comparable | Chromium V8, comparable |

The size/RAM numbers are nice, but the **deciding factor for this project** is the shared Rust
core: Electron forces a Node backend, so desktop and server stop sharing implementation; Tauri
keeps them in lockstep. The Tauri tradeoff is webview inconsistency across OSes (WebKit / WebView2
/ WebKitGTK) — acceptable for a well-tested CM6 editor, less so if you push exotic CSS or
bleeding-edge web APIs where Electron's always-Chromium guarantee earns its cost.

## Constraints the shape deliberately rules out

- **Tauri-only (no separate server binary)** — loses the headless self-host case and forces
  every collaborator to install a desktop app.
- **Two separate frontends (desktop vs web)** — doubles UI maintenance for what is mostly
  window-chrome. Build one web frontend; let Tauri host it with `tauri-invoke` IPC for the few
  native-only features.
- **Node-only server** — fine for a prototype, but locks you out of the shared-core pattern;
  port to Rust at the moment the editor needs to scale or ship as a binary.

## Open questions (were deferred to implementation)

- **Persistence** — flat-file (snapshot each `Y.Doc` to disk on idle; "the editor is a fancy view
  of your folder") vs SQLite-backed ("the editor owns its store, syncs to flat files on save").
- **File-system bridge** — canonical version owner: the editor's `Y.Doc` or the file on disk?
  Decides file-watcher / save behaviour.
- **Plugin model** — adopt the docs framework's plugin pattern or invent its own?
- **Headless server UI** — pure sync endpoint, or does it also serve an admin/viewer page?

> Relevance today: this entire exploration is **dormant under phase 3a** (editor-in-Go-binary via
> `y-go`) and only reactivates under **phase 3b** — if `y-go` proves insufficient and the editor
> is spun out as a genuinely separate product. The `yrs` evaluation is the piece most worth
> keeping warm.
