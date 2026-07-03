---
title: "Document first-class diagram pages in the user-guide"
status: done
---

User-guide updates so authors know diagrams can be pages *or* embeds and which
to pick when. Blocked on this group's coding subtasks shipping — prose can be
drafted earlier, but examples and URLs need the behaviour nailed down.

## Where to update

Primary landing area: `15_writing-content/`.

- [x] **New page** — `15_writing-content/06_diagram-pages.md`: formats
      table, naming/slug rules with the live dev-docs examples, "name
      suffices" sidecar framing, collision + no-prefix + assets rules, page
      behaviour (outline auto-hide, lightbox, open-file link, dark mode),
      opt-out flag, embed-or-page guidance.
- [x] **`03_asset-embedding.md`** — "Embed or page?" paragraph appended to
      the Two-embed-mechanisms section, linking to the new page.
- [x] **`02_markdown-basics.md`** — Diagram Pages row in the extended
      features table + a "markdown isn't the only page format" note.
- [x] **Settings field docs** — `allow_diagram_pages` documented in
      `17_docs/03_folder-settings.md` (the page enumerating folder-settings
      fields; nothing in `10_configuration/` enumerates section fields).
- [x] **`05_getting-started/04_data-structure.md`** — docs naming-pattern
      row now mentions diagram extensions with a link to the new page.
- [x] **"Markdown only" sweep** — repo grep found no such claims in
      `25_themes/` / `16_layout-system/` prose.

## Cross-links

- [x] Diagram-pages page ↔ asset-embedding page link both ways; editor-side
      work is tracker scope (`subtasks/30_editor/`), not user-guide content —
      linked from the issue instead.
