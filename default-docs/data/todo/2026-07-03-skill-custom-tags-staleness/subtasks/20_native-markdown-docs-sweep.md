---
title: "User-guide sweep — remove tag references, document the native-markdown system"
status: open
---

The published docs must match the native-markdown-only policy
(`brainstorm/01_discuss_native-markdown-only.md`): no custom-tag mentions anywhere,
and a positive reference for what authors (human and AI) actually use.

- [ ] Remove the remaining custom-tags references from the user-guide:
      `15_writing-content/01_overview.md` carries a note pointing readers to
      `2026-04-20-custom-tags` for status — delete it; sweep `user-guide/` and
      `dev-docs/` for other `custom-tag` / `callout` / `<tabs>` mentions.
- [ ] Extend `15_writing-content/` into the native-markdown reference: blockquote
      callouts (settle the GFM `> [!NOTE]` open point from the brainstorm here),
      native `<details><summary>`, fenced ```mermaid / ```graphviz diagrams, and
      `[[path]]` embeds as the one extension pattern — including that future embed
      types (e.g. Excalidraw) extend `[[path]]` by file extension rather than adding
      tag syntax.
- [ ] Check `dev-docs/` architecture pages for pipeline diagrams or module lists
      that still name `custom-tags` / tag transformation as a stage.
- [ ] Document only what renders today — if the GFM-alerts call lands on "yes",
      its renderer support ships under subtask 30 before this page describes it.
