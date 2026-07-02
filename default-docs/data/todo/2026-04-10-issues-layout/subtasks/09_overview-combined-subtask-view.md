---
title: "Overview — combined subtask view (all bodies inline)"
status: done
---

After the comment thread, render every subtask's body inline as a stack of comment-style boxes. Lets the reader review the whole issue without clicking through every subtask page.

## Layout

Below the comment thread on the overview, add a **"Subtasks"** section with three sub-tabs:

- **All** (default)
- **Open**
- **Closed (done)**

Sub-tab switches the visible boxes — same data, filtered.

## Per-subtask box

Each box renders:

- Title (from frontmatter) + done-state badge
- Full markdown body — **but capped at 50 lines** of rendered content
  - If the body exceeds 50 lines: collapse with a **"Show more"** toggle
  - When expanded: show all + **"Show less"**
  - Default state per box: open subtasks expanded, closed subtasks collapsed
- Anchor link to the standalone subtask page

## Concerns to handle

- Long subtasks shouldn't blow up the page — the 50-line cap is the answer
- Avoid double-rendering when the user navigates from overview to a subtask page (the standalone subtask page still exists; this is a *summary view*, not a replacement)
