---
title: "Site index — one view of the project: entries, URLs, folder hashes, references"
status: in-progress
---

Every derived value comes from one index of the whole project, built at start-up by walking every section once. It answers "which entry is at this path or URL", "what are this folder's ordered children", "did anything under this folder change", and "which pages link to or embed this file". It is also the file-to-URL map the link resolver reads ([020/30](../020_content-contract/30_links-and-urls.md)), and the registry the knowledge-graph issue planned. Its data structure is [open question 07](../../notes/01_overview/05_open-questions-and-risks.md); this leaf builds the proposed one, measures it, and records the decision.

# 01 To Do
- [ ] **Entries.** One per file in a content section (pages and assets), not config files and not `settings.json`:
    ```rust
    pub struct Entry {
        pub path: RelPath,           // project-relative
        pub section: SectionId,
        pub kind: EntryKind,         // Markdown | Video | Diagram | Artifact | Asset | TrackerFile(..)
        pub hash: Hash,              // BLAKE3 of the bytes
        pub frontmatter: Option<Frontmatter>,
        pub title: Option<Arc<str>>,
        pub label: Option<Arc<str>>, // sidebar label
        pub order: OrderKey,         // prefix value, then name
        pub url: Option<Url>,        // None for non-page files
        pub refs: Vec<Reference>,    // outgoing links and embeds, with line numbers
    }
    ```
    Page bodies are not stored or rendered here.
- [ ] **Lookups**: path → entry (ordered map), URL → path, folder → ordered children, reverse references (target path → pages that link to it; → pages that embed it).
- [ ] **Folder hashes, Merkle style**: a folder's hash rolls up its children's names and hashes, so a change re-hashes only its chain of parents, and "did anything under this folder change" is one comparison. Sidebars, the issues index and the browser cache key on these.
- [ ] **URLs**: derived here, once, from the section's `base_url` and the path with prefixes and extensions stripped, following today's routing (index collapsing, tracker detail URLs, plan stage aliases, dual-slug redirects). The canonical form and every alias or redirect are recorded, so the server and `agentks build` read one route table.
- [ ] **Reserved prefixes and collisions**: refuse a page URL under a reserved prefix; resolve slug collisions as [020/50](../020_content-contract/50_ordering-settings-frontmatter.md) says.
- [ ] **Incremental update**: `apply(change: FileChange) -> ChangedKeys`. Re-read one file, update its entry and references, re-hash its parent chain, and return the set of changed keys (the page, pages that embed it, the section's sidebar, the tracker index, the manifest). The server pushes exactly those ([050/30](../050_server/30_watcher-and-push.md)).
- [ ] **Graph queries** (absorbs [knowledge graph 01](../../../2026-04-19-knowledge-graph-and-wiki-links/subtasks/01_unified-pipeline-and-graph.md) §1.2–1.4 and [02 URL registry](../../../2026-04-19-knowledge-graph-and-wiki-links/subtasks/02_url-registry.md)): backlinks and outlinks for a path, orphan pages (no inbound links), broken references (a `Miss` from the resolver). Exposed as functions now; surfaced through `agentks check` and later the dev toolbar and layouts ([knowledge graph 07](../../../2026-04-19-knowledge-graph-and-wiki-links/subtasks/07_surfaces-backlinks-and-devtools.md) stays in its issue).
- [ ] **Decide open question 07 with numbers**: build the proposed structure (an ordered map keyed by path plus rolled-up folder hashes; no radix tree), then benchmark on the corpus (about 1,300 pages) and on a synthetic 20× corpus: cold build, single-file update, a sidebar query, a backlinks query. Record the numbers and the decision in this leaf's `04 Decisions`, and tell the main session so the open-questions note is updated.

## Guardrails
- **The index is not persisted.** It is rebuilt every start; a stale index is the worst kind of wrong ([02/06](../../notes/02_engine/06_machine-home-and-build-cache.md) section 02). Expensive derived values are cached elsewhere.
- **Keys are content hashes, never modification times** (WSL reports unreliable mtimes).
- **One producer of URLs.** Nothing else in the engine computes a URL from a path.
- Wiki links are rejected: references are only relative `[text](path)` links and `[[path]]` embeds ([comment 002 on the knowledge-graph issue](../../../2026-04-19-knowledge-graph-and-wiki-links/comments/002_2026-09-30_wiki-link-syntax-rejected.md)). Do not build alias lookup by title or file name.

## Done when
- On the corpus, the index's route table equals the golden snapshot's routes, redirects included ([020/10](../020_content-contract/10_golden-fixtures.md)).
- A single-file edit re-hashes only its parent chain (asserted by counting hash computations) and returns the expected changed keys.
- Backlinks for a hand-picked page match a grep of the corpus for links to it.
- The benchmark results and the question-07 decision are recorded here.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** crate `agentks-index`.
- **Read first:** [02/03 The Rust engine](../../notes/02_engine/03_rust-engine.md) sections 02 and 03; [open question 07](../../brainstorm/01_initial-discussion/16_open-questions.md) and the prior audit's [B-tree cache study](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/022_question_btree-cache.md); today's routing in [route-match.ts](../../../../../../agent-ks-engine/src/pages/lib/route-match.ts) and [static-paths.ts](../../../../../../agent-ks-engine/src/pages/lib/static-paths.ts); the knowledge-graph issue's [subtask 01](../../../2026-04-19-knowledge-graph-and-wiki-links/subtasks/01_unified-pipeline-and-graph.md) and [subtask 02](../../../2026-04-19-knowledge-graph-and-wiki-links/subtasks/02_url-registry.md).
- **Depends on:** [10](./10_workspace-and-crate-boundaries.md), [020/50](../020_content-contract/50_ordering-settings-frontmatter.md).
- **Unblocks:** [020/30 links and URLs](../020_content-contract/30_links-and-urls.md), [50](./50_markdown-pipeline.md), [60](./60_tracker-loader.md), [040/00 caching](../040_caching/00_overview.md), [050/30](../050_server/30_watcher-and-push.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the site is indexed at start-up and pages are rendered on request (question 07's first half).
- Decided (claude, 2026-09-30): the index is the URL registry and the file-to-URL map; there is no second structure.
- Open until measured: the data structure (question 07's second half). Claude's proposal is above.

# 05 Notes & Analysis
## 01 What the knowledge-graph issue keeps
- Its wiki-link and `[[[...]]]` embed plans are rejected (sidhantha, 2026-09-30). Its registry and graph queries land here. Its surfaces — a backlinks card on detail pages and a graph panel in the dev toolbar — are layout and toolbar work that can follow once these queries exist.

## Watch out
- The prior audit measured a median of 3 entries per folder; a plain ordered map is fast at that shape. Do not add a tree structure before the benchmark says it is needed.
