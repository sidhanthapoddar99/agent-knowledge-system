---
iteration: 12
agent: claude
status: failed
date: 2026-04-29
---

# Agent log — level 3 (depth 3, over the cap)

This is for testing the 2-level subfolder tree (subtask 20).

This entry is intentionally placed too deep — at `agent-log/exploration/phase-1/deeper/test-level-3.md`, three folders below `agent-log/`. The loader caps depth at 2, so this folder should be skipped and the build should log a warning like:

```
[issues] "2026-04-10-issues-layout": agent-log/exploration/phase-1/deeper/ exceeds the 2-level depth cap — ignored
```

It should NOT appear in the sidebar.
