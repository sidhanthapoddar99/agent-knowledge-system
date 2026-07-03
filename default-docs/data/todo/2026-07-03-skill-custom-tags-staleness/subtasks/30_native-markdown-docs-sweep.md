---
title: "User-guide sweep — remove tag references, document the native-markdown system"
status: done
---

The published docs must match the native-markdown-only policy
(`brainstorm/01_discuss_native-markdown-only.md`): no custom-tag mentions anywhere,
and a positive reference for what authors (human and AI) actually use. Runs after
subtask 20 so the GFM-alerts syntax it documents actually renders.

- [ ] Remove the remaining custom-tags references from the user-guide:
      `15_writing-content/01_overview.md` carries a note pointing readers to
      `2026-04-20-custom-tags` for status — delete it; sweep `user-guide/` and
      `dev-docs/` for other `custom-tag` / `callout` / `<tabs>` mentions.
- [ ] Extend `15_writing-content/` into the native-markdown reference: GFM alert
      callouts (`> [!NOTE]` / `[!TIP]` / `[!IMPORTANT]` / `[!WARNING]` /
      `[!CAUTION]` — decided 2026-07-03, shipped by subtask 20), native
      `<details><summary>`, fenced ```mermaid / ```graphviz diagrams, and
      `[[path]]` embeds as the one extension pattern — including that future embed
      types (e.g. Excalidraw) extend `[[path]]` by file extension rather than adding
      tag syntax.
- [ ] Check `dev-docs/` architecture pages for pipeline diagrams or module lists
      that still name `custom-tags` / tag transformation as a stage.
