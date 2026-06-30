---
title: Issues layout restructuring
state: open
---

Running log of structural / UI tweaks to the issues layout. One or two lines appended
per change as it's completed.

- [x] **MetaPanel — 5 lines → 3.** Merged Labels onto the Status/Priority line, and
      Created/Updated onto the Author/Assignees line; dropped the orphaned
      `--wide` cell rule.
- [x] **Description scoped to overview only.** Shown on the overview page + index
      cards; removed from subdoc pages (notes / subtasks / agent-log).
- [x] **Comments → own panel + single nav entry.** Overview renders only `issue.md`;
      comments live on a `#comments` panel as the old GitHub-style thread (issue body =
      opening post + comments), with the right-rail per-comment index. Sidebar gets a
      single **Comments** entry in the "This issue" group, right after Overview
      (Overview · Comments · Comprehensive), always visible. Panel-based, hash-addressable
      (`#comments` / `#comment-N`), no new routing. Also dropped the subtask summary
      from the overview per "only issue.md".
- [x] **Sizing: centred trio via shared variables.** `.issue-layout` columns use
      `--sidebar-width` / `--outline-width`; capped at
      `calc(--sidebar-width + --max-width-secondary + --outline-width)` so the centre
      content can't stretch past `--max-width-secondary` — sidebar + outline stay
      attached to the content and extra viewport space falls outside the centred trio.
      (Fixes the full-width theme's `--max-width-primary: none` letting `1fr` stretch
      edge-to-edge.) Padding on spacing vars; grid kept.
- [x] **Brainstorm section added (full stack).** New `brainstorm/` collection, same
      free-form 2-level shape as notes: loader (`readFreeformDocs`), routing
      (`resolveSubDoc` + static-paths), sidebar section (ordered before Notes, lightbulb
      icon), subdoc pages at `/<issue>/brainstorm/<name>` (rendered via `NotePage` with
      a `prefix` so the path label/panel-key are namespaced correctly). Name decided:
      **Brainstorm** (see the issue's `brainstorm/01_section-naming.md`).
