# Demo issue — anatomy showcase

> **Fixture, not real work.** This issue exists to populate *every* section of the
> issue anatomy at once, so the layout can be eyeballed with a full, varied dataset.
> Sibling of the design work in `2026-07-01-issue-anatomy-restructure`.

It intentionally exercises:

- **Brainstorm** — a numbered folder of options *and* a flat open-questions file, with a
  second level of nesting.
- **Notes** — decided architecture, a `02_reference/` folder, and one **un-prefixed**
  file to test label-only rendering.
- **Subtasks** — prefixed, a nested `02_build/` group with its own `settings.json`, and
  an un-prefixed one.
- **Agent Logs** — one activity folder per **kind** (`loop`, `audit`, `refactor`,
  `workflow`, `fast-iteration`), each with a `settings.json`, goal file, and milestone
  files carrying `iteration` frontmatter (so the `#N` badge shows) — plus a trivial flat
  `101_quick-fix.md` one-off.
- **Agent Memory** — flat topic files *and* a `01_context/` folder.
- **Comments** — a flat evolution log (opened → scope → handoff).

**Related:** [[2026-07-01-issue-anatomy-restructure]]
