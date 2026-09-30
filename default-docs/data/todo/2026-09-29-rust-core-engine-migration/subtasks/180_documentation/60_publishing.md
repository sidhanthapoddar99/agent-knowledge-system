---
title: "Docs: publishing with agentks build"
status: open
---

Publishing turns a project into a static website: `agentks build` renders every page to HTML with the shared layouts, and the output can be served by any static host, a CDN or nginx in a container. This leaf documents it for users. agentks's own website is built the same way, so every step here is exercised by [195/00 hosting](../195_hosting/00_overview.md).

# 01 To Do
- [ ] **`55_publishing/01_overview.md`** — what a published site is (static HTML with small interactive islands, no server), what is left out (the dev toolbar, editing, draft and dev-only content).
- [ ] **`agentks build`** — every flag (`--out`, `--base`, `--site-url`, `--json`), that it needs Bun or Node at build time, the output folder layout, build caching.
- [ ] **Serving under a path** — `--base /docs`, and how links, assets and library elements stay inside the base.
- [ ] **Hosting options** — a static host, a CDN, GitHub Pages, and a container with nginx.
- [ ] **The Dockerfile** — a user-owned `Dockerfile` in the project, the example that installs a pinned agentks, builds and serves with nginx; cache headers for hashed assets and HTML.
- [ ] **SEO and feeds** — the sitemap, `robots.txt`, canonical URLs, RSS for blogs, raw markdown and `llms.txt` for AI readers.
- [ ] **Search on a static site** — how it works and what it indexes ([150/40](../150_publishing/40_static-search.md)).
- [ ] **Check before you publish** — `agentks check link-form`, and the build's own report.

## Guardrails
- Group rules in [180/00 overview](./00_overview.md).
- The Dockerfile example must be the one agentks's own website uses, or a trimmed copy checked against it, so it is known to work.

## Done when
- The section exists under `docs/data/user-guide/55_publishing/` and renders.
- Following only these pages, a reader builds a project under `/docs` and serves it with the example Dockerfile, and every link works (checked by the end-to-end flow 9 in [170/30](../170_testing/30_end-to-end.md)).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `docs/data/user-guide/55_publishing/`.
- **Read first:**
  - [Publishing (SSG)](../../notes/05_delivery/02_publishing-ssg.md) — `agentks build`, the output layout, islands, the Dockerfile.
  - [Deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md) — the website's own Dockerfile and nginx config.
  - [Phase 3 publishing](../../brainstorm/02_future-stages/07_phase-3-publishing.md).
  - Today's stub: [user-guide/30_deployment](../../../../user-guide/30_deployment).
- **Depends on:** the [150/00 publishing](../150_publishing/00_overview.md) group, [195/20 build and deploy pipeline](../195_hosting/20_build-and-deploy-pipeline.md) (the reference Dockerfile).
- **Unblocks:** [200/20 switch-over](../200_launch/20_switch-over.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): publishing is SSG, not SSR; pages use islands with no full-page hydration ([publishing](../../notes/05_delivery/02_publishing-ssg.md)).
- Decided (sidhantha, 2026-09-30): the Dockerfile is user-owned and lives in the project; agentks ships no Docker image.

# 05 Notes & Analysis

## Watch out
- Phase 3 lands after 1.0.0. If these pages are written before it ships, they state "since 1.x" with the real version.
