---
title: "Dev-only content: sections, navbar items and drafts left out of a build"
status: open
---

Some content should be visible while working and absent from the published site: a roadmap section, a tracker, a debug navbar item, a draft page. Under the migration, "hidden in production" means "left out of `agentks build`", Rust decides visibility, and the local client shows a badge on what will not be published. This leaf takes over the remaining work of [2025-06-25-dev-only-content](../../../2025-06-25-dev-only-content/issue.md): section-level and navbar-level exclusion, the existing per-page `draft: true`, and the dev-mode badges.

# 01 To Do
- [ ] **Config keys** (typed in [140/60](../140_versioning-and-migrations/60_settings-schema-versioning.md)):
    - [ ] `publish: false` on a section in `site.yaml → pages.<name>` — the whole section is left out of the build.
    - [ ] `publish: false` on a navbar item or dropdown child in `navbar.yaml` (and footer items), each independently.
    - [ ] `draft: true` frontmatter on a single page keeps its current meaning: shown locally, left out of the build.
- [ ] **Visibility in Rust.** One function decides, for a build, whether each page, section and navbar item is published. The page-data interface carries a `published: bool` for the local client. Links from a published page to an unpublished one are a build error naming both (a published site must not link into a hole).
- [ ] **Local badges.** The client shows a small "not published" mark on unpublished sidebar entries, navbar items and page headers, using theme status variables ([100/00 layouts](../100_layouts/00_overview.md) implements the mark).
- [ ] **Build.** [150/10 agentks build](./10_agentks-build.md) leaves unpublished pages out of HTML, sitemap, RSS, search index, `llms.txt` and raw markdown; unpublished navbar items are absent from every page's chrome.
- [ ] **The 1.0.0 migration**: if a 0.x project used any interim key for this (check this repository and the old issue), [140/30](../140_versioning-and-migrations/30_docs-migration-0x-to-1.md) converts it.
- [ ] **Docs.** The user-guide page for it in the new docs (the old issue's [subtask 01](../../../2025-06-25-dev-only-content/subtasks/01_update-docs-on-ship.md) lists what to document: section key, navbar key, the draft flag, the badges).
- [ ] **Tests.** A fixture with an unpublished section, a navbar item, a draft page and a published page linking to a draft (must fail); assert the built output.

## Guardrails
- Visibility is decided only in Rust; the frontend only shows the badge.
- No `NODE_ENV`-style mode switch: the local tool always shows everything; the build always leaves unpublished content out.

## Done when
- The fixture build contains no trace of unpublished content (grep the output for its titles and paths).
- The local client shows the badge on each unpublished item.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: visibility in `apps/agentks-engine/`, badges in `apps/packages/agentks-ui/`.

**Read first**
- The absorbed issue: [2025-06-25-dev-only-content](../../../2025-06-25-dev-only-content/issue.md), its [docs subtask](../../../2025-06-25-dev-only-content/subtasks/01_update-docs-on-ship.md) and its [migration comment](../../../2025-06-25-dev-only-content/comments/001_2026-09-29_engine-migration-impact.md).
- [Publishing](../../notes/05_delivery/02_publishing-ssg.md), section 07.
- Today's draft handling: [data.ts](../../../../../../agent-ks-engine/src/loaders/data.ts); today's placeholder doc: [dev mode](../../../../user-guide/10_configuration/06_dev-mode.md).

**Depends on:** [150/10 agentks build](./10_agentks-build.md), [030/80 page data](../030_rust-engine/80_page-data-interface.md).
**Unblocks:** [180/60 publishing docs](../180_documentation/60_publishing.md).

# 04 Decisions
- Decided (claude, 2026-09-30): the key is `publish: false` (for sections and navbar items) rather than the old issue's `hideInProd`, because "production" no longer names a mode; it names the output of `agentks build`. `draft: true` stays for single pages.
- Decided (claude, 2026-09-30): a published page linking to an unpublished one fails the build.

# 05 Notes & Analysis
## 01 What this leaf absorbed
- Everything open in [2025-06-25-dev-only-content](../../../2025-06-25-dev-only-content/issue.md): section hiding, navbar hiding (including nested items), the visual indicators, and the docs task. Once accepted, that issue can be marked superseded with a `→` line here.
