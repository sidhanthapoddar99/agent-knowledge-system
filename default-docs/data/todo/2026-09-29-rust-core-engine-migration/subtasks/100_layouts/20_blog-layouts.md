---
title: "Blog layouts: index and post"
status: in-progress
---

`@blog/default` draws a blog section: an index of posts, newest first, and a post page. This leaf rebuilds both as pure components and takes over the open work of [2025-06-25-blog-testing-polish](../../../2025-06-25-blog-testing-polish/issue.md): its test checklist becomes this leaf's acceptance checks, and pagination is designed on the new engine. Sorting, dates, authors and tags are computed by Rust and arrive in the `blog-index` and `blog-post` payloads.

# 01 To Do
- [x] **Components** in `agentks-ui/src/layouts/blog/default/`: `IndexLayout`, `IndexBody`, `PostCard`, `PostLayout`, `PostBody`. (Built as `IndexLayout.tsx`, `PostCard.tsx` with `PostGrid` in the place of `IndexBody`, `PostLayout.tsx` with its body part inside, and `parts.tsx`.)
- [x] **Index** from `blog-index`: posts already sorted newest first, each with title, URL, formatted date, description, author, tags, image. Draft posts are left out of a published build and badged in the local client ([150/50](../150_publishing/50_dev-only-content.md)).
- [ ] **Pagination** (from the absorbed issue). Rust pages the index: `page`, `pageCount`, `prevUrl`, `nextUrl`, and a real URL per page (for example `/blog/page/2`) so pages are linkable and build statically. Page size from config (`postsPerPage`, default 10 as today). The component only draws the controls.
- [x] **Tags and authors** (from the absorbed issue). Rust sends each post's tags and author, plus the tag list for the section. A tag filter is an island that matches values; tag pages as real URLs are a later option, not in this leaf.
- [x] **Post page** from `blog-post`: title, date, author, tags, image, Rust's `body_html`, prev and next posts.
- [ ] **Acceptance checks** (the absorbed checklist, now tests on fixtures and on this repository's blog):
    - [x] Index lists every post, newest first, with correct dates from the file name or the `date` frontmatter override.
    - [x] Post pages render title, date, author, tags, image and body.
    - [x] Date sorting holds across years and same-day posts (Rust's order).
    - [x] Author and tag values display correctly, including posts without them.
    - [ ] Pagination: correct page counts, links, and the last page.
- [ ] **Parity** with today's blog on this repository's posts.

## Guardrails
- No sorting, date parsing or date formatting in the component.
- Flat files `YYYY-MM-DD-<slug>.md` stay the content format ([content format](../../notes/02_engine/01_content-format.md)).

## Done when
- The acceptance checks pass on fixtures with at least 25 posts across three years, with and without authors and tags.
- This repository's blog passes parity.

# 02 Status and Result
In progress: the index, the post page, the tag filter and the acceptance tests are built and green. Left: pagination (the `blog-index` payload has no page fields yet) and parity with this repository's own blog.

## Result
- **Code** (main repository, branch `wave3/layout-pages`): `apps/packages/agentks-ui/src/layouts/blog/default/` (`IndexLayout.tsx`, `PostCard.tsx`, `PostLayout.tsx`, `parts.tsx`, `blog.css`), the tag filter island `src/islands/blog-tag-filter/TagFilter.tsx`, registry entries `@blog/default` in `PAGE_LAYOUTS` (the post) and `BLOG_INDEX_LAYOUTS` (the index), hooks in `src/hooks.json`.
- **Client:** `apps/agentks-client/src/app/controller.ts` draws `blog-index` routes (layout from the blog section in the manifest); the mock engine serves the 27-post blog and a page per post (`dev/mock-pages.ts`).
- **Tests:** `tests/pages.test.tsx` (order kept across three years and same-day posts, dates as sent, authors, tags, drafts, empty blog, post page), `tests/live.test.tsx` (the tag filter), on `tests/payloads/blog-index-many.json` (27 posts, 2024 to 2026). The package's 35 tests run in 0.3 s; `ctl gate` green.
- **Screenshots:** `/tmp/lp-shots/default-blog-{light,dark}.png`, `default-post-{light,dark}.png`, `minimal-post-{light,dark}.png`.

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
- Decided (claude, 2026-10-01): the date shows as Rust sends it (`2026-09-30`), in a `<time datetime>`, because the layout must not parse or format dates and the payload has no display form yet. Today's "Sep 30, 2026" comes back when Rust sends a formatted date.
- Decided (claude, 2026-10-01): the index draws every post Rust sends. Today's index silently cut the list at 10 with no page controls; that dropped posts.
- Decided (claude, 2026-10-01): the tag filter is an island over the whole grid (buttons with `aria-pressed`, in a `fieldset`); it matches tag values only, because Rust sends the values and counts.
- Decided (claude, 2026-10-01): the post's "Back to" link is the nearest breadcrumb with a URL, because the post page gets no section URL. No breadcrumb, no link. Rust sends the blog index as the post's breadcrumb.
- Decided (claude, 2026-10-01): a post's previous and next reuse the docs `Pagination` part, one piece of code for both.
- Decided (claude, 2026-10-01): cover images carry `alt=""`, because the title sits beside them; the card keeps today's first two tags.

# 05 Notes & Analysis
## Watch out
- Today's blog layout loads its own posts inside the component (`loadContent`). The new component must receive them; any data it needs goes into the Rust payload.
