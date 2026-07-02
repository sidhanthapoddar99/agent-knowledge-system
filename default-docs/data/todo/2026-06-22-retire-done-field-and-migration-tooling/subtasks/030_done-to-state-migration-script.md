---
title: Author + test the `done`→`state` migration script
status: done
---

Drop the first migration into the `migration/` folder (from `020`):
`migration/2026-06-22_done-to-state.py`. One Python file, self-documented via a module
docstring, containing **both** detection and migration.

## Functions (one file)

1. **Detect / count** — given a section or issue folder (recurses into subfolders), scan
   markdown frontmatter and return how many files still carry a `done:` field. Answers "does
   this need migration, and how big is it?"
2. **Locate / detail** — list **every** offending file with the **line number** of the
   `done:` line (and its value). Human-readable report.
3. **Migrate** — rewrite frontmatter:
   - `done: true`  → ensure `state: closed` (when no `state:` present),
   - `done: false` → ensure `state: open` (when no `state:` present),
   - when `state:` is **already present**, just **drop the redundant `done:` line** (state
     wins — see the loader logic),
   - then remove the `done:` line in all cases.
   Support a **dry-run** (report only) vs apply. Idempotent: re-running finds zero instances.

## Testing (required — this is "create *and test*")

- Dry-run the detect + locate passes over `default-docs/data/todo/` and eyeball the report
  (there are many real `done:` lines to find).
- Run migrate on a throwaway copy first; confirm `done:` gone and `state:` correct.
- Then apply to the real tracker content to strip the now-redundant `done:` lines (every
  current subtask has both fields, so this is a clean strip, not a semantic change).
- Re-run detect → 0 instances (idempotency).
- `bun run build` green afterward (content still parses; `state:` unaffected).

## Order

Author/run this **before** `040` removes the loader's `done` fallback, so no `done:`-only
file is ever silently misread as open. (In practice all current files have `state:`, but keep
the ordering as the safe default.)
