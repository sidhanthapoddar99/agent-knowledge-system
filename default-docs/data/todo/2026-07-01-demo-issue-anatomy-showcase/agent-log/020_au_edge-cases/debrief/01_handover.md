---
title: "Handover"
---

# What leaves this audit

**The confirmed defect is already a subtask** —
[the depth guard](../../../subtasks/04_verify/20_depth-guard.md). It is not
repeated here. A bug recorded only as log prose dies in the log; the debrief
keeps the pointer and nothing else.

# What the next audit of this surface should know

- **The executing half's fixtures are the expensive part.** Building a tree that
  sits exactly one level past the cap took most of the round; the generator is in
  the repo's gitignored benchmark directory, not here. Re-use it rather than
  rebuilding it.
- **The mixed-width claim will look plausible again.** Reading the parser
  suggests `05_` and `010_` sort wrongly. They do not — numeric comparison is
  applied before the string. It is refuted in
  [the merged verdict](../working/010_findings.md); check there before spending a
  round on it.
- **Rendering was deliberately out of scope**, so nothing here says whether a
  dropped folder is *visible* as dropped. That is still unaudited.

# One thing that is not actionable, and is worth saying anyway

The reading half found both suspect paths without running anything, and was wrong
about one of them. That is the expected shape of a pair, not a failure of the
reading half — reading finds candidates, executing decides. A round that had only
read would have shipped a defect that does not exist.
