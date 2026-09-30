---
title: "Retrieval index — full-text search for the site and for agents (later stage)"
status: open
---

Search is wanted by people browsing the site and by agents that should read a few relevant paragraphs instead of whole files. [2026-04-19-site-wide-search](../../../2026-04-19-site-wide-search/issue.md) planned it with Orama inside Astro; the migration replaces that with one Rust index shared by the site and agents ([brainstorm: agent hooks and retrieval](../../brainstorm/02_future-stages/05_agent-hooks-and-retrieval.md)). This is a later stage: today's site has no search, so parity does not need it. This leaf holds the Rust side; search on a published static site is [150/40](../150_publishing/40_static-search.md).

# 01 To Do
- [ ] **A new crate, `agentks-search`**, at layer 4 beside `agentks-render` ([10](./10_workspace-and-crate-boundaries.md)), using tantivy.
- [ ] **What is indexed**: titles, headings, body text and frontmatter of docs, blog posts, issues and every tracker sub-document (subtasks, notes, logs, comments), with fields for section, type, parent issue, status, tags, labels. Built from rendered text in the cache; kept current by the same file changes that update the index; stored under the project's build cache ([040/40](../040_caching/40_build-cache-on-disk.md)) with a format version.
- [ ] **Queries** (from the search issue's [06](../../../2026-04-19-site-wide-search/subtasks/06_regex-and-advanced.md) and [07](../../../2026-04-19-site-wide-search/subtasks/07_search-scope-global-local-filtered.md)):
    - [ ] full text with prefix and fuzzy matching, ranked;
    - [ ] scope as filters: global, section-local, filter-scoped (issues facets), inside one issue;
    - [ ] field queries (`title:`, `tag:`, `status:`), negation, `AND`/`OR`/`NOT`, quoted phrases;
    - [ ] regex mode (`/pattern/`) over indexed text — Rust's `regex` crate runs in linear time, so there is no catastrophic backtracking to guard against, only a result limit;
    - [ ] synonyms from `site.yaml → search.synonyms`, expanded at query time.
- [ ] **One interface for people and agents** (the search issue's [05](../../../2026-04-19-site-wide-search/subtasks/05_ai-search-api.md)): a `search` request on `/api` and an `agentks search <query> --json` command returning the same hits (id, URL, source path, title, excerpt, match positions, score), with a size limit so an agent reads paragraphs, not files.
- [ ] **Link graph queries** stay in the site index ([40](./40_site-index.md)); search results may show backlink counts from it.

## Guardrails
- One index for the site and agents; no second search system.
- Semantic (embedding) search is not part of this leaf; it is an optional later download, like the narration voice.

## Done when
- `agentks search "version gate" --json` over this repository's content returns the version-gate pages first.
- An edit to a page is searchable within a second, with no restart.
- The same query through `/api` and through the CLI returns identical hits.

# 02 Status and Result
Open. Not started. A later stage: not required for 1.0.0 parity.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** new crate `agentks-search`; the `search` request in `agentks-server`; the command in `agentks-cli`.
- **Read first:** [2026-04-19-site-wide-search](../../../2026-04-19-site-wide-search/issue.md), its [engine analysis](../../../2026-04-19-site-wide-search/notes/01_engine-analysis.md) and [scaling note](../../../2026-04-19-site-wide-search/notes/02_scaling-and-system-requirements.md), subtasks [05](../../../2026-04-19-site-wide-search/subtasks/05_ai-search-api.md), [06](../../../2026-04-19-site-wide-search/subtasks/06_regex-and-advanced.md), [07](../../../2026-04-19-site-wide-search/subtasks/07_search-scope-global-local-filtered.md); [brainstorm: agent hooks and retrieval](../../brainstorm/02_future-stages/05_agent-hooks-and-retrieval.md); today's CLI `find` in [navigate.rs](../../../../../../agent-ks-cli/src/navigate.rs).
- **Depends on:** [40](./40_site-index.md), [50](./50_markdown-pipeline.md), [040/40](../040_caching/40_build-cache-on-disk.md).
- **Unblocks:** [150/40 static search](../150_publishing/40_static-search.md); the search UI island ([080/50](../080_ui-and-client/50_islands.md)).

# 04 Decisions
- Decided (sidhantha, 2026-09-29, recorded as an idea): agent hooks and retrieval are a later stage.
- Decided (claude, 2026-09-29, [impact note](../../brainstorm/01_initial-discussion/18_impact-on-other-issues.md)): the Orama-in-Astro plan is replaced by a Rust index shared by the site and agents.

# 05 Notes & Analysis
## 01 What the search issue keeps
| Its subtask | Here or there |
|---|---|
| 01 architecture design | Replaced by this leaf |
| 02 Orama integration, 04 plugin hooks, 09 static-build fallback (Pagefind) | Obsolete as written; static search is [150/40](../150_publishing/40_static-search.md) |
| 03 dev-tools inspection | The dev toolbar, later |
| 05 AI search API, 06 advanced queries, 07 scopes | Here |
| 08 search UI | The search island ([080/50](../080_ui-and-client/50_islands.md)) |
