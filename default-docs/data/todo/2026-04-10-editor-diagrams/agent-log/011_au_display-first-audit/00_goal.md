---
title: "Goal — post-implementation audit of the display-first diagram work"
agent: claude
date: 2026-07-04
---

## Goal

Validate everything the display-first loop (activity `010_lp`) shipped, with a
fleet of report-only subagents — no fixes applied during the audit, findings
reported back for triage:

- **Docs (Haiku fleet):** structural + consistency validation of the
  diagram-related user-guide pages and a staleness sweep of dev-docs.
- **Audience-split audit (Haiku):** check the newly codified CLAUDE.md
  distinction — user-guide = how to *use* features to build documentation,
  dev-docs = how features are *implemented* internally — and flag misfiled
  content on either side.
- **Skills + code (Opus):** verify both skills' diagram claims against the
  shipped code and repo↔cache parity; review the diagram pipeline code
  (embed postprocessor, diagram-pages loader, asset routes, client renderer,
  caching) for correctness and edge cases.

Requested by sidhantha (2026-07-04) together with two new tooling subtasks
(`subtasks/40_tooling/`) and a parallel Opus research agent on excalidraw
scene tooling / MCP options.
