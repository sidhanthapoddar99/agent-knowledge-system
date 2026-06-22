# Format migrations

How the on-disk content format evolves without hand-editing every file. **Reach for this reference rarely** — migrations are not part of normal authoring.

## When to use

Only in these cases:

- The user **explicitly asks** to run / write a migration ("migrate the `done` field", "convert these to the new format").
- A build error or validator warning points at a **legacy / old-format field** in content. In this case, **surface it and confirm before migrating** — report what the detect pass finds (count + locations) and get the user's go-ahead; do not migrate just because a warning appeared.
- The user asks a **"does X need migrating?" / "check legacy"** question about a section.

If none of these apply, you do not need migrations — author content with the current format documented in the other references.

> **Always confirm before applying a migration.** Migrations rewrite content in place. Run the detect/locate pass, show the user the count and affected files, and wait for an explicit go-ahead before the write pass — even when an error or warning triggered it. The only exception is when the user has already explicitly asked you to run that migration.

## Where they live

```
plugins/documentation-guide/skills/documentation-guide/migration/<date>_<name>.py
```

One file per migration, named `<YYYY-MM-DD>_<short-name>.py` (e.g. `2026-06-22_done-to-state.py`). They are **Python (stdlib only)** because they are **one-off runs**, not part of the live `.mjs` validator/CLI path. Each script is **self-documenting**: its module docstring carries the full purpose, behaviour, and usage. This reference does not enumerate individual scripts — open the script and read its docstring; that docstring is the source of truth for running it.

## How to author one

A migration script ships **two capabilities in one file**:

1. **Detect** — given a section or issue folder (recursing into subfolders), scan markdown frontmatter and report *whether* migration is needed and *how many* / *where* (file + line number) the legacy instances are. This answers "does this need migrating, and how big is it?" before changing anything.
2. **Migrate** — apply the fix to frontmatter, supporting a **`--dry-run`** that reports what *would* change without writing. Make it **idempotent**: re-running after a successful migrate finds zero instances and is a no-op.

Author it pure-stdlib, run the detect pass first, dry-run the migrate, then apply — and re-run detect to confirm zero. Put the run instructions in the docstring so the next reader needs nothing but the file.
