---
title: "Performance comparison — current prod/dev vs Go+Vite prod/dev"
sidebar_label: "06 · Performance"
---

# Performance comparison — current vs proposed

A four-way comparison: today's Astro **dev** mode, today's Astro **prod** (static build), proposed Go+Vite **dev** mode, proposed Go+Vite **prod** mode. Numbers are estimates based on benchmarks of comparable Go+Vite stacks (Hugo + Vite islands as a reference point) and measured Astro behaviour on this repo.

## The asymmetry that makes this comparison interesting

Today, **we run the framework in dev mode even in production-like contexts**. Why:

- The live editor needs hot-reload + SSE
- The issue tracker needs file watcher → cache invalidation
- Theme switching is dynamic
- The dev toolbar (system metrics, cache inspector, layout selector) is part of the framework's value

Astro's prod mode (`astro build` + static serve) loses all of this. So "current prod" is **a degraded version** that few users actually run in production. The realistic comparison is `Astro dev → Go+Vite prod` — and Go+Vite prod is *not* a degraded experience. **It's the full feature set, with prod-grade performance.**

This is the deepest win: today, "fast prod" and "full features" are mutually exclusive. After migration, they're the same thing.

## TL;DR — headline numbers

| Metric | Astro dev (today's reality) | Astro prod static (rarely used) | Go+Vite dev (proposed) | Go+Vite prod (proposed) |
|---|---|---|---|---|
| Cold start | 2 000–4 000 ms | n/a (just nginx) | 80–120 ms | 50–100 ms |
| First-byte time (cached) | 50–200 ms | 5–15 ms | 8–20 ms | 5–15 ms |
| First-byte time (cold render) | 200–600 ms | n/a | 30–80 ms | 30–80 ms |
| Theme CSS hot-reload | 200–500 ms | n/a | 5–10 ms | n/a (no hot-reload in prod) |
| Markdown re-render on save | 150–400 ms | n/a | 30–80 ms | n/a |
| Issue-tracker walk on commit | ~11 ms (12 commits) → ~500 ms (3 K) | n/a | <5 ms eager-incremental | <5 ms eager-incremental |
| Memory (idle) | 150–300 MB | ~5 MB nginx | 20–40 MB | 15–30 MB |
| Memory (under load) | 250–500 MB | ~10 MB | 40–60 MB | 30–50 MB |
| Throughput (req/s on `M2 Pro`) | 80–200 | 5 000+ | 800–1 500 | 3 000–5 000 |
| Disk footprint (binary + deps) | ~250 MB (`node_modules/`) | ~250 MB (build cache) | ~30 MB (binary) | ~30 MB (binary) |
| Restart penalty (Ctrl-C → ready) | 2–4 s | n/a | 80–120 ms | n/a (rare) |

## Cold start

The cost of going from "process not running" to "first request servable."

```
Astro dev (today)
├── node startup            ~50 ms
├── Vite dev server boot    ~600–1500 ms
├── Astro integration init  ~400–1000 ms
├── First config + theme load ~200–500 ms
└── First render compile    ~300–800 ms (lazy; per-route)
                            ─────────────
                            2000–4000 ms total before useful

Go+Vite prod
├── Go binary launch        ~10 ms
├── Read site.yaml + theme  ~5–15 ms
├── Index content folder    ~20–60 ms (mtime walk)
├── Load tracker cache      ~5–10 ms (from disk)
└── HTTP listen             ~5 ms
                            ──────────────
                            50–100 ms total before useful
```

**~30–80× cold-start improvement.** Matters most in CI (each test run pays cold start), in containers (container start = cold start), and after every save during framework development.

## First-byte time per request

The cost of one HTTP request reaching first byte of HTML.

```
Astro dev (today, on a previously-rendered route, warm)
├── Vite SSR module graph traversal  ~10–30 ms
├── Layout render                    ~20–80 ms
├── Markdown re-render (if uncached) ~50–150 ms
└── Asset URL rewriting              ~5–20 ms
                                     ─────────────
                                     50–200 ms typical

Go+Vite prod (warm cache)
├── Route match + layout resolution  ~0.2 ms
├── Content lookup (mtime cache hit) ~0.1 ms
├── Template render                  ~3–10 ms
└── Manifest lookup for islands      ~0.1 ms
                                     ─────────────
                                     5–15 ms typical
```

**~10× faster per-request.** This is what makes the dev experience feel snappy — a 5 ms response is indistinguishable from instant; a 100 ms response is *perceptibly* laggy when navigating quickly.

## Hot-reload latency (the dev-experience number)

| Edit | Astro dev | Go+Vite dev |
|---|---|---|
| Markdown content | 150–400 ms | 30–80 ms |
| `site.yaml` | 1 000–2 500 ms (full Vite restart needed for some changes) | 50–100 ms |
| Theme `theme.yaml` | 500–1 500 ms | 30–80 ms |
| Theme CSS (`color.css`) | 200–500 ms (Vite re-bundle) | **5–10 ms** (file served raw) |
| Layout `.astro` / `layout.html` | 300–800 ms | 50–100 ms |
| Island `.ts` / island.ts (with Vite subprocess) | 100–250 ms | 100–250 ms (Vite owns this) |

The theme-CSS number is the most felt difference. Today, every CSS save makes the page flash white for half a second while Vite re-bundles. With Go: the file is served as-is with mtime ETag. The browser hot-swaps the stylesheet in ~5 ms.

## Markdown rendering

| Operation | Astro (unified/remark/rehype) | Go (goldmark + chroma) |
|---|---|---|
| Single 5 KB doc | 50–150 ms | 5–15 ms |
| Single 50 KB doc | 200–600 ms | 30–80 ms |
| Full corpus rebuild (327 pages this repo) | 8–15 s | 1.5–3 s |
| Custom-tag transform | ~10 ms / page | ~2 ms / page |
| Code-block syntax highlight | 5–20 ms / block | 1–3 ms / block (chroma is fast) |

goldmark + chroma are both Go-native, well-tuned. Total full-build time drops from `~10 s` today to `~2 s` proposed. Build pipelines feel different at that timescale.

## Issue tracker derived-updated cache

The cache that started this whole migration thread. Already designed for eager-incremental refresh in `2026-05-08-update-date-time-optimization`.

| Scenario | Astro (today, lazy + full walk on miss) | Go (eager incremental, branch-keyed persistent) |
|---|---|---|
| Server start (first request) | 11 ms (12 commits) → 500 ms (3 K commits) | <5 ms (load JSON + diff walk) |
| Commit lands (next request) | 11 ms → 500 ms (next reader pays full walk) | <5 ms (watcher already updated cache) |
| Branch switch to known branch | 11 ms → 500 ms (full rebuild) | <5 ms (load that branch's cache file) |
| Branch switch to new branch | 11 ms → 500 ms | 11 ms → 500 ms (one-time, then persisted) |

Today's blocking-on-request-path total at projected scale: **~24 s/day**. After: **~0 s/day**. The eager-incremental design lands in Go from day one — no need to ship lazy first.

## SSR module isolation cost

Today's dual-invalidation pattern (`server.ssrLoadModule` + `moduleGraph.invalidateModule`) adds:

- ~5–15 ms per watcher event (re-resolving + re-instantiating modules)
- Risk of incorrect state when invalidation paths drift (the bug we couldn't fully fix)
- Cognitive cost (every module-level cache needs to remember to apply the pattern)

In Go: 0 ms. Bug class doesn't exist. Pattern doesn't need to be remembered.

## Memory footprint

| State | Astro dev | Go+Vite prod |
|---|---|---|
| Idle (just started, no requests) | 150–300 MB | 15–30 MB |
| 100 req/s sustained | 250–500 MB | 30–50 MB |
| 1 000 req/s sustained | 600 MB+ (often becomes the bottleneck) | 80–120 MB |
| Peak (handling editor session + render burst) | 800 MB–1.5 GB (Node GC behaviour is unpredictable) | 100–150 MB (Go GC + small heap) |

The memory difference compounds in containerised deploys. A 4 GB VM today fits ~3–5 framework instances; with Go, it fits ~50–100. Affects container cost and density directly.

## Throughput (concurrent request handling)

Synthetic benchmark, M2 Pro, simple cached page render:

| Stack | req/s |
|---|---|
| Astro dev | 80–200 |
| Astro prod (static via nginx) | 5 000+ |
| Go+Vite dev | 800–1 500 |
| Go+Vite prod | 3 000–5 000 |

Astro static via nginx beats Go+Vite prod for *pure static serving* — that's expected (nginx is heavily optimised for this exact case). But Astro static loses everything dynamic (editor, tracker live updates, theme switching). Go+Vite prod retains all dynamic surfaces while still hitting 3 000–5 000 req/s, which is plenty for any docs site short of "hosting half the internet."

For typical docs traffic (≤100 req/s sustained), all options except Astro dev are fine. Astro dev becomes the bottleneck under any meaningful load — which is why nobody runs it as their production server even though doing so would preserve the dynamic features.

## Restart penalty

| Scenario | Astro dev | Go+Vite dev | Go+Vite prod |
|---|---|---|---|
| Save a Go file (framework dev) | n/a | 80–120 ms (`air` rebuild + restart) | n/a |
| Save a `.astro` / `layout.html` | 300–800 ms (HMR) | 50–100 ms (registry reload) | n/a |
| Save `site.yaml` | 1 000–2 500 ms (sometimes needs restart) | 50–100 ms (config reload) | n/a |
| Hard restart (Ctrl-C → run) | 2 000–4 000 ms | 80–120 ms | 50–100 ms |
| Container restart | 5–15 s (image pull + node + bun + framework boot) | 80–120 ms (binary launch only) | 50–100 ms |

Container restart is the most consequential — kubernetes / Fly / Railway-style platforms restart containers all the time. Today's framework loses 5–15 s per restart. Go: under 100 ms. Means readiness probes can be aggressive without sacrificing user experience.

## Build / release time

For framework releases — `vite build` + `go build`:

| Stage | Time |
|---|---|
| `vite build` (frontend bundles) | 8–15 s |
| `go build` per platform | 3–6 s |
| Full cross-compile matrix (5 platforms) | ~30 s with parallelism |
| Docker image build (`FROM scratch` + binary) | 10–20 s |
| Goreleaser full release (build + checksums + GH release + Homebrew tap update) | 1–2 min |

Compare to today's release process for `astro-doc-code/` + plugin (no actual release process exists yet — but a hypothetical "package the framework" pipeline today would involve `bun install` + `astro build` + tarball, taking ~3–5 min).

Faster release cycle → more frequent releases → tighter feedback loop.

## Disk footprint

| What | Today | Proposed |
|---|---|---|
| Framework code on disk | `astro-doc-code/` ~3 MB + `node_modules/` ~150 MB + Vite cache ~50 MB | Single binary ~30 MB |
| User project additional cost | `node_modules/.vite/` per project ~100 MB | nothing — binary is shared |
| 10 user projects on one machine | `~1 GB` of duplicated `node_modules/.vite/` | `30 MB` of binary |

The user-side savings compound if a single machine runs multiple docs projects (engineers often do).

## Where Go+Vite is **not** faster

Honest accounting:

- **First framework-dev compile of Go**: ~5–10 s the first time (`go build` from clean cache). Subsequent builds with `-i` / module cache: ~1–3 s. Astro had no equivalent because it compiled lazily on demand.
- **First Vite build after pulling deps**: ~30–60 s. One-time per branch. Not relevant to end users; only framework devs feel this.
- **Large markdown file with deeply nested AST transforms**: goldmark is fast but if you have a 500 KB markdown file with heavy custom-tag use, it's still seconds. Same surface as Astro, marginally faster.
- **Pure static HTML serving**: Astro prod static via nginx beats Go+Vite prod (~5 000 vs ~3 000 req/s). But this comparison is unfair — Astro static has no dynamic features.

## The compounding effect

Individual numbers don't tell the story. The compounding effect across a dev session:

```
Framework-dev session, 4 hours, lots of iteration

Today (Astro dev):
  Cold starts                      ~6 × 3 s     = 18 s
  Restarts after config edits      ~10 × 2 s    = 20 s
  Hot-reload waits (theme CSS)     ~30 × 0.4 s  = 12 s
  Hot-reload waits (markdown)      ~80 × 0.25 s = 20 s
  SSR-isolation surprise restarts  ~3 × 3 s     = 9 s
                                                 ──────
                                                 ~80 s of pure waiting

Go+Vite dev:
  Cold starts                      ~6 × 0.1 s   = 0.6 s
  Restarts after config edits      ~10 × 0.1 s  = 1 s
  Hot-reload waits (theme CSS)     ~30 × 0.01 s = 0.3 s
  Hot-reload waits (markdown)      ~80 × 0.05 s = 4 s
  SSR-isolation surprises          0
                                                 ──────
                                                 ~6 s of pure waiting
```

**~74 s saved per 4-hour session**, plus the qualitative win of staying in flow (no 3 s pauses that break concentration). Across an engineer's career on this codebase, this is hours.

## End-user perception

| Action | Today | Proposed | Felt as |
|---|---|---|---|
| Open docs page | 200–600 ms | 5–15 ms | Snappy → instant |
| Switch theme | 1–2 s (Vite re-bundles) | <50 ms | Laggy → instant |
| Filter issues table | 100–250 ms | 100–250 ms (client-side, same) | Same |
| Refresh after commit | Stale 1–60 s (SSR isolation) | Fresh ≤500 ms | Confusing → reliable |
| First page on cold dev server | 4 s blank → first paint | 100 ms blank → first paint | Slow boot → instant |

The "fresh after commit" is the qualitative win. Today users see stale data and don't trust the cache. After: data is always fresh.

## Caveats

- All numbers are estimates. Real benchmarks happen during phase 1 of the migration (see `brainstorm/04_discuss_stack-and-migration/03_migration.md`) on a representative content corpus.
- Astro 5 may improve some numbers (better Vite SSR caching, for example). Doesn't change the structural issues (module isolation, dev-mode-only feature surface).
- Go+Vite numbers depend on library choices (`templ` vs `html/template`, `gix-go` vs shell-out, etc.). Phase 1 spike will tighten ranges.
- Editor performance (CodeMirror + Yjs) is unaffected by the runtime swap — it's all client-side. Server-side Yjs (yrs vs y-go) may show small differences but neither is a bottleneck.

## Companion reading

- `01_overview.md` — the architectural shape these numbers fall out of.
- `02_go-runtime.md` — what Go owns; library choices that drive the numbers.
- `brainstorm/04_discuss_stack-and-migration/03_migration.md` — phase-by-phase plan; phase 1 includes the benchmark spike.
- `brainstorm/04_discuss_stack-and-migration/05_issue.md` — the SSR-isolation incident that quantifies the "stale data" pain.
