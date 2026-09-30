---
title: "Search on a published site"
status: open
---

A published agentks site has no server, so search must run in the reader's browser from files written at build time. This leaf takes over the static side of [2026-04-19-site-wide-search](../../../2026-04-19-site-wide-search/issue.md): a build-time index, a search island that loads it only when search opens, the scope rules and the keyboard-first UI from that issue, and graceful limits (no regex on a static site). The local, live search is the Rust retrieval index ([030/95](../030_rust-engine/95_retrieval-index.md)); the island talks to either backend through one adapter interface, so the UI is written once.

# 01 To Do
- [ ] **Decide the static engine** at the start and record it (see Questions). Options: Pagefind (a build-time indexer over the final HTML, sharded, lazy-loaded, filters built in), a WASM build of the Rust index, or a compact JSON index with a small JS search library.
- [ ] **Index at build time** (step 7 of [150/10](./10_agentks-build.md)): titles, headings, bodies and frontmatter of docs, blog, issues, subtasks and notes; facets for section, type, status, priority, labels.
- [ ] **One search island** (the UI is built once, in `agentks-ui`, with [080/50 islands](../080_ui-and-client/50_islands.md)):
    - [ ] Adapter interface `search(params) → SearchResponse`; a WebSocket adapter for the local client and a static adapter for published sites.
    - [ ] Scope rules from the search issue's [subtask 07](../../../2026-04-19-site-wide-search/subtasks/07_search-scope-global-local-filtered.md): global from the navbar; section-local on a section page with a "search all" toggle; issue filters applied on the tracker index; inside-this-issue on an issue page.
    - [ ] UI from [subtask 08](../../../2026-04-19-site-wide-search/subtasks/08_search-ui.md): `Ctrl+K`/`⌘K` modal, `/` focuses the input, results grouped by type with breadcrumb and highlighted excerpt, `<dialog>` with a focus trap, listbox roles, a screen-reader result count, theme tokens only.
    - [ ] Field filters and quoted phrases from [subtask 06](../../../2026-04-19-site-wide-search/subtasks/06_regex-and-advanced.md) where the static engine supports them; regex is local-only and the toggle is disabled on a static site with a tooltip saying why.
    - [ ] The index loads only when search opens; pages without search open ship only the island's small loader.
- [ ] **Base prefix**: index paths and result URLs carry `--base`.
- [ ] **Tests.** Build a fixture site, open it in Playwright, search for a known phrase, check the first result, check scope switching and keyboard navigation, and check no index is fetched before search opens.

## Guardrails
- One UI for both backends; no second search UI.
- The index is built from the same data the pages are built from; no separate crawl of the markdown.
- Search is an island; it never turns the page into a hydrated app.

## Done when
- The Playwright test passes on a static build served from a folder with a `/docs` prefix.
- The index for this repository's docs loads under 300 KB for a typical query (record the measured number).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: the island in `apps/packages/agentks-ui/`, the index step in `apps/agentks-engine/` or `apps/agentks-ssg/`.

**Read first**
- [Publishing](../../notes/05_delivery/02_publishing-ssg.md), sections 05 (islands) and 12 (open).
- The absorbed issue: [2026-04-19-site-wide-search](../../../2026-04-19-site-wide-search/issue.md), its [engine analysis](../../../2026-04-19-site-wide-search/notes/01_engine-analysis.md), [scaling note](../../../2026-04-19-site-wide-search/notes/02_scaling-and-system-requirements.md), and subtasks [06](../../../2026-04-19-site-wide-search/subtasks/06_regex-and-advanced.md), [07](../../../2026-04-19-site-wide-search/subtasks/07_search-scope-global-local-filtered.md), [08](../../../2026-04-19-site-wide-search/subtasks/08_search-ui.md), [09](../../../2026-04-19-site-wide-search/subtasks/09_static-build-fallback.md).

**Depends on:** [150/10 agentks build](./10_agentks-build.md), [080/50 islands](../080_ui-and-client/50_islands.md), [030/95 retrieval index](../030_rust-engine/95_retrieval-index.md) (the local adapter).
**Unblocks:** [195/00 hosting](../195_hosting/00_overview.md) (search on agentks.neuralabs.org/docs).

# 04 Decisions
- Decided (claude, under sidhantha's delegation, 2026-09-30): the static search engine is Pagefind. It is built for static sites (sharded, lazy-loaded, filterable) and runs at build time, where Bun or Node already run. This answers the open question on search for a static site.
- Decided (sidhantha, 2026-09-29): search-engine friendliness and static output are Phase 3's job ([publishing](../../notes/05_delivery/02_publishing-ssg.md)).
- Decided (claude, 2026-09-30): one search UI with two adapters, so the local client and the published site share the same component.

# 05 Notes & Analysis
## 01 What this leaf absorbed from the site-wide search issue
- Subtask 09 (static fallback), and the static parts of 06 (advanced queries), 07 (scope) and 08 (UI).
- Not absorbed here: 05 (AI search API) → [130/50](../130_ai-plugins/50_agent-hooks-and-retrieval.md); the live index and regex → [030/95](../030_rust-engine/95_retrieval-index.md). Subtasks 01 (architecture), 02 (Orama integration), 03 (dev-tools inspection) and 04 (plugin hooks) were written for Astro and Orama and are obsolete under the migration.
