---
title: "Astro 6 upgrade — overview"
---

# Astro 6 upgrade — overview

Orientation page for the Astro 5 → 6 upgrade. Read this first, then drop into the breaking-changes and step-by-step notes.

## Current pin → target

Confirmed from `astro-doc-code/package.json`:

| Package | Current pin (`package.json:line`) | Target |
|---|---|---|
| `astro` | `^5.16.12` (`package.json:29`) | `6.4.5` |
| `@astrojs/mdx` | `^4.3.13` (`package.json:13`) | `6.0.3` (requires `astro ^6.4.0`) |
| `shiki` (direct dep) | `^3.22.0` (`package.json:35`) | Astro 6 bundles Shiki `4.x`; align direct dep — see `04_dependency-compat.md` |

The framework pins `astro` and `@astrojs/mdx` as direct dependencies; both jump one major. `shiki` is also a direct dependency here (`package.json:35`), independent of Astro's bundled copy — worth aligning during the upgrade. `marked@^17.0.1` and `gray-matter@^4.0.3` are direct deps **not** constrained by Astro, so they don't move as part of this jump.

## Size of the jump

**One major version: Astro 5 → Astro 6.** Internally that pulls in two more major bumps under the hood:

- **Vite 6 → 7** (`^6.4.1` → `^7.3.2`) — the dev server and production bundler.
- **Zod 3 → 4** and **Shiki 3 → 4** in Astro's own dependency tree.

So while it's "one major" from our pin's perspective, the blast radius spans the Vite SSR/module-runner layer, content-collection APIs, and several removed/renamed runtime APIs. Treat it as a real major, not a routine bump.

## Why upgrade

- **Node baseline shifts under us anyway.** Astro 6 requires **Node 20.19.1+ / 22.12+** and drops Node 18 entirely; staying on 5 just defers that.
- **Core SSR module-invalidation fix lands in Astro 6.3.4+** (PR #16757) — directly relevant to this codebase. The `astro:hmr-reload` plugin now returns SSR-only modules so Vite's `updateModules` propagates invalidation to the SSR module runner, instead of leaving stale cache. This may let us simplify or remove the dual-invalidation workaround in `astro-doc-code/src/dev-tools/integration.ts` (the local-cache + `server.moduleGraph.invalidateModule()` pattern). See `../01-astro-update-impact` for the impact analysis.
- **Experimental features we may want go stable** in 6: CSP (`experimental.csp` → `security.csp`) and the Fonts API (`experimental.fonts` → `fonts`).
- **Redesigned dev server** runs the actual production runtime via Vite's Environment API, reducing "works in dev, breaks in prod" drift.

## How these notes are organized

This `00-astro-update` group is the upgrade playbook. After this overview:

- **`02_breaking-changes.md`** — the full v5 → v6 breaking-change catalogue: Node floor, removed APIs (`Astro.glob()`, `astro:schema`, `<ViewTransitions />`), content-collection API changes, env-var inlining, script/style render order, image/markdown behavior shifts, and the Vite 7 / Zod 4 / Shiki 4 dependency bumps.
- **`03_upgrade-steps.md`** — the ordered, executable migration: Node check → `npx @astrojs/upgrade` → config/content/API fixes → build + dev verification.
- **`04_dependency-compat.md`** — per-dependency compatibility: `@astrojs/mdx` 4→6, Vite 6→7 SSR isolation, Shiki/Zod, and which of our direct deps are unconstrained.

The sibling **`../01-astro-update-impact`** group covers the *codebase-specific* fallout — the dev-tools integration, SSR module invalidation workarounds, middleware, and custom loaders measured against the v6 behavior changes. Start here for the "what changed in Astro"; go there for "what it means for our `src/`".
