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
- [x] **Comments → sidebar section + own panel.** Overview now renders only
      `issue.md`; comments live as one scrollable thread (issue body = the opening
      post) on a `#comments` / `#comment-N` panel, listed in a new sidebar **Comments**
      section and the right-rail index. Built as a panel (hash-addressable, no new
      routing). Also dropped the subtask summary from the overview per "only issue.md".
