---
title: Issue-creation threshold rules + expanded lifecycle states
---

## Problem

The tracker was built for fast-paced issue tracking, but it bloated quickly — and most
of the bloat was **not real issues**:

1. **Brainstorms wearing issue costumes.** Whole issues that were really deliberation
   about *what issue to create*. The migration-direction cluster is the canonical case:
   `framework-as-npm-package`, `editor-as-standalone-product`, `astro-6-upgrade` each
   proposed a migration in its own format, all three were dropped — yet their research
   was essential input to the real issue (`runtime-stack-migration`). As standalone
   issues they were hard to track, broke graphs/connections, and destroyed structure;
   folded into the winner's `brainstorm/` they enable informed decisions. (The fold-in
   happened in `2026-07-01-issue-anatomy-restructure/subtasks/05`.)
2. **Micro-issues.** One-line feature requests with no subtask list of their own —
   things resolvable in a single prompt. An issue is fundamentally *a set of small
   subtasks*; a thought that can't sustain even one subtask is a dump, not an issue,
   and creating a folder for it is pure friction.

Efficiency is the goal: the ceremony of a full issue folder must be *earned*.

## Decision 1 — creation threshold rules

When does a thought become each of these? Write the rules down (they extend
`2026-07-01-issue-anatomy-restructure/subtasks/02_decide-rules.md`, propagation in
its `07_set-rules.md`):

- **Full issue** — a coherent unit of thinking + execution that decomposes into
  subtasks. Rule of thumb: if it can't declare at least one real subtask, it isn't an
  issue yet.
- **Subtask on an existing issue** — concrete work that belongs to an existing unit's
  center of gravity. One-prompt fixes land here, not in new folders.
- **Brainstorm entry inside an existing issue** — deliberation, direction-weighing,
  research toward a decision. Distilled rule from the cluster refactor: *an issue that
  shipped work stays an issue* (close with a supersession comment); *an issue that is
  pure deliberation converging elsewhere folds into the winner's `brainstorm/`* (with
  a `**Resolved →**` overview + provenance) *and is deleted* — git history keeps it.

## Decision 2 — expanded lifecycle states (policy reversal)

The current model is 4 flat states (`open → review → closed | cancelled`) with
in-progress *derived from `assignees.length > 0`* and blocked/wip as labels. That
derivation never matched practice — in-progress is not really determined by assignees.
This issue **deliberately reverses** the "transient state is a label, not a status"
doctrine (see `user-guide/19_issues/02_design-philosophy.md`) for these two signals.

**DECIDED 2026-07-02** — ground truth in `notes/01_lifecycle-vocabulary.md` (the
deliberation trail is `brainstorm/01_discuss_lifecycle-decisions.md`). Final shape —
**4 hardcoded categories, 7 hardcoded statuses**, both fixed in framework code, no
user extension (only color overrides):

| Category | Statuses | Notes |
|---|---|---|
| **Not Started** | `open` · `blocked` | blocked = structural dependency on another item, reason in prose |
| **In Progress** | `in-progress` | set automatically by agents when work starts |
| **Review** | `input-needed` · `review` | the "needs a human" category: stuck-on-a-question vs done-verify-me |
| **Closed** | `done` · `dropped` | human-only terminals; `dropped` requires a comment |

**Scope: issues AND subtasks** — one shared enum, one shared field name (`status`,
after subtask 07's rename), one shared validation. Unknown status = hard startup
error with a copy-pasteable message. Transitions unenforced (guidance only).
Category is always derived from status, never stored in issue files. UI filters by
category, not status.

**Consequence:** every mention of "assignees double as the in-progress signal" in the
documentation and the skill gets removed (see subtasks 04 and 06).

## Success criteria

- Threshold rules written and discoverable (user-guide + skill).
- New state vocabulary decided, implemented end-to-end (loader validation, UI, CLI,
  root `settings.jsonc`), existing issues migrated, validator green.
- Docs, `guide.ts`, and the skill plugin all describe the same model; the
  assignee-derived in-progress signal is gone everywhere.

Related: `2026-07-01-issue-anatomy-restructure` (subtasks 02 + 05 — anatomy-side rules
and the fold-in that motivated this), `2026-05-07-tracker-mental-model-alignment`
(where the 4-state doctrine was set).
