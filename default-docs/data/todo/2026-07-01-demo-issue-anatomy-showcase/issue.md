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
- **Agent Logs** — one **activity folder** per kind, kind **encoded in the folder name**
  (`NNN_<code>_<name>/`: `lp` / `au` / `rf` / `it` / `wf`, plus a custom `ex` from
  `settings.json` and an **undefined** `nt` to show the fallback). Each folder holds optional
  pinned meta files (`00_goal` / `01_summary` / `02_task_list`) and `MNN_` milestones with
  `iteration` frontmatter (so the `#N` badge shows) — including a deliberately **failed** one
  and a colour-tinted one. (Also mixes 3-digit prefixes `010`–`060` with a 2-digit `70`.)
- **Agent Memory** — flat topic files *and* a `01_context/` folder.
- **Comments** — a flat evolution log (opened → scope → handoff).

**Related:** [[2026-07-01-issue-anatomy-restructure]]
