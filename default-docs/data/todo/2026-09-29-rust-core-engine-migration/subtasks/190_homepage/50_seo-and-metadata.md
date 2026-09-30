---
title: "Homepage: SEO, social cards and metadata"
status: review
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
Review: everything buildable now is built. On 2026-10-01 the social card was redrawn (the headline plus three story lines), and the meta title is "agentks: a workspace for your AI agents". The live checks (a chat-app preview, Google's Rich Results test) wait for the site to be hosted.

## Result
- **Page metadata** in `apps/agentks-homepage/src/app/layout.tsx`: title, description, canonical `https://agentks.neuralabs.org/`, `lang="en"`, `og:locale` `en_GB`, and `theme-color` for light and dark read from the theme files. The words live in `meta` in `src/modules/home/content.ts`.
- **Social cards.** Open Graph and Twitter `summary_large_image` tags point at `/social-card.png`, a 1200×630 PNG drawn once at build time by `src/app/social-card.png/route.tsx` from `src/modules/home/social-card.tsx`: the hero headline, then a markdown file beside the page it becomes, in the brand fonts and light colours.
- **Structured data.** A `SoftwareApplication` JSON-LD block on `/` (`src/lib/seo.ts`): name, description, URL, category, operating systems, licence, `downloadUrl` (the latest GitHub release), a free offer, publisher Neuralabs.
- **Root files**, each a `force-static` route handler written as a file by `next build`: `/robots.txt` (allow all, names the sitemap), `/sitemap.xml` (an index over `/sitemap-home.xml` and `/docs/sitemap.xml`), `/sitemap-home.xml` (only `/`), `/llms.txt` (a summary, a paragraph, then links to `/docs/llms.txt`, `/docs/` and the two repositories).
- **Favicons and manifest.** `/favicon.svg` (the mark in ink, per OS mode), `/apple-icon.png` (180×180) and `/manifest.webmanifest`, all from the brand files ([40](./40_shared-look-with-docs.md)).
- **Checks.** `src/lib/seo.test.ts` (robots, sitemap index and home sitemap, llms.txt, JSON-LD). `bunx structured-data-testing-tool --file out/index.html --presets SocialMedia`: 16 passed, 0 failed, warnings only for `twitter:site` and `twitter:creator` (no X account is recorded, so none is named). `ctl gate` green.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `apps/agentks-homepage/`.
- **Read first:** [Deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md), sections 01 and 06 (routes, raw markdown and `llms.txt` for agents); [publishing](../../notes/05_delivery/02_publishing-ssg.md) (the docs build's SEO output).
- **Depends on:** [190/30 sections](./30_sections.md), [190/40 shared look](./40_shared-look-with-docs.md), [150/60 SEO, sitemap and feeds](../150_publishing/60_seo-sitemap-feeds.md).
- **Unblocks:** [195/30 docs at /docs](../195_hosting/30_docs-at-slash-docs.md).

# 04 Decisions
- Decided (claude, 2026-09-30): the root sitemap is an index over the homepage's and the docs' sitemaps, so each build owns its own list.
- Decided (claude, 2026-10-01): the homepage's own sitemap is `/sitemap-home.xml`, and it carries no `<lastmod>`, because the build has no trustworthy date for the page and a made-up one would mislead crawlers.
- Decided (claude, 2026-10-01): the root files are Next route handlers marked `force-static`, not files in `public/`, so every URL in them comes from `SITE_URL` in `src/lib/site.ts` and the tests can read them.
- Decided (claude, 2026-10-01): the card image and the touch icon are route handlers with a file extension (`/social-card.png`, `/apple-icon.png`), not Next's `opengraph-image` and `apple-icon` conventions, because the static export writes those conventions' files without an extension, and nginx would serve them with the wrong content type.
- Decided (claude, 2026-10-01): the root `/llms.txt` belongs to the homepage and `/docs/llms.txt` to the docs build, matching the route table's "every other path" row; the homepage's old test that forbade an `llms.txt` route is changed to match.
- Decided (claude, 2026-10-01): the card uses the static cuts of Source Serif 4 from `@fontsource/source-serif-4` (a new dev dependency), because the build-time image renderer reads neither WOFF2 nor variable fonts.

# 05 Notes & Analysis

## Watch out
- Next's static export writes metadata at build time only. Anything that would need a request (per-visitor data) cannot be used, which is fine here.
