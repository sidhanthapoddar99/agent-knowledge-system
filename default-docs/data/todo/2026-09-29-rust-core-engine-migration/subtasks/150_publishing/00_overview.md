---
title: "Publishing — overview and rules for the group"
status: open
---

This group builds Phase 3: `agentks build`, which writes a fully static site using static site generation (SSG). Rust computes every page's data exactly as it does for the WebSocket; the static renderer `apps/agentks-ssg` renders that data with the shared UI package `apps/packages/agentks-ui` into finished HTML; only interactive parts (**islands**) ship JavaScript. The output is plain files for nginx, any static host or a CDN, with no Rust server. Phase 3 must finish before launch step 5, because agentks's own docs at agentks.neuralabs.org/docs are built with it.

# 01 To Do
- [ ] **Work the leaves in this order.**

| Leaf | Status | Delivers |
|---|---|---|
| [150/20 SSG renderer](./20_ssg-renderer.md) | open | `apps/agentks-ssg`: page data in, HTML out, islands marked |
| [150/10 agentks build](./10_agentks-build.md) | open | The command: check, install from the lock, data, render, assets, extras, atomic write |
| [150/30 Diagrams to SVG](./30_diagrams-to-svg.md) | open | Mermaid, Graphviz, Excalidraw, draw.io pre-rendered where possible |
| [150/40 Static search](./40_static-search.md) | open | Search on a published site ← [2026-04-19-site-wide-search](../../../2026-04-19-site-wide-search/issue.md) (static side) |
| [150/50 Dev-only content](./50_dev-only-content.md) | open | Sections, navbar items and drafts left out of a build ← [2025-06-25-dev-only-content](../../../2025-06-25-dev-only-content/issue.md) |
| [150/60 SEO, sitemap and feeds](./60_seo-sitemap-feeds.md) | open | Head metadata, `sitemap.xml`, `robots.txt`, RSS, raw markdown, `llms.txt`, `404.html` |
| [150/70 Dockerfile](./70_dockerfile.md) | open | The basic, user-owned Dockerfile for the template and docs |

Order: 20 → 10 → 30, 50, 60 in parallel → 40 → 70.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where the work happens.** The main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: the build step in `apps/agentks-engine/`, the renderer in `apps/agentks-ssg/`, shared components in `apps/packages/agentks-ui/`.

**Rules every leaf in this group follows**
- **SSG, not SSR.** Nothing is computed per request; no Rust server in production; no page loads its content as JSON.
- **One component tree.** The client and the static renderer render the same components from `agentks-ui`. Never write a layout twice. Rust never writes layout HTML.
- **Rules stay in Rust.** URLs, links, order, status, sidebars, outlines and visibility are computed by the engine and handed over as data.
- **Same URLs as the local tool.** Every page is `<path>/index.html`; every href is root-absolute with the base prefix ([020/30 links and URLs](../020_content-contract/30_links-and-urls.md)).
- **A known defect fails the build.** A broken link, unknown library element, missing embed or failed diagram stops the build with file and line.
- **Build needs Bun or Node.** The build finds `bun`, then `node`; it never downloads a runtime.
- **Libraries install strictly from `dep.lock`**, like `npm ci`; the build never resolves `dep.yaml` afresh.

**Read first**
- [Publishing: agentks build and SSG](../../notes/05_delivery/02_publishing-ssg.md) — the design.
- [Shared UI package](../../notes/03_frontend/01_shared-ui-package.md) — the three Phase 1 safeguards that make this phase possible.
- [Brainstorm: Phase 3 publishing](../../brainstorm/02_future-stages/07_phase-3-publishing.md).

**Depends on:** [080/00 UI and client](../080_ui-and-client/00_overview.md) (especially [080/10 UI framework decision](../080_ui-and-client/10_ui-framework-decision.md) and [080/20 shared UI package](../080_ui-and-client/20_shared-ui-package.md)), [100/00 layouts](../100_layouts/00_overview.md), [030/00 Rust engine](../030_rust-engine/00_overview.md), [120/00 libraries](../120_libraries/00_overview.md).
**Unblocks:** [195/00 hosting](../195_hosting/00_overview.md), [190/00 homepage](../190_homepage/00_overview.md) (shares the website build), [180/60 publishing docs](../180_documentation/60_publishing.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): publishing is SSG; published pages are not hydrated as a whole; only interactive parts carry JavaScript ([publishing](../../notes/05_delivery/02_publishing-ssg.md)).
- Decided (sidhantha, 2026-09-30): `agentks build` needs Bun or Node; the static renderer ships compressed inside the binary.
- Decided (sidhantha, 2026-09-30): no Docker image is published; a basic Dockerfile ships for users to change.
- Decided (sidhantha, 2026-09-30): the agentks docs are built with `agentks build`, so this phase finishes before the hosting step.

# 05 Notes & Analysis
## Watch out
- The notes disagree on the prefix flag: [publishing](../../notes/05_delivery/02_publishing-ssg.md) says `--base`, the [Rust CLI note](../../notes/02_engine/05_rust-cli.md) says `--base-path`. [150/10](./10_agentks-build.md) settles it.
