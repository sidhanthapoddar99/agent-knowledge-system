---
title: "Three usage methods — CLI, from-source, Docker"
sidebar_label: "01 · Three methods"
---

# Three usage methods

Lifted and condensed from `2026-04-26-framework-as-cli-tool` — the three-method distribution model survives the runtime migration intact, just simplified because the binary is now the framework (no more "CLI wraps Astro+Bun").

## Method 1 — CLI tool (the ideal)

A small Go binary, installed via `curl … | sh`, that runs the docs site directly. Single-source-of-truth philosophy — the binary is the framework; no separate Bun/Astro stack to manage.

```bash
# Install
curl -sSf https://doc-engine.dev/install.sh | sh

# Use
cd my-docs-project
doc-engine init                 # scaffolds default-docs/
doc-engine serve                # production server
doc-engine dev                  # dev mode (file watcher + auto-reload)
doc-engine build                # static-site build → dist/ in cwd
doc-engine docs list            # tracker subcommand
```

**Properties:**
- One binary, ~25–35 MB
- No Node, no `node_modules/`, no Bun
- Subprocess-spawn-and-forward removed (the binary IS the framework now, not a launcher for one)
- Foreground process; Ctrl-C to stop
- Config via `doc-engine.toml` (replaces the `.env` convention)

**Cache layout:**
```
~/.cache/doc-engine/
├── frameworks/                 # if version-pinning supported in v1
│   ├── 0.5.0/                  # alternative binaries cached
│   └── 0.6.0/
└── content-cache/              # per-project derived caches
    └── <project-fingerprint>/
```

The `frameworks/` slot is optional — only relevant if we support `engine.version` pinning across coexisting binaries. v1 can ship without it (one binary version per machine).

## Method 2 — From source (framework dev)

Clone the framework repo, run `go run ./cmd/doc-engine` against your project. The contributor / framework-hacker path.

```bash
git clone https://github.com/<org>/doc-engine.git
cd doc-engine
go run ./cmd/doc-engine serve --project-root /path/to/my-docs
```

Or with frontend HMR:
```bash
go run ./cmd/doc-engine dev --vite --project-root /path/to/my-docs
# Spawns Vite dev server alongside Go process
```

**Properties:**
- Both content HMR and framework-code HMR work
- Edit Go source → `air` restarts binary; edit frontend → Vite HMR
- Required for: contributors, theme/layout customisers writing JS islands
- **Not required for** authoring docs, customising themes (CSS only), or writing layout overlays (HTML only)

## Method 3 — Docker

For production deploys, CI build jobs, and reproducible dev environments.

```bash
# One-shot build (CI)
docker run --rm -v $(pwd):/site doc-engine:latest build

# Long-running serve (production)
docker run -d -p 80:4321 -v $(pwd)/default-docs:/site/default-docs doc-engine:latest serve --host 0.0.0.0
```

The image is `FROM scratch` + the binary (~30 MB total). Trivially simple compared to today's Node-based image (~250 MB).

**Two roles:**
- **Role 1 — Container as runtime:** equivalent to Methods 1+2 inside a container. Mount `default-docs/`, run `serve` or `build`.
- **Role 2 — Production deploy:** two-stage build → static `dist/` → serve via nginx (or Caddy, or directly from `doc-engine serve --static`).

Detail in `02_docker-design.md`.

## Convergence

All three methods produce **identical behaviour**. The binary is the only differentiator — installed via curl (Method 1), built from source (Method 2), or run inside a container (Method 3). No method-specific code paths; no script-based abstraction layer.

This is the simplification vs the existing `2026-04-26-framework-as-cli-tool` design: in that issue, the CLI was a *launcher* that spawned `bun run dev`. Methods diverged in subtle ways. After the runtime migration, **all three methods run the same Go binary** — they only differ in how the user got the binary.

## Decision points

| Question | Recommendation | Rationale |
|---|---|---|
| Config file format | TOML (`doc-engine.toml`) | Stronger schema; matches Cargo/PyProject ergonomics; not invented |
| Auto-discover config | Yes — look for `doc-engine.toml` walking up from cwd | Matches Cargo / git / docker-compose UX |
| Env-var overrides | No — TOML is the only source | Reproducibility; CI uses different files via `--config` |
| Default port | 4321 (matches today's Astro default) | Continuity |
| Default mode | `dev` mode for `doc-engine` (no subcommand); `serve` for explicit production | Common case is dev; production explicit |
| Auto-update | `doc-engine upgrade` subcommand; not automatic | User control over framework version |

## What gets dropped from the original CLI-tool design

The `2026-04-26-framework-as-cli-tool` issue documented several pieces that become redundant after the runtime migration:

- **Bun bootstrapping** (the option to auto-install Bun on first run) — irrelevant; Go binary doesn't need Bun
- **Framework version cache as separate git checkouts** — irrelevant; binary IS the framework
- **`docs.conf` / `docs.yaml` as compose-style schema for spawning bun** — replaced by simpler `doc-engine.toml` for run config
- **The dual-cache strategy from `notes/03_dual-caching-strategy.md`** — content cache stays per-project; framework deps cache disappears (no deps to install)

What stays from that issue:

- The three-methods model (Method 1/2/3 — but simplified per above)
- The Docker design (`02_docker-design.md` here)
- The shell-wrapper absorption (now covered in `notes/claude-plugin-upgrade/02_subcommand-migration.md`)
