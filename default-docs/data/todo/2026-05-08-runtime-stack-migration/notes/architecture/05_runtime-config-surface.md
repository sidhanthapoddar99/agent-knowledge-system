---
title: "Runtime config surface — what stays user-editable"
sidebar_label: "05 · Runtime config"
---

# Runtime config surface — what stays user-editable

Companion to `brainstorm/04_discuss_stack-and-migration/02_architecture.md` — that note explains the principle ("binary owns engine, default-docs/ owns content + config + customisations"). This note enumerates the surface in detail with implementation specifics.

## Site-level config (`site.yaml`)

**Behaviour:** identical. Same keys, same `@key` aliases, same two-phase path resolution.

```yaml
# default-docs/config/site.yaml — unchanged from today
theme: "tokyo-night"
theme_paths: ["@themes"]

paths:
  default-docs: "@root/default-docs/data"

pages:
  - path: "/"
    type: home
    data: "@data/pages/home.yaml"
  - path: "/user-guide"
    type: docs
    data: "@data/user-guide"
```

**Implementation:**
```go
// internal/config/site.go
type SiteConfig struct {
    Theme       string             `yaml:"theme"`
    ThemePaths  []string           `yaml:"theme_paths"`
    Paths       map[string]string  `yaml:"paths"`
    Pages       []PageDef          `yaml:"pages"`
    // ... rest mirrors today's config.ts shape
}

func LoadSiteConfig(projectRoot string) (*SiteConfig, error) {
    // 1. Read default-docs/config/site.yaml
    // 2. Validate required fields (throw if `theme` missing — same rule as today)
    // 3. Resolve user aliases against @root (only @root allowed in paths: values)
    // 4. Watch the file; on change, reload + invalidate dependent caches
}
```

**Hot-reload:** file watcher → reload → SSE → browser refresh. ~10 ms total.

## Theme selection + custom themes

**Behaviour:** identical. Themes live in `default-docs/themes/<name>/`; `theme.yaml` declares variables + extends chain; CSS files are served raw to the browser.

```
default-docs/themes/tokyo-night/
  ├── theme.yaml         (extends: "@theme/default", variable overrides)
  ├── color.css
  ├── element.css
  └── markdown.css
```

**Implementation:**
```go
// internal/theme/loader.go
type Theme struct {
    Name      string
    Extends   string                  // resolved theme path or "" for standalone
    Variables map[string]string
    CSSFiles  []string                // absolute paths
}

func (s *Server) ServeThemeCSS(w http.ResponseWriter, r *http.Request) {
    // /themes/<name>/<file>.css → read from disk, set ETag from mtime, serve
    // No bundling. Browser gets the raw file.
}
```

**Hot-reload:** edit `color.css` → fsnotify event → SSE → browser hot-swaps the stylesheet (or full reload if structure changed). **Faster than today** (~5 ms vs ~200–500 ms because no Vite bundling step).

**Built-in default theme** (today's `src/styles/`) gets embedded into the binary via `embed.FS`. User themes always win when present; the built-in is a fallback / inheritance source (`extends: "@theme/default"`).

## Custom pages (`data/pages/*.yaml`)

**Behaviour:** identical. YAML files referenced from `site.yaml`'s `pages:` array; `type:` field selects the layout.

```yaml
# default-docs/data/pages/about.yaml
title: "About us"
hero:
  heading: "Hi"
  subheading: "We make docs."
features:
  - title: "Fast"
    body: "..."
```

**Implementation:** Go reads the YAML, dispatches to the layout matching `type:`, passes data to the template.

**Adding a new custom-page type** (e.g., `type: portfolio`) still requires a built-in template — same as today (Astro doesn't let users add layout types either without source edits). For runtime-extensible custom pages, that's the `2025-06-25-plugin-system` issue's territory.

## Layout overlay path

**Behaviour:** identical. User drops a layout into `default-docs/layouts/<type>/<style>/`; it overrides the built-in for that key.

```
default-docs/layouts/
└── docs/myfancy/
    ├── layout.html        ← Go template (today: Layout.astro)
    ├── style.css
    └── island.ts          ← optional; needs Vite to bundle
```

**Implementation:**
```go
// internal/layout/overlay.go
func ScanOverlays(projectRoot string) map[string]*template.Template {
    // Walk default-docs/layouts/<type>/<style>/
    // For each found layout.html, parse + register under key "<type>/<style>"
    // Returns map keyed by "docs/myfancy", "blog/default", etc.
}

func ResolveLayout(typeKey, styleKey string) *template.Template {
    // 1. Check user overlay registry first
    // 2. Fall back to built-in registry (compiled in via embed)
    // 3. Last fallback: built-in default style
}
```

**Hot-reload:** add/edit `layout.html` → reload registry → next request uses new template. CSS edits flow through the theme path (file-served + ETag).

**JS islands in user layouts:** require `doc-engine dev --vite` (Vite subprocess) to bundle. Not blocked by the migration; just an opt-in dev mode.

## Asset paths

**Behaviour:** identical. `default-docs/assets/` is served at `/assets/...` with mtime-based caching.

**Implementation:**
```go
// internal/server/assets.go — two asset roots
http.Handle("/assets/", projectAssets)            // user's default-docs/assets/
http.Handle("/_engine/", embeddedDistFS)          // Vite-built JS/CSS from embed.FS
```

Two distinct roots avoid confusion. User assets at `/assets/`. Framework JS/CSS at `/_engine/` (or similar prefix; bikeshed-naming).

## Markdown frontmatter + custom tags

**Behaviour:** identical schema; same custom tags (callouts, tabs, collapsible, columns, badge, etc.).

**Implementation:** goldmark with custom AST extensions per tag. The 10-or-so built-in tags ship with the binary. **User-defined custom tags would need a runtime extension mechanism** — out of scope for v1, deferrable to plugin-system issue.

## Issue tracker schema

**Behaviour:** identical. Folder-per-item under `data/todo/<date>-<slug>/`, root `settings.json` declares vocabulary, per-issue `settings.json` carries metadata, `issue.md` + `comments/` + `agent-log/` + `subtasks/` + `notes/`.

**Implementation:** Go port of `loaders/issues.ts` + `_lib.mjs`. Schema is the spec.

**Derived `updated`:** ports to Go using the eager-incremental design from `2026-05-08-update-date-time-optimization` from day one (no need to land lazy first).

## What requires a binary rebuild

| Change | Why rebuild | Comparable today |
|---|---|---|
| New layout type (e.g., `type: portfolio`) | Built-in template registry is compile-time | Same — Astro requires source edit |
| New custom markdown tag | Goldmark extension is compile-time | Same — Astro requires source edit |
| Markdown pipeline change | goldmark integration is in Go | Same |
| New content type (e.g., "products") | Routing + loader is in Go | Same |
| Theme contract changes (new required vars) | Validation is compile-time | Same |
| Vite frontend code change (new island, etc.) | dist/ is embedded | Same — Astro requires `astro build` |

**Net:** the user-editable surface is identical. The "must rebuild the framework" surface is identical. The migration doesn't reduce customisation — it reduces *runtime weight*.

## Summary table

| Surface | Editable at runtime? | How? |
|---|---|---|
| `site.yaml` | ✅ | Edit file, save, file watcher reloads |
| `navbar.yaml`, `footer.yaml` | ✅ | Same |
| `themes/<name>/theme.yaml` | ✅ | Same |
| `themes/<name>/*.css` | ✅ | Same; faster than today (no bundling) |
| `data/pages/*.yaml` | ✅ | Same |
| `data/docs/`, `data/blog/`, `data/issues/` | ✅ | Same |
| `assets/*` | ✅ | Same |
| `default-docs/layouts/<type>/<style>/layout.html` | ✅ (HTML/CSS) | Same; hot-reloaded |
| `default-docs/layouts/<type>/<style>/island.ts` | ⚠️ (JS) | Requires `doc-engine dev --vite` |
| Built-in layouts | ❌ | Rebuild binary |
| Custom markdown tags | ❌ | Rebuild binary |
| Routing logic | ❌ | Rebuild binary |
