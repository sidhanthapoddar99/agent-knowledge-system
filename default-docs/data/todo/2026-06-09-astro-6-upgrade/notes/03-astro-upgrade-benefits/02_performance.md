---
title: "Benefit: performance, build & dev-server speed"
---

# Benefit: performance, build & dev-server speed

Performance case for the **Astro 5.16.12 → 6.4.5** upgrade, scoped to *this*
project's workload. See `01_overview.md` for the benefit summary and
`04_strategic.md` for the why-now framing.

> **Honesty up front.** The official Astro 6.0 and Vite 7.0 release notes are
> **deliberately light on hard performance numbers.** Most speed claims in both
> are *qualitative* ("faster", "smaller", "more memory-efficient") with no
> published benchmark. The single concrete number in the Astro 6.0 blog is the
> **experimental** queued-rendering "up to 2x faster rendering" figure. The
> bigger, quantified bundler wins (Rolldown's 10–30x) belong to **Vite 8 /
> Astro 7**, not this bump. This note flags every claim accordingly so we don't
> oversell the upgrade.

## This project's workload (why dev-server & build matter most)

`astro-doc-code/astro.config.mjs:92` runs **`output: 'server'` (SSR) in dev** and
**`output: 'static'` in prod**:

```js
output: isDev ? 'server' : 'static',  // server in dev, static for CDN builds
```

So the performance surfaces that actually move the needle here are:

| Surface | Why it dominates this project |
|---|---|
| **Dev-server cold start + HMR** | Heavy interactive dev use: live Yjs CRDT editor (`src/dev-tools/editor/`), five dev-toolbar apps, SSR rendering every page on each request. This is where contributors spend their time. |
| **Build time** | Prod is `static` — a full SSG render of all docs/blog/issues pages. Faster bundling = faster CI and local `./start build`. |
| **Memory** | SSR dev server holds module-graph + per-context caches (see `../01-astro-update-impact/03_loaders-ssr-and-cache.md`); lower memory headroom helps long dev sessions. |

## What Astro 6.0 actually delivers (sourced)

| Claim | Numeric? | Status | Source |
|---|---|---|---|
| Dev server redesigned on **Vite Environment API** — runs the real production runtime in dev | No | Qualitative. Framed as *correctness/parity* ("fewer works-in-dev-breaks-in-prod"), **not** a speed metric | [Astro 6.0 blog](https://astro.build/blog/astro-6/) |
| **Vite 7** as dev server + prod bundler across Astro and all `@astrojs/*` | No | Qualitative; perf impact not stated by Astro | [Astro 6.0 blog](https://astro.build/blog/astro-6/) |
| Experimental **Rust compiler** (successor to Go `.astro` compiler) — "results already impressive" | No | Experimental, qualitative only — no metric published | [Astro 6.0 blog](https://astro.build/blog/astro-6/) |
| Experimental **queued rendering** — "up to **2x faster** rendering", more memory-efficient; slated to become default in Astro 7 | **Yes (2x)** | Experimental flag `experimental.queuedRendering`; "early benchmarks" — treat as a ceiling, not a guarantee | [Astro 6.0 blog](https://astro.build/blog/astro-6/), [queued-rendering docs](https://docs.astro.build/en/reference/experimental-flags/queued-rendering/) |
| **Node 22** floor lets Astro drop old-Node polyfills → "smaller, more maintainable package and better performance across the board" | No | Asserted, unmeasured | [Astro 6.0 blog](https://astro.build/blog/astro-6/) |

## What Vite 7 brings (the bundled engine — sourced)

Vite is **transitive via Astro** (no manual pin — see `../00-astro-update/04_dependency-compat.md`). Bumping Astro to `^6.4.5` pulls Vite `^7.3.2`.

| Claim | Numeric? | Status | Source |
|---|---|---|---|
| **Rolldown** (Rust bundler) — "switching should **reduce your build time**, especially for larger projects" | No | Qualitative. **Opt-in / not default in Vite 7**; not wired into Astro 6 — the big numbers land with Vite 8 / Astro 7 | [Vite 7.0 blog](https://vite.dev/blog/announcing-vite7) |
| **Oxc** (Rust parser/transformer) underpins Rolldown | No | Architectural direction, not an Astro-6-era user-facing metric | [Vite 7.0 blog](https://vite.dev/blog/announcing-vite7) |
| Default build target → `'baseline-widely-available'` (Chrome 87→107, Safari 14→16, etc.) | Targets only | Smaller/more-modern output by emitting less legacy down-compilation — perf *implication*, not a benchmark | [Vite 7.0 blog](https://vite.dev/blog/announcing-vite7) |
| Node floor raised to **20.19+ / 22.12+** | Version | Enables modern runtime code paths; matches Astro 6's floor | [Vite 7.0 blog](https://vite.dev/blog/announcing-vite7) |

> ⚠️ **Unverified — confirm against the Astro 6 / Vite 7 release notes:** any
> figure for dev-server **cold-start**, **HMR latency**, or **memory** under
> Astro 6 + Vite 7 for this repo. Neither official source publishes these
> numbers. The only way to get real figures for *our* workload is to **measure
> before/after locally** (see below). Do **not** cite the Vite 8 "3× faster dev
> startup / 40% faster reloads / 10–30× builds" numbers for this upgrade —
> those are **Vite 8 / Astro 7**, a different bump.

## The honest bottom line for this bump

- **Real, shippable now:** Vite 7 engine + the redesigned dev server. Gains are
  **mostly correctness/parity and incremental**, not a step-change. The dev/prod
  unification (real prod runtime in dev) is the headline — valuable for our SSR
  dev mode, but sold as *reliability*, not raw speed.
- **Real but opt-in / experimental:** queued rendering (up to 2x render, flag-gated)
  and the Rust compiler. Worth piloting behind flags; **don't** assume them on by default.
- **Deferred to Astro 7 / Vite 8:** the headline 10–30x Rolldown build numbers.
  Astro 6 puts us on the **on-ramp** (already on Vite 7) so the Astro-7 jump to
  Vite 8 + Rolldown is incremental rather than a second major migration. That
  forward-positioning is itself a strategic benefit → see `04_strategic.md`.

## Measure it for *our* workload (don't trust generic numbers)

Because no source gives figures for an SSR-in-dev + Yjs + dev-toolbar app like
this, capture a local before/after on the upgrade branch:

| Metric | How |
|---|---|
| Dev cold start | Time `./start dev` from launch to "ready" line, 5.16.12 vs 6.4.5 |
| Build time | `time ./start build` (full static render), both versions, warm cache |
| HMR latency | Edit a docs `.md` and a layout `.astro`; eyeball reload-to-paint |
| Memory | Watch the system-metrics toolbar app (`src/dev-tools/system-metrics/`) over a long session |

Record results back into this issue's `agent-log/`. Any number that lands here
**must** come from that measurement, not from the release blogs.

## Cross-references

- Benefit overview → `01_overview.md`
- Strategic / why-now (Vite 8 on-ramp, ecosystem positioning) → `04_strategic.md`
- Vite 7 / SSR module-graph risk (the flip side of the dev-server redesign) →
  `../01-astro-update-impact/03_loaders-ssr-and-cache.md`
- Dependency floors (Node 22, Vite 7 transitive) →
  `../00-astro-update/04_dependency-compat.md`
- Full breaking-change list → `../00-astro-update/02_breaking-changes.md`

**Sources:** [Astro 6.0 blog](https://astro.build/blog/astro-6/) ·
[Astro queued-rendering docs](https://docs.astro.build/en/reference/experimental-flags/queued-rendering/) ·
[Vite 7.0 blog](https://vite.dev/blog/announcing-vite7) ·
[Upgrade to Astro v6](https://docs.astro.build/en/guides/upgrade-to/v6/)
