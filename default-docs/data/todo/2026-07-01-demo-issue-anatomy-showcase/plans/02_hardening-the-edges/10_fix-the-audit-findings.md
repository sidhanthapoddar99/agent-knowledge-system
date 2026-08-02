---
title: "Fix the audit findings"
outcome: "The two confirmed defects stop being reachable"
notes: "Both defects were **reproduced**, not just reported — the audit names the command"
who: claude
status: in-progress
subtasks:
  - "[Backend](../../subtasks/02_build/01_backend.md)"
  - "[Depth guard](../../subtasks/04_verify/20_depth-guard.md)"
agent-logs:
  - "[Edge cases](../../agent-log/020_au_edge-cases/summary.md)"
---

## Todo
- [x] the `00-` / `00_` separator collision
- [ ] [Depth guard](../../subtasks/04_verify/20_depth-guard.md) — overflow must
      ERROR, not warn to a console nobody reads

## Questions
- [ ] Does the depth cap belong to the loader or to the section?
