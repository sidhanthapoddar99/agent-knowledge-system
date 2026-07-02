---
iteration: 2
agent: claude-fable-5
status: success
date: 2026-07-02
---

# Rules propagation + the dump capture command

## Goal
Finish the operating-rules propagation (subtask 07) and the remaining phase-3 items
of subtask 04 — the `/docs-quick-idea-note` slash command and the CLI-surface check —
so both subtasks can move to review.

## Approach
- Author `commands/docs-quick-idea-note.md` as a slash command (per sidhantha: a
  command, not a CLI tool) — route-first flow: existing-issue check → litmus check →
  dump; creates the first dump issue on demand; entry template enforces the
  no-bare-dump rule; guardrails keep it one-search-one-write fast.
- Add `issue-dump` to the tracker-root `settings.jsonc` component vocabulary,
  commented as the deliberate non-stack-axis exception.
- Bless `2025-06-25-future-feature-ideas` as the first dump issue — retagged,
  retitled "Dump: future features & ideas", `issue.md` rewritten to state the dump
  contract (promote + delete, unhomed only).
- User-guide: new "§0 — does this thought earn an issue at all?" section in
  `19_issues/08_workflows/01_create-an-issue.md`; also fixed its stale "planned
  /issues skill" line to point at `doc-issues`.
- `guide.ts`: one-breath litmus + section routing + dump mention added to the
  overview (map-thin); fixed retired flat `docs-*` names in `/docs-add-section`.

## Result
- `guide.ts` build-checked with bun; `docs-guide check issues` green (46 issues);
  skill-links green; cache re-mirrored diff-identical.
- Subtasks 04 and 07 fully ticked and marked `review`; the lifecycle issue's
  subtask 04 "creation-threshold page" box cross-ticked with a pointer so the rules
  land once.

## Next
—
