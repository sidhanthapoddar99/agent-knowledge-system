---
title: "Blog layouts: index and post"
status: open
---

`@blog/default` draws a blog section: an index of posts, newest first, and a post page. This leaf rebuilds both as pure components and takes over the open work of [2025-06-25-blog-testing-polish](../../../2025-06-25-blog-testing-polish/issue.md): its test checklist becomes this leaf's acceptance checks, and pagination is designed on the new engine. Sorting, dates, authors and tags are computed by Rust and arrive in the `blog-index` and `blog-post` payloads.

# 01 To Do
- [ ] **Components** in `agentks-ui/src/layouts/blog/default/`: `IndexLayout`, `IndexBody`, `PostCard`, `PostLayout`, `PostBody`.
- [ ] **Index** from `blog-index`: posts already sorted newest first, each with title, URL, formatted date, description, author, tags, image. Draft posts are left out of a published build and badged in the local client ([150/50](../150_publishing/50_dev-only-content.md)).
- [ ] **Pagination** (from the absorbed issue). Rust pages the index: `page`, `pageCount`, `prevUrl`, `nextUrl`, and a real URL per page (for example `/blog/page/2`) so pages are linkable and build statically. Page size from config (`postsPerPage`, default 10 as today). The component only draws the controls.
- [ ] **Tags and authors** (from the absorbed issue). Rust sends each post's tags and author, plus the tag list for the section. A tag filter is an island that matches values; tag pages as real URLs are a later option, not in this leaf.
- [ ] **Post page** from `blog-post`: title, date, author, tags, image, Rust's `body_html`, prev and next posts.
- [ ] **Acceptance checks** (the absorbed checklist, now tests on fixtures and on this repository's blog):
    - [ ] Index lists every post, newest first, with correct dates from the file name or the `date` frontmatter override.
    - [ ] Post pages render title, date, author, tags, image and body.
    - [ ] Date sorting holds across years and same-day posts (Rust's order).
    - [ ] Author and tag values display correctly, including posts without them.
    - [ ] Pagination: correct page counts, links, and the last page.
- [ ] **Parity** with today's blog on this repository's posts.

## Guardrails
- No sorting, date parsing or date formatting in the component.
- Flat files `YYYY-MM-DD-<slug>.md` stay the content format ([content format](../../notes/02_engine/01_content-format.md)).

## Done when
- The acceptance checks pass on fixtures with at least 25 posts across three years, with and without authors and tags.
- This repository's blog passes parity.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/packages/agentks-ui/src/layouts/blog/default/`.
- **Absorbed:** [2025-06-25-blog-testing-polish](../../../2025-06-25-blog-testing-polish/issue.md) — its open tasks: test index and post layouts, date sorting, authors and tags, pagination. Its parser fix is already done.
- **Read first:** [theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md), [the Rust engine](../../notes/02_engine/03_rust-engine.md) (section 05, `blog-index`), [content format](../../notes/02_engine/01_content-format.md) (blog rows).
- **Today's code:** [the blog layout](../../../../../../agent-ks-engine/src/layouts/blogs/default), docs: [blog layout internals](../../../../dev-docs/10_layouts/03_blog-layout), [blog user guide](../../../../user-guide/18_blogs/01_overview.md).
- **Depends on:** [10](./10_theme-contract-and-css.md), [15](./15_docs-layouts.md) (shared parts), [030/80](../030_rust-engine/80_page-data-interface.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): blog layouts become frontend components; sorting, authors and tags become Rust-computed values ([impact on other issues](../../brainstorm/01_initial-discussion/18_impact-on-other-issues.md)).
- Decided (claude, 2026-09-30): pagination uses real URLs computed by Rust, so it builds statically.

# 05 Notes & Analysis
## Watch out
- Today's blog layout loads its own posts inside the component (`loadContent`). The new component must receive them; any data it needs goes into the Rust payload.
