---
title: "Update dev-docs — engine + architecture"
state: open
---

The engine restructure has to be documented for maintainers. Three areas touch the parser, the loader, and the dev-toolbar layer.

## Parser section

- [ ] `dev-docs/05_architecture/04_parser/01_overview.md` — describe the new unified pipeline model: one `createMarkdownPipeline()` factory, per-content-type overrides only where they matter.
- [ ] Parser architecture page — add section on the URL registry as the pipeline's resolution backend.
- [ ] Custom-tags registry — document that it's now actually wired (it wasn't before). List the registered tags + how to add new ones.
- [ ] Asset-embed / wiki-link / embed pre-processors — document the three new preprocessors and what each resolves.

## Loader section

- [ ] `dev-docs/05_architecture/` — new page for the **URL registry**:
  - Entry shape
  - Lookup paths (sourcePath ↔ url ↔ alias)
  - When it's built / invalidated
  - The `settings.json` exclusion rule and why
- [ ] Document how the registry plugs into `cache-manager` and shares the mtime-invalidation path.

## Graph + autorewrite

- [ ] New page: **Graph indexer** — how the graph is built from rendered HTML, the backlinks reverse-index, cache shape, API endpoints (`/api/graph/*`).
- [ ] New page: **Autorewrite mechanism** — file watcher hooks, debounce semantics, how rewrites coordinate with the Yjs editor, headless vs dev-server behaviour.

## Dev toolbar

- [ ] If subtask 07 (surfaces) lands a graph dev-tools app, add a page under `dev-docs/` covering it — match the pattern used for `system-metrics` and `cache-inspector`.

## Verify

- A maintainer who's never seen the graph work can read these pages end-to-end and understand where the registry, graph, and autorewriter live in the codebase.
- Every new API endpoint is documented with request/response shape.
