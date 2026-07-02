---
title: Remove the `done:` field from the skill entirely
status: done
---

Strip every reference to the `done:` subtask field from the `documentation-guide` skill —
**completely, as if it never existed.** Do **not** relabel it "legacy" and do **not** leave a
"this used to exist" note: any mention (even a deprecation note) still costs an agent context
on every read, which is the whole reason to remove it. `state:` is the sole canonical field.

## Where it appears (confirmed)

- **`references/layouts/issues/23_subtasks.md`** — the field is currently prescribed as
  *standard*:
  - the frontmatter example block (`done: false` / `done: true`),
  - the line "`done: true` should be paired with `state: closed` (or `review`)",
  - "Write the file with the standard frontmatter (`title`, `done: false`, `state: open`)",
  - the helper note "flips `state` *and* syncs `done:`".
  → Rewrite all of these to use **`state:` only**. The standard subtask frontmatter becomes
  `title:` + `state:` (no `done:`).
- **`references/layouts/issues/41_searching.md`** — "state vs legacy `done`" and "Subtask
  flips also sync `done:`". → Remove the `done` clauses; the CLI just sets `state`.

## Scope guard

- Sweep **both** skills (`documentation-guide` + `doc-agent`) and **all** reference files for
  the field, but **do not** touch natural-language uses of the word "done" — e.g. "what done
  means", "done-when", "Implementation is done from your perspective", "carry state
  (open/done)". Those are prose, not the field.
- This subtask is **skill text only**. The framework code (`040`) and the migration that
  rewrites existing content (`030`) are separate.

## Verify

- `grep -rn "done:" references/ SKILL.md` (both skills) returns no *field* hits.
- `bun run build` green; `check-skill-links.mjs` clean.
