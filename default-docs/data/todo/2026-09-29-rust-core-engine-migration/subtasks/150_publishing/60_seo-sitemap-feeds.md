---
title: "SEO, sitemap, RSS, raw markdown and llms.txt"
status: open
---

A published site must be easy to find and easy for AI readers to consume. This leaf fills step 7 of the build: complete `<head>` metadata on every page, `sitemap.xml` and `robots.txt`, an RSS feed per blog section (moved to Phase 3 by the migration's impact review), each page's raw markdown beside its HTML, `llms.txt` (a plain list of pages with one line each for AI readers), and a `404.html`.

# 01 To Do
- [ ] **Head metadata** (data from Rust, rendered by the shell in [150/20](./20_ssg-renderer.md)): `<title>`, meta description (frontmatter `description`, else the first paragraph trimmed by Rust), canonical URL (`--site-url` + base + path), Open Graph (`og:title`, `og:description`, `og:url`, `og:type`, `og:image` from frontmatter `image` or the site logo), Twitter card, `<html lang>` from `site.yaml`.
- [ ] **`sitemap.xml`**: every published page with `<lastmod>` from the git-derived updated date ([030/60 tracker loader](../030_rust-engine/60_tracker-loader.md) and the docs equivalent). Skip with a warning when there is no site URL.
- [ ] **`robots.txt`**: allow all, point at the sitemap.
- [ ] **RSS** (Atom or RSS 2.0; pick one and record): one feed per blog section at `<blog base>/feed.xml`, newest 20 posts, full content or summary (pick and record), linked from the blog pages' head. Takes over the RSS item from [2026-04-10-new-layout-types](../../../2026-04-10-new-layout-types/issue.md) and the old plugin-system sample.
- [ ] **Raw markdown**: `<path>/index.md` beside each page, byte-identical to the source file, so its relative links stay what is true on disk.
- [ ] **`llms.txt`** at the site root: the site title, a one-line description, then one line per published page grouped by section: `- [Title](url): description`.
- [ ] **`404.html`**: rendered with the site chrome through the renderer.
- [ ] **Validation tests**: the sitemap parses and lists every page; every page has a canonical URL and description; the feed validates; `llms.txt` lists every published page exactly once.

## Guardrails
- Unpublished content ([150/50](./50_dev-only-content.md)) appears nowhere here.
- Metadata comes from Rust as data; the renderer does not compute descriptions.

## Done when
- The validation tests pass on this repository's docs.
- A feed reader subscribes to a fixture blog feed and shows the posts.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: extras in `apps/agentks-engine/` (build step 7), head rendering in `apps/agentks-ssg/`.

**Read first**
- [Publishing](../../notes/05_delivery/02_publishing-ssg.md), sections 04 and 07.
- [Impact on other issues](../../brainstorm/01_initial-discussion/18_impact-on-other-issues.md) — RSS belongs to Phase 3.
- [2026-04-10-new-layout-types](../../../2026-04-10-new-layout-types/issue.md) — the RSS item.

**Depends on:** [150/10 agentks build](./10_agentks-build.md), [150/20 SSG renderer](./20_ssg-renderer.md), [150/50 dev-only content](./50_dev-only-content.md).
**Unblocks:** [195/00 hosting](../195_hosting/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): search-engine friendliness is Phase 3's job ([publishing](../../notes/05_delivery/02_publishing-ssg.md)).
- Proposed (claude, 2026-09-30): raw markdown and `llms.txt` in the output (same note). Build as proposed.
- Decided (claude, 2026-09-30): the published `index.md` is the source file unchanged, because the project's rule is that relative links are what is true on disk.

# 05 Notes & Analysis
## Watch out
- The raw markdown's relative links resolve against `index.md`'s folder in the output, which is the page's own URL folder, not the source folder; relative links between sibling pages will not line up exactly. Test with a crawler and, if they break, say so in `llms.txt` guidance rather than rewriting the file.
