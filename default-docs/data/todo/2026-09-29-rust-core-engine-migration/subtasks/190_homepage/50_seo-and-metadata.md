---
title: "Homepage: SEO, social cards and metadata"
status: open
---

The homepage is how people find agentks from search engines, links shared in chat and AI assistants. This leaf gives it correct metadata: titles and descriptions, social preview cards, a sitemap and robots file that cover both `/` and `/docs`, structured data for a software product, and an `llms.txt` at the root that points AI readers at the docs.

# 01 To Do
- [ ] **Page metadata** with Next's `metadata` export: title, description, canonical URL `https://agentks.neuralabs.org/`, `lang`, theme colour for both modes.
- [ ] **Social cards** — Open Graph and Twitter card tags; a 1200×630 image generated at build time (static, not an image route) in the brand style.
- [ ] **Structured data** — a `SoftwareApplication` JSON-LD block: name, description, operating systems, licence, download URL (the GitHub release), the publisher Neuralabs.
- [ ] **Sitemap and robots** —
    - [ ] `robots.txt` at the root, allowing everything and naming the sitemap.
    - [ ] A sitemap index at `/sitemap.xml` listing the homepage's sitemap and the docs' sitemap (`/docs/sitemap.xml`, written by `agentks build` — [150/60](../150_publishing/60_seo-sitemap-feeds.md)).
- [ ] **`/llms.txt`** at the root: one paragraph on agentks and a link to `/docs/llms.txt`, which lists every docs page.
- [ ] **Favicons and the web manifest** from the shared brand assets ([40](./40_shared-look-with-docs.md)).

## Guardrails
- Metadata describes only what the released version does.
- The sitemap index is the only root file that lists docs URLs; the docs' own sitemap stays the docs build's job.

## Done when
- The exported `index.html` carries the title, description, canonical, Open Graph, Twitter and JSON-LD tags; a validator (for example `bunx structured-data-testing-tool` or Google's Rich Results test by hand) reports no errors.
- `/robots.txt`, `/sitemap.xml` and `/llms.txt` exist in the export and point at real URLs.
- Sharing the URL in a chat app shows the preview card (checked once the site is live).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `apps/agentks-homepage/`.
- **Read first:** [Deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md), sections 01 and 06 (routes, raw markdown and `llms.txt` for agents); [publishing](../../notes/05_delivery/02_publishing-ssg.md) (the docs build's SEO output).
- **Depends on:** [190/30 sections](./30_sections.md), [190/40 shared look](./40_shared-look-with-docs.md), [150/60 SEO, sitemap and feeds](../150_publishing/60_seo-sitemap-feeds.md).
- **Unblocks:** [195/30 docs at /docs](../195_hosting/30_docs-at-slash-docs.md).

# 04 Decisions
- Decided (claude, 2026-09-30): the root sitemap is an index over the homepage's and the docs' sitemaps, so each build owns its own list.

# 05 Notes & Analysis

## Watch out
- Next's static export writes metadata at build time only. Anything that would need a request (per-visitor data) cannot be used, which is fine here.
