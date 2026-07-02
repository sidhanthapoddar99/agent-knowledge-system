---
title: "Architecture overview — runtime / build / browser split"
sidebar_label: "01 · Overview"
---

# Go + Vite — architecture overview

The migration's defining structural choice is the three-layer split between **runtime, build, and browser**. Each layer has exactly one job; no layer crosses into another. This is what eliminates the SSR-isolation bug class and produces the single-binary distribution.

## The three layers

```
┌────────────────────────────────────────────────────────────────┐
│  RUNTIME (Go binary)                                           │
│  - HTTP server, file watcher, markdown pipeline                │
│  - Config + theme + layout loaders                             │
│  - Issue tracker loader, derived-updated cache                 │
│  - Renders HTML via html/template (or templ)                   │
│  - Serves embedded JS/CSS bundles to the browser               │
│  - Single process. Single module graph. No SSR isolation.      │
└────────────────────────────────────────────────────────────────┘
                                ▲
                                │  (compile-time embed of dist/)
                                │
┌───────────────────────────────┴────────────────────────────────┐
│  BUILD (Vite, developer's machine, once per release)           │
│  - Bundles frontend TS → hashed JS                             │
│  - Bundles CSS → hashed CSS                                    │
│  - Tree-shakes, splits per-route, hashes filenames             │
│  - Outputs dist/ with index.html, assets/*.js, assets/*.css    │
│  - Vite never runs in production. Just a build tool.           │
└────────────────────────────────────────────────────────────────┘
                                ▲
                                │  (HTTP request)
                                │
┌───────────────────────────────┴────────────────────────────────┐
│  BROWSER                                                       │
│  - Receives Go-rendered HTML                                   │
│  - Loads bundled JS islands lazily (per-route)                 │
│  - Hydrates interactive surfaces (filter bar, editor, etc.)    │
│  - All non-interactive surfaces are pure HTML+CSS              │
└────────────────────────────────────────────────────────────────┘
```

## What this lets us delete

- The whole `astro-doc-code/` tree (Astro + Vite SSR + integration plumbing)
- `node_modules/` for the runtime (~150 MB)
- `bun.lock` runtime dependency
- Astro dev-toolbar plumbing
- `import.meta.glob()` layout resolution (replaced by Go's compile-time map)
- Vite SSR module-graph reasoning entirely

## What this requires us to write

- Markdown pipeline (goldmark + custom extensions for our tags)
- Layout/theme loaders (port from `loaders/`)
- File watcher + SSE refresh channel
- Issue tracker loader (port from `loaders/issues.ts`)
- Derived-updated cache (port from `loaders/issue-dates.ts` — eager-incremental design from `2026-05-08-update-date-time-optimization`)
- HTTP routing (port from `pages/[...slug].astro`)
- Embed.FS asset serving with mtime/ETag caching
- Frontend island bundle (the JS surfaces — see `03_vite-frontend-and-dist.md`)

## What stays unchanged

- `default-docs/` folder shape
- `site.yaml` / `navbar.yaml` / `footer.yaml` schema
- Theme contract (`required_variables` in `theme.yaml`)
- Tracker schema (settings.json, frontmatter, agent-log/comments)
- The 11 plugin commands (renamed to subcommands; see `notes/claude-plugin-upgrade/`)
- Two-mode operation (consumer / dogfood), simplified — single binary either way
- `@root` alias semantics

## Why this is faster than today

| Operation | Today (Astro + Vite SSR) | Go + Vite |
|---|---|---|
| Cold-start dev server | 2–4 s | 50–100 ms |
| First-byte time on a page | 50–200 ms | 5–20 ms |
| Theme CSS hot-reload | 200–500 ms (Vite re-bundle) | 5 ms (Go serves file directly) |
| Markdown re-render on save | 150–400 ms | 30–80 ms |
| Issue tracker walk on commit | 11 ms (current scale) | <5 ms (same goldmark/git2 perf) |
| Memory footprint (idle) | 150–300 MB Node | 20–40 MB Go |

## Why this is more reliable than today

- **Single module graph** — the `brainstorm/04_discuss_stack-and-migration/05_issue.md` bug class is impossible.
- **No package-manager state** — no "did `bun install` run cleanly?" failure mode.
- **No Vite dev/prod divergence** — what you build is what you ship; no SSR adapter mismatches.
- **Predictable production runtime** — Go binary either runs or prints a structured error; no Node process management.

## Companion notes

- **`02_go-runtime.md`** — what Go owns; module structure; libraries chosen.
- **`03_vite-frontend-and-dist.md`** — what Vite produces and how it gets embedded.
- **`04_distribution-single-binary.md`** — cross-compile, install paths, sizes.
- **`05_runtime-config-surface.md`** — what stays user-editable.
