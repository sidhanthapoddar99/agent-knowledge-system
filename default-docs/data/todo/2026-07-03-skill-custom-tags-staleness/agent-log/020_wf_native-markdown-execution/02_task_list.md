---
title: "Task list — native-markdown execution run"
---

# Task list — native-markdown execution run

Working checklist for this run (the durable plan lives in `../../subtasks/`).

- [x] Agent A: subtask 10 — retired `src/custom-tags/` AND `src/parsers/transformers/`
      (registry had zero consumers), orphaned `TagTransformer` type removed,
      CLAUDE.md tree updated, zero stale grep hits
- [x] Agent A: subtask 20 — `marked-alert@2.1.2` wired into all three renderer
      factories + the editor's own client-side marked instance; five alert styles
      in `src/styles/markdown.css` (declared vars only, `color-mix` tints); probe
      shows all five types + plain blockquotes intact; build green (686 pages)
- [x] Agent B: subtask 30 — 17 user-guide/dev-docs files rewritten; fictional
      transformers page deleted; native reference written in 15_writing-content/
- [x] Agent C: subtask 40 — both skills rewritten, cache mirrored, parity diff clean
      (writing.md + SKILL.md + 10_writing.md; 7 further stale mentions rewritten)
- [x] Agent D: tracker scan report (read-only) — 7 issues need next-cycle updates;
      preserved at `../../notes/01_tracker-references-scan.md`
- [x] Orchestrator: cross-fence fixes (tsconfig alias, alert-classes styles row) +
      final integration build — 687 pages, 0 errors, residual grep 0 hits
- [x] Orchestrator: subtasks 10–40 → `review`, milestones #1–#3 + summary written
