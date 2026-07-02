---
title: "Unified parser pipeline + graph indexer + queries"
status: open
---

The foundation. Collapse per-parser wiring into one shared pipeline; build the graph on top; expose queries; cache it.

## 1.1 — Shared pipeline factory

Today each parser (`DocsParser`, `BlogParser`, `IssuesParser`) wires its own pre/postprocessors independently, and `IssuesParser` is missing asset-embed + the custom-tags registry entirely (both are dead code in `src/custom-tags/`). Replace this with a single factory.

- [ ] Extract `createMarkdownPipeline(contentType, overrides?)` in `src/parsers/core/` that returns a `ProcessingPipeline` with the full standard set:
  - Preprocessors: asset-shorthand resolver, wiki-link resolver (`[[...]]`), embed resolver (`[[[...]]]`), custom-tags registry
  - Postprocessors: heading-ids, internal-links (ungated), external-links, diagrams
- [ ] Per-content-type overrides only for genuinely different behaviour (e.g. the blog slug→asset-folder shorthand).
- [ ] `DocsParser` / `BlogParser` / `IssuesParser` all call this factory in their constructors.
- [ ] Drop the `contentType === 'docs'` gate in `src/parsers/postprocessors/internal-links.ts:53`.

## 1.2 — Graph indexer

- [ ] Walk every rendered page's final HTML; extract all `<a href>` and embed references.
- [ ] Store `(source_url, target_url, link_text, kind: link|embed)` tuples.
- [ ] Build reverse index `target_url → [source_url, ...]` for backlinks.
- [ ] Hook into the unified `cache-manager` for mtime-based invalidation (only re-index changed files).

## 1.3 — Query API

Exposed under `/api/graph/*` (dev only in v1):

- [ ] `GET /api/graph/backlinks/:url` — pages linking *to* `:url`
- [ ] `GET /api/graph/outlinks/:url` — pages linked *from* `:url`
- [ ] `GET /api/graph/orphans` — pages with zero inbound links
- [ ] `GET /api/graph/broken` — references whose target isn't in the registry
- [ ] `GET /api/graph/stats` — totals for dev-tool surfaces

## 1.4 — Graph cache

- [ ] Hold the full graph in memory, keyed by URL.
- [ ] Invalidate via `cache-manager` when any source file's mtime changes.
- [ ] Optional on-disk snapshot for cold-start warmth.

## Verify

- Every content type produces rewritten internal links after this lands (not just docs).
- Issues can `[[link]]` to user-guide pages and vice-versa.
- `<callout>/<tabs>/<collapsible>` tags render everywhere, not nowhere.
- `GET /api/graph/backlinks/<url>` returns the list for a hand-picked page.
