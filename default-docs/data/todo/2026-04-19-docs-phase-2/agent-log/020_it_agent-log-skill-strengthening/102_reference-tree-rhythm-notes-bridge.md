---
iteration: 2
agent: claude-fable-5
status: success
date: 2026-07-08
---

# Reference tree, run rhythm, and the notes/artifact bridge

## Goal

Second pass after user review of milestone #1: raise adherence without losing
agent flexibility. Three gaps named — the per-kind reference tree wasn't in the
skill (only in `notes/02`), the scaffold-first / stub-then-update lifecycle was
absent (the recipe read as write-at-completion), and nothing pointed rich run
outputs toward `notes/` + the artifact-authoring skill.

## Approach

- Enforcement stance settled as **"default rhythm + hard invariants"**: the
  invariants stay few (milestone frontmatter, one milestone per mapping unit,
  summary at wrap); the tree and lifecycle are framed as the default shape,
  explicitly adaptable.
- All three additions land in `24_agent-logs.md`; SKILL.md gets only a
  compressed echo inside the existing granularity bullet.

## Result

- **`24_agent-logs.md`**: new "Reference tree — the default shape per kind"
  (compact six-kind tree with `#N` markers, opened with "a default, not a
  straitjacket"); "Add an entry" rewritten as **"The run rhythm — scaffold,
  stub, update, wrap"** (scaffold folder + goal before starting → stub the
  milestone `in-progress` when its unit begins, so a dead session leaves a
  trace → update to `success`/`failed` with results → summary at wrap), marked
  as a rhythm not a ritual; new subsection **"Rich outputs graduate to
  `notes/`"** — dense deliverables (architecture write-ups, diagrams, HTML
  artifacts via the artifact-authoring sibling skill) live in `notes/`/
  `brainstorm/`, milestones link to them ("if a section outgrows its bullets,
  it's a note wearing a milestone's hat").
- **SKILL.md**: the granularity bullet now carries the default rhythm and the
  notes-graduation pointer in two sentences.
- **Cache parity**: mirrored, `diff -rq` identical. No `guide.ts` change —
  lifecycle detail is manual territory, not legend territory.

## Next

Unchanged: verify structure holds on the next real run (subtask 09, last open
item) — now including whether milestones appear as `in-progress` stubs mid-run.
