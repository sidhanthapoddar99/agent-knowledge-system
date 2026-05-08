---
title: "Go runtime — module structure, libraries, contracts"
sidebar_label: "02 · Go runtime"
---

# Go runtime — what the binary actually does

This note describes the Go-side architecture: module layout, library choices, and the runtime contracts the binary owns.

## Proposed module layout

```
cmd/
└── doc-engine/
    └── main.go                 # entry; arg parsing; subcommand dispatch

internal/
├── config/                     # site.yaml / navbar.yaml / footer.yaml + alias resolution
│   ├── site.go
│   ├── alias.go                # @data / @docs / @blog / @issues / @root
│   └── paths.go                # two-phase init (frameworkRoot, projectRoot)
│
├── theme/                      # theme.yaml + CSS file resolution + inheritance
│   ├── loader.go
│   ├── inheritance.go
│   └── contract.go             # required_variables validation
│
├── layout/                     # built-in templates + user overlay scan
│   ├── registry.go
│   ├── overlay.go
│   └── render.go
│
├── content/                    # docs / blog / issues / pages loaders
│   ├── docs.go
│   ├── blog.go
│   ├── issues.go
│   ├── pages.go
│   └── frontmatter.go
│
├── tracker/                    # issue tracker — folder-per-item walk, settings.json
│   ├── load.go
│   ├── derived_dates.go        # the eager-incremental cache
│   ├── git.go                  # git2-go or gix-go for derived dates
│   └── vocab.go
│
├── markdown/                   # goldmark + chroma + custom tags
│   ├── pipeline.go
│   ├── tags/
│   │   ├── callout.go
│   │   ├── tabs.go
│   │   ├── collapsible.go
│   │   └── ...
│   └── highlighting.go
│
├── server/                     # HTTP routing, SSE, dev-mode hot-reload
│   ├── router.go
│   ├── sse.go
│   ├── assets.go               # serve embedded dist/ via embed.FS
│   └── handlers.go
│
├── watcher/                    # fsnotify wrapper, debounce, SSE bridge
│   └── watcher.go
│
├── editor/                     # if Phase 3a (in-binary editor); else absent in v1
│   ├── yjs.go                  # y-go integration
│   ├── presence.go
│   └── store.go
│
└── plugin/                     # subcommands for the 11 absorbed wrappers
    ├── docs_list.go
    ├── docs_show.go
    └── ...

frontend/                       # Vite project; built artifacts embedded into binary
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── islands/
    │   ├── issues-table.ts
    │   ├── editor.ts
    │   ├── sidebar.ts
    │   └── ...
    └── styles/
```

## Library choices

| Need | Pick | Why |
|---|---|---|
| HTTP router | `net/http` + `chi` | Stdlib + thin enhancement; no framework lock-in |
| YAML | `gopkg.in/yaml.v3` | De facto standard |
| Markdown | `goldmark` | Most extensible; CommonMark + GFM; matches our custom-tag preprocessor model |
| Syntax highlighting | `chroma` | Pure Go; supports all languages we use today |
| File watching | `fsnotify` | Stdlib-adjacent; cross-platform; battle-tested |
| Templates | `html/template` *or* `templ` | `html/template` is stdlib; `templ` adds compile-time checking with HMR. Lean toward `templ`. |
| Git derived-dates | `gix-go` *or* shell out to `git` | `gix-go` is pure Go; shelling to git is simpler. Start with shell, switch to gix if perf demands |
| Yjs (if in-binary editor) | `y-crdt-go` (y-go) | Less mature than yrs but available |
| Logging | `slog` (stdlib) | Standardised structured logging in Go 1.21+ |
| Subcommand parsing | `cobra` | Standard for Go CLIs |
| Compose-file parsing | `gopkg.in/yaml.v3` | Same YAML lib |
| Cross-compile + release | `goreleaser` | Standard tool, nothing else comes close |

## Runtime contracts

### Startup sequence

```
1. Parse argv → subcommand (serve | dev | build | docs ... | check ...)
2. Load doc-engine.toml (or default config)
3. Resolve framework root (binary location) + project root (cwd or --project-root)
4. Initialize paths: structural aliases (@docs, @blog, @issues, @custom) + user aliases from site.yaml
5. Load site.yaml + navbar.yaml + footer.yaml (validate, resolve aliases)
6. Resolve active theme (scan theme_paths for theme.yaml, inheritance chain, validate contract)
7. Scan layouts: built-in (embedded) + user overlay (default-docs/layouts/)
8. Initialize markdown pipeline (register custom-tag handlers)
9. Initialize content loaders (docs / blog / issues / pages)
10. Initialize tracker derived-updated cache (load from .cache/<branch>.json or full walk)
11. Start file watcher (config files, content dirs, theme dirs, layout dirs, .git/HEAD)
12. Start HTTP server (handlers + SSE channel + asset serving from embedded dist/)
13. Print "ready on http://host:port in Xms"
```

### Request flow (`GET /docs/something`)

```
1. Match path against page registry (built from site.yaml's pages: + content scans)
2. Resolve to (page-type, layout-key, content-source)
3. Load content (markdown → frontmatter + body) via content loader (mtime-cached)
4. Render markdown body to HTML via goldmark pipeline (mtime-cached)
5. Build sidebar / outline / pagination context (from content loader)
6. Render layout template with (frontmatter, body-html, sidebar, outline, theme vars)
7. Inject head meta + island script tags from manifest
8. Write HTML response
```

No SSR module graph. No build pipeline at request time. Just template render + HTML out.

### Watcher → SSE flow

```
1. fsnotify event on watched path
2. Classify: content / config / theme / layout / git-ref
3. Invalidate appropriate caches (one cache, one process — no isolation)
4. Determine impact set (which routes need re-render hint)
5. Push SSE event to all connected dev clients
6. Browser receives event → reloads page (full reload or HMR via Vite-built bundle)
```

In production (`serve`), there are no SSE connections; the watcher still runs but only mutates caches.

### Cache architecture

All caches are package-level `sync.Map` or `sync.RWMutex`-guarded `map`. Single instance per process. Cleared by watcher events. No SSR isolation, no `moduleGraph.invalidateModule` dance.

| Cache | Location | Invalidated by |
|---|---|---|
| Site config | `internal/config` | `site.yaml` change |
| Theme resolution | `internal/theme` | `theme.yaml` or theme CSS file change |
| Layout registry | `internal/layout` | layout file change (overlay) — built-ins are compile-time |
| Content (mtime-keyed) | `internal/content` | file mtime check on read |
| Issue tracker derived dates | `internal/tracker` | `.git/HEAD` change |
| Markdown render output | `internal/markdown` | content-cache invalidation cascade |

## Why this is simpler than the Astro version

- **No `loaders/cache-manager.ts`** equivalent needed. Each cache is local to its module; they don't need a shared manager because there's no module-graph isolation to fight.
- **No two-phase init choreography across plugin/SSR contexts.** One process, one start, one set of caches.
- **No `import.meta.glob`** for layout resolution. Built-in layouts are a compile-time map literal; user overlays are a runtime directory scan.
- **No `vite.fs.allow` + cwd handshake.** Go reads files from disk. The end.

## What we lose

- Hot-module replacement of Go code itself (use `air` for restart-on-save in framework dev)
- Astro's component-style template syntax (templ is close, html/template is plainer)
- `import.meta.glob` ergonomics for "find all of X" — replaced by explicit registries

These are framework-developer concerns, not user-facing. Net: simpler runtime, more reliable production behaviour, slightly chunkier framework dev experience.
