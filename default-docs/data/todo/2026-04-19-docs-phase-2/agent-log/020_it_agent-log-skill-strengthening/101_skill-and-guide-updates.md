---
iteration: 1
agent: claude-fable-5
status: success
date: 2026-07-08
---

# Skill + guide updates — frontmatter requirement and per-kind mapping units

## Goal

Encode the structure settled in `notes/02_agent-log-activity-structure.md` into
the skill text so an agent writing logs mid-run cannot miss it, and audit the
tracker for existing offenders.

## Approach

- Edit the repo source under `plugins/documentation-guide/skills/doc-issues/`,
  then mirror to the installed cache (`~/.claude/plugins/cache/.../0.5.4/`)
  and confirm parity with `diff -rq`.
- Keep `guide.ts` a thin legend — one line, not the full table.
- Sweep all `agent-log/*/1NN_*.md` files for missing `iteration:` and wrong
  status vocabulary.

## Result

- **SKILL.md** (executing-work section): two new bullets — one milestone per
  natural unit of the kind (wf phase, written as each phase completes / lp
  iteration with roll-up / au stage / rf move / it chunk; sub-steps are bullets,
  never files), and milestone frontmatter required (`iteration`/`agent`/`date`/
  `status` from `not-started|in-progress|success|failed`, never `done`), plus
  `01_summary.md` at wrap every run.
- **`24_agent-logs.md`**: "Milestone shape" now opens with the
  frontmatter-is-required warning + vocabulary trap; new subsection "The mapping
  unit — what one milestone corresponds to, per kind" with the six-row table;
  the add-an-entry recipe now says per-phase milestones written as phases
  complete and summary-at-wrap-no-exceptions.
- **`guide.ts`**: milestone bullet extended with the compact per-kind line.
  Build green (805 pages).
- **Cache parity**: `diff -rq` source vs cache → identical.
- **Audit finding**: 12 pre-existing milestone files share the gap —
  `2026-04-10-editor-diagrams` `010_lp_*` (5 files) + `011_au_*` (4 files) and
  `2026-07-07-artifact-component` all three `wf` activities (3 files) — all
  `status: done`, no `iteration:`. Left as-is (append-only history); a
  metadata-only backfill is possible if wanted.

## Next

Verify on the next real run that milestones come out per-phase with full
frontmatter — the last open checklist item on subtask 09.
