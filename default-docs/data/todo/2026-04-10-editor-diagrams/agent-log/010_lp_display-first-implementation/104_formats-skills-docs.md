---
title: "M4 — graphviz/excalidraw pages closed + first-class skills & docs"
iteration: 4
agent: claude
status: done
date: 2026-07-03
---

## Goal

I5 + I6: verify the remaining first-class formats and ship the group's
skills + documentation, completing the display-first scope.

## Approach

- **Graphviz pages**: build-verified with a temporary `.dot` page (correct
  `.diagram-graphviz` div at the expected slug; client render shared with the
  browser-verified embeds); temp file removed.
- **Excalidraw pages**: already browser-verified via the permanent demo;
  viewer UX rides on outline auto-hide + lightbox + `overflow-x` CSS.
- **Docs**: new `user-guide/15_writing-content/06_diagram-pages.md` (formats,
  naming, sidecar with "name suffices" framing, collision/no-prefix/assets
  rules, behaviour, opt-out, embed-or-page). Touchpoints:
  `02_markdown-basics.md` (note + table row), `03_asset-embedding.md`
  ("Embed or page?"), `17_docs/03_folder-settings.md`
  (`allow_diagram_pages` row), `05_getting-started/04_data-structure.md`
  (naming table). No stale "markdown only" claims found in a repo sweep.
- **Skills**: `docs-layout.md` gained a "Diagram pages" section + settings
  row; mirrored to plugin cache (diff-verified).

## Result

Build green, 721 pages, new guide live. All ten display-first subtasks are
now Closed or Review: group `10_embeds/` (2 done + 3 review), group
`20_first-class/` (5 review). Group `30_editor/` stays open by scope
decision. Issue remains `in-progress` (editor group outstanding); the
review badges on subtasks carry the needs-review signal.

## Next

Loop complete — nothing left in the display-first scope. Human review of
the 8 subtasks in `review`, then either close them or bounce feedback;
`30_editor/` is the next workstream when prioritized.
