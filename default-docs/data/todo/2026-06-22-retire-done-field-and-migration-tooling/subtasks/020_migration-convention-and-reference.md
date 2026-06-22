---
title: Establish the `migration/` convention + `references/doc-migration.md`
state: closed
---

Stand up a home for one-off format-migration scripts and document it, so removing `done:`
(and any future format change) has a repeatable pattern instead of an ad-hoc script.

## The `migration/` folder

- Location: `plugins/documentation-guide/skills/documentation-guide/migration/`.
- One file per migration, named `<date>_<name>.py` (e.g. `2026-06-22_done-to-state.py`).
- **Python**, because these are **one-off runs**, not part of the live `.mjs` validator path.
- **Self-documenting:** each script carries its full purpose + usage as a module docstring /
  comments. The reference does **not** enumerate individual scripts — the code is the doc.
- Each script ships **two capabilities** (see `030` for the concrete shape): a **detection**
  pass (does this section/its subfolders need migration? how many instances? where?) and a
  **migration** pass (apply the fix, ideally with a dry-run).

## `references/doc-migration.md`

A short reference (not a per-script catalogue) covering:

- **Purpose** — what migrations are for (evolving the on-disk format without hand-editing).
- **When to use** — *only* when the user explicitly asks for a migration, when an error or
  validator warning points at a legacy/old-format field, or when "checking legacy"/"does X
  need migrating" is asked. Not part of normal authoring.
- **Where they live** — the `migration/<date>_<name>.py` convention above.
- **How to author one** — the detect + migrate two-function shape; dry-run first; docstring
  carries the instructions; keep it idempotent.
- That the script's **own docstring is the source of truth** for running it.

## `SKILL.md` pointer (one line)

Add a single line to `documentation-guide/SKILL.md` (do **not** list scripts): something like
*"Format migrations / legacy-field cleanup → see `references/doc-migration.md` (use only on
migration errors, legacy-format checks, or explicit user request)."* Keep it one line so it
costs almost no context until actually needed.

## Depends on / order

Pairs with `030` (the first script proving the convention). Author the reference + folder
here; `030` drops the actual `done`→`state` script into the folder.

## Verify

`bun run build` green; `check-skill-links.mjs` clean (the new reference + the SKILL pointer
resolve).
