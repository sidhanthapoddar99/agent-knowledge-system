---
title: "Goal — execute the native-markdown migration (subtasks 10–40)"
---

# Goal

Execute all four subtasks of the native-markdown-only decision
(`../../brainstorm/01_discuss_native-markdown-only.md`) in one multi-agent run,
launched 2026-07-03 at the user's request ("complete all of these tasks, use
multiple opus agents"). Fan-out:

- **Agent A (framework):** subtasks 10 + 20 sequentially — delete
  `src/custom-tags/` (+ registry fate call), then ship GFM-alerts rendering +
  default-theme CSS, verified by renderer probe + full build.
- **Agent B (docs):** subtask 30 — user-guide/dev-docs sweep + the
  native-markdown writing reference.
- **Agent C (skills):** subtask 40 — both skill writing references rewritten to
  the native toolkit, mirrored to the installed plugin cache with parity check.
- **Agent D (read-only):** scan the rest of the tracker for issues still
  referencing custom tags — report for the next cycle, no edits.

Done looks like: all four subtasks at `review` with evidence (build output,
renderer probe, parity diff), a final integration build run by the orchestrator
after all agents land, and the tracker-references report delivered to the user.
File-ownership fences keep the agents disjoint (src/ vs data/ vs plugins/), with
only Agent A allowed to run builds until the final integration check.
