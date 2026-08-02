# Demo issue — anatomy showcase

> **Fixture, not real work.** This issue exists to populate *every* section of the
> issue anatomy at once, so the layout can be eyeballed with a full, varied dataset.
> Sibling of the design work in `2026-07-01-issue-anatomy-restructure`.

It intentionally exercises:

- **Brainstorm** — a numbered folder of options (plain names — the kind word is optional),
  flat files carrying **full-word kinds** (`02_discuss_…`, `03_research_…`), a second level
  of nesting, and one **resolved** brainstorm with a `**Resolved →**` graduation marker
  pointing into Notes.
- **Notes** — decided architecture, a `02_reference/` folder, and one **un-prefixed**
  file to test label-only rendering.
- **Subtasks** — prefixed, a nested `02_build/` group with its own `settings.json`, and
  an un-prefixed one.
- **Plans** — two plans, each a folder of numbered stages with an `overview.md`, so the
  stage table and its subtask counts have something real to render.
- **Agent Logs** — **three**, and deliberately not one per kind. A catalogue of every
  code and shape produced a fixture full of one- and two-file stubs, which teaches the
  wrong thing about what a log is for. What is here instead:
  - [A loop that ran six rounds](./agent-log/010_lp_implement-sections/summary.md) —
    producer files beside their iteration file, one producer folder holding several
    artifacts (including a `.mmd` diagram), a debrief, and a **child agent log** whose
    status is `in-progress` while its parent is `done`.
  - [An audit](./agent-log/020_au_edge-cases/summary.md) — a pair is **two** files plus
    the merged verdict, because one half reproducing a defect is not outvoted by the
    other half finding nothing.
  - [An abandoned experiment](./agent-log/030_ex_one-pass-spike/summary.md) — the custom
    `ex` kind from `settings.json`, `status: dropped`, and both signals a failed run
    needs: the colour, and the callout saying what actually happened.
- **Agent Memory** — a `memory.md` index, a flat topic file, and the two folders the
  section is now split into: `knowledge/` (binding) and `history/` (how it got here).
- **Comments** — a flat evolution log (opened → scope → handoff).

**Related:** [[2026-07-01-issue-anatomy-restructure]]
