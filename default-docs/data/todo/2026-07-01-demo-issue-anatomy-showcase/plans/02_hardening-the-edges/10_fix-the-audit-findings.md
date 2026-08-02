---
title: "Fix the audit findings"
outcome: "The two confirmed defects stop being reachable"
notes: "Both defects were **reproduced**, not just reported — the audit names the command"
who: claude
status: in-progress
subtasks:
  - "[Backend](../../subtasks/02_build/01_backend.md)"
  - "[Depth guard](../../subtasks/04_verify/20_depth-guard.md)"
---

## Todo
- [x] the `00-` / `00_` separator collision
- [ ] [Depth guard](../../subtasks/04_verify/20_depth-guard.md) — overflow must
      ERROR, not warn to a console nobody reads

## Questions
- [ ] Does the depth cap belong to the loader or to the section?

## The run

[020/01 the edge-case audit](../../agent-log/020_au_edge-cases/01_summary.md) found
them. Two halves worked the same concern independently — one reading, one
executing — and the merged verdict is a **union, not a vote**: the executing half
reproduced a crash the reading half had not seen, and that is a finding, not a
tie to be broken.

One reported defect was **refuted on evidence and kept as refuted**, which is the
part worth copying: a finding that turned out to be wrong is more useful written
down than deleted, because the next reader would otherwise re-find it.
