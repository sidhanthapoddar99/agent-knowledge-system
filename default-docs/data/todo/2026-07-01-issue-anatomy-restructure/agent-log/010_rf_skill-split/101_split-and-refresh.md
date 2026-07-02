---
iteration: 1
agent: claude-fable-5
status: success
date: 2026-07-02
---

# Skill split + anatomy refresh

## Goal
Execute subtask 04 phase 2 (implement the two-skill structure) and the reference
half of phase 3 (refresh content against `notes/01_issue-anatomy/**`).

## Approach
- `git mv` the 16 issues references out of `documentation-guide` into
  `skills/doc-issues/references/`; rewrite the four cross-skill prose pointers to
  name the sibling skill.
- Author the `doc-issues` SKILL.md fresh against the finalized anatomy + operating
  rules (not the stale reference text), with the absorbed doc-agent execution-verb
  surface in the trigger description.
- Rewrite `24_agent-logs.md` from the old `000/100/200/300/400` category-wrapper
  workspace to activity folders (`NNN_<code>_<name>/`, `0NN` meta trio, `MNN_`
  milestones, `agentLogKinds`); drop the retired `100_discussion/` concept
  (dialogue now routes to brainstorm `discuss`, explicit-save-only).
- Add the missing section references (brainstorm / agent-memory / guide+glossary)
  and the self-contained tracker writing guide; fold the creation threshold +
  dump rules into `42_updating.md`; subtask authoring guidance into
  `23_subtasks.md`; assignee→in-progress policy-reversal note into
  `02_settings.md`.
- Trim `documentation-guide` (description, sibling note, triage row, writing.md
  redirects + sync note); delete `doc-agent`; bump manifest to 0.4.0; update
  CLAUDE.md, skill catalogue, README; rsync-mirror to the installed cache.

## Result
- Both skills pass `docs-guide check skill-links` (repo + cache copies);
  `docs-guide check issues` green; `docs-guide help` healthy.
- Cache diff-verified identical to repo source.
- Tracker record: subtask 04 phases 1–2 fully ticked, phase 3 reference items
  ticked; remaining phase-3 items re-scoped (`/docs-quick-idea-note` is a slash
  command, not a CLI tool — per sidhantha mid-run).

## Next
Phase 3 leftovers: `/docs-quick-idea-note` command; CLI-surface updates if any;
subtask 07 propagation (user-guide prose, guide.ts, `issue-dump` vocabulary entry,
blessing `future-feature-ideas` as the first dump issue).
