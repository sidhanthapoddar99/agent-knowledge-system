---
title: "Site index — one view of the project: entries, URLs, folder hashes, references"
status: review
---

Every derived value comes from one index of the whole project, built at start-up by walking every section once. It answers "which entry is at this path or URL", "what are this folder's ordered children", "did anything under this folder change", and "which pages link to or embed this file". It is also the file-to-URL map the link resolver reads ([020/30](../020_content-contract/30_links-and-urls.md)), and the registry the knowledge-graph issue planned. Its data structure was open question 07; this leaf built the proposed one, measured it, and recorded the decision below.

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
    A folder whose settings file says `"kind": "video"` is one `Video` entry at the folder's path. The walk hashes the files inside it but makes no entries for them, and its `components/` and `assets/` never report `settings-missing`. The entry's hash is the folder's rolled-up hash, and its title and label come from its `controller.yaml`.
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
Review. The index is built and tested in `agentks-index` (wave 2, index track); route parity against the golden snapshot waits for the real content rules and the fixtures of [020/10](../020_content-contract/10_golden-fixtures.md).

## Result
- Crate `apps/agentks-engine/crates/index`, in four folders: `src/refs/` (the reference scanner), `src/walk/` (the walk, `ProjectFiles`, file and folder maps with Merkle folder hashes), `src/routing/` (URL rules, collisions, reserved URLs, the route table), `src/snapshot/` (`SiteIndex`: queries, resolver, graph, `apply`). Its README lists what is where.
- `SiteIndex::build`, `apply`, `entry`, `entry_for_url`, `folder`, `hash_of`, `routes`, `route`, `shown_at`, `linked_from`, `embedded_by`, `orphans`, `broken` all work. `build` calls `agentks-content`; until that crate is built it returns its `NotImplemented` error. Tests run the same walk with stand-in rules.
- Tests: 30 unit and small integration tests, 0.02 s (`ctl test engine`). `ctl gate` green.
- A single-file edit re-hashes exactly 2 folders (its folder and the section root), asserted by a counter in the test `a_single_edit_rehashes_only_its_parent_chain`.
- Benchmark (ignored test `bench_index_structure`, release build, stand-in rules, files in memory): the corpus (1,659 files, 1,375 routes, 272 redirects) builds cold in 49 ms; a one-file update takes 0.2 ms; a sidebar walk 6 µs; a backlinks query 0.1 µs. A synthetic 20x corpus (33,180 files, 27,500 routes) builds in 1.04 s; a one-file update takes 7 ms (the copy of the path maps); sidebar and backlinks stay flat.
- On the corpus the resolver reports 83 `link-missing` and 465 `path-escapes-project` references. The escapes are tracker links into the engine's source (`../../../../../../agent-ks-engine/...`), which leave the `default-docs` project. The misses are real: links to folders with no page (subtask groups, agent-log runs, docs folders without `index.md`), slug-form links, and example links in the embedding guide.
- Left for other work: the golden route parity, and the backlinks-versus-grep check on a hand-picked page, both once the content crate is real.

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
- Decided (claude, 2026-10-01): question 07 is settled for the proposed structure: two ordered maps keyed by path (files and folders), entries and folders reference-counted, folder hashes rolled up Merkle style; no radix or Patricia tree, because the benchmark above is fast at 20x the corpus and the only cost that grows is the map copy on update (7 ms at 33,000 files). A persistent map can replace the two maps behind the same API if that ever matters.
- Decided (claude, 2026-10-01): a folder's hash rolls up each child's name, kind and hash, and the hashes of its settings files, because a `settings.json` change moves the sidebar.
- Decided (claude, 2026-10-01): the walk calls the content rules through a small internal trait, because the content crate is built in parallel; tests pass stand-ins through the very same walk.
- Decided (claude, 2026-10-01): slug collisions are settled in one pool across all sections: structural routes, then markdown, then diagrams, then artifacts, then path order. Every file in a collision gets a `slug-collision` error; the losers get no URL, and a link to one is a miss, because it points at no page.
- Decided (claude, 2026-10-01): the docs base URL redirects to the section's first page in today's order (folder prefixes, then the file's; no prefix counts as 999). An empty docs section has no route at its base URL, because there is nothing to send the reader to.
- Decided (claude, 2026-10-01): files shown on another page have no URL of their own but a place there: comments and `glossary.md` on the issue page, a plan's `overview.md` on the plan page, a stage on the plan page at its title anchor (`SiteIndex::shown_at`). Plans are their own route target (`RouteTarget::Plan`), and stage aliases are `anchored_redirects`, because a redirect to a heading cannot fit a plain URL.
- Decided (claude, 2026-10-01): `IndexChanges.pages` lists each changed page, the pages that embed it, and the pages that link to it, plus the linkers of every file whose URL changed. Re-rendering a few extra pages is safe; a stale page is not.
- Decided (claude, 2026-10-01): a change to `allow_diagram_pages` in a section root's settings rebuilds the whole index, because it reclassifies every file in the section. It is rare.
- Decided (claude, 2026-10-01): the walk skips names starting with `.`, and reports a docs folder without `settings.json` (outside `assets/`) as `settings-missing`, because the walk is the only place that sees every folder.

# 05 Notes & Analysis
## 01 What the knowledge-graph issue keeps
- Its wiki-link and `[[[...]]]` embed plans are rejected (sidhantha, 2026-09-30). Its registry and graph queries land here. Its surfaces — a backlinks card on detail pages and a graph panel in the dev toolbar — are layout and toolbar work that can follow once these queries exist.

## Watch out
- The prior audit measured a median of 3 entries per folder; a plain ordered map is fast at that shape. Do not add a tree structure before the benchmark says it is needed.
