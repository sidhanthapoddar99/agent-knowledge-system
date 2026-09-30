---
title: "Docs: publishing with agentks build"
status: review
---

Publishing turns a project into a static website: `agentks build` renders every page to HTML with the shared layouts, and the output can be served by any static host, a CDN or nginx in a container. This leaf documents it for users. agentks's own website is built the same way, so every step here is exercised by [195/00 hosting](../195_hosting/00_overview.md).

# 01 To Do
- [x] **`55_publishing/01_overview.md`** — what a published site is (static HTML with small interactive islands, no server), what is left out (the dev toolbar, editing, draft and dev-only content).
- [x] **`agentks build`** — every flag (`--out`, `--base`, `--site-url`, `--json`), that it needs Bun or Node at build time, the output folder layout, build caching.
- [x] **Serving under a path** — `--base /docs`, and how links, assets and library elements stay inside the base.
- [x] **Hosting options** — a static host, a CDN, GitHub Pages, and a container with nginx.
- [ ] **The Dockerfile** — a user-owned `Dockerfile` in the project, the example that installs a pinned agentks, builds and serves with nginx; cache headers for hashed assets and HTML.
- [x] **SEO and feeds** — the sitemap, `robots.txt`, canonical URLs, RSS for blogs, raw markdown and `llms.txt` for AI readers.
- [x] **Search on a static site** — how it works and what it indexes ([150/40](../150_publishing/40_static-search.md)).
- [x] **Check before you publish** — `agentks check link-form`, and the build's own report.

## Guardrails
- Group rules in [180/00 overview](./00_overview.md).
- The Dockerfile example must be the one agentks's own website uses, or a trimmed copy checked against it, so it is known to work.

## Done when
- The section exists under `docs/data/user-guide/55_publishing/` and renders.
- Following only these pages, a reader builds a project under `/docs` and serves it with the example Dockerfile, and every link works (checked by the end-to-end flow 9 in [170/30](../170_testing/30_end-to-end.md)).

# 02 Status and Result
Review. Seven pages written in `user-guide-2/55_publishing/` from the publishing and hosting notes, the 150 subtasks and the CLI and config worktrees; `agent-ks check section` and `check link-form` report 0 errors. The Dockerfile item stays open: no tested Dockerfile exists yet to check the example against (150/70, 195/20).

## Result
Pages written (about 4,170 words):

- [55/01 Publishing](../../../../user-guide-2/55_publishing/01_overview.md): what a published site is, the local app against the published site, the three steps, what the build needs, and a note that publishing ships in a 1.x release after 1.0.0 with a pointer to the upgrading guide for pinning.
- [55/05 Building the site](../../../../user-guide-2/55_publishing/05_building-the-site.md): prerequisites (Bun or Node, `dep.lock`, network on first build, the version gate, `agentks doctor`), the checks to run first, `agentks build` and every flag the CLI registers (`--out`, `--base`, `--site-url`, `--json`, `--config-dir`), why a build fails, the atomic output swap, exit codes, and a CI recipe with a pinned installer.
- [55/10 What the build writes](../../../../user-guide-2/55_publishing/10_what-the-build-writes.md): the output tree and its rules, head metadata, canonical URLs, sitemap, robots, 404, raw markdown and `llms.txt`, search, blog feeds, diagrams, and what never reaches the folder.
- [55/15 Serving under a path](../../../../user-guide-2/55_publishing/15_serving-under-a-path.md): `--base` and `site.yaml` `base_path` (as the config code reads it), what gets the prefix, placing the files, GitHub project sites, a local preview check.
- [55/20 Leaving content out](../../../../user-guide-2/55_publishing/20_leaving-content-out.md): `draft: true`, `publish: false` on sections, navbar items and footer links, what "left out" covers, the build error for links into unpublished pages, and that shared visitors still see everything.
- [55/25 Hosting](../../../../user-guide-2/55_publishing/25_hosting.md): what any host needs, cache headers, the `_lib/` sandbox header, static hosts and CDNs, GitHub Pages, nginx.
- [55/30 Docker](../../../../user-guide-2/55_publishing/30_docker.md): the template's `Dockerfile`, `nginx.conf` and `.dockerignore`, the Dockerfile's shape from the publishing note and 150/70, build and run commands, what the nginx config does, serving under `/docs`, HTTPS in front.

Video outputs (`_audio/`, standalone video pages) are left out while the video format is revised. Before the switch-over: replace the Dockerfile example with the tested one, name the publishing release in 55/01, and re-check against 150's build.

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
- Decided (claude, 2026-10-01): 55/01 opens with a note that publishing ships in a 1.x release after 1.0.0 and that a 1.0.0 binary cannot publish, without a version number, because the release is not known yet. The note is replaced by a "since 1.x" line when Phase 3 ships.
- Decided (claude, 2026-10-01): the Dockerfile example follows the publishing note section 09 plus 150/70's pinned `AGENTKS_VERSION`, framed as "your project's own Dockerfile is the one to use"; the nginx config is described as rules, not printed as a file, because no tested config exists yet.
- Decided (claude, 2026-10-01): `publish: false` is documented as 150/50 decides it, although today's config crate still warns on it as an unknown key; the build output layout follows the publishing note section 04, which 150/10 builds as proposed.
- Decided (claude, 2026-10-01): the user-guide publishing pages drop what the publishing note marks "proposed, not yet agreed": one folder with `index.html` per page, the `_assets/` and `_content/` names, fingerprinted names and year-long caching, the `index.md` sources and `llms.txt`, and the build failing when `dep.lock` disagrees with `dep.yaml`. The Docker page keeps its example as it stands, because it already says it is untested. This matches the developer publishing pages.
- Decided (claude, 2026-10-01): the publishing overview says a project that must publish before Phase 3 stays on the last 0.x release, pinned with mise, because that is the note's decision.

# 05 Notes & Analysis

## Watch out
- Phase 3 lands after 1.0.0. If these pages are written before it ships, they state "since 1.x" with the real version.
