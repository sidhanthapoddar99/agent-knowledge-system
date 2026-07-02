---
title: Decide the issue vs subtask vs brainstorm threshold rules
status: done
---

Write the operating rules for *when the ceremony of a full issue folder is earned*:

- [x] Full issue — coherent thinking+execution unit; must sustain ≥1 real subtask
- [x] Subtask — one-prompt fixes and small features attach to an existing issue's
      center of gravity instead of getting a folder
- [x] Brainstorm entry — deliberation/research toward a decision lives inside the
      issue it informs; standalone deliberation-issues are an anti-pattern
- [x] Fold-in / supersession rule (distilled in
      `2026-07-01-issue-anatomy-restructure/subtasks/05`): shipped-work issues stay
      and close with a supersession comment; pure-deliberation issues fold into the
      winner's `brainstorm/` and are deleted (git keeps history)
- [x] Decide where the rules live (user-guide `19_issues` page + skill reference)

**Decided 2026-07-02** — the full rule set (litmus test, section router, graduation
trigger, comments tripwire, `issue-dump` category with promote-and-delete
graduation, convention-not-code meta-rule) is written to
`2026-07-01-issue-anatomy-restructure/notes/02_operating-rules.md`. Propagation into
docs / guide.ts / skill is subtasks 04–06 of this issue.

Related: `2026-07-01-issue-anatomy-restructure/subtasks/02_decide-rules.md` (decision,
closed) and `07_set-rules.md` (propagation) — own the anatomy-side boundaries
(brainstorm vs notes vs agent-log, comments hygiene, issues dump). This subtask owns
the *threshold* question; keep the two linked, not duplicated.
