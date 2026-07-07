---
title: "Goal — make the milestone structure unmissable in the doc-issues skill"
---

Executes subtask `09_agent-log-milestone-structure-skill-review.md` against the
settled structure in `notes/02_agent-log-activity-structure.md`. Recent runs
produced activity folders whose milestones lacked `iteration:` frontmatter,
used the wrong status vocabulary, and squashed whole multi-phase workflows into
one file — because the skill buried the milestone shape and never named the
per-kind mapping unit.

**Done looks like:** the frontmatter requirement and the per-kind
milestone-granularity table live in both SKILL.md (the always-loaded surface)
and `24_agent-logs.md`, mirrored byte-identically to the installed plugin
cache; `guide.ts` carries a one-line legend of the mapping units; build green;
tracker audited for pre-existing offenders.
