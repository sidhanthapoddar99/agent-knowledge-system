---
title: "Support model — what users install, dev vs author UX, Windows"
sidebar_label: "04 · Support"
---

# Support model — who needs what

A migration changes the install story. This note captures who needs what after the binary ships.

## Three personas

| Persona | What they do | What they need installed |
|---|---|---|
| **Docs author** | Writes Markdown, edits `site.yaml`, switches themes | Just the binary (~25 MB) |
| **Theme/layout customiser** | Drops custom CSS, writes overlay layouts (HTML templates) | Just the binary; for JS islands → also Node + Vite (only when adding a new interactive island) |
| **Framework developer** | Edits the Go runtime, the embedded Vite frontend, the markdown pipeline | Go toolchain, Node, Vite, the framework repo |

The killer split: **today even a docs-only author needs `bun install` (~150 MB of `node_modules`)**. After migration, they need a single 25 MB binary.

## Install paths after migration

| Channel | Command | Best for |
|---|---|---|
| `curl \| sh` installer | `curl -sSf https://doc-engine.dev/install.sh \| sh` | Linux/macOS individual machines |
| PowerShell installer | `iwr -useb https://doc-engine.dev/install.ps1 \| iex` | Windows |
| Homebrew tap | `brew install <tap>/doc-engine` | macOS / Linux brew users |
| Docker image | `docker run -v $(pwd):/site doc-engine:latest serve` | Production / CI |
| Direct download | GitHub releases page | Air-gapped / restricted environments |
| `go install` | `go install github.com/.../doc-engine@latest` | Go developers |

All channels deliver the same binary. `goreleaser` produces them in one CI run.

## Dev experience

### Author flow (no Node needed)

```
$ doc-engine init                    # scaffolds default-docs/ in cwd
$ doc-engine serve                   # production-mode server
$ doc-engine dev                     # development mode (file watcher + auto-reload)
```

`dev` and `serve` both use the embedded Vite bundle. The author never sees Vite. File watcher detects content changes → re-renders affected pages → SSE pushes a refresh signal to the browser → page reloads.

### Customiser flow (CSS + HTML, no Node needed)

Same as author. Edit `themes/<name>/*.css` or drop `default-docs/layouts/<type>/<style>/layout.html` overrides — Go's file watcher hot-reloads.

### Customiser flow (with JS islands — Node needed)

```
$ doc-engine dev --vite               # spawns Vite dev server as subprocess
[doc-engine] starting Go on :4321
[doc-engine] starting vite dev on :5173 (subprocess)
[doc-engine] proxying /@vite/* /assets/* → :5173 for HMR
```

The user needs Node + the framework repo's `frontend/` dir to add interactive islands. This matches what they'd need today.

### Framework dev flow

Same as today's `bun run dev` style. Edit Go, restart binary (or use `air` for live-reload of Go source). Edit Vite, see HMR.

## Windows support

`curl | sh` doesn't work on Windows. The PowerShell installer (`install.ps1`) takes over. Path-handling is different:

- Forward-slash vs backslash in paths — use Go's `filepath` not raw string concat
- Junction points instead of symlinks for theme dirs — Go's `os.Symlink` works on Windows 10+ with developer mode
- Default install location: `%LOCALAPPDATA%\Programs\doc-engine\` instead of `~/.local/bin/`
- File watcher: `fsnotify` works on Windows but with caveats around long paths and case-insensitive filesystems — test surface

**Working assumption:** Windows is first-class but on a 1-version delay. Linux + macOS ship from day one; Windows ships when the binary's been beat on for a couple weeks.

## What about today's existing projects?

Migration story for existing `default-docs/` trees:

1. Drop binary into project root
2. Run `doc-engine validate` — checks `default-docs/` structure against the new loader's expectations
3. Run `doc-engine compare-render` (one-shot) — renders 5 sample pages with both Astro and Go side-by-side, diffs the HTML, flags differences
4. If diffs are clean → swap. If diffs exist → triage; either fix the loader or accept the divergence with a migration note

The folder shape doesn't change. The contracts (`site.yaml` keys, theme-variable names, settings.json schema) don't change. The migration is a **runtime swap**, not a content rewrite.

## Telemetry / error reporting

Out of scope for v1. The binary should print structured errors to stderr (not crash). A future `doc-engine doctor` subcommand can produce a diagnostic bundle if users need to file bugs.

## Documentation pass

User-guide pages that need updating after migration:

- `05_getting-started/` — install changes from "clone + bun install" to "curl | sh"
- `10_configuration/` — `site.yaml` story stays but `.env` becomes `doc-engine.toml` (lifted from CLI-tool issue)
- `25_layouts/` — layout-overlay path stays but the file is `layout.html` (Go template) not `Layout.astro`
- `dev-docs/` — full rewrite of architecture pages; old Astro-specific content gets the cancelled treatment

These updates are part of phase 4–5 of the migration (see `03_migration.md`).
