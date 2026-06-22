---
title: "Document first-class diagram pages"
state: open
---

Once subtask 04 lands, the user-guide needs updates in a few places so authors know diagrams can be pages *or* embeds and which to pick when.

## Where to update

Primary landing area: `15_writing-content/`.

- [ ] **`15_writing-content/03_asset-embedding.md`** — add a "Diagrams as embeds vs pages" section. When to embed (docs: inline figure, tight to prose), when to use a standalone page (notes / KB: diagram IS the content).
- [ ] **`15_writing-content/` new page** (`06_diagram-pages.md` or similar) — the first-class path: supported extensions, `XX_` naming, meta sidecar schema, slug rules, opt-out flag. Example: `20_architecture.mmd` + `20_architecture.meta.json` rendering at `/docs/architecture`.
- [ ] **`15_writing-content/02_markdown-basics.md`** — short note that markdown isn't the only page format (link out to the new diagram-pages page).

Secondary touchpoints:

- [ ] **`10_configuration/`** (wherever `settings.json` fields are enumerated) — document the section-level `allow_diagram_pages` opt-out flag.
- [ ] **`05_getting-started/04_data-structure.md`** — update the "Naming pattern" table to mention non-markdown extensions are valid for docs sections by default.
- [ ] **Sidebar in `25_themes/` or `16_layout-system/`** — no content change expected, but double-check no page claims "markdown only" in prose.

## Cross-links to add

- From the new diagram-pages page → out to `2026-04-10-editor-diagrams` subtasks 01-03 (editor-side preview / inline edit).
- From `03_asset-embedding.md` → to the new diagram-pages page (so authors choosing between embed and page land in the right spot).

## Dependencies

Blocked on subtask 04 (first-class pages) actually shipping — can draft prose earlier, but examples + URLs need the feature behaviour nailed down.
