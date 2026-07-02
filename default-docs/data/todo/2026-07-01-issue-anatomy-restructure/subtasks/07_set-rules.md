---
title: Set the rules — propagate the operating rules into skill, docs, and guide
state: closed
---

Take the decided operating rules (`notes/02_operating-rules.md`, decided in
subtask 02) and set them everywhere agents and humans actually read — **as
convention, never code-enforced** (the meta-rule).

- [x] **Skill** — landed in the new `doc-issues` skill (created by subtask 04's
      split): the Rule-2 router + litmus test + dump convention at router level in
      its SKILL.md and in full in `references/42_updating.md`; graduation trigger +
      guardrails in `25_brainstorm.md` / `22_notes.md`; the comments tripwire in
      `21_comments.md`. Mirrored to the installed cache (diff-verified).
- [x] **User-guide (`19_issues`)** — new "§0 First — does this thought earn an
      issue at all?" in `08_workflows/01_create-an-issue.md` (litmus test, routing,
      supersession, the dump + `/docs-quick-idea-note`). Counts as the lifecycle
      issue's subtask-04 "creation-threshold page" item too — landed once, ticked
      there with a pointer here.
- [x] **`guide.ts`** — overview gained the one-breath litmus + section-routing
      lines and the dump mention; map-thin, depth stays in the user-guide/skill.
      Build-checked.
- [x] **Vocabulary** — `issue-dump` added to `component` in the tracker root
      `settings.jsonc`, commented as the deliberate non-stack-axis exception
      (pre-issues, not a layer; promote-and-delete graduation; capture via
      `/docs-quick-idea-note`). Validator green.
- [x] **Bless the prototype** — `2025-06-25-future-feature-ideas` retagged to
      `issue-dump` and retitled "Dump: future features & ideas"; its `issue.md`
      now states the dump contract (entries as subtasks, promote + delete, unhomed
      only). No other dump issues scaffolded — created only as need appears.

**Complete 2026-07-02** — marked review for human sign-off. Execution record:
`agent-log/010_rf_skill-split/` (milestone #2).

Related: `2026-07-02-issue-lifecycle-and-creation-rules` subtasks 04–06 carry the
lifecycle-state side of the same propagation.
