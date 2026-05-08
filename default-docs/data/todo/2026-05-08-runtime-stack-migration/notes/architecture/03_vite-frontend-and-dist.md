---
title: "Vite frontend + dist embedding — how the JS shipping works"
sidebar_label: "03 · Vite + dist"
---

# Vite frontend + dist embedding

Vite is **build-time only**. It doesn't run in production. The `dist/` it produces gets baked into the Go binary at compile time. This note details how that works and what the frontend looks like.

## What Vite does

```
frontend/src/                 →   vite build   →   dist/
├── islands/                                       ├── index.html
│   ├── issues-table.ts                            ├── assets/
│   ├── editor.ts                                  │   ├── issues-table-a3f1.js  (15 KB)
│   ├── sidebar.ts                                 │   ├── editor-9b2c.js        (180 KB)
│   ├── outline.ts                                 │   ├── sidebar-7d4e.js       (8 KB)
│   └── theme-toggle.ts                            │   ├── main-d8e0.css         (12 KB)
└── styles/                                        │   └── ...
                                                   └── manifest.json
```

`vite build` outputs:

- `index.html` (template; not actually served — Go renders its own HTML)
- `assets/*.js` — hashed JS bundles per island (lazy-loaded per route)
- `assets/*.css` — hashed CSS bundles
- `manifest.json` — maps island name → hashed filename (Go reads this to inject correct `<script>` tags)

## How Go embeds dist/

```go
package main

import "embed"

//go:embed all:frontend/dist
var distFS embed.FS

// At server boot:
http.Handle("/assets/", http.FileServer(http.FS(distFS)))
```

That's the entire embedding story. Compile time: dist/ is baked. Runtime: Go reads from `embed.FS` and serves bytes. No filesystem access for assets.

## What the frontend framework choice should be

Vite is framework-agnostic. The island runtime is independent.

| Framework | Runtime size (gzipped) | Verdict for this project |
|---|---|---|
| **Vanilla TS** | 0 KB | Best for tiny islands (theme toggle, sidebar persistence). Today most chrome is already vanilla DOM. |
| **Preact** | ~3 KB | React-ish, tiny. Good default for medium islands. |
| **Svelte** | ~5 KB compiled out | Compiles away mostly. Excellent for issues table + filter bar. |
| **SolidJS** | ~7 KB | Fine-grained reactivity. Best perf ceiling. |
| **React** | ~45 KB | Only worth it if we need React-specific libs. CodeMirror has React wrappers but vanilla works fine. |

**Working assumption: Svelte for the structured islands (issues table, editor shell), Vanilla TS for the smallest ones (theme toggle, sidebar persistence).** Total per-page JS budget: under 30 KB except editor route (~200 KB because CodeMirror).

## Island budget per route

| Route | Islands loaded | JS budget (gzipped) |
|---|---|---|
| Docs page | sidebar, outline, theme-toggle | ~8 KB |
| Blog index / post | sidebar (light), theme-toggle | ~5 KB |
| Issues index | filter-bar, table-sort, pagination | ~25 KB |
| Issue detail | sidebar, theme-toggle | ~8 KB |
| Editor route | editor (CodeMirror + yjs-client) | ~200 KB |
| Custom (home, info) | theme-toggle | ~3 KB |

Compare to today's Astro setup which ships ~300–500 KB to most pages. **Go + Vite ships less JS than Astro** because there's no framework runtime — only the islands actually used.

## Build-time integration

```bash
# Build script (run on developer's machine, in CI for releases)
cd frontend && bun run build              # produces dist/
cd .. && go build -o doc-engine ./cmd/doc-engine
                                          # embeds dist/, produces single binary

# OR via a Makefile / release script
make release                              # cross-compiles all platforms
```

## Manifest reading at runtime

```go
type ViteManifest map[string]struct {
    File    string   `json:"file"`     // hashed JS filename
    CSS     []string `json:"css"`      // hashed CSS files for this entry
    Imports []string `json:"imports"`  // chunk dependencies
}

func loadManifest() (*ViteManifest, error) {
    data, _ := distFS.ReadFile("frontend/dist/manifest.json")
    var m ViteManifest
    json.Unmarshal(data, &m)
    return &m, nil
}

// In template:
// <script type="module" src="/assets/{{ manifest.Get "issues-table" }}"></script>
```

Go reads the manifest at startup, caches the entry → hashed-filename map, injects correct `<script>` tags into rendered HTML. Standard SSG-with-islands pattern.

## Dev mode (Vite as subprocess)

For framework developers (or theme/layout customisers adding new islands), `doc-engine dev --vite` spawns Vite dev server as a subprocess:

```
$ doc-engine dev --vite
[doc-engine] starting Go on :4321
[doc-engine] starting vite dev on :5173 (subprocess)
[doc-engine] proxying /@vite/* /assets/* → :5173 for HMR
```

In this mode, Go doesn't serve from `embed.FS`; it proxies asset requests to the Vite dev server, which provides HMR. When the developer is happy, `vite build` regenerates `dist/`, `go build` re-embeds, and the new binary ships.

For the docs author / themer who isn't writing islands, no Vite, no Node, no subprocess.

## What gets dropped

- Astro's `import.meta.glob` for islands → replaced by Vite's manifest + Go's lookup table
- Astro's component-island runtime (~30 KB) → replaced by direct script tags
- Astro's hydration directives (`client:load`, `client:idle`, etc.) → replaced by explicit dynamic imports in island code
- The dev-toolbar UI (system metrics, cache inspector) → optionally rebuilt as plain dev-only routes; or dropped from v1

## What's preserved

- TypeScript everywhere on the frontend
- Vite's HMR experience (when running `doc-engine dev --vite`)
- Tree-shaking, code splitting, asset hashing
- The plugin ecosystem (PostCSS, Tailwind if we want it, Vue/Svelte/Preact plugins)

## The mental model

> **Vite produces the JS the browser needs. Go produces the HTML the browser needs. The binary is the union of both, served from one process. Vite never runs in production.**
