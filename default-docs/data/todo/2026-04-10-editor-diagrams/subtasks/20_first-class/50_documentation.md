---
title: "Document first-class diagram pages in the user-guide"
status: open
---

User-guide updates so authors know diagrams can be pages *or* embeds and which
to pick when. Blocked on this group's coding subtasks shipping — prose can be
drafted earlier, but examples and URLs need the behaviour nailed down.

## Where to update

Primary landing area: `15_writing-content/`.

- [ ] **New page** (`15_writing-content/06_diagram-pages.md` or similar) —
      the first-class path: supported extensions, `XX_` naming, metadata
      sidecar schema, slug rules + collision error, opt-out flag. Example:
      `20_architecture.mmd` rendering at `/docs/architecture`.
- [ ] **`15_writing-content/03_asset-embedding.md`** — "embeds vs pages"
      section: embed when the diagram is an inline figure tight to prose;
      standalone page when the diagram IS the content (notes/KB use).
- [ ] **`15_writing-content/02_markdown-basics.md`** — short note that
      markdown isn't the only page format, linking to the new page.
- [ ] **`10_configuration/`** — document the section-level
      `allow_diagram_pages` opt-out wherever `settings.json` fields are
      enumerated.
- [ ] **`05_getting-started/04_data-structure.md`** — update the naming
      table: non-markdown extensions are valid docs pages by default; note
      the explicit `assets/` exclusion.
- [ ] **Sweep for "markdown only" claims** in `25_themes/` /
      `16_layout-system/` prose.

## Cross-links

- [ ] From the new diagram-pages page → `subtasks/30_editor/` (editor-side
      preview/editing, deferred) and back to
      `subtasks/10_embeds/50_documentation.md`'s embed section.
