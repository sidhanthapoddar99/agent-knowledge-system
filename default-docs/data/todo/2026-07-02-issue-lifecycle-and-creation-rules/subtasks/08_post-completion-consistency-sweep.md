---
title: Post-completion consistency sweep — skills, docs, and guide vs shipped reality
status: done
---

After the implementation subtasks (03–07) have all landed, do one final
cross-surface pass verifying that every place that *describes* the lifecycle
matches what the code actually *does* now — descriptions written mid-flight
(subtasks 04–06) can drift from the final shipped behavior, and this sweep is the
backstop. Run it LAST among the lifecycle subtasks (only subtask 09, the skill
restructure, comes after).

- [x] **Re-read the shipped code** (the exported status/category constant, the
      loader validation + error message, the category tabs, the CLI verbs) and diff
      it mentally against each describing surface — don't trust that 04–06 stayed
      accurate through 03/07's implementation details.
- [x] **User-guide `19_issues/`** — every page mentions only the shipped vocabulary;
      the hard-error message quoted in docs matches the real one verbatim; UI
      screenshots/descriptions match the category tabs.
- [x] **`guide.ts`** — legend matches shipped statuses, colors, and rules.
- [x] **Skill plugin (both skills, repo + cache)** — SKILL.md router rules, all
      references, CLI examples (`set-state` syntax incl. the fixed subtask
      targeting) — runnable as written; spot-run 2–3 documented commands.
- [x] **Repo `CLAUDE.md`** — tracker-mental-model paragraph consistent.
- [x] **The tracker itself** — this issue's own files (issue.md, notes, brainstorm
      resolution markers) reflect what shipped; all trackers pass
      `docs-guide check issues`; full build green.
- [x] **Fix what the sweep finds** directly (small drifts) or file subtasks (real
      gaps); record the sweep result as a milestone in the running agent-log
      activity folder.
