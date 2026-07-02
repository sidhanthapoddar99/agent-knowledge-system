---
title: Set the rules — propagate the operating rules into skill, docs, and guide
state: open
---

Take the decided operating rules (`notes/02_operating-rules.md`, decided in
subtask 02) and set them everywhere agents and humans actually read — **as
convention, never code-enforced** (the meta-rule).

- [ ] **Skill (`documentation-guide`)** — `references/layouts/issues/`: the Rule-2
      router (brainstorm/notes/subtasks/agent-log boundaries) into the relevant
      sub-doc files; the graduation trigger + guardrails into the brainstorm/notes
      references; the comments tripwire into `21_comments.md`; the creation litmus
      test + dump convention into `42_updating.md`. Teach the skill that an
      `issue-dump` component category exists and how dump issues work (a few dump
      issues by kind, entries as subtasks, graduated entries deleted). Mirror to the
      installed cache.
- [ ] **User-guide (`19_issues`)** — the same rules in the prose docs (creation
      thresholds, section routing, graduation, comments hygiene, the dump).
      Coordinate with `2026-07-02-issue-lifecycle-and-creation-rules/subtasks/04`
      so the threshold rules land once, not twice.
- [ ] **`guide.ts`** — the thin legend gets the router table + one-line litmus test
      and a dump mention; depth stays in the user-guide/skill.
- [ ] **Vocabulary** — add `issue-dump` to `component` in the tracker root
      `settings.jsonc` with a comment marking it the deliberate non-stack-axis
      exception; retag `2025-06-25-future-feature-ideas` into the category.
- [ ] **Bless the prototype** — shape `future-feature-ideas` as the first dump
      issue (entries as subtasks); decide the other dump issues (backlog, …) only
      as need appears — don't scaffold empty ones.

Related: `2026-07-02-issue-lifecycle-and-creation-rules` subtasks 04–06 carry the
lifecycle-state side of the same propagation.
